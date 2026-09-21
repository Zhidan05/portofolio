"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AuthProvider";
export default function Login({ serverError = "" }: { serverError?: string }) {
  const auth = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { if (submitted && !auth.loading && auth.isAdmin) window.location.replace("/admin"); }, [submitted, auth.loading, auth.isAdmin]);
  return <main className="control login"><section className="panel login-panel">
    <Link className="code muted" href="/">← PUBLIC PORTFOLIO</Link>
    <h1>HELSINKI <span className="green">{"//"}</span> ADMIN TERMINAL</h1>
    <p className="code cyan">&gt; authentication_required_</p>
    {auth.loading ? <p role="status">&gt; VERIFYING_SESSION...</p> : auth.session ? <>
      <p role="alert">{serverError || auth.error || (auth.isAdmin ? submitted ? "Access verified. Opening control panel…" : "Session restored. Open the control panel to retry server verification." : "Access denied. This account is not an authorized administrator.")}</p>
      {auth.isAdmin && !submitted && <Link className="pixel-button" href="/admin">OPEN CONTROL PANEL</Link>}
      <button className="pixel-button secondary" disabled={busy} onClick={async () => { setBusy(true); try { await auth.logout(); } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); } }}>TERMINATE SESSION</button>
    </> : <form className="control-form" onSubmit={async (event) => {
      event.preventDefault(); if (busy) return;
      const fields = new FormData(event.currentTarget);
      setBusy(true); setMessage("");
      try { await auth.login(String(fields.get("email")).trim(), String(fields.get("password"))); setSubmitted(true); }
      catch (e) { setMessage((e as Error).message); }
      finally { setBusy(false); }
    }}>
      <label>EMAIL<input type="email" name="email" autoComplete="username" required disabled={busy || Boolean(auth.error)} /></label>
      <label>PASSWORD<input type="password" name="password" autoComplete="current-password" required disabled={busy || Boolean(auth.error)} /></label>
      <button className="pixel-button" disabled={busy || Boolean(auth.error)}>{busy ? "AUTHENTICATING..." : "AUTHENTICATE"}</button>
      {auth.error && <p role="alert">{auth.error}</p>}
    </form>}
    <p className="code cyan" role="status">{message}</p>
  </section></main>;
}
