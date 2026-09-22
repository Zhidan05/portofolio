import type { HomeData } from "@/lib/home";

interface PanelProps {
  draft: HomeData;
  update: (next: HomeData) => void;
  busy: boolean;
}

export function HeroSettingsPanel({ draft, update, busy }: PanelProps) {
  return (
    <fieldset disabled={busy} className="panel control-fields">
      <legend className="code cyan">HERO SETTINGS</legend>
      
      <h3 className="section-title">SYSTEM HEADER</h3>
      <div className="form-grid compact">
        <label htmlFor="profile-system_location_code">
          <span id="label-system_location_code">Location Code</span>
          <input 
            id="profile-system_location_code" 
            value={draft.profile.system_location_code || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, system_location_code: e.target.value } })} 
          />
        </label>
        <label htmlFor="profile-system_status_text">
          <span id="label-system_status_text">Status Text</span>
          <input 
            id="profile-system_status_text" 
            value={draft.profile.system_status_text || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, system_status_text: e.target.value } })} 
          />
        </label>
      </div>

      <div className="spacer" />

      <h3 className="section-title">REGION</h3>
      <div className="form-grid compact">
        <label htmlFor="profile-region_primary">
          <span id="label-region_primary">Primary</span>
          <input 
            id="profile-region_primary" 
            value={draft.profile.region_primary || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, region_primary: e.target.value } })} 
          />
        </label>
        <label htmlFor="profile-region_secondary">
          <span id="label-region_secondary">Secondary</span>
          <input 
            id="profile-region_secondary" 
            value={draft.profile.region_secondary || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, region_secondary: e.target.value } })} 
          />
        </label>
      </div>

      <div className="spacer" />

      <h3 className="section-title">GREETING</h3>
      <div className="form-grid">
        <label htmlFor="profile-greeting" className="full-width">
          <span className="sr-only">Greeting</span>
          <input 
            id="profile-greeting" 
            value={draft.profile.greeting || ""} 
            maxLength={100} required 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, greeting: e.target.value } })} 
          />
        </label>
      </div>

      <div className="spacer" />

      <h3 className="section-title">DESCRIPTION</h3>
      <div className="form-grid">
        <label htmlFor="profile-description" className="full-width">
          <span className="sr-only">Description</span>
          <textarea 
            id="profile-description" 
            value={draft.profile.description || ""} 
            maxLength={1000} required rows={3} 
            onChange={(e) => update({ ...draft, profile: { ...draft.profile, description: e.target.value } })} 
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
        .spacer {
          height: 24px;
        }
        .form-grid.compact {
           grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .form-grid.compact {
             grid-template-columns: 1fr;
          }
        }
      `}</style>
    </fieldset>
  );
}
