import { getAdminProjects } from "@/services/adminProjectsService";
import { ProjectsList } from "@/components/admin/ProjectsList";

export const metadata = { title: "Admin // Projects" };

export default async function ProjectsAdminPage() {
  const projects = await getAdminProjects();
  return (
    <section>
      <p className="code green">[ CONTENT MANAGEMENT // PROJECTS ]</p>
      <h1>Projects</h1>
      <ProjectsList initialProjects={projects} />
    </section>
  );
}
