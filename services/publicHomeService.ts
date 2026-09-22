import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, supabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";
import { initialHome } from "@/data/home";
import { HOME_CACHE_TAG } from "@/lib/home-cache";

export async function readPublicHome() {
  if (!supabaseConfigured) return initialHome;
  const { url, key } = getSupabaseConfig();
  
  // Deliberately anonymous: no request cookies or user sessions enter this cache.
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, {
        ...init,
        next: { revalidate: 60, tags: [HOME_CACHE_TAG] },
      }),
    },
  });
  
  try {
    const { data, error } = await client.rpc("read_home", {}, { get: true }).abortSignal(AbortSignal.timeout(10000));
    if (error || !data) return initialHome;
    return data;
  } catch {
    return initialHome;
  }
}
