import { ExperienceList } from "@/components/admin/experience/ExperienceList";

export const metadata = {
  title: "Experience | Admin | HELSINKI",
};

export default function ExperienceAdminPage() {
  return (
    <section>
      <p className="code green">[ CONTENT MANAGEMENT // EXPERIENCE ]</p>
      <h1>Experience</h1>
      <ExperienceList />
    </section>
  );
}
