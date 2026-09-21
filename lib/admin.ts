import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

export const getAdminAccess = cache(async () => {
  if (!supabaseConfigured) return { client: null, user: null, isAdmin: false, error: "Supabase configuration is unavailable." };
  const client = await createSupabaseServerClient();
  try {
    // Auth-server validation, never authorization based on an unverified cookie.
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return { client, user: null, isAdmin: false, error: "Sign in again to continue." };
    const { data, error } = await client.from("portfolio_admins").select("user_id").eq("user_id", user.id).maybeSingle();
    return { client, user, isAdmin: !error && Boolean(data), error: error ? "Admin access could not be verified. Check the database setup and retry." : "" };
  } catch {
    return { client, user: null, isAdmin: false, error: "Authentication is temporarily unavailable." };
  }
});
export async function requireAdmin() {
  const access = await getAdminAccess();
  if (!access.user || !access.isAdmin) redirect("/login");
  return access;
}
