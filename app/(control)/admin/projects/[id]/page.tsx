import { getAdminProject } from "@/services/adminProjectsService";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export const metadata = { title: "Admin // Edit Project" };

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = await getAdminProject(params.id);
  
  return (
    <section>
      <p className="code green">[ CONTENT MANAGEMENT // EDIT PROJECT ]</p>
      <h1>Edit Project: {project.title}</h1>
      <ProjectEditor project={project} />
    </section>
  );
}
