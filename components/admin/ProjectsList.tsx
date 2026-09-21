"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { AdminProject } from "@/services/adminProjectsService";
import { deleteProject, updateProjectOrder } from "@/services/adminProjectsService";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "./ConfirmDialog";

export function ProjectsList({ initialProjects }: { initialProjects: AdminProject[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<AdminProject | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === projects.length - 1) return;

    const newProjects = [...projects];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;

    // Update sort_order
    const updated = newProjects.map((p, i) => ({ ...p, sort_order: i }));
    setProjects(updated);

    startTransition(async () => {
      try {
        await updateProjectOrder(updated.map(p => ({ id: p.id, sort_order: p.sort_order })));
        router.refresh();
      } catch (err) {
        console.error(err);
        setProjects(projects); // revert
      }
    });
  };

  const handleDeleteClick = (project: AdminProject) => {
    setDeleteConfirmProject(project);
    setDeleteError(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmProject) return;
    
    startTransition(async () => {
      setDeleteError(null);
      try {
        await deleteProject(deleteConfirmProject.id);
        setProjects(projects.filter(p => p.id !== deleteConfirmProject.id));
        setDeleteConfirmProject(null);
        router.refresh();
      } catch (err) {
        console.error(err);
        setDeleteError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmProject(null);
    setDeleteError(null);
  };

  return (
    <div className="projects-list">
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/projects/new" className="pixel-button secondary">
          [ + NEW PROJECT ]
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {projects.map((project, idx) => (
          <div key={project.id} className="panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>{project.title}</h3>
                <div className="muted micro">
                  {project.category} {"//"} {project.status.toUpperCase()} 
                  {project.featured && " // FEATURED"}
                </div>
              </div>
              <div className="editor-actions" style={{ marginTop: 0 }}>
                <Link href={`/admin/projects/${project.id}`} className="admin-action-btn primary">
                  [ EDIT ]
                </Link>
                <button 
                  className="admin-action-btn"
                  onClick={() => handleMove(idx, "up")}
                  disabled={idx === 0 || isPending}
                >
                  [ UP ]
                </button>
                <button 
                  className="admin-action-btn"
                  onClick={() => handleMove(idx, "down")}
                  disabled={idx === projects.length - 1 || isPending}
                >
                  [ DOWN ]
                </button>
                <button 
                  className="admin-action-btn danger"
                  onClick={() => handleDeleteClick(project)}
                  disabled={isPending || deleteConfirmProject?.id === project.id}
                >
                  [ DELETE ]
                </button>
              </div>
            </div>
            
            <div className="micro muted" style={{ display: "flex", gap: "1rem" }}>
              <span>IMG: {project.cover_image_url ? "YES" : "NO"}</span>
              <span>REPO: {project.repository_url ? "YES" : "NO"}</span>
              <span>DEMO: {project.demo_url ? "YES" : "NO"}</span>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="panel muted">NO PROJECTS FOUND</div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={!!deleteConfirmProject}
        title="[ SYSTEM WARNING // DELETE RECORD ]"
        message="> CONFIRM_RECORD_DELETION"
        itemName={deleteConfirmProject?.title}
        description="Deleting this project will permanently remove the project record and its related project technologies. If the project has an uploaded image, the existing image cleanup logic must continue to run."
        metadata={{
          "RECORD_TYPE": "PROJECT",
          "OPERATION": "PERMANENT_DELETE"
        }}
        confirmLabel="DELETE PROJECT"
        destructive={true}
        loading={isPending && !!deleteConfirmProject}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
