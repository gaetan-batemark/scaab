import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-6";
const PREMIUM_MODEL = "claude-opus-4-7";
const MAX_TOKENS_DEFAULT = 1500;

interface AiProxyRequest {
  prompt_type: string; // scout_report | opponent_briefing | comparison | squad_analysis
  messages: Array<{ role: string; content: string }>;
  system?: string;
  model?: "default" | "premium";
  max_tokens?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Parse body
    const body: AiProxyRequest = await req.json();
    const model =
      body.model === "premium" ? PREMIUM_MODEL : DEFAULT_MODEL;
    const maxTokens = body.max_tokens ?? MAX_TOKENS_DEFAULT;

    // Service client for DB writes
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check quota
    const { data: hasQuota } = await serviceClient.rpc("has_ai_quota", {
      uid: user.id,
    });
    if (!hasQuota) {
      return new Response(
        JSON.stringify({
          error: "AI quota exceeded",
          message: "Vous avez atteint votre quota mensuel de générations IA.",
        }),
        {
          status: 429,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Check cache
    const cacheKey = `ai:${body.prompt_type}:${JSON.stringify(body.messages).substring(0, 200)}`;
    const { data: cached } = await serviceClient
      .from("api_cache")
      .select("value")
      .eq("key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify(cached.value), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Call Claude API
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 503,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    const startTime = Date.now();
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: body.system,
        messages: body.messages,
      }),
    });

    const latencyMs = Date.now() - startTime;
    const result = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      // Log failed request
      await serviceClient.from("api_usage_log").insert({
        source: "ai-proxy",
        endpoint: body.prompt_type,
        status: anthropicResponse.status,
        latency_ms: latencyMs,
        user_id: user.id,
        model,
        prompt_type: body.prompt_type,
      });

      return new Response(JSON.stringify({ error: "AI request failed", details: result }), {
        status: anthropicResponse.status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const tokensInput = result.usage?.input_tokens ?? 0;
    const tokensOutput = result.usage?.output_tokens ?? 0;
    // Approximate cost: Sonnet ~$3/$15 per M tokens, Opus ~$15/$75
    const costPerInputToken =
      model === PREMIUM_MODEL ? 15 / 1_000_000 : 3 / 1_000_000;
    const costPerOutputToken =
      model === PREMIUM_MODEL ? 75 / 1_000_000 : 15 / 1_000_000;
    const costUsd =
      tokensInput * costPerInputToken + tokensOutput * costPerOutputToken;

    // Log usage + increment quota (in parallel)
    await Promise.all([
      serviceClient.from("api_usage_log").insert({
        source: "ai-proxy",
        endpoint: body.prompt_type,
        status: anthropicResponse.status,
        latency_ms: latencyMs,
        user_id: user.id,
        tokens_input: tokensInput,
        tokens_output: tokensOutput,
        cost_usd: costUsd,
        model,
        prompt_type: body.prompt_type,
      }),
      serviceClient.rpc("increment_ai_usage", { uid: user.id }),
    ]);

    // Cache result (30 days for reports, 7 days for briefings, 24h for analysis)
    const ttlDays =
      body.prompt_type === "scout_report"
        ? 30
        : body.prompt_type === "opponent_briefing"
          ? 7
          : 1;
    const expiresAt = new Date(
      Date.now() + ttlDays * 24 * 60 * 60 * 1000
    ).toISOString();

    await serviceClient.from("api_cache").upsert({
      key: cacheKey,
      value: result,
      source: "ai-proxy",
      endpoint: body.prompt_type,
      expires_at: expiresAt,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(error) }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
