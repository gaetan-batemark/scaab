import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://esm.sh/linkedom@0.16.11";

/**
 * Scraper FBref — Edge Function Deno (cron 1x/jour à 4h)
 *
 * Scrape player advanced stats from FBref.
 * Rate limited: 1 request per 3-5 seconds.
 * Writes to player_advanced_stats via service_role.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// League IDs on FBref
const LEAGUES: Record<string, { id: number; slug: string; priority: number }> = {
  "Ligue 1": { id: 13, slug: "Ligue-1-Stats", priority: 1 },
  "Ligue 2": { id: 60, slug: "Ligue-2-Stats", priority: 2 },
  "National": { id: 192, slug: "Championnat-National-Stats", priority: 1 },
  "Premier League": { id: 9, slug: "Premier-League-Stats", priority: 3 },
  "La Liga": { id: 12, slug: "La-Liga-Stats", priority: 3 },
  "Serie A": { id: 11, slug: "Serie-A-Stats", priority: 3 },
  "Bundesliga": { id: 20, slug: "Bundesliga-Stats", priority: 3 },
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
];

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  retries = 3
): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": randomUA(),
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (res.status === 429) {
        console.warn(`[fbref] Rate limited on ${url}, waiting 60s...`);
        await sleep(60_000);
        continue;
      }

      if (res.status === 403) {
        console.error(`[fbref] 403 Forbidden on ${url}, aborting.`);
        return null;
      }

      if (!res.ok) {
        console.warn(`[fbref] HTTP ${res.status} on ${url}, retry ${i + 1}`);
        await sleep(5000 * (i + 1));
        continue;
      }

      return await res.text();
    } catch (err) {
      console.error(`[fbref] Fetch error on ${url}:`, err);
      await sleep(5000 * (i + 1));
    }
  }
  return null;
}

// TODO: Implement full HTML table parser in Sprint 1
// This is a stub that outlines the architecture
function parseStatsTable(
  _html: string,
  _tableId: string
): Array<Record<string, string>> {
  // FBref wraps tables in HTML comments — strip them first
  // const cleaned = html.replace(/<!--/g, "").replace(/-->/g, "");
  // const doc = new DOMParser().parseFromString(cleaned, "text/html");
  // const table = doc.getElementById(tableId);
  // ... parse rows into key-value maps
  return [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  // Only allow invocation from cron or admin
  const authHeader = req.headers.get("Authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");

  // Cron invocation uses a shared secret
  const isCron =
    req.headers.get("x-cron-secret") === cronSecret && cronSecret;

  if (!isCron && !authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results = {
    leagues_processed: 0,
    players_upserted: 0,
    errors: [] as string[],
  };

  try {
    // TODO Sprint 1: iterate leagues, fetch squad pages, parse stats
    // For each league:
    //   1. Fetch league page to get team URLs
    //   2. For each team, fetch squad stats page
    //   3. Parse advanced stats tables (shooting, passing, possession, defense)
    //   4. Fuzzy match to existing players or insert new ones
    //   5. Upsert player_advanced_stats

    // Placeholder response for stub
    console.log("[fbref] Scraper invoked — stub mode, no scraping performed.");

    // Log the scraper run
    await supabase.from("api_usage_log").insert({
      source: "scraper-fbref",
      endpoint: "cron-run",
      status: 200,
      latency_ms: 0,
    });

    return new Response(JSON.stringify({ ok: true, ...results }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[fbref] Fatal error:", error);

    await supabase.from("api_usage_log").insert({
      source: "scraper-fbref",
      endpoint: "cron-run",
      status: 500,
      latency_ms: 0,
    });

    return new Response(
      JSON.stringify({ ok: false, error: String(error) }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
