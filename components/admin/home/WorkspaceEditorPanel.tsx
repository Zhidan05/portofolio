import type { HomeData } from "@/lib/home";

interface PanelProps {
  draft: HomeData;
  update: (next: HomeData) => void;
  busy: boolean;
}

export function WorkspaceEditorPanel({ draft, update, busy }: PanelProps) {
  return (
    <fieldset disabled={busy} className="panel control-fields">
      <legend className="code cyan">WORKSPACE PANEL</legend>

      <h3 className="section-title">TERMINAL</h3>
      <div className="form-grid compact">
        <label htmlFor="profile-workspace_terminal_user">
          <span id="label-workspace_terminal_user">Terminal User</span>
          <input 
            id="profile-workspace_terminal_user" 
            value={draft.profile.workspace_terminal_user || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, workspace_terminal_user: e.target.value } })} 
          />
        </label>
        <label htmlFor="profile-workspace_terminal_path">
          <span id="label-workspace_terminal_path">Terminal Path</span>
          <input 
            id="profile-workspace_terminal_path" 
            value={draft.profile.workspace_terminal_path || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, workspace_terminal_path: e.target.value } })} 
          />
        </label>
      </div>

      <div className="spacer" />

      <h3 className="section-title">INTERFACE STATUS</h3>
      <div className="form-grid compact">
        <label htmlFor="profile-workspace_label">
          <span id="label-workspace_label">Workspace Label</span>
          <input 
            id="profile-workspace_label" 
            value={draft.profile.workspace_label || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, workspace_label: e.target.value } })} 
          />
        </label>
        <label htmlFor="profile-workspace_status">
          <span id="label-workspace_status">Workspace Status</span>
          <input 
            id="profile-workspace_status" 
            value={draft.profile.workspace_status || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, workspace_status: e.target.value } })} 
          />
        </label>
      </div>

      <div className="spacer" />

      <h3 className="section-title">PROJECT FOCUS</h3>
      <div className="form-grid compact">
        <label htmlFor="profile-project_focus_label">
          <span id="label-project_focus_label">Focus Label</span>
          <input 
            id="profile-project_focus_label" 
            value={draft.profile.project_focus_label || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, project_focus_label: e.target.value } })} 
          />
        </label>
        <label htmlFor="profile-project_focus_value">
          <span id="label-project_focus_value">Focus Value</span>
          <input 
            id="profile-project_focus_value" 
            value={draft.profile.project_focus_value || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, project_focus_value: e.target.value } })} 
          />
        </label>
      </div>

      <div className="spacer" />

      <h3 className="section-title">FOOTER STATUS</h3>
      <div className="form-grid compact">
        <label htmlFor="profile-workspace_motto">
          <span id="label-workspace_motto">Workspace Motto</span>
          <input 
            id="profile-workspace_motto" 
            value={draft.profile.workspace_motto || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, workspace_motto: e.target.value } })} 
          />
        </label>
        <label htmlFor="profile-workspace_mode">
          <span id="label-workspace_mode">Workspace Mode</span>
          <input 
            id="profile-workspace_mode" 
            value={draft.profile.workspace_mode || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, workspace_mode: e.target.value } })} 
          />
        </label>
      </div>

      <style jsx>{`
        .section-title {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          color: var(--muted);
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .spacer { height: 24px; }
        .form-grid.compact { grid-template-columns: 1fr 1fr; }
        @media (max-width: 768px) {
          .form-grid.compact { grid-template-columns: 1fr; }
        }
      `}</style>
    </fieldset>
  );
}
