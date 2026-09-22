import type { HomeData } from "./home";

export function validHome(content: unknown): content is HomeData {
  if (!content || typeof content !== "object") return false;
  
  const c = content as Partial<HomeData>;
  if (!c.profile || typeof c.profile !== "object") return false;
  
  const p = c.profile;
  const isString = (v: unknown, maxLen: number) => typeof v === "string" && v.length <= maxLen;

  // Short labels ~100
  if (!isString(p.system_location_code, 100)) return false;
  if (!isString(p.system_status_text, 100)) return false;
  if (!isString(p.region_primary, 100)) return false;
  if (!isString(p.region_secondary, 100)) return false;
  if (!isString(p.greeting, 100)) return false;
  
  // CTAs
  if (!isString(p.primary_cta_label, 100)) return false;
  if (!isString(p.primary_cta_url, 500)) return false;
  if (!isString(p.secondary_cta_label, 100)) return false;
  if (!isString(p.secondary_cta_url, 500)) return false;
  if (!isString(p.cv_cta_label, 100)) return false;
  if (!isString(p.cv_url, 500)) return false;
  if (typeof p.cv_enabled !== "boolean") return false;

  // Workspace
  if (!isString(p.workspace_terminal_user, 100)) return false;
  if (!isString(p.workspace_terminal_path, 100)) return false;
  if (!isString(p.workspace_label, 100)) return false;
  if (!isString(p.workspace_status, 100)) return false;
  if (!isString(p.project_focus_label, 100)) return false;
  if (!isString(p.project_focus_value, 100)) return false;
  if (!isString(p.workspace_motto, 100)) return false;
  if (!isString(p.workspace_mode, 100)) return false;

  // Description ~1000
  if (!isString(p.description, 1000)) return false;

  // Segments
  if (!Array.isArray(c.segments)) return false;
  if (c.segments.length > 50) return false;
  for (const seg of c.segments) {
    if (typeof seg !== "object" || !seg) return false;
    if (!isString(seg.id, 50)) return false;
    if (typeof seg.line_number !== "number") return false;
    if (!isString(seg.text, 200)) return false; // segments max 200
    if (!["default", "primary", "secondary", "tertiary", "custom"].includes(seg.accent)) return false;
    if (seg.accent === "custom") {
      if (!seg.custom_color || !/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(seg.custom_color)) return false;
    }
    if (typeof seg.sort_order !== "number") return false;
  }

  // Info Cards
  if (!Array.isArray(c.info_cards)) return false;
  if (c.info_cards.length > 50) return false;
  for (const card of c.info_cards) {
    if (typeof card !== "object" || !card) return false;
    if (!isString(card.id, 50)) return false;
    if (!isString(card.label, 100)) return false;
    if (!isString(card.value, 100)) return false;
    if (!["default", "primary", "secondary", "tertiary"].includes(card.accent)) return false;
    if (typeof card.sort_order !== "number") return false;
  }

  return true;
}
