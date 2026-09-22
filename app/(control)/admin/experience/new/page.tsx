import { ExperienceEditor } from "@/components/admin/experience/ExperienceEditor";

export const metadata = {
  title: "New Experience | Admin | HELSINKI",
};

export default function NewExperiencePage() {
  return (
    <section>
      <p className="code green">[ CONTENT MANAGEMENT // NEW EXPERIENCE ]</p>
      <h1>Create Experience</h1>
      <ExperienceEditor />
    </section>
  );
}
