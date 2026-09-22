import { useState } from "react";
import type { HomeData, HomeHeadlineSegment, Accent } from "@/lib/home";

const COLOR_PRESETS: { label: string; accent: Accent; hex?: string }[] = [
  { label: "Default", accent: "default" },
  { label: "Helsinki Green", accent: "primary", hex: "#4EDEA3" },
  { label: "Helsinki Cyan", accent: "secondary", hex: "#4CD7F6" },
  { label: "Helsinki Violet", accent: "tertiary", hex: "#D0BCFF" },
];

function SegmentEditModal({
  segment,
  onSave,
  onCancel
}: {
  segment: HomeHeadlineSegment;
  onSave: (s: HomeHeadlineSegment) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(segment.text);
  const [accent, setAccent] = useState<Accent>(segment.accent);
  const [customColor, setCustomColor] = useState(segment.custom_color || "#FFB86C");

  return (
    <div className="segment-modal-overlay">
      <div className="segment-modal panel">
        <h3 className="code cyan" style={{ marginBottom: "16px" }}>EDIT SEGMENT</h3>
        
        <label>
          <span>TEXT</span>
          <input value={text} onChange={e => setText(e.target.value)} maxLength={200} autoFocus />
        </label>

        <div style={{ marginTop: "16px" }}>
          <span>COLOR</span>
          <div className="color-presets">
            {COLOR_PRESETS.map(preset => (
              <label key={preset.accent} className="radio-label">
                <input 
                  type="radio" 
                  name="colorPreset" 
                  checked={accent === preset.accent} 
                  onChange={() => setAccent(preset.accent)} 
                />
                <span className="swatch" style={{ background: preset.hex || "var(--foreground)" }} />
                {preset.label}
              </label>
            ))}
            <label className="radio-label">
              <input 
                type="radio" 
                name="colorPreset" 
                checked={accent === "custom"} 
                onChange={() => setAccent("custom")} 
              />
              <span className="swatch" style={{ background: customColor }} />
              Custom
            </label>
          </div>
          
          {accent === "custom" && (
            <div className="custom-color-picker">
              <input 
                type="color" 
                value={customColor} 
                onChange={e => setCustomColor(e.target.value)} 
              />
              <input 
                type="text" 
                className="code" 
                value={customColor} 
                onChange={e => {
                  let val = e.target.value;
                  if (!val.startsWith("#")) val = "#" + val;
                  setCustomColor(val);
                }} 
                pattern="^#[0-9A-Fa-f]{6}$"
                placeholder="#RRGGBB"
              />
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button type="button" className="pixel-button secondary" onClick={onCancel}>CANCEL</button>
          <button type="button" className="pixel-button" onClick={() => {
            let colorToSave = customColor;
            if (/^#[0-9a-fA-F]{3}$/.test(colorToSave)) {
              colorToSave = "#" + colorToSave[1]+colorToSave[1]+colorToSave[2]+colorToSave[2]+colorToSave[3]+colorToSave[3];
            }
            onSave({ ...segment, text, accent, custom_color: accent === "custom" ? colorToSave : null });
          }}>APPLY</button>
        </div>
      </div>
      <style jsx>{`
        .segment-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(8, 15, 23, 0.85);
          display: flex; align-items: center; justify-content: center;
        }
        .segment-modal { width: 400px; max-width: 90vw; }
        .segment-modal label span { display: block; font-size: 11px; margin-bottom: 4px; color: var(--muted); }
        .color-presets { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
        .swatch { width: 14px; height: 14px; display: inline-block; border: 1px solid var(--border); }
        .custom-color-picker { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
        .custom-color-picker input[type="color"] { width: 40px; height: 40px; padding: 0; background: none; border: 1px solid var(--border); cursor: pointer; }
      `}</style>
    </div>
  );
}

interface PanelProps {
  draft: HomeData;
  update: (next: HomeData) => void;
  busy: boolean;
}

export function HeadlineEditorPanel({ draft, update, busy }: PanelProps) {
  const [editingSegment, setEditingSegment] = useState<HomeHeadlineSegment | null>(null);

  const linesMap = new Map<number, HomeHeadlineSegment[]>();
  for (const seg of draft.segments) {
    if (!linesMap.has(seg.line_number)) linesMap.set(seg.line_number, []);
    linesMap.get(seg.line_number)!.push(seg);
  }
  const lines = Array.from(linesMap.entries()).sort(([a], [b]) => a - b).map(([lineNum, segs]) => {
    return { lineNum, segs: segs.sort((a, b) => a.sort_order - b.sort_order) };
  });

  const reindexSegments = (newSegments: HomeHeadlineSegment[]) => {
    const grouped = new Map<number, HomeHeadlineSegment[]>();
    for (const s of newSegments) {
      if (!grouped.has(s.line_number)) grouped.set(s.line_number, []);
      grouped.get(s.line_number)!.push(s);
    }
    const finalSegs: HomeHeadlineSegment[] = [];
    let currentLineNum = 1;
    Array.from(grouped.entries()).sort(([a], [b]) => a - b).forEach(([, segs]) => {
      segs.sort((a, b) => a.sort_order - b.sort_order);
      segs.forEach((seg, i) => {
        finalSegs.push({ ...seg, line_number: currentLineNum, sort_order: i });
      });
      currentLineNum++;
    });
    update({ ...draft, segments: finalSegs });
  };

  const getHumanColorLabel = (accent: Accent, customColor: string | null) => {
    if (accent === "custom") return <span style={{ color: customColor || "inherit" }}>■ Custom ({customColor})</span>;
    const preset = COLOR_PRESETS.find(p => p.accent === accent);
    return (
      <span style={{ color: preset?.hex || "inherit" }}>
        {preset?.hex ? "■ " : ""}{preset?.label || "Default"}
      </span>
    );
  };

  return (
    <fieldset disabled={busy} className="panel control-fields">
      <legend className="code cyan">HEADLINE EDITOR</legend>
      {lines.length === 0 && <p className="muted">No lines. Add the first line below.</p>}
      
      <div className="headline-editor">
        {lines.map((line, lineIndex) => (
          <div key={line.lineNum} className="headline-line">
            <div className="line-header">
              <span className="code green">LINE {lineIndex + 1}</span>
              <div className="line-actions">
                <button type="button" disabled={lineIndex === 0} onClick={() => {
                  const newSegs = draft.segments.map(s => {
                    if (s.line_number === line.lineNum) return { ...s, line_number: line.lineNum - 1 };
                    if (s.line_number === line.lineNum - 1) return { ...s, line_number: line.lineNum };
                    return s;
                  });
                  reindexSegments(newSegs);
                }}>↑ LINE</button>
                <button type="button" disabled={lineIndex === lines.length - 1} onClick={() => {
                  const newSegs = draft.segments.map(s => {
                    if (s.line_number === line.lineNum) return { ...s, line_number: line.lineNum + 1 };
                    if (s.line_number === line.lineNum + 1) return { ...s, line_number: line.lineNum };
                    return s;
                  });
                  reindexSegments(newSegs);
                }}>↓ LINE</button>
                <button type="button" className="remove-btn" onClick={() => {
                  reindexSegments(draft.segments.filter(s => s.line_number !== line.lineNum));
                }}>REMOVE LINE</button>
              </div>
            </div>
            
            <div className="segments-list">
              {line.segs.map((seg, segIndex) => (
                <div key={seg.id} className="segment-card-row">
                  <div className="segment-card-content">
                    <div className="segment-text code">{seg.text || <span className="muted">{"<empty>"}</span>}</div>
                    <div className="segment-color micro muted">{getHumanColorLabel(seg.accent, seg.custom_color)}</div>
                  </div>
                  <div className="segment-card-actions">
                    <button type="button" disabled={segIndex === 0} onClick={() => {
                      const newSegs = [...draft.segments];
                      const idx1 = newSegs.findIndex(s => s.id === seg.id);
                      const idx2 = newSegs.findIndex(s => s.id === line.segs[segIndex - 1].id);
                      const temp = newSegs[idx1].sort_order;
                      newSegs[idx1].sort_order = newSegs[idx2].sort_order;
                      newSegs[idx2].sort_order = temp;
                      reindexSegments(newSegs);
                    }}>←</button>
                    <button type="button" disabled={segIndex === line.segs.length - 1} onClick={() => {
                      const newSegs = [...draft.segments];
                      const idx1 = newSegs.findIndex(s => s.id === seg.id);
                      const idx2 = newSegs.findIndex(s => s.id === line.segs[segIndex + 1].id);
                      const temp = newSegs[idx1].sort_order;
                      newSegs[idx1].sort_order = newSegs[idx2].sort_order;
                      newSegs[idx2].sort_order = temp;
                      reindexSegments(newSegs);
                    }}>→</button>
                    <button type="button" onClick={() => setEditingSegment(seg)}>EDIT</button>
                    <button type="button" className="remove-btn" onClick={() => {
                      reindexSegments(draft.segments.filter(s => s.id !== seg.id));
                    }}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="add-segment-btn" onClick={() => {
              reindexSegments([...draft.segments, {
                id: crypto.randomUUID(), line_number: line.lineNum, text: "", accent: "default", custom_color: null, sort_order: 999
              }]);
            }}>+ ADD SEGMENT</button>
          </div>
        ))}
      </div>

      <button type="button" className="pixel-button secondary" style={{ marginTop: "16px" }} onClick={() => {
        const newLineNum = (lines.length > 0 ? lines[lines.length - 1].lineNum : 0) + 1;
        reindexSegments([...draft.segments, {
          id: crypto.randomUUID(), line_number: newLineNum, text: "", accent: "default", custom_color: null, sort_order: 0
        }]);
      }}>+ ADD LINE</button>

      {editingSegment && (
        <SegmentEditModal 
          segment={editingSegment} 
          onSave={(s) => {
            const newSegs = draft.segments.map(seg => seg.id === s.id ? s : seg);
            update({ ...draft, segments: newSegs });
            setEditingSegment(null);
          }}
          onCancel={() => setEditingSegment(null)}
        />
      )}

      <style jsx>{`
        .headline-editor { display: flex; flex-direction: column; gap: 24px; }
        .headline-line {
          background: var(--surface-low);
          border: 1px solid var(--border);
          padding: 12px;
        }
        .line-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
        }
        .line-actions { display: flex; gap: 4px; }
        .line-actions button { background: var(--surface); border: 1px solid var(--border); color: var(--muted); padding: 4px 8px; font-size: 11px; cursor: pointer; }
        .line-actions button:hover:not(:disabled) { background: var(--surface-high); color: var(--foreground); }
        .line-actions button:disabled { opacity: 0.3; cursor: not-allowed; }
        .line-actions .remove-btn:hover:not(:disabled) { color: #ffb4ab; border-color: #ffb4ab; }

        .segments-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
        .segment-card-row {
          display: flex; justify-content: space-between; align-items: center;
          background: var(--surface); border: 1px solid var(--border); padding: 8px 12px;
        }
        .segment-card-content { display: flex; flex-direction: column; gap: 4px; }
        .segment-text { font-size: 14px; white-space: pre-wrap; word-break: break-all; }
        
        .segment-card-actions { display: flex; gap: 4px; }
        .segment-card-actions button { background: var(--surface-low); border: 1px solid var(--border); color: var(--muted); padding: 4px 8px; font-size: 11px; cursor: pointer; }
        .segment-card-actions button:hover:not(:disabled) { background: var(--surface-high); color: var(--foreground); }
        .segment-card-actions button:disabled { opacity: 0.3; cursor: not-allowed; }
        .segment-card-actions .remove-btn:hover:not(:disabled) { color: #ffb4ab; border-color: #ffb4ab; }

        .add-segment-btn {
          background: transparent; border: 1px dashed var(--border); color: var(--muted);
          padding: 8px 16px; font-size: 11px; cursor: pointer; width: 100%; text-align: left;
        }
        .add-segment-btn:hover { border-color: var(--primary); color: var(--primary); }
      `}</style>
    </fieldset>
  );
}
