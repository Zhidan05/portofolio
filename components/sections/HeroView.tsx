import Image from "next/image";
import { PixelButton } from "@/components/ui/PixelButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { HomeData } from "@/lib/home";

function getAccentClass(accent: string) {
  switch (accent) {
    case "primary": return "green";
    case "secondary": return "cyan";
    case "tertiary": return "violet";
    default: return "";
  }
}

export function HeroView({ homeData }: { homeData: HomeData }) {
  const { profile, segments, info_cards } = homeData;

  // Group segments by line_number to dynamically support any number of lines
  const linesMap = new Map<number, typeof segments>();
  for (const seg of segments) {
    if (!linesMap.has(seg.line_number)) linesMap.set(seg.line_number, []);
    linesMap.get(seg.line_number)!.push(seg);
  }
  const sortedLines = Array.from(linesMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, segs]) => segs.sort((a, b) => a.sort_order - b.sort_order));

  return (
    <section id="hero" className="hero container">
      <div className="hero-hud micro">
        <StatusBadge>LOC: {profile.system_location_code} {"//"} {profile.system_status_text}</StatusBadge>
        <span className="muted desktop-detail">{profile.region_primary} {"//"} {profile.region_secondary}</span>
      </div>
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hello code">
            {profile.greeting}
            <span className="cursor" aria-hidden="true" />
          </div>
          <h1>
            {sortedLines.map((line, lineIndex) => (
              line.length > 0 ? (
                <span key={lineIndex} style={{ display: "block", whiteSpace: "pre-wrap" }}>
                  {line.map(seg => (
                    <span
                      key={seg.id}
                      className={getAccentClass(seg.accent) || undefined}
                      style={seg.accent === "custom" && seg.custom_color ? { color: seg.custom_color } : undefined}
                    >
                      {seg.text}
                    </span>
                  ))}
                </span>
              ) : null
            ))}
          </h1>
          <p className="hero-description" style={{ whiteSpace: "pre-wrap" }}>
            {profile.description}
          </p>
          <div className="hero-actions">
            {profile.primary_cta_label && (
              <PixelButton href={profile.primary_cta_url}>{profile.primary_cta_label}</PixelButton>
            )}
            {profile.secondary_cta_label && (
              <PixelButton href={profile.secondary_cta_url} secondary>
                {profile.secondary_cta_label}
              </PixelButton>
            )}
            {profile.cv_enabled && profile.cv_url ? (
              <a className="code text-link" href={profile.cv_url}>
                {profile.cv_cta_label || "[ DOWNLOAD CV ↓ ]"}
              </a>
            ) : profile.cv_cta_label ? (
              <span className="micro muted">{profile.cv_cta_label}</span>
            ) : null}
          </div>
          {info_cards.length > 0 && (
            <dl className="hero-specs">
              {info_cards.map(card => (
                <div key={card.id}>
                  <dt>{card.label}</dt>
                  <dd className={getAccentClass(card.accent) || undefined}>{card.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="battlestation panel">
          <div className="window-bar">
            <span className="window-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>{profile.workspace_terminal_user}: {profile.workspace_terminal_path}</span>
          </div>
          <div className="workspace-art">
            <Image
              src="/assets/battlestation.svg"
              alt="Pixel-style developer workspace with dual monitors, code, a computer vision diagram, and headphones"
              width={460}
              height={320}
              priority
            />
          </div>
          <div className="telemetry-row micro">
            <span className="muted">{profile.workspace_label}</span>
            <StatusBadge>{profile.workspace_status}</StatusBadge>
          </div>
          <div className="telemetry-row code">
            <span className="muted micro">{profile.project_focus_label}</span>
            <span className="cyan">{profile.project_focus_value}</span>
          </div>
          <div className="telemetry-row micro">
            <span className="green">{profile.workspace_motto}</span>
            <span className="muted">{profile.workspace_mode}</span>
          </div>
          <div className="pixel-track" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
