import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ApiSource = "api-football" | "football-data" | "anysport" | "sportdb" | "thesportsdb";

interface ProxyRequest {
  source: ApiSource;
  endpoint: string;
  params?: Record<string, string>;
}

interface SourceConfig {
  baseUrl: string;
  headers: Record<string, string>;
}

function getSourceConfig(source: ApiSource): SourceConfig {
  const configs: Record<ApiSource, SourceConfig> = {
    "api-football": {
      baseUrl: "https://v3.football.api-sports.io",
      headers: { "x-apisports-key": Deno.env.get("API_FOOTBALL_KEY") ?? "" },
    },
    "football-data": {
      baseUrl: "https://api.football-data.org/v4",
      headers: { "X-Auth-Token": Deno.env.get("FOOTBALL_DATA_KEY") ?? "" },
    },
    anysport: {
      baseUrl: "https://api.anysport.io/v1",
      headers: { "X-API-Key": Deno.env.get("ANYSPORT_KEY") ?? "" },
    },
    sportdb: {
      baseUrl: "https://api.sportdb.dev/api",
      headers: { "X-API-Key": Deno.env.get("SPORTDB_KEY") ?? "" },
    },
    thesportsdb: {
      baseUrl: "https://www.thesportsdb.com/api/v1/json/123",
      headers: {},
    },
  };
  return configs[source];
}

function getTtlMinutes(source: ApiSource, endpoint: string): number {
  // Static player profiles: 7 days
  if (endpoint.includes("/players?id=") || endpoint.includes("/persons/")) {
    return 7 * 24 * 60;
  }
  // Season stats: 6 hours
  if (endpoint.includes("/players?league=") || endpoint.includes("/standings") || endpoint.includes("/scorers")) {
    return 6 * 60;
  }
  // Competitions/leagues list: 24 hours
  if (endpoint.includes("/leagues") || endpoint.includes("/competitions") || endpoint.includes("/countries")) {
    return 24 * 60;
  }
  // Transfers: 7 days
  if (endpoint.includes("/transfers")) {
    return 7 * 24 * 60;
  }
  // Media: 7 days
  if (source === "thesportsdb") {
    return 7 * 24 * 60;
  }
  // Default: 1 hour
  return 60;
}

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<{ data: unknown; status: number; latencyMs: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const start = performance.now();
    try {
      const response = await fetch(url, options);
      const latencyMs = Math.round(performance.now() - start);

      if (response.status === 429 && attempt < maxRetries - 1) {
        const backoff = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }

      const data: unknown = await response.json();
      return { data, status: response.status, latencyMs };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const backoff = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
  }

  throw lastError ?? new Error("Fetch failed after retries");
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with service_role for cache operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token invalide" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const body = (await req.json()) as ProxyRequest;
    const { source, endpoint, params } = body;

    if (!source || !endpoint) {
      return new Response(JSON.stringify({ error: "source et endpoint requis" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const config = getSourceConfig(source);
    if (!config) {
      return new Response(JSON.stringify({ error: `Source inconnue: ${source}` }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Build cache key
    const cacheKey = await sha256(`${source}:${endpoint}:${JSON.stringify(params ?? {})}`);

    // Check cache
    const { data: cached } = await supabase
      .from("api_cache")
      .select("value")
      .eq("key", cacheKey)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify(cached.value), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    // Build URL with params
    const url = new URL(`${config.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    // Fetch from external API
    const { data, status, latencyMs } = await fetchWithRetry(url.toString(), {
      headers: config.headers,
    });

    // Cache the response
    const ttlMinutes = getTtlMinutes(source, endpoint);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    await supabase.from("api_cache").upsert({
      key: cacheKey,
      value: data,
      source,
      endpoint,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    });

    // Log usage
    await supabase.from("api_usage_log").insert({
      source,
      endpoint,
      status,
      latency_ms: latencyMs,
      user_id: user.id,
    });

    return new Response(JSON.stringify(data), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
