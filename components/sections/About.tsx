import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechBadge } from "@/components/ui/TechBadge";
export function About() {
  const record = [
    ["NAME", "Zhidan"],
    ["CLASS", "Informatics Engineering"],
    ["SPECIALIZATION", "Full-Stack & Vision Systems"],
    ["AFFILIATION", "Universitas Riau"],
    ["LOCATION", "Indonesia"],
  ];
  return (
    <section id="about" className="section section-dark">
      <div className="container">
        <SectionHeader
          index="02"
          label="ABOUT_ME"
          title="Player profile & mission"
          meta="CLASS: INFORMATICS_ENGINEER"
        />
        <div className="split-grid">
          <div>
            <div className="panel narrative">
              <span className="code cyan">{"// EXECUTE_BIO_SUMMARY"}</span>
              <p>
                I am an{" "}
                <strong className="green">
                  Informatics Engineering student
                </strong>{" "}
                interested in the mechanics of resilient computing. My
                engineering path connects structured software design, full-stack
                applications, and computer vision.
              </p>
              <p>
                I like bringing machine learning and web systems together: from
                face recognition and attendance workflows to safety monitoring
                and useful digital experiences.
              </p>
              <p>
                Every project is an opportunity to make technology more
                practical, with thoughtful requirements, readable code, and
                clear interfaces.
              </p>
              <div className="directive">
                <span className="green terminal-symbol" aria-hidden="true">
                  &gt;_
                </span>
                <div>
                  <strong className="code green">
                    CORE OPERATING DIRECTIVE:
                  </strong>
                  <p>
                    “Simplicity in interface, rigor in architecture, practical
                    utility over decorative hype.”
                  </p>
                </div>
              </div>
            </div>
            <div className="profile-specs micro">
              {[
                "SOFTWARE DEVELOPMENT",
                "COMPUTER VISION",
                "WEB APPLICATIONS",
                "CONTINUOUS LEARNING",
              ].map((text, i) => (
                <div key={text}>
                  <span className="muted">FOCUS_0{i + 1}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <aside className="panel character-record">
            <div className="card-meta">
              <span className="green">[ CHARACTER_RECORD ]</span>
              <span className="muted">ID: ZHIDAN</span>
            </div>
            <dl>
              {record.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}:</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="record-block">
              <span className="micro muted">ENGINEERING INTERESTS</span>
              {[
                "Web Architecture",
                "Computer Vision & YOLO",
                "Edge AI & Recognition",
                "Network Protocols & Sockets",
              ].map((item, i) => (
                <div className="interest-row code" key={item}>
                  <span>{item}</span>
                  <span className={i % 2 ? "cyan" : "green"}>[ + ]</span>
                </div>
              ))}
            </div>
            <div className="record-block">
              <span className="micro muted">TACTICAL LOADOUT [TOOLS]</span>
              <div className="badge-list">
                {["VS Code", "Linux / WSL", "Docker", "Git", "Postman"].map(
                  (tool) => (
                    <TechBadge key={tool}>{tool}</TechBadge>
                  ),
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
