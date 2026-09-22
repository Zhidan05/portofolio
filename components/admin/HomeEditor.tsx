"use client";
import { useEffect, useRef, useState } from "react";
import type { HomeData } from "@/lib/home";
import { initialHome } from "@/data/home";
import { readHome, saveHome } from "@/services/homeService";
import { HeroView } from "@/components/sections/HeroView";

// Panels
import { HomeEditorTabs, type HomeEditorTab } from "./home/HomeEditorTabs";
import { HeroSettingsPanel } from "./home/HeroSettingsPanel";
import { HeadlineEditorPanel } from "./home/HeadlineEditorPanel";
import { CtaEditorPanel } from "./home/CtaEditorPanel";
import { InfoCardsEditorPanel } from "./home/InfoCardsEditorPanel";
import { WorkspaceEditorPanel } from "./home/WorkspaceEditorPanel";

export default function HomeEditor() {
  const [draft, setDraft] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const saving = useRef(false);

  const [activeTab, setActiveTab] = useState<HomeEditorTab>("HERO");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    let active = true;
    readHome().then((data) => {
      if (!active) return;
      setDraft(data || { ...initialHome, revision: null });
      setStatus(data ? "" : "No record exists. Review the original Home structure before publishing.");
      setLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setStatus(error instanceof Error ? error.message : "LOAD_FAILED — Please retry.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  function update(next: HomeData) { setDraft(next); setDirty(true); setStatus(""); }

  if (loading) return <section className="panel" role="status">&gt; LOADING_RECORD...</section>;
  if (!draft) return (
    <section className="panel">
      <p role="alert">{status}</p>
      <button className="pixel-button" onClick={() => { setLoading(true); setAttempt(attempt + 1); }}>RETRY</button>
    </section>
  );

  return (
    <div className="home-editor-container">
      <div className="home-editor-main">
        <form className="control-form" onSubmit={async (event) => {
          event.preventDefault(); if (saving.current) return;
          saving.current = true; setBusy(true); setStatus("> WRITING_HOME_RECORD...");
          try {
            const revision = await saveHome(draft);
            setDraft({ ...draft, revision }); setDirty(false); setStatus("> SAVED");
          } catch (e) {
            setStatus(`> UPDATE_FAILED — ${(e as Error).message}`);
          } finally {
            saving.current = false; setBusy(false);
          }
        }}>
          
          <div className="editor-header panel">
            <div className="header-meta">
              <p className="code green micro">[ MODULE // HERO ]</p>
              <h1 style={{ margin: "4px 0 8px 0" }}>HOME CONTENT</h1>
              <p className="code muted micro">STATUS: <span className={dirty ? "cyan" : "muted"}>{status || (dirty ? "UNSAVED_CHANGES" : "SAVED")}</span></p>
            </div>
            <div className="header-actions">
              <button className="pixel-button" disabled={busy}>{busy ? "SAVING..." : "SAVE & PUBLISH"}</button>
            </div>
          </div>

          <HomeEditorTabs activeTab={activeTab} onTabChange={setActiveTab} disabled={busy} />

          <div className="tab-content">
            {activeTab === "HERO" && <HeroSettingsPanel draft={draft} update={update} busy={busy} />}
            {activeTab === "HEADLINE" && <HeadlineEditorPanel draft={draft} update={update} busy={busy} />}
            {activeTab === "CTA" && <CtaEditorPanel draft={draft} update={update} busy={busy} />}
            {activeTab === "INFO_CARDS" && <InfoCardsEditorPanel draft={draft} update={update} busy={busy} />}
            {activeTab === "WORKSPACE" && <WorkspaceEditorPanel draft={draft} update={update} busy={busy} />}
          </div>
        </form>
      </div>

      <div className="home-editor-preview-container">
        <div className="preview-sticky">
          <div className="preview-header">
            <span className="code green" style={{ fontSize: "11px" }}>[ LIVE_RENDER // HERO ]</span>
          </div>
          <div className="preview-controls">
            <button type="button" className={viewport === "desktop" ? "active" : ""} onClick={() => setViewport("desktop")}>DESKTOP</button>
            <button type="button" className={viewport === "tablet" ? "active" : ""} onClick={() => setViewport("tablet")}>TABLET</button>
            <button type="button" className={viewport === "mobile" ? "active" : ""} onClick={() => setViewport("mobile")}>MOBILE</button>
          </div>
          <div className={`preview-wrapper ${viewport}`}>
            <div className="preview-scale-wrapper">
               <HeroView homeData={draft} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .home-editor-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        @media (min-width: 1100px) {
          .home-editor-container {
            flex-direction: row;
            align-items: flex-start;
          }
          .home-editor-main { flex: 1; min-width: 0; }
          .home-editor-preview-container { width: 45vw; flex-shrink: 0; max-width: 800px; }
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--background);
          border-bottom: 1px solid var(--border);
          border-radius: 0;
        }

        @media (max-width: 640px) {
           .editor-header {
             flex-direction: column;
             align-items: flex-start;
             gap: 16px;
           }
           .header-actions { width: 100%; }
           .header-actions button { width: 100%; }
        }

        .preview-sticky {
          position: sticky;
          top: 88px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .preview-header {
          display: flex; justify-content: space-between; padding: 8px; background: var(--surface-low); border: 1px solid var(--border);
        }
        .preview-controls {
          display: flex; gap: 8px;
        }
        .preview-controls button {
          flex: 1; padding: 6px; font-size: 11px; background: var(--surface); border: 1px solid var(--border); color: var(--muted);
          cursor: pointer;
        }
        .preview-controls button.active {
          background: var(--primary); color: #003824; border-color: var(--primary);
        }
        .preview-wrapper {
          border: 1px solid var(--border); background: var(--background); overflow: hidden;
          transition: width 0.3s ease; margin: 0 auto;
        }
        .preview-wrapper.desktop { width: 100%; }
        .preview-wrapper.tablet { width: 768px; max-width: 100%; }
        .preview-wrapper.mobile { width: 375px; max-width: 100%; }
        
        /* the Hero relies on container paddings and standard DOM. In preview, we want it isolated */
        .preview-scale-wrapper {
           zoom: 0.75;
           pointer-events: none; /* Make preview non-interactive */
        }
        @media (max-width: 1400px) {
           .preview-scale-wrapper { zoom: 0.6; }
        }
      `}</style>
    </div>
  );
}
