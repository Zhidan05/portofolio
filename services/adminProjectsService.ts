/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { requireAdmin } from "@/lib/admin";
import { updateTag } from "next/cache";
import { PROJECTS_CACHE_TAG } from "@/lib/projects-cache";

export type AdminProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  short_description: string;
  descriptor: string | null;
  cover_image_url: string | null;
  repository_url: string | null;
  demo_url: string | null;
  status: "draft" | "published" | "archived";
  featured: boolean;
  sort_order: number;
  technologies: { id?: string; label: string; sort_order: number }[];
};

export async function getAdminProjects() {
  const { client } = await requireAdmin();
  if (!client) throw new Error("Unauthorized");

  const { data, error } = await (client as any)
    .from("portfolio_projects")
    .select(`
      *,
      portfolio_project_technologies (
        id, label, sort_order
      )
    `)
    .order("sort_order", { ascending: true });

  if (error) throw new Error("Failed to fetch projects");

  return data.map((project: any) => ({
    ...project,
    technologies: (project.portfolio_project_technologies || []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
  })) as AdminProject[];
}

export async function getAdminProject(id: string) {
  const { client } = await requireAdmin();
  if (!client) throw new Error("Unauthorized");

  const { data, error } = await (client as any)
    .from("portfolio_projects")
    .select(`
      *,
      portfolio_project_technologies (
        id, label, sort_order
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) throw new Error("Project not found");

  return {
    ...data,
    technologies: (data.portfolio_project_technologies || []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
  } as AdminProject;
}

export async function saveProject(project: Partial<AdminProject> & { technologies: { label: string; sort_order: number }[] }) {
  const { client } = await requireAdmin();
  if (!client) throw new Error("Unauthorized");

  const isUpdate = !!project.id;
  let projectId = project.id;

  const projectData = {
    slug: project.slug,
    title: project.title,
    category: project.category,
    short_description: project.short_description,
    descriptor: project.descriptor,
    cover_image_url: project.cover_image_url,
    repository_url: project.repository_url,
    demo_url: project.demo_url,
    status: project.status,
    featured: project.featured,
    sort_order: project.sort_order ?? 0,
  };

  if (isUpdate) {
    const { error: updateError } = await (client as any)
      .from("portfolio_projects")
      .update(projectData)
      .eq("id", projectId!);
    
    if (updateError) throw new Error(updateError.message);
  } else {
    const { data: inserted, error: insertError } = await (client as any)
      .from("portfolio_projects")
      .insert([projectData])
      .select("id")
      .single();

    if (insertError) throw new Error(insertError.message);
    projectId = inserted.id;
  }

  // Handle technologies
  if (projectId) {
    // Delete existing
    const { error: deleteError } = await (client as any)
      .from("portfolio_project_technologies")
      .delete()
      .eq("project_id", projectId);
      
    if (deleteError) throw new Error(deleteError.message);

    // Insert new
    if (project.technologies.length > 0) {
      const techData = project.technologies.map((t) => ({
        project_id: projectId,
        label: t.label,
        sort_order: t.sort_order,
      }));

      const { error: insertTechError } = await (client as any)
        .from("portfolio_project_technologies")
        .insert(techData);
        
      if (insertTechError) throw new Error(insertTechError.message);
    }
  }

  updateTag(PROJECTS_CACHE_TAG);
  return projectId;
}

export async function deleteProject(id: string) {
  const { client } = await requireAdmin();
  if (!client) throw new Error("Unauthorized");

  const { error } = await (client as any).from("portfolio_projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  updateTag(PROJECTS_CACHE_TAG);
}

export async function updateProjectOrder(orders: { id: string; sort_order: number }[]) {
  const { client } = await requireAdmin();
  if (!client) throw new Error("Unauthorized");

  for (const { id, sort_order } of orders) {
    const { error } = await (client as any)
      .from("portfolio_projects")
      .update({ sort_order })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
  
  updateTag(PROJECTS_CACHE_TAG);
}
