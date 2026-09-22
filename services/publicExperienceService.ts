import { createSupabaseServerClient } from "@/lib/supabase/server";
import { experience as fallbackExperience } from "@/data/experience";
import type { ExperienceRecord } from "@/lib/experience";

export async function readPublicExperiences(): Promise<ExperienceRecord[]> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("portfolio_experiences")
      .select(`*, tags:portfolio_experience_tags(*)`)
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    
    return (data || []).map((exp: unknown) => {
      const e = exp as Record<string, unknown>;
      return {
        ...e,
        tags: ((e.tags as any[]) || []).sort((a, b) => a.sort_order - b.sort_order),
      };
    }) as unknown as ExperienceRecord[];
    
  } catch (error) {
    console.error("Experience fetch error:", error);
    
    // Transform the static fallback data into the ExperienceRecord shape
    return fallbackExperience.map((exp, index) => ({
      id: `fallback-exp-${index}`,
      organization: exp.organization,
      role: exp.role,
      description: exp.description,
      start_label: exp.dates.includes("//") ? exp.dates.split("//")[0].trim() : exp.dates,
      end_label: exp.dates.includes("//") ? exp.dates.split("//")[1].trim() : null,
      status: exp.status === "ACTIVE MISSION" ? "active" : exp.status === "DORMANT" ? "inactive" : "completed",
      status_label: exp.status,
      accent: exp.accent === "green" ? "primary" : exp.accent === "cyan" ? "secondary" : "tertiary",
      custom_accent_color: null,
      is_current: exp.dates.includes("PRESENT"),
      sort_order: index,
      published: true,
      tags: exp.technologies.map((tech, tIndex) => ({
        id: `fallback-tag-${index}-${tIndex}`,
        label: tech,
        sort_order: tIndex,
      })),
    }));
  }
}
