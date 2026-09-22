import { loadHomeAction, saveHomeAction } from "@/app/(control)/admin/home/actions";
import type { HomeData } from "@/lib/home";

export async function readHome(): Promise<HomeData | null> {
  const result = await loadHomeAction();
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function saveHome(content: HomeData): Promise<string> {
  const result = await saveHomeAction(content);
  if (!result.ok) throw new Error(result.message);
  return result.data;
}
