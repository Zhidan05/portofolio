"use server";
import { revalidatePath, updateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import type { HomeData } from "@/lib/home";
import { HOME_CACHE_TAG } from "@/lib/home-cache";
import { validHome } from "@/lib/homeValidation";

export async function loadHomeAction(): Promise<{ ok: true; data: HomeData | null } | { ok: false; message: string }> {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("read_home");
    if (error) return { ok: false, message: error.message };
    return { ok: true, data: data as HomeData };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to load Home data" };
  }
}

export async function saveHomeAction(content: HomeData): Promise<{ ok: true; data: string } | { ok: false; message: string }> {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    if (!validHome(content)) return { ok: false, message: "Review the fields and list items before saving. Values may be too long." };

    // CTA URL basic validation
    const urls = [
      content.profile.primary_cta_url,
      content.profile.secondary_cta_url,
      content.profile.cv_url,
    ];
    for (const u of urls) {
      if (u.trim().toLowerCase().startsWith("javascript:") ||
          u.trim().toLowerCase().startsWith("data:") ||
          u.trim().toLowerCase().startsWith("vbscript:")) {
        return { ok: false, message: "Invalid URL protocol detected." };
      }
    }

    const { data, error } = await supabase.rpc("save_home", {
      content,
      expected_revision: content.revision,
    });
    if (error) {
      if (error.code === "40001") return { ok: false, message: "RECORD_CHANGED_SINCE_LOAD" };
      return { ok: false, message: error.message };
    }
    updateTag(HOME_CACHE_TAG);
    revalidatePath("/");
    return { ok: true, data: data as string };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to save Home data" };
  }
}
