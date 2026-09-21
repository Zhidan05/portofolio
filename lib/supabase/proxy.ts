import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig, supabaseConfigured } from "./config";
import type { Database } from "./database.types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const protect = request.nextUrl.pathname.startsWith("/admin");
  const privateResponse = (result: NextResponse) => {
    result.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0");
    result.headers.set("Pragma", "no-cache");
    result.headers.set("Expires", "0");
    return result;
  };
  const loginRedirect = () => {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.search = "";
    const result = NextResponse.redirect(target);
    response.cookies.getAll().forEach(cookie => result.cookies.set(cookie));
    return privateResponse(result);
  };
  if (!supabaseConfigured) return protect ? loginRedirect() : privateResponse(response);
  const { url, key } = getSupabaseConfig();
  const client = createServerClient<Database>(url, key, {
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(15000) }) },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        const previousCookies = response.cookies.getAll();
        response = NextResponse.next({ request });
        previousCookies.forEach(cookie => response.cookies.set(cookie));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
  try {
    // Verifies the JWT, refreshes expired tokens, and persists refreshed cookies.
    const { data, error } = await client.auth.getClaims();
    if (protect && (error || !data?.claims)) return loginRedirect();
  } catch {
    if (protect) return loginRedirect();
  }
  return privateResponse(response);
}
