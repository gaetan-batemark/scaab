import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://esm.sh/linkedom@0.16.11";

/**
 * Scraper Transfermarkt — Edge Function Deno (cron 2x/semaine lundi+jeudi 4h)
 *
 * Scrape player market values, contract info, transfer & injury history.
 * Rate limited: 1 request per 5 seconds minimum.
 * Only scrapes players currently in shortlists (status = monitoring/contacted/negotiating).
 * Writes to player_market_data via service_role.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TM_BASE = "https://www.transfermarkt.com";

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

async function fetchTM(path: string): Promise<string | null> {
  const url = `${TM_BASE}${path}?language=en`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": randomUA(),
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: TM_BASE,
        },
      });

      if (res.status === 429 || res.status === 403) {
        console.warn(
          `[transfermarkt] ${res.status} on ${path}, pausing 1h...`
        );
        await sleep(3_600_000); // 1 hour pause
        continue;
      }

      if (!res.ok) {
        console.warn(
          `[transfermarkt] HTTP ${res.status} on ${path}, retry ${attempt + 1}`
        );
        await sleep(10_000 * (attempt + 1));
        continue;
      }

      // Rate limit: 5s between requests
      await sleep(5_000);
      return await res.text();
    } catch (err) {
      console.error(`[transfermarkt] Fetch error on ${path}:`, err);
      await sleep(10_000 * (attempt + 1));
    }
  }
  return null;
}

// TODO: Implement full HTML parsers in Sprint 1
function parsePlayerProfile(
  _html: string
): Record<string, unknown> | null {
  // Parse: market value, contract end, agent, nationality, height, foot
  return null;
}

function parseTransferHistory(
  _html: string
): Array<Record<string, unknown>> {
  // Parse transfer table: date, from, to, fee/loan, type
  return [];
}

function parseMarketValueHistory(
  _html: string
): Array<{ date: string; value: number }> {
  // Parse market value chart data (embedded JSON in script tag)
  return [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  // Auth: cron secret or admin
  const cronSecret = Deno.env.get("CRON_SECRET");
  const isCron =
    req.headers.get("x-cron-secret") === cronSecret && cronSecret;

  if (!isCron && !req.headers.get("Authorization")) {
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
    players_checked: 0,
    players_updated: 0,
    errors: [] as string[],
  };

  try {
    // TODO Sprint 1: Get players to scrape from shortlists
    // 1. Query shortlist_players with status IN ('monitoring', 'contacted', 'negotiating')
    // 2. Join with players to get transfermarkt_id (if known)
    // 3. For each player with transfermarkt_id: fetch profile + transfers
    // 4. For players without transfermarkt_id: search by name (fuzzy)
    // 5. Upsert player_market_data

    console.log(
      "[transfermarkt] Scraper invoked — stub mode, no scraping performed."
    );

    // Log the scraper run
    await supabase.from("api_usage_log").insert({
      source: "scraper-transfermarkt",
      endpoint: "cron-run",
      status: 200,
      latency_ms: 0,
    });

    return new Response(JSON.stringify({ ok: true, ...results }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[transfermarkt] Fatal error:", error);

    await supabase.from("api_usage_log").insert({
      source: "scraper-transfermarkt",
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
