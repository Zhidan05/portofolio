import type { ExperienceRecord } from "./experience";

function isString(val: unknown, max: number): val is string {
  return typeof val === "string" && val.length <= max;
}

function isValidUUID(val: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
}

export function validExperience(exp: unknown): exp is ExperienceRecord {
  if (!exp || typeof exp !== "object") return false;
  const e = exp as Record<string, unknown>;

  if (typeof e.id !== "string" || !isValidUUID(e.id)) return false;
  if (!isString(e.organization, 150) || e.organization.trim().length === 0) return false;
  if (!isString(e.role, 150) || e.role.trim().length === 0) return false;
  if (!isString(e.description, 1000) || e.description.trim().length === 0) return false;
  if (!isString(e.start_label, 30) || e.start_label.trim().length === 0) return false;
  if (e.end_label !== null && !isString(e.end_label, 30)) return false;
  
  if (!["active", "inactive", "completed"].includes(e.status as string)) return false;
  if (!isString(e.status_label, 50) || e.status_label.trim().length === 0) return false;
  
  if (!["primary", "secondary", "tertiary", "custom"].includes(e.accent as string)) return false;
  
  if (e.accent === "custom") {
    if (!e.custom_accent_color || typeof e.custom_accent_color !== "string") return false;
    if (!/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(e.custom_accent_color)) return false;
  } else {
    if (e.custom_accent_color !== null) return false; // Should be null if not custom
  }

  if (typeof e.is_current !== "boolean") return false;
  if (typeof e.sort_order !== "number") return false;
  if (typeof e.published !== "boolean") return false;

  if (!Array.isArray(e.tags) || e.tags.length > 20) return false;
  for (const tag of e.tags as unknown[]) {
    if (!tag || typeof tag !== "object") return false;
    const t = tag as Record<string, unknown>;
    if (typeof t.id !== "string" || !isValidUUID(t.id)) return false;
    if (!isString(t.label, 80) || t.label.trim().length === 0) return false;
    if (typeof t.sort_order !== "number") return false;
  }

  return true;
}
