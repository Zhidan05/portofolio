import { readPublicExperiences } from "@/services/publicExperienceService";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ExperienceCardView } from "./ExperienceCard";

export async function Experience() {
  const experiences = await readPublicExperiences();

  return (
    <section id="experience" className="section section-dark">
      <div className="container">
        <SectionHeader
          index="04"
          label="EXPERIENCE_LOG"
          title="Mission chronology & sites"
          meta="LEVEL PROGRESSION TIMELINE"
        />
        {experiences.length === 0 ? (
          <div className="panel code muted">&gt; NO_PUBLIC_EXPERIENCE_RECORDS</div>
        ) : (
          <ol className="timeline">
            {experiences.map((job) => (
              <ExperienceCardView key={job.id} job={job} />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

