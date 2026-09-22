import { TechBadge } from "@/components/ui/TechBadge";
import type { ExperienceRecord } from "@/lib/experience";

export function ExperienceCardView({ job }: { job: ExperienceRecord }) {
  const dates = job.end_label ? `${job.start_label} // ${job.end_label}` : job.start_label;
  const inlineStyle = job.accent === "custom" && job.custom_accent_color ? { "--accent": job.custom_accent_color } as React.CSSProperties : {};
  const className = job.accent === "custom" ? "accent-custom" : `accent-${job.accent === "primary" ? "green" : job.accent === "secondary" ? "cyan" : "violet"}`;

  return (
    <li className={className} style={inlineStyle}>
      <article className="panel">
        <div className="experience-heading">
          <h3>{job.organization}</h3>
          <span className="micro job-status">[ {job.status_label} ]</span>
          <span className="code job-dates">{dates}</span>
        </div>
        <p className="job-role code">{job.role}</p>
        <p>{job.description}</p>
        <div className="badge-list">
          {job.tags.map((tag) => (
            <TechBadge key={tag.id}>{tag.label}</TechBadge>
          ))}
        </div>
      </article>
    </li>
  );
}
