import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSupabase() {
  const client = useMemo(() => createClient(), []);
  return client;
}
