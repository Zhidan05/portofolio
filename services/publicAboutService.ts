import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, supabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";
import { initialAbout } from "@/data/about";
import { ABOUT_CACHE_TAG } from "@/lib/about-cache";

export async function readPublicAbout() {
  if (!supabaseConfigured) return initialAbout;
  const { url, key } = getSupabaseConfig();
  // Deliberately anonymous: no request cookies or user sessions enter this cache.
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, {
        ...init,
        next: { revalidate: 60, tags: [ABOUT_CACHE_TAG] },
      }),
    },
  });
  try {
    const { data, error } = await client.rpc("read_about", {}, { get: true }).abortSignal(AbortSignal.timeout(10000));
    if (error || !data) return initialAbout;
    return data;
  } catch { return initialAbout; }
}
