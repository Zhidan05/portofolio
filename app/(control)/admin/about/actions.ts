"use server";
import { revalidatePath, updateTag } from "next/cache";
import { getAdminAccess } from "@/lib/admin";
import { ABOUT_CACHE_TAG } from "@/lib/about-cache";
import { validAbout } from "@/lib/aboutValidation";
import type { AboutData } from "@/lib/about";

type Result<T> = { ok: true; data: T } | { ok: false; message: string };
export async function loadAboutAction(): Promise<Result<AboutData | null>> {
  const { client, isAdmin } = await getAdminAccess();
  if (!client || !isAdmin) return { ok: false, message: "Your session or admin access could not be verified. Sign in again." };
  try {
    const { data, error } = await client.rpc("read_about");
    if (error) return { ok: false, message: "Unable to load the profile. Check the database setup and retry." };
    return { ok: true, data };
  } catch { return { ok: false, message: "Unable to load the profile. Please retry." }; }
}
export async function saveAboutAction(content: unknown): Promise<Result<string>> {
  const { client, isAdmin } = await getAdminAccess();
  if (!client || !isAdmin) return { ok: false, message: "Your session or admin access could not be verified. Sign in again." };
  if (!validAbout(content)) return { ok: false, message: "Review the fields and list items before saving." };
  let revision: string;
  try {
    const { data, error } = await client.rpc("save_about", { content, expected_revision: content.revision });
    if (error) return { ok: false, message: error.code === "40001"
      ? "This record changed in another session. Reload before editing again."
      : "Update failed. Check your connection and admin access, then retry." };
    revision = data;
  } catch { return { ok: false, message: "Update could not be confirmed. Reload before retrying." }; }
  updateTag(ABOUT_CACHE_TAG);
  revalidatePath("/");
  return { ok: true, data: revision };
}
