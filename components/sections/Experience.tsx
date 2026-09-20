import { experience } from "@/data/experience";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechBadge } from "@/components/ui/TechBadge";
export function Experience() {
  return (
    <section id="experience" className="section section-dark">
      <div className="container">
        <SectionHeader
          index="04"
          label="EXPERIENCE_LOG"
          title="Mission chronology & sites"
          meta="LEVEL PROGRESSION TIMELINE"
        />
        <ol className="timeline">
          {experience.map((job) => (
            <li className={`accent-${job.accent}`} key={job.organization}>
              <article className="panel">
                <div className="experience-heading">
                  <h3>{job.organization}</h3>
                  <span className="micro job-status">[ {job.status} ]</span>
                  <span className="code job-dates">{job.dates}</span>
                </div>
                <p className="job-role code">{job.role}</p>
                <p>{job.description}</p>
                <div className="badge-list">
                  {job.technologies.map((tech) => (
                    <TechBadge key={tech}>{tech}</TechBadge>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
