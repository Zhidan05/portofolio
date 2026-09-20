import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
export function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHeader
          index="03"
          label="SELECTED_PROJECTS"
          title="Prototypes & production apps"
          meta="4 PROJECTS // SELECTED WORK"
        />
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
