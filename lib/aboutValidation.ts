import type { AboutData } from "./about";
const limits = {
  name: 160, class: 160, specialization: 160, affiliation: 160, location: 160,
  record_id: 160, class_meta: 160, bio_paragraph_1: 4000, bio_paragraph_2: 4000,
  bio_paragraph_3: 4000, bio_highlight: 160, directive: 2000,
} as const;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function validAbout(value: unknown): value is AboutData {
  if (!object(value) || !object(value.profile)) return false;
  for (const [key, max] of Object.entries(limits)) {
    const text = value.profile[key];
    if (typeof text !== "string" || text.length > max) return false;
    if (!["bio_highlight", "bio_paragraph_2", "bio_paragraph_3"].includes(key) && !text.trim()) return false;
  }
  if (value.revision !== null && (typeof value.revision !== "string" || !Number.isFinite(Date.parse(value.revision)))) return false;
  for (const key of ["interests", "tools", "focus"]) {
    const rows = value[key];
    if (!Array.isArray(rows) || rows.length > 30) return false;
    const ids = new Set<string>();
    for (const row of rows) {
      if (!object(row) || typeof row.id !== "string" || !uuid.test(row.id) || ids.has(row.id)) return false;
      ids.add(row.id);
      if (typeof row.label !== "string" || !row.label.trim() || row.label.length > 160) return false;
      if (typeof row.sort_order !== "number" || !Number.isInteger(row.sort_order) || row.sort_order < 0) return false;
      if (key === "focus" && (typeof row.code !== "string" || !row.code.trim() || row.code.length > 40)) return false;
    }
  }
  return true;
}
