"use client";
import { useState } from "react";
import { logout } from "@/services/authService";
export function AccessDenied({ message }: { message: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <main className="control"><section className="panel"><h1>ACCESS DENIED</h1>
    <p role="alert">{message || "This account is not an authorized portfolio administrator."}</p>
    <button className="pixel-button" disabled={busy} onClick={async () => {
      setBusy(true);
      try { await logout(); window.location.replace("/login"); }
      catch { setError("Unable to terminate the session. Please retry."); setBusy(false); }
    }}>TERMINATE SESSION</button><p role="status">{error}</p>
  </section></main>;
}
