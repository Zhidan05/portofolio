import Image from "next/image";
import { PixelButton } from "@/components/ui/PixelButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { profile } from "@/data/profile";
export function Hero() {
  return (
    <section id="hero" className="hero container">
      <div className="hero-hud micro">
        <StatusBadge>LOC: 0x00_INIT // BOOT_SEQ_COMPLETE</StatusBadge>
        <span className="muted desktop-detail">INDONESIA [ID] // SUMATERA</span>
      </div>
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hello code">
            &gt; HELLO WORLD
            <span className="cursor" aria-hidden="true" />
          </div>
          <h1>
            Hi, I&apos;m <span className="green">Zhidan</span>. I build
            software, <span className="cyan">AI systems</span>, and{" "}
            <span className="violet">digital experiences</span>.
          </h1>
          <p className="hero-description">
            Informatics Engineering student focused on software development,
            computer vision, web applications, and practical technology
            solutions calibrated for real-world reliability.
          </p>
          <div className="hero-actions">
            <PixelButton href="#projects">&gt; RUN_PROJECTS ↓</PixelButton>
            <PixelButton href="#contact" secondary>
              [ GET IN TOUCH ↗ ]
            </PixelButton>
            {profile.cv ? (
              <a className="code text-link" href={profile.cv}>
                [ DOWNLOAD CV ↓ ]
              </a>
            ) : (
              <span className="micro muted">[ CV COMING SOON ]</span>
            )}
          </div>
          <dl className="hero-specs">
            <div>
              <dt>ROLE</dt>
              <dd>Software Dev</dd>
            </div>
            <div>
              <dt>FOCUS</dt>
              <dd className="cyan">Web / CV / Edge AI</dd>
            </div>
            <div>
              <dt>LOCATION</dt>
              <dd className="green">Indonesia [ID]</dd>
            </div>
          </dl>
        </div>
        <div className="battlestation panel">
          <div className="window-bar">
            <span className="window-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>zhidan@battlestation: ~/workspace</span>
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
            <span className="muted">WORKSPACE_INTERFACE</span>
            <StatusBadge>READY</StatusBadge>
          </div>
          <div className="telemetry-row code">
            <span className="muted micro">PROJECT FOCUS:</span>
            <span className="cyan">Computer Vision</span>
          </div>
          <div className="telemetry-row micro">
            <span className="green">BUILD. LEARN. ITERATE.</span>
            <span className="muted">[ DEV_MODE ]</span>
          </div>
          <div className="pixel-track" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
