import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, supabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";
import { experience as fallbackExperience } from "@/data/experience";
import type { ExperienceRecord, ExperienceTag } from "@/lib/experience";

export async function readPublicExperiences(): Promise<ExperienceRecord[]> {
  const fallback = () => fallbackExperience.map((exp, index) => ({
    id: `fallback-exp-${index}`,
    organization: exp.organization,
    role: exp.role,
    description: exp.description,
    start_label: exp.dates.includes("//") ? exp.dates.split("//")[0].trim() : exp.dates,
    end_label: exp.dates.includes("//") ? exp.dates.split("//")[1].trim() : null,
    status: exp.status === "ACTIVE MISSION" ? "active" as const : exp.status === "DORMANT" ? "inactive" as const : "completed" as const,
    status_label: exp.status,
    accent: exp.accent === "green" ? "primary" as const : exp.accent === "cyan" ? "secondary" as const : "tertiary" as const,
    custom_accent_color: null,
    is_current: exp.dates.includes("PRESENT"), sort_order: index, published: true,
    tags: exp.technologies.map((tech, tagIndex) => ({ id: `fallback-tag-${index}-${tagIndex}`, label: tech, sort_order: tagIndex })),
  }));
  if (!supabaseConfigured) return fallback();
  try {
    const { url, key } = getSupabaseConfig();
    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60, tags: ["portfolio-experience"] } }) },
    });
    
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
        tags: ((e.tags as ExperienceTag[]) || []).sort((a, b) => a.sort_order - b.sort_order),
      };
    }) as unknown as ExperienceRecord[];
    
  } catch { return fallback(); }
}
