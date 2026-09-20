import { skills, focusAreas } from "@/data/skills";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechBadge } from "@/components/ui/TechBadge";
export function Skills() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <SectionHeader
          index="05"
          label="TECH_STACK"
          title="Stack matrix & engineering tools"
          meta="ARSENAL SPECIFICATION"
        />
        <div className="split-grid">
          <div className="skills-grid">
            {skills.map((skill) => (
              <article
                className={`panel skill-card accent-${skill.accent}`}
                key={skill.title}
              >
                <h3 className="code">
                  <span aria-hidden="true">{skill.icon}</span> {skill.title}
                </h3>
                <div className="badge-list">
                  {skill.items.map((item) => (
                    <TechBadge key={item}>{item}</TechBadge>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <aside className="panel focus-panel">
            <div className="card-meta">
              <span className="green">[ DEVELOPMENT_FOCUS ]</span>
              <span className="muted">ALWAYS LEARNING</span>
            </div>
            {focusAreas.map((area, i) => (
              <div
                className={`focus-row accent-${i === 1 ? "cyan" : i === 2 ? "violet" : "green"}`}
                key={area}
              >
                <div className="micro">
                  <span>{area}</span>
                  <span>ONGOING</span>
                </div>
                <div className="pixel-track" aria-hidden="true" />
              </div>
            ))}
            <p className="micro muted focus-note">
              An evolving toolkit, shaped by hands-on projects and continuous
              learning.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
