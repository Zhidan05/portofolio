"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return <section className="panel"><h1>CONTROL PANEL UNAVAILABLE</h1><p>Check your connection and try again.</p><button className="pixel-button" onClick={reset}>RETRY</button></section>;
}
