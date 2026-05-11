import type { ApiSource } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface ProxyParams {
  source: ApiSource;
  endpoint: string;
  params?: Record<string, string>;
}

export async function apiProxy<T = unknown>({ source, endpoint, params }: ProxyParams): Promise<T> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Non authentifié");
  }

  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const response = await fetch(`${supabaseUrl}/functions/v1/api-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ source, endpoint, params }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur réseau" }));
    throw new Error((error as { error?: string }).error ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}
