import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, supabaseConfigured } from "@/lib/supabase/config";
import { projects as fallbackProjects } from "@/data/projects";
import { PROJECTS_CACHE_TAG } from "@/lib/projects-cache";

export type PublicProject = {
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
  technologies: string[];
};

export async function readPublicProjects(): Promise<PublicProject[]> {
  if (!supabaseConfigured) {
    return fallbackProjects.map((p, index) => ({
      id: p.id,
      slug: `fallback-${p.id}`,
      title: p.title,
      category: p.category,
      short_description: p.description,
      descriptor: p.detail,
      cover_image_url: null,
      repository_url: p.github,
      demo_url: p.demo,
      status: "published",
      featured: true,
      sort_order: index,
      technologies: p.technologies,
    }));
  }
  const { url, key } = getSupabaseConfig();
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, {
        ...init,
        next: { revalidate: 60, tags: [PROJECTS_CACHE_TAG] },
      }),
    },
  });
  
  try {
    const { data, error } = await client
      .from("portfolio_projects")
      .select(`
        *,
        portfolio_project_technologies (
          label, sort_order
        )
      `)
      .eq("status", "published")
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .abortSignal(AbortSignal.timeout(10000));
      
    if (error || !data) return [];
    
    return data.map(project => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      category: project.category,
      short_description: project.short_description,
      descriptor: project.descriptor,
      cover_image_url: project.cover_image_url,
      repository_url: project.repository_url,
      demo_url: project.demo_url,
      status: project.status as "draft" | "published" | "archived",
      featured: project.featured,
      sort_order: project.sort_order,
      technologies: (project.portfolio_project_technologies || [])
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        .map((t: { label: string }) => t.label)
    }));
  } catch {
    return [];
  }
}
