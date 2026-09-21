"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/config";
import { isAuthorizedAdmin, login, logout } from "@/services/authService";

type AuthState = { session: Session | null; isAdmin: boolean; loading: boolean; error: string };
const AuthContext = createContext<(AuthState & { login: typeof login; logout: typeof logout }) | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, isAdmin: false, loading: supabaseConfigured, error: supabaseConfigured ? "" : "Admin setup is incomplete. Configure the Supabase environment variables." });
  useEffect(() => {
    if (!supabaseConfigured) return;
    let active = true;
    let generation = 0;
    const client = getSupabase();
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      const version = ++generation;
      setState((previous) => ({ session, isAdmin: Boolean(session && previous.session?.user.id === session.user.id && previous.isAdmin), loading: Boolean(session && (previous.loading || previous.session?.user.id !== session.user.id)), error: "" }));
      if (!session) return;
      // Defer Supabase queries until the auth callback releases its lock.
      setTimeout(() => {
        if (!active || version !== generation) return;
        void isAuthorizedAdmin(session.user.id).then((isAdmin) => {
          if (active && version === generation) setState({ session, isAdmin, loading: false, error: "" });
        }).catch(() => {
          if (active && version === generation) setState({ session, isAdmin: false, loading: false, error: "Authorization could not be verified. Reload to retry." });
        });
      }, 0);
    });
    return () => { active = false; generation++; data.subscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is required.");
  return { ...value, user: value.session?.user ?? null, isAuthenticated: Boolean(value.session) };
}
