"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveExperience } from "@/services/experienceService";
import type { ExperienceRecord, ExperienceAccent } from "@/lib/experience";
import { ExperienceCardView } from "@/components/sections/ExperienceCard";

const COLOR_PRESETS: { label: string; accent: ExperienceAccent; hex?: string }[] = [
  { label: "Helsinki Green", accent: "primary", hex: "#4EDEA3" },
  { label: "Helsinki Cyan", accent: "secondary", hex: "#4CD7F6" },
  { label: "Helsinki Violet", accent: "tertiary", hex: "#D0BCFF" },
];

export function ExperienceEditor({ initialData }: { initialData?: ExperienceRecord }) {
  const router = useRouter();
  
  const [draft, setDraft] = useState<ExperienceRecord>(initialData || {
    id: "",
    organization: "",
    role: "",
    description: "",
    start_label: "",
    end_label: "",
    status: "active",
    status_label: "ACTIVE MISSION",
    accent: "primary",
    custom_accent_color: null,
    is_current: false,
    sort_order: 0,
    published: true,
    tags: []
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const saving = useRef(false);

  useEffect(() => {
    if (!draft.id) {
      // eslint-disable-next-line
      setDraft(d => ({ ...d, id: crypto.randomUUID() }));
    }
  }, [draft.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");

    try {
      await saveExperience(draft);
      router.push("/admin/experience");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  const update = (updates: Partial<ExperienceRecord>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="home-editor-container">
      <div className="home-editor-main">
        <form className="control-form" onSubmit={handleSave}>
          <fieldset disabled={busy} style={{ border: 'none', padding: 0, margin: 0 }}>
            <div className="panel control-fields" style={{ marginBottom: "24px" }}>
              <legend className="code cyan">BASIC INFORMATION</legend>
              <div className="form-grid">
                <label>
                  <span>Organization</span>
                  <input required maxLength={150} value={draft.organization} onChange={e => update({ organization: e.target.value })} />
                </label>
                <label>
                  <span>Role / Position</span>
                  <input required maxLength={150} value={draft.role} onChange={e => update({ role: e.target.value })} />
                </label>
              </div>
            </div>

            <div className="panel control-fields" style={{ marginBottom: "24px" }}>
              <legend className="code cyan">TIMELINE</legend>
              <div className="form-grid compact">
                <label>
                  <span>Start Label (e.g. 2026)</span>
                  <input required maxLength={30} value={draft.start_label} onChange={e => update({ start_label: e.target.value })} />
                </label>
                <label>
                  <span>End Label (e.g. PRESENT)</span>
                  <input maxLength={30} value={draft.end_label || ""} onChange={e => update({ end_label: e.target.value || null })} />
                </label>
              </div>
              <div style={{ marginTop: "16px" }}>
                <label className="toggle-switch">
                  <input type="checkbox" checked={draft.is_current} onChange={e => {
                    const is_current = e.target.checked;
                    update({ is_current, end_label: is_current ? "PRESENT" : draft.end_label });
                  }} />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label code micro">CURRENT EXPERIENCE</span>
                </label>
              </div>
            </div>

            <div className="panel control-fields" style={{ marginBottom: "24px" }}>
              <legend className="code cyan">STATUS</legend>
              <div className="form-grid compact">
                <label>
                  <span>Semantic Status</span>
                  <select value={draft.status} onChange={e => update({ status: e.target.value as any })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>
                <label>
                  <span>Visible Status Label (e.g. ACTIVE MISSION)</span>
                  <input required maxLength={50} value={draft.status_label} onChange={e => update({ status_label: e.target.value })} />
                </label>
              </div>
              <div style={{ marginTop: "16px" }}>
                <label className="toggle-switch">
                  <input type="checkbox" checked={draft.published} onChange={e => update({ published: e.target.checked })} />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label code micro">PUBLISHED</span>
                </label>
              </div>
            </div>

            <div className="panel control-fields" style={{ marginBottom: "24px" }}>
              <legend className="code cyan">DESCRIPTION</legend>
              <div className="form-grid">
                <label>
                  <span className="sr-only">Description</span>
                  <textarea required maxLength={1000} rows={4} value={draft.description} onChange={e => update({ description: e.target.value })} />
                </label>
              </div>
            </div>

            <div className="panel control-fields" style={{ marginBottom: "24px" }}>
              <legend className="code cyan">TIMELINE ACCENT</legend>
              <div className="color-presets" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="muted code micro">RECOMMENDED</span>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {COLOR_PRESETS.map(preset => (
                    <label key={preset.accent} className="radio-label">
                      <input type="radio" name="accent" checked={draft.accent === preset.accent} onChange={() => update({ accent: preset.accent, custom_accent_color: null })} />
                      <span className="swatch" style={{ background: preset.hex }} />
                      {preset.label}
                    </label>
                  ))}
                </div>
                
                <span className="muted code micro">CUSTOM</span>
                <label className="radio-label" style={{ marginBottom: '8px' }}>
                  <input type="radio" name="accent" checked={draft.accent === "custom"} onChange={() => update({ accent: "custom", custom_accent_color: draft.custom_accent_color || "#FFB86C" })} />
                  <span className="swatch" style={{ background: draft.custom_accent_color || "var(--foreground)" }} />
                  Custom Hex
                </label>
                {draft.accent === "custom" && (
                  <div className="custom-color-picker">
                    <input type="color" value={draft.custom_accent_color || "#000000"} onChange={e => update({ custom_accent_color: e.target.value })} />
                    <input type="text" className="code" value={draft.custom_accent_color || ""} onChange={e => {
                      let val = e.target.value;
                      if (!val.startsWith("#")) val = "#" + val;
                      update({ custom_accent_color: val });
                    }} pattern="^#[0-9A-Fa-f]{6}$" placeholder="#RRGGBB" />
                  </div>
                )}
              </div>
            </div>

            <div className="panel control-fields" style={{ marginBottom: "24px" }}>
              <legend className="code cyan">TAGS</legend>
              {draft.tags.length === 0 && <p className="muted" style={{ marginBottom: "16px" }}>No tags added.</p>}
              <div className="tags-list">
                {draft.tags.map((tag, index) => (
                  <div key={tag.id} className="tag-row flex-between">
                    <div className="flex gap-2" style={{ alignItems: 'center', flex: 1, marginRight: '16px' }}>
                      <span className="code cyan micro">{String(index + 1).padStart(2, '0')}</span>
                      <input style={{ flex: 1, padding: "4px 8px" }} value={tag.label} onChange={e => {
                        const newTags = [...draft.tags];
                        newTags[index].label = e.target.value;
                        update({ tags: newTags });
                      }} maxLength={80} required />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="pixel-button secondary" style={{ padding: "4px 8px", fontSize: "11px" }} disabled={index === 0} onClick={() => {
                        const newTags = [...draft.tags];
                        [newTags[index - 1], newTags[index]] = [newTags[index], newTags[index - 1]];
                        newTags.forEach((t, i) => t.sort_order = i);
                        update({ tags: newTags });
                      }}>←</button>
                      <button type="button" className="pixel-button secondary" style={{ padding: "4px 8px", fontSize: "11px" }} disabled={index === draft.tags.length - 1} onClick={() => {
                        const newTags = [...draft.tags];
                        [newTags[index + 1], newTags[index]] = [newTags[index], newTags[index + 1]];
                        newTags.forEach((t, i) => t.sort_order = i);
                        update({ tags: newTags });
                      }}>→</button>
                      <button type="button" className="pixel-button" style={{ padding: "4px 8px", fontSize: "11px", borderColor: "#ffb4ab", color: "#ffb4ab" }} onClick={() => {
                        const newTags = draft.tags.filter(t => t.id !== tag.id);
                        newTags.forEach((t, i) => t.sort_order = i);
                        update({ tags: newTags });
                      }}>REMOVE</button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="pixel-button secondary" onClick={() => {
                update({ tags: [...draft.tags, { id: crypto.randomUUID(), label: "", sort_order: draft.tags.length }] });
              }}>+ ADD TAG</button>
            </div>

            <div className="editor-actions panel" style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="code cyan" role="status" aria-live="polite">
                {error ? `> ERROR: ${error}` : busy ? "> SAVING..." : "> READY_"}
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" onClick={() => router.push("/admin/experience")} disabled={busy} className="pixel-button secondary">
                  CANCEL
                </button>
                <button disabled={busy} type="submit" className="pixel-button">
                  {busy ? "SAVING..." : "SAVE EXPERIENCE"}
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>

      <div className="home-editor-preview-container">
        <div className="preview-sticky">
          <div className="preview-header">
            <span className="code green" style={{ fontSize: "11px" }}>[ LIVE_RENDER // EXPERIENCE_RECORD ]</span>
          </div>
          <div className="preview-wrapper desktop" style={{ padding: "32px", background: "var(--background)" }}>
             {/* Render inside timeline wrapper to get correct styles */}
             <div className="section section-dark" style={{ padding: 0 }}>
                <ol className="timeline" style={{ margin: 0, border: 'none', paddingLeft: '16px' }}>
                  <ExperienceCardView job={draft} />
                </ol>
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .home-editor-container { display: flex; flex-direction: column; gap: 32px; }
        @media (min-width: 1100px) {
          .home-editor-container { flex-direction: row; align-items: flex-start; }
          .home-editor-main { flex: 1; min-width: 0; }
          .home-editor-preview-container { width: 400px; flex-shrink: 0; }
        }



        .flex { display: flex; flex-wrap: wrap; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        .gap-2 { gap: 8px; }
        
        .form-grid.compact { grid-template-columns: 1fr 1fr; }
        @media (max-width: 768px) { .form-grid.compact { grid-template-columns: 1fr; } }
        
        .tags-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .tag-row { background: var(--surface-low); border: 1px solid var(--border); padding: 8px 12px; }
        @media (max-width: 500px) {
          .tag-row { flex-direction: column; align-items: stretch; gap: 12px; }
          .tag-row > div { margin-right: 0 !important; }
        }

        /* Toggle switch */
        .toggle-switch { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .toggle-switch input { display: none; }
        .toggle-slider { position: relative; width: 36px; height: 20px; background: var(--surface); border: 1px solid var(--border); transition: 0.2s; }
        .toggle-slider:before { content: ""; position: absolute; left: 2px; bottom: 2px; width: 14px; height: 14px; background: var(--muted); transition: 0.2s; }
        .toggle-switch input:checked + .toggle-slider { border-color: var(--primary); }
        .toggle-switch input:checked + .toggle-slider:before { background: var(--primary); transform: translateX(16px); }
        .toggle-label { color: var(--muted); }
        .toggle-switch input:checked ~ .toggle-label { color: var(--primary); }

        /* Color Presets */
        .radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
        .swatch { width: 14px; height: 14px; display: inline-block; border: 1px solid var(--border); }
        .custom-color-picker { display: flex; gap: 8px; align-items: center; }
        .custom-color-picker input[type="color"] { width: 40px; height: 40px; padding: 0; background: none; border: 1px solid var(--border); cursor: pointer; }

        .preview-sticky { position: sticky; top: 88px; display: flex; flex-direction: column; gap: 12px; }
        .preview-header { display: flex; justify-content: space-between; padding: 8px; background: var(--surface-low); border: 1px solid var(--border); }
        .preview-wrapper { border: 1px solid var(--border); background: var(--background); overflow: hidden; margin: 0 auto; width: 100%; }
        
        .error { color: var(--error, #ffb4ab); }
      `}</style>
    </div>
  );
}
