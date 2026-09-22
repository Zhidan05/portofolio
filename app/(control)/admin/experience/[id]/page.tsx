import { ExperienceEditor } from "@/components/admin/experience/ExperienceEditor";
import { readExperience } from "@/services/experienceService";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Experience | Admin | HELSINKI",
};

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const experience = await readExperience(resolvedParams.id);

  if (!experience) {
    notFound();
  }

  return (
    <section>
      <p className="code green">[ CONTENT MANAGEMENT // EDIT EXPERIENCE ]</p>
      <h1>Edit Experience</h1>
      <ExperienceEditor initialData={experience} />
    </section>
  );
}
