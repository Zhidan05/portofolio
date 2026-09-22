"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { readAllExperiences, deleteExperience, reorderExperiences } from "@/services/experienceService";
import type { ExperienceRecord } from "@/lib/experience";
import { ConfirmDialog } from "../ConfirmDialog";
import { useRouter } from "next/navigation";

export function ExperienceList() {
  const [items, setItems] = useState<ExperienceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmExp, setDeleteConfirmExp] = useState<ExperienceRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  async function load() {
    try {
      setLoading(true);
      const data = await readAllExperiences();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    load();
  }, []);

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update sort_order
    const updated = newItems.map((p, i) => ({ ...p, sort_order: i }));
    setItems(updated);

    startTransition(async () => {
      try {
        await reorderExperiences(updated.map(p => p.id));
        router.refresh();
      } catch (err) {
        console.error(err);
        setItems(items); // revert
      }
    });
  };

  const handleDeleteClick = (exp: ExperienceRecord) => {
    setDeleteConfirmExp(exp);
    setDeleteError(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmExp) return;
    
    startTransition(async () => {
      setDeleteError(null);
      try {
        await deleteExperience(deleteConfirmExp.id);
        setItems(items.filter(p => p.id !== deleteConfirmExp.id));
        setDeleteConfirmExp(null);
        router.refresh();
      } catch (err) {
        console.error(err);
        setDeleteError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmExp(null);
    setDeleteError(null);
  };

  const getAccentName = (accent: string, customHex: string | null) => {
    if (accent === "primary") return "Helsinki Green";
    if (accent === "secondary") return "Helsinki Cyan";
    if (accent === "tertiary") return "Helsinki Violet";
    if (accent === "custom" && customHex) return customHex.toUpperCase();
    return accent.toUpperCase();
  };

  const getAccentColor = (accent: string, customHex: string | null) => {
    if (accent === "custom" && customHex) return customHex;
    return `var(--${accent})`;
  };

  if (loading) return <section className="panel muted" role="status">&gt; FETCHING_RECORDS...</section>;

  return (
    <div className="experience-list">
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/experience/new" className="pixel-button secondary">
          [ + NEW EXPERIENCE ]
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {items.map((item, idx) => (
          <div key={item.id} className="panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>{item.organization}</h3>
                <div className="muted micro">
                  {item.role} {"//"} {item.start_label} {"//"} {item.end_label || "PRESENT"}
                </div>
              </div>
              <div className="editor-actions" style={{ marginTop: 0 }}>
                <Link href={`/admin/experience/${item.id}`} className="admin-action-btn primary">
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
                  disabled={idx === items.length - 1 || isPending}
                >
                  [ DOWN ]
                </button>
                <button 
                  className="admin-action-btn danger"
                  onClick={() => handleDeleteClick(item)}
                  disabled={isPending || deleteConfirmExp?.id === item.id}
                >
                  [ DELETE ]
                </button>
              </div>
            </div>
            
            <div className="micro muted" style={{ display: "flex", gap: "1rem" }}>
              <span>STATUS: {item.status_label}</span>
              <span>VISIBILITY: {item.published ? "PUBLISHED" : "DRAFT"}</span>
              <span>TAGS: {item.tags.length}</span>
              <span style={{ color: getAccentColor(item.accent, item.custom_accent_color) }}>
                ACCENT: ■ {getAccentName(item.accent, item.custom_accent_color)}
              </span>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="panel muted">NO EXPERIENCES FOUND</div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={!!deleteConfirmExp}
        title="[ SYSTEM WARNING // DELETE RECORD ]"
        message="> CONFIRM_RECORD_DELETION"
        itemName={deleteConfirmExp?.organization}
        description="Deleting this experience will also permanently remove its associated tags."
        metadata={{
          "RECORD_TYPE": "EXPERIENCE",
          "OPERATION": "PERMANENT_DELETE"
        }}
        confirmLabel="DELETE EXPERIENCE"
        destructive={true}
        loading={isPending && !!deleteConfirmExp}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
