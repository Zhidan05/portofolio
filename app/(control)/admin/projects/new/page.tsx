import { ProjectEditor } from "@/components/admin/ProjectEditor";

export const metadata = { title: "Admin // New Project" };

export default function NewProjectPage() {
  return (
    <section>
      <p className="code green">[ CONTENT MANAGEMENT // NEW PROJECT ]</p>
      <h1>Create Project</h1>
      <ProjectEditor />
    </section>
  );
}
