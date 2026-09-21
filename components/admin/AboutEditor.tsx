"use client";
import { useEffect, useRef, useState } from "react";
import type { AboutData, AboutItem, Profile } from "@/lib/about";
import { initialAbout } from "@/data/about";
import { readAbout, saveAbout } from "@/services/aboutService";

const fields: [keyof Profile, string, number][] = [
  ["name", "Name", 160], ["class", "Class", 160], ["specialization", "Specialization", 160],
  ["affiliation", "Affiliation", 160], ["location", "Location", 160], ["record_id", "Record ID", 160],
  ["class_meta", "Header class label", 160], ["bio_paragraph_1", "Bio paragraph 1", 4000],
  ["bio_paragraph_2", "Bio paragraph 2", 4000], ["bio_paragraph_3", "Bio paragraph 3", 4000],
  ["bio_highlight", "Highlighted phrase in paragraph 1 (optional)", 160], ["directive", "Core operating directive", 2000],
];
type ListKey = "interests" | "tools" | "focus";
export default function AboutEditor() {
  const [draft, setDraft] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const saving = useRef(false);
  useEffect(() => {
    let active = true;
    readAbout().then((data) => {
      if (!active) return;
      setDraft(data || { ...initialAbout, interests: [], tools: [], focus: [], revision: null });
      setStatus(data ? "" : "No record exists. Review the original profile and add lists before publishing.");
      setLoading(false);
    }).catch((error: unknown) => { if (!active) return; setStatus(error instanceof Error ? error.message : "LOAD_FAILED — Please retry."); setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  function update(next: AboutData) { setDraft(next); setDirty(true); setStatus(""); }
  function changeList(key: ListKey, items: AboutItem[]) {
    if (draft) update({ ...draft, [key]: items.map((item, sort_order) => ({ ...item, sort_order })) });
  }
  if (loading) return <section className="panel" role="status">&gt; LOADING_RECORD...</section>;
  if (!draft) return <section className="panel"><p role="alert">{status}</p><button className="pixel-button" onClick={() => { setLoading(true); setAttempt(attempt + 1); }}>RETRY</button></section>;
  return <form className="control-form" onSubmit={async (event) => {
    event.preventDefault(); if (saving.current) return;
    saving.current = true; setBusy(true); setStatus("> SAVING_RECORD...");
    try {
      const revision = await saveAbout(draft);
      setDraft({ ...draft, revision }); setDirty(false); setStatus("> RECORD_UPDATED_SUCCESSFULLY");
    } catch (e) { setStatus(`> UPDATE_FAILED — ${(e as Error).message}`); }
    finally { saving.current = false; setBusy(false); }
  }}>
    <div><p className="code green">[ 02 // ABOUT_ME ]</p><h1>Player profile editor</h1><p>Changes are published together when you save.</p></div>
    <fieldset disabled={busy} className="panel control-fields"><legend className="code cyan">PROFILE / BIO / DIRECTIVE</legend>
      <div className="form-grid">{fields.map(([key, label, max]) => <label key={key} htmlFor={`profile-${key}`} className={max > 160 ? "full-width" : ""}><span id={`label-${key}`}>{label}</span>
        {max > 160 ? <textarea id={`profile-${key}`} aria-labelledby={`label-${key}`} value={draft.profile[key]} maxLength={max} required={key === "directive" || key === "bio_paragraph_1"} rows={4} onChange={(e) => update({ ...draft, profile: { ...draft.profile, [key]: e.target.value } })} /> : <input id={`profile-${key}`} aria-labelledby={`label-${key}`} value={draft.profile[key]} maxLength={max} required={key !== "bio_highlight"} onChange={(e) => update({ ...draft, profile: { ...draft.profile, [key]: e.target.value } })} />}
      </label>)}</div>
    </fieldset>
    {([ ["interests", "ENGINEERING INTERESTS"], ["tools", "TACTICAL LOADOUT / TOOLS"], ["focus", "FOCUS CARDS"] ] as const).map(([key, title]) => <fieldset className="panel control-fields" disabled={busy} key={key}>
      <legend className="code cyan">{title}</legend>
      {draft[key].length === 0 && <p className="muted">No items. Add the first item below.</p>}
      <div className="editor-list">{draft[key].map((item, index) => <div className="editor-row" key={item.id}>
        <div className="editor-inputs">{key === "focus" && <label>Code {index + 1}<input required maxLength={40} value={item.code || ""} onChange={(e) => changeList(key, draft[key].map((row) => row.id === item.id ? { ...row, code: e.target.value } : row))} /></label>}
        <label>Label {index + 1}<input required maxLength={160} value={item.label} onChange={(e) => changeList(key, draft[key].map((row) => row.id === item.id ? { ...row, label: e.target.value } : row))} /></label></div>
        <div className="editor-actions"><button type="button" disabled={index === 0 || busy} aria-label={`Move ${key} item ${index + 1} up`} onClick={() => { const rows = [...draft[key]]; [rows[index - 1], rows[index]] = [rows[index], rows[index - 1]]; changeList(key, rows); }}>↑ Up</button>
        <button type="button" disabled={index === draft[key].length - 1 || busy} aria-label={`Move ${key} item ${index + 1} down`} onClick={() => { const rows = [...draft[key]]; [rows[index + 1], rows[index]] = [rows[index], rows[index + 1]]; changeList(key, rows); }}>↓ Down</button>
        <button type="button" aria-label={`Remove ${key} item ${index + 1}`} onClick={() => changeList(key, draft[key].filter((row) => row.id !== item.id))}>Remove</button></div>
      </div>)}</div>
      <button type="button" className="pixel-button secondary" disabled={draft[key].length >= 30 || busy} onClick={() => changeList(key, [...draft[key], { id: crypto.randomUUID(), label: "", sort_order: draft[key].length, ...(key === "focus" ? { code: `FOCUS_${String(draft[key].length + 1).padStart(2, "0")}` } : {}) }])}>+ ADD {key === "interests" ? "INTEREST" : key === "tools" ? "TOOL" : "FOCUS"}</button>
    </fieldset>)}
    <div className="panel save-panel"><p className="code cyan" role="status" aria-live="polite">{status || (dirty ? "> UNSAVED_CHANGES" : "> READY_")}</p><button className="pixel-button" disabled={busy}>{busy ? "SAVING..." : "SAVE & PUBLISH"}</button></div>
  </form>;
}
