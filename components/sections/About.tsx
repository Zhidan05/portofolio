import { readPublicAbout } from "@/services/publicAboutService";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechBadge } from "@/components/ui/TechBadge";
export async function About() {
  const data = await readPublicAbout();
  const { profile, interests, tools, focus } = data;
  const record = [["NAME", profile.name], ["CLASS", profile.class], ["SPECIALIZATION", profile.specialization], ["AFFILIATION", profile.affiliation], ["LOCATION", profile.location]];
  const hi = profile.bio_highlight ? profile.bio_paragraph_1.indexOf(profile.bio_highlight) : -1;
  return (
    <section id="about" className="section section-dark">
      <div className="container">
        <SectionHeader
          index="02"
          label="ABOUT_ME"
          title="Player profile & mission"
          meta={`CLASS: ${profile.class_meta}`}
        />
        <div className="split-grid">
          <div>
            <div className="panel narrative">
              <span className="code cyan">{"// EXECUTE_BIO_SUMMARY"}</span>
              <p>{hi < 0 ? profile.bio_paragraph_1 : <>{profile.bio_paragraph_1.slice(0, hi)}<strong className="green">{profile.bio_highlight}</strong>{profile.bio_paragraph_1.slice(hi + profile.bio_highlight.length)}</>}</p>
              <p>{profile.bio_paragraph_2}</p>
              <p>{profile.bio_paragraph_3}</p>
              <div className="directive">
                <span className="green terminal-symbol" aria-hidden="true">
                  &gt;_
                </span>
                <div>
                  <strong className="code green">
                    CORE OPERATING DIRECTIVE:
                  </strong>
                  <p>“{profile.directive}”</p>
                </div>
              </div>
            </div>
            <div className="profile-specs micro">
              {focus.map((item) => <div key={item.id}><span className="muted">{item.code}</span><span>{item.label}</span></div>)}
            </div>
          </div>
          <aside className="panel character-record">
            <div className="card-meta">
              <span className="green">[ CHARACTER_RECORD ]</span>
              <span className="muted">ID: {profile.record_id}</span>
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
              {interests.map((item, i) => <div className="interest-row code" key={item.id}><span>{item.label}</span><span className={i % 2 ? "cyan" : "green"}>[ + ]</span></div>)}
            </div>
            <div className="record-block">
              <span className="micro muted">TACTICAL LOADOUT [TOOLS]</span>
              <div className="badge-list">
                {tools.map((tool) => <TechBadge key={tool.id}>{tool.label}</TechBadge>)}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
