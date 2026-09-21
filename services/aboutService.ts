import { loadAboutAction, saveAboutAction } from "@/app/(control)/admin/about/actions";
import type { AboutData } from "@/lib/about";

export async function readAbout(): Promise<AboutData | null> {
  const result = await loadAboutAction();
  if (!result.ok) throw new Error(result.message);
  return result.data;
}
export async function saveAbout(content: AboutData): Promise<string> {
  const result = await saveAboutAction(content);
  if (!result.ok) throw new Error(result.message);
  return result.data;
}
