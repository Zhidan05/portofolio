import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
export async function proxy(request: NextRequest) { return updateSession(request); }
// Public content is anonymous and cacheable; only control routes use auth cookies.
export const config = { matcher: ["/login", "/admin/:path*"] };
