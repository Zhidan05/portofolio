import "server-only";
import { createClient } from "@supabase/supabase-js";
import { initialContact } from "@/data/contact";
import { CONTACT_CACHE_TAG } from "@/lib/contact-cache";
import type { PublicContactData } from "@/lib/contact";
import { getSupabaseConfig, supabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

export async function readPublicContact(): Promise<PublicContactData> {
  if (!supabaseConfigured) return initialContact;
  const { url, key } = getSupabaseConfig();
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60, tags: [CONTACT_CACHE_TAG] } }) },
  });
  try {
    const { data, error } = await client.rpc("read_public_contact", {}, { get: true }).abortSignal(AbortSignal.timeout(10000));
    if (error || !data?.settings || !Array.isArray(data.channels) || !Array.isArray(data.subjects)) return initialContact;
    return { ...data, submissionAvailable: true } as PublicContactData;
  } catch {
    return initialContact;
  }
}
