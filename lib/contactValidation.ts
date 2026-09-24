import type { ContactChannel, ContactSettings, ContactSubject, ContactSubmission } from "./contact";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_PATTERN = /^#[0-9a-f]{6}$/i;
export const isUuid = (value: string) => UUID_PATTERN.test(value);
export const isEmail = (value: string) => value.length <= 254 && EMAIL_PATTERN.test(value);

export function safeChannelUrl(type: string, value: string | null, url: string | null): string | null {
  const cleanValue = value?.trim() || null;
  const cleanUrl = url?.trim() || null;
  if (type === "email") {
    if (!cleanValue) return null;
    if (!isEmail(cleanValue)) throw new Error("Enter a valid email address.");
    return `mailto:${cleanValue}`;
  }
  if (!cleanUrl) return null;
  let parsed: URL;
  try { parsed = new URL(cleanUrl); } catch { throw new Error("Enter a complete http:// or https:// URL."); }
  if (!(["https:", "http:"] as string[]).includes(parsed.protocol)) throw new Error("Only http:// and https:// channel URLs are allowed.");
  return parsed.toString();
}

export function validateContactSubmission(payload: ContactSubmission, settings: Pick<ContactSettings, "max_message_length">, enabledSubjects: Pick<ContactSubject, "value">[], now = Date.now()) {
  const fieldErrors: Partial<Record<"name" | "email" | "subject" | "message", string>> = {};
  const name = payload.name.trim(); const email = payload.email.trim().toLowerCase();
  const subject = payload.subject.trim(); const message = payload.message.trim();
  if (payload.company_website.trim()) return { ok: false as const, spam: true, fieldErrors };
  if (!Number.isFinite(payload.initialized_at) || now - payload.initialized_at < 1000 || now - payload.initialized_at > 86_400_000) return { ok: false as const, spam: true, fieldErrors };
  if (name.length < 2 || name.length > 100) fieldErrors.name = "Name must be 2–100 characters.";
  if (!isEmail(email)) fieldErrors.email = "Enter a valid email address.";
  if (!enabledSubjects.some((item) => item.value === subject)) fieldErrors.subject = "Choose an available subject.";
  if (message.length < 10 || message.length > settings.max_message_length) fieldErrors.message = `Message must be 10–${settings.max_message_length} characters.`;
  if (Object.keys(fieldErrors).length) return { ok: false as const, spam: false, fieldErrors };
  return { ok: true as const, value: { name, email, subject, message } };
}

export function validContactSettings(value: ContactSettings) {
  return isUuid(value.id) && value.section_label.trim().length > 0 && value.section_label.length <= 100 &&
    value.heading.trim().length > 0 && value.heading.length <= 200 && value.description.trim().length > 0 && value.description.length <= 1000 &&
    value.channels_heading.trim().length > 0 && value.channels_heading.length <= 100 &&
    (value.channels_status_label === null || value.channels_status_label.length <= 100) &&
    (value.channels_footer_title === null || value.channels_footer_title.length <= 100) &&
    (value.channels_footer_text === null || value.channels_footer_text.length <= 500) &&
    value.form_heading.trim().length > 0 && value.form_heading.length <= 100 &&
    (value.form_intro === null || value.form_intro.length <= 500) && value.submit_label.trim().length > 0 && value.submit_label.length <= 100 &&
    Number.isInteger(value.max_message_length) && value.max_message_length >= 100 && value.max_message_length <= 5000;
}
export function validContactChannel(channel: ContactChannel) {
  if (!isUuid(channel.id) || !isUuid(channel.contact_id) || !channel.type.trim() || channel.type.length > 40 || !/^[a-z0-9_-]+$/i.test(channel.type)) return false;
  if (!channel.label.trim() || channel.label.length > 100 || (channel.value !== null && channel.value.length > 320) || (channel.url !== null && channel.url.length > 2048)) return false;
  if (!(["active", "pending", "hidden"] as string[]).includes(channel.status) || (channel.status_label !== null && channel.status_label.length > 80)) return false;
  if (!(["primary", "secondary", "tertiary"].includes(channel.accent) || HEX_PATTERN.test(channel.accent))) return false;
  try { safeChannelUrl(channel.type, channel.value, channel.url); } catch { return false; }
  return Number.isInteger(channel.sort_order) && channel.sort_order >= 0;
}
export function validContactSubject(subject: ContactSubject) {
  return isUuid(subject.id) && isUuid(subject.contact_id) && /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(subject.value) &&
    subject.label.trim().length > 0 && subject.label.length <= 120 && typeof subject.enabled === "boolean" && Number.isInteger(subject.sort_order) && subject.sort_order >= 0;
}
