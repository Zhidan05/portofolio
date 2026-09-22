import type { HomeData } from "@/lib/home";

interface PanelProps {
  draft: HomeData;
  update: (next: HomeData) => void;
  busy: boolean;
}

export function CtaEditorPanel({ draft, update, busy }: PanelProps) {
  return (
    <fieldset disabled={busy} className="panel control-fields">
      <legend className="code cyan">CALL TO ACTION</legend>

      <div className="cta-card">
        <h4 className="code green section-title">PRIMARY CTA</h4>
        <div className="form-grid">
          <label htmlFor="profile-primary_cta_label">
            <span id="label-primary_cta_label">Label</span>
            <input 
              id="profile-primary_cta_label" 
              value={draft.profile.primary_cta_label || ""} 
              maxLength={100} required 
              onChange={(e) => update({ ...draft, profile: { ...draft.profile, primary_cta_label: e.target.value } })} 
            />
          </label>
          <label htmlFor="profile-primary_cta_url">
            <span id="label-primary_cta_url">Destination</span>
            <input 
              id="profile-primary_cta_url" 
              value={draft.profile.primary_cta_url || ""} 
              maxLength={500} required 
              onChange={(e) => update({ ...draft, profile: { ...draft.profile, primary_cta_url: e.target.value } })} 
            />
          </label>
        </div>
      </div>

      <div className="cta-card">
        <h4 className="code green section-title">SECONDARY CTA</h4>
        <div className="form-grid">
          <label htmlFor="profile-secondary_cta_label">
            <span id="label-secondary_cta_label">Label</span>
            <input 
              id="profile-secondary_cta_label" 
              value={draft.profile.secondary_cta_label || ""} 
              maxLength={100} required 
              onChange={(e) => update({ ...draft, profile: { ...draft.profile, secondary_cta_label: e.target.value } })} 
            />
          </label>
          <label htmlFor="profile-secondary_cta_url">
            <span id="label-secondary_cta_url">Destination</span>
            <input 
              id="profile-secondary_cta_url" 
              value={draft.profile.secondary_cta_url || ""} 
              maxLength={500} required 
              onChange={(e) => update({ ...draft, profile: { ...draft.profile, secondary_cta_url: e.target.value } })} 
            />
          </label>
        </div>
      </div>

      <div className="cta-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h4 className="code green section-title" style={{ margin: 0 }}>CV CTA</h4>
          <label htmlFor="profile-cv_enabled" className="toggle-switch">
            <span id="label-cv_enabled" className="sr-only">Enable CV Link</span>
            <input 
              type="checkbox" 
              id="profile-cv_enabled" 
              checked={draft.profile.cv_enabled} 
              onChange={(e) => update({ ...draft, profile: { ...draft.profile, cv_enabled: e.target.checked } })} 
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label code micro" aria-hidden="true">{draft.profile.cv_enabled ? "ENABLED" : "DISABLED"}</span>
          </label>
        </div>
        <div className="form-grid">
          <label htmlFor="profile-cv_cta_label">
            <span id="label-cv_cta_label">Label</span>
            <input 
              id="profile-cv_cta_label" 
              value={draft.profile.cv_cta_label || ""} 
              maxLength={100} required 
              onChange={(e) => update({ ...draft, profile: { ...draft.profile, cv_cta_label: e.target.value } })} 
            />
          </label>
          <label htmlFor="profile-cv_url">
            <span id="label-cv_url">CV URL</span>
            <input 
              id="profile-cv_url" 
              value={draft.profile.cv_url || ""} 
              maxLength={500} 
              onChange={(e) => update({ ...draft, profile: { ...draft.profile, cv_url: e.target.value } })} 
            />
          </label>
        </div>
      </div>

      <style jsx>{`
        .cta-card {
          background: var(--surface-low);
          border: 1px solid var(--border);
          padding: 16px;
          margin-bottom: 24px;
        }
        .cta-card:last-child { margin-bottom: 0; }
        .section-title {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          margin-bottom: 16px;
          letter-spacing: 0.5px;
        }
        
        /* Helsinki style toggle switch */
        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .toggle-switch input { display: none; }
        .toggle-slider {
          position: relative;
          width: 36px;
          height: 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          transition: 0.2s;
        }
        .toggle-slider:before {
          content: "";
          position: absolute;
          left: 2px;
          bottom: 2px;
          width: 14px;
          height: 14px;
          background: var(--muted);
          transition: 0.2s;
        }
        .toggle-switch input:checked + .toggle-slider {
          border-color: var(--primary);
        }
        .toggle-switch input:checked + .toggle-slider:before {
          background: var(--primary);
          transform: translateX(16px);
        }
        .toggle-label {
          color: var(--muted);
        }
        .toggle-switch input:checked ~ .toggle-label {
          color: var(--primary);
        }
      `}</style>
    </fieldset>
  );
}
