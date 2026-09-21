import type { PublicProject } from "@/services/publicProjectsService";
import { TechBadge } from "./TechBadge";

import { ProjectCoverImage } from "./ProjectCoverImage";

export function ProjectCard({ project, index }: { project: PublicProject; index: number }) {
  const accents = ["green", "cyan", "violet"];
  const accent = accents[index % accents.length];
  const hexIndex = index.toString(16).toUpperCase();

  return (
    <article className={`project-card panel accent-${accent}`}>
      <ProjectCoverImage src={project.cover_image_url} alt={project.title} />
      <div className="card-meta">
        <span>[ {project.category} ]</span>
        <span className="muted">
          {String(index + 1).padStart(2, "0")}
          {" // LOC: 0xA"}
          {hexIndex}
        </span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.short_description}</p>
      {project.descriptor && (
        <div className="project-telemetry">▣ &nbsp;{project.descriptor}</div>
      )}
      <div className="badge-list">
        {project.technologies.map((tech) => (
          <TechBadge key={tech}>{tech}</TechBadge>
        ))}
      </div>
      <div className="project-links">
        {project.repository_url ? (
          <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
            [ Repository ↗ ]
          </a>
        ) : (
          <span className="muted">[ Repository pending ]</span>
        )}
        {project.demo_url ? (
          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
            [ Live demo ↗ ]
          </a>
        ) : (
          <span className="muted">[ Demo pending ]</span>
        )}
      </div>
    </article>
  );
}
