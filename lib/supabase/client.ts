"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseConfig } from "./config";

export function getSupabase() {
  const { url, key } = getSupabaseConfig();
  // @supabase/ssr owns the browser singleton and cookie session storage.
  return createBrowserClient<Database>(url, key);
}
