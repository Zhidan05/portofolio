import { readPublicProjects } from "@/services/publicProjectsService";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

export async function Projects() {
  const projects = await readPublicProjects();
  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHeader
          index="03"
          label="SELECTED_PROJECTS"
          title="Prototypes & production apps"
          meta={`${projects.length} PROJECTS // SELECTED WORK`}
        />
        <div className="projects-grid">
          {projects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
