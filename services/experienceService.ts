"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateTag, revalidatePath } from "next/cache";
import { validExperience } from "@/lib/experienceValidation";
import type { ExperienceRecord, ExperienceTag } from "@/lib/experience";

export async function readAllExperiences(): Promise<ExperienceRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_experiences")
    .select(`*, tags:portfolio_experience_tags(*)`)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((exp: unknown) => {
    const e = exp as Record<string, unknown>;
    return {
      ...e,
      tags: ((e.tags as ExperienceTag[]) || []).sort((a, b) => a.sort_order - b.sort_order),
    };
  }) as unknown as ExperienceRecord[];
}

export async function readExperience(id: string): Promise<ExperienceRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_experiences")
    .select(`*, tags:portfolio_experience_tags(*)`)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  const exp = data as Record<string, unknown>;
  return {
    ...exp,
    tags: ((exp.tags as ExperienceTag[]) || []).sort((a, b) => a.sort_order - b.sort_order),
  } as unknown as ExperienceRecord;
}

export async function saveExperience(record: ExperienceRecord): Promise<void> {
  if (!validExperience(record)) throw new Error("Invalid experience record payload");
  
  const supabase = await createSupabaseServerClient();
  // Call the atomic save_experience function
  const { error } = await supabase.rpc("save_experience", {
    exp_json: record,
    tags_json: record.tags,
  });

  if (error) throw new Error(error.message);
  updateTag("portfolio-experience");
  revalidatePath("/");
}

export async function deleteExperience(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("portfolio_experiences")
    .delete()
    .eq("id", id);
    
  if (error) throw new Error(error.message);
  updateTag("portfolio-experience");
  revalidatePath("/");
}

export async function reorderExperiences(ids: string[]): Promise<void> {
  if (!Array.isArray(ids) || ids.some(id => typeof id !== "string")) {
    throw new Error("Invalid order payload");
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("reorder_experiences", { exp_ids: ids });
  if (error) throw new Error(error.message);
  updateTag("portfolio-experience");
  revalidatePath("/");
}
