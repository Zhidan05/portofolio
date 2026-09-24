"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
export function AdminShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth(); const router = useRouter(); const path = usePathname();
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (!auth.loading && !auth.session) router.replace("/login"); }, [auth.loading, auth.session, router]);
  async function signOut() {
    setBusy(true); setError("");
    try { await auth.logout(); window.location.replace("/login"); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  if (auth.loading || !auth.session) return <main className="control"><p className="code green" role="status">&gt; VERIFYING_ACCESS...</p></main>;
  if (!auth.isAdmin) return <main className="control"><section className="panel"><h1>ACCESS DENIED</h1><p role="alert">{auth.error || "Your account is not authorized to administer this portfolio."}</p><button className="pixel-button" onClick={signOut} disabled={busy}>TERMINATE SESSION</button><p role="status">{error}</p></section></main>;
  return <main className="control"><header className="control-header"><div><span className="code green">HELSINKI // CONTROL PANEL</span><p className="micro muted">AUTHORIZED ADMINISTRATOR</p></div><button className="pixel-button secondary" disabled={busy} onClick={signOut}>TERMINATE SESSION</button></header>
    <p role="status" className="code cyan">{error}</p>
    <div className="control-grid"><nav className="control-nav" aria-label="Admin navigation">
      <Link href="/admin" aria-current={path === "/admin" ? "page" : undefined}>Dashboard</Link>
      <Link href="/admin/home" aria-current={path === "/admin/home" ? "page" : undefined}>Home</Link>
      <Link href="/admin/about" aria-current={path === "/admin/about" ? "page" : undefined}>About</Link>
      <Link href="/admin/projects" aria-current={path.startsWith("/admin/projects") ? "page" : undefined}>Projects</Link>
      <Link href="/admin/experience" aria-current={path.startsWith("/admin/experience") ? "page" : undefined}>Experience</Link>
      <Link href="/admin/contact" aria-current={path.startsWith("/admin/contact") ? "page" : undefined}>Contact</Link>
      <Link href="/" target="_blank" rel="noopener noreferrer">View portfolio ↗</Link>
    </nav><div className="control-content">{children}</div></div></main>;
}
