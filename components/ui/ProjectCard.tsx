import type { Project } from "@/data/projects";
import { TechBadge } from "./TechBadge";
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={`project-card panel accent-${project.accent}`}>
      <div className="card-meta">
        <span>[ {project.category} ]</span>
        <span className="muted">
          {project.id}
          {" // LOC: 0xA"}
          {Number(project.id) - 1}
        </span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="project-telemetry">▣ &nbsp;{project.detail}</div>
      <div className="badge-list">
        {project.technologies.map((tech) => (
          <TechBadge key={tech}>{tech}</TechBadge>
        ))}
      </div>
      <div className="project-links">
        {project.github ? (
          <a href={project.github} target="_blank" rel="noreferrer">
            [ GitHub ↗ ]
          </a>
        ) : (
          <span className="muted">[ Repository pending ]</span>
        )}
        {project.demo ? (
          <a href={project.demo} target="_blank" rel="noreferrer">
            [ Live demo ↗ ]
          </a>
        ) : (
          <span className="muted">[ Demo pending ]</span>
        )}
      </div>
    </article>
  );
}
