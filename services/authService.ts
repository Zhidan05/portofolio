import { getSupabase } from "@/lib/supabase/client";

export async function isAuthorizedAdmin(userId: string) {
  const { data, error } = await getSupabase().from("portfolio_admins").select("user_id").eq("user_id", userId).abortSignal(AbortSignal.timeout(10000)).maybeSingle();
  if (error) throw new Error("Authorization could not be verified. Please retry.");
  return Boolean(data);
}
export async function login(email: string, password: string) {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error("Authentication failed. Check your credentials and try again.");
}
export async function logout() {
  const { error } = await getSupabase().auth.signOut({ scope: "local" });
  if (error) throw new Error("Unable to terminate the session. Please retry.");
}
