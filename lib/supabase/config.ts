// Only these two public values are used by the application.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
function validConfig() {
  if (!url || !key || !key.startsWith("sb_publishable_")) return false;
  try { return ["https:", "http:"].includes(new URL(url).protocol); }
  catch { return false; }
}
export const supabaseConfigured = validConfig();
export function getSupabaseConfig() {
  if (!supabaseConfigured) throw new Error("Supabase public configuration is unavailable.");
  return { url: url!, key: key! };
}
