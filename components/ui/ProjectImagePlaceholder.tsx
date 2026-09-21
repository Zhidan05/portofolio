import React from "react";

export function ProjectImagePlaceholder() {
  return (
    <div 
      className="panel"
      style={{
        aspectRatio: "16 / 9",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "12px",
        background: "var(--surface-lowest)",
        backgroundImage: "radial-gradient(#4cd7f615 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        border: "1px solid var(--border)",
        color: "var(--muted)",
        fontFamily: "var(--font-jetbrains), monospace",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <div style={{ fontSize: "10px", color: "var(--secondary)", opacity: 0.8 }}>
        PROJECT_VISUAL // UNAVAILABLE
      </div>

      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
        <div style={{ fontSize: "24px", opacity: 0.5 }}>
          [ ▧ ]
        </div>
        <div style={{ fontSize: "13px", letterSpacing: "0.1em", color: "var(--foreground)" }}>
          NO_VISUAL_ASSET
        </div>
      </div>

      <div style={{ fontSize: "9px", display: "flex", flexDirection: "column", gap: "2px" }}>
        <div>SOURCE: NOT_ASSIGNED</div>
        <div>STATUS: PLACEHOLDER</div>
      </div>
    </div>
  );
}
