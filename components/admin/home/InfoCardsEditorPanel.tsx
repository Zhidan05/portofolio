import type { HomeData, Accent } from "@/lib/home";

interface PanelProps {
  draft: HomeData;
  update: (next: HomeData) => void;
  busy: boolean;
}

export function InfoCardsEditorPanel({ draft, update, busy }: PanelProps) {
  return (
    <fieldset disabled={busy} className="panel control-fields">
      <legend className="code cyan">INFO CARDS</legend>
      {draft.info_cards.length === 0 && <p className="muted">No items. Add the first info card below.</p>}
      
      <div className="info-cards-list">
        {draft.info_cards.map((item, index) => (
          <div className="info-card-row" key={item.id}>
            <div className="info-card-header">
              <span className="code cyan">INFO CARD {String(index + 1).padStart(2, '0')}</span>
              <div className="info-card-actions">
                <button type="button" disabled={index === 0} onClick={() => {
                  const rows = [...draft.info_cards];
                  [rows[index - 1], rows[index]] = [rows[index], rows[index - 1]];
                  update({ ...draft, info_cards: rows.map((r, i) => ({ ...r, sort_order: i })) });
                }}>↑</button>
                <button type="button" disabled={index === draft.info_cards.length - 1} onClick={() => {
                  const rows = [...draft.info_cards];
                  [rows[index + 1], rows[index]] = [rows[index], rows[index + 1]];
                  update({ ...draft, info_cards: rows.map((r, i) => ({ ...r, sort_order: i })) });
                }}>↓</button>
                <button type="button" className="remove-btn" onClick={() => {
                  const rows = draft.info_cards.filter(row => row.id !== item.id);
                  update({ ...draft, info_cards: rows.map((r, i) => ({ ...r, sort_order: i })) });
                }}>×</button>
              </div>
            </div>

            <div className="form-grid compact">
              <label>
                <span>LABEL</span>
                <input required maxLength={100} value={item.label || ""} onChange={(e) => {
                  const rows = draft.info_cards.map(row => row.id === item.id ? { ...row, label: e.target.value } : row);
                  update({ ...draft, info_cards: rows });
                }} />
              </label>
              <label>
                <span>VALUE</span>
                <input required maxLength={100} value={item.value || ""} onChange={(e) => {
                  const rows = draft.info_cards.map(row => row.id === item.id ? { ...row, value: e.target.value } : row);
                  update({ ...draft, info_cards: rows });
                }} />
              </label>
            </div>
            <div className="form-grid" style={{ marginTop: '16px' }}>
              <label>
                <span>COLOR</span>
                <select value={item.accent} onChange={(e) => {
                  const rows = draft.info_cards.map(row => row.id === item.id ? { ...row, accent: e.target.value as Accent } : row);
                  update({ ...draft, info_cards: rows });
                }}>
                  <option value="default">Default</option>
                  <option value="primary">Helsinki Green</option>
                  <option value="secondary">Helsinki Cyan</option>
                  <option value="tertiary">Helsinki Violet</option>
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>
      
      <button type="button" className="pixel-button secondary" disabled={draft.info_cards.length >= 30} onClick={() => {
        update({ ...draft, info_cards: [...draft.info_cards, { id: crypto.randomUUID(), label: "", value: "", accent: "default", sort_order: draft.info_cards.length }] });
      }}>+ ADD INFO CARD</button>

      <style jsx>{`
        .info-cards-list { display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px; }
        .info-card-row {
          background: var(--surface-low);
          border: 1px solid var(--border);
          padding: 16px;
        }
        .info-card-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
          border-bottom: 1px solid var(--border); padding-bottom: 8px;
        }
        .info-card-actions { display: flex; gap: 4px; }
        .info-card-actions button { background: var(--surface); border: 1px solid var(--border); color: var(--muted); padding: 4px 8px; font-size: 11px; cursor: pointer; }
        .info-card-actions button:hover:not(:disabled) { background: var(--surface-high); color: var(--foreground); }
        .info-card-actions button:disabled { opacity: 0.3; cursor: not-allowed; }
        .info-card-actions .remove-btn:hover:not(:disabled) { color: #ffb4ab; border-color: #ffb4ab; }
        
        .form-grid.compact {
           grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .form-grid.compact { grid-template-columns: 1fr; }
        }
      `}</style>
    </fieldset>
  );
}
