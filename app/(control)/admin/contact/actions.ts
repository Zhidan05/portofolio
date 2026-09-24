"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { CONTACT_CACHE_TAG } from "@/lib/contact-cache";
import type { ContactChannel, ContactSettings, ContactSubject } from "@/lib/contact";
import { isUuid, safeChannelUrl, validContactChannel, validContactSettings, validContactSubject } from "@/lib/contactValidation";

type Result = { ok: true } | { ok: false; message: string };
function refreshed() { updateTag(CONTACT_CACHE_TAG); revalidatePath("/"); revalidatePath("/admin/contact"); }
async function adminClient() {
  const access = await requireAdmin();
  if (!access.client) throw new Error("Admin database client unavailable.");
  return access.client;
}

export async function saveContactSettingsAction(settings: ContactSettings): Promise<Result> {
  if (!validContactSettings(settings)) return { ok: false, message: "Review the Contact content fields and limits." };
  const client = await adminClient();
  const { id } = settings;
  const values = {
    section_label: settings.section_label, heading: settings.heading, description: settings.description,
    channels_heading: settings.channels_heading, channels_status_label: settings.channels_status_label,
    channels_footer_title: settings.channels_footer_title, channels_footer_text: settings.channels_footer_text,
    form_heading: settings.form_heading, form_intro: settings.form_intro, submit_label: settings.submit_label,
    max_message_length: settings.max_message_length,
  };
  const { error } = await client.from("portfolio_contact").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, message: "Contact content could not be saved." };
  refreshed(); return { ok: true };
}

export async function saveContactChannelAction(channel: ContactChannel): Promise<Result> {
  if (!validContactChannel(channel)) return { ok: false, message: "Review the channel fields, email, URL, and accent." };
  const client = await adminClient();
  let url: string | null;
  try { url = safeChannelUrl(channel.type, channel.value, channel.url); } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Invalid channel URL." }; }
  const values = { contact_id: channel.contact_id, type: channel.type.trim().toLowerCase(), label: channel.label.trim(), value: channel.value?.trim() || null, url, status: channel.status, status_label: channel.status_label?.trim() || null, accent: channel.accent, sort_order: channel.sort_order, updated_at: new Date().toISOString() };
  const { error } = await client.from("portfolio_contact_channels").upsert({ id: channel.id, ...values }, { onConflict: "id" });
  if (error) return { ok: false, message: "Channel could not be saved." };
  refreshed(); return { ok: true };
}

export async function deleteContactChannelAction(id: string): Promise<Result> {
  if (!isUuid(id)) return { ok: false, message: "Invalid channel." };
  const client = await adminClient(); const { error } = await client.from("portfolio_contact_channels").delete().eq("id", id);
  if (error) return { ok: false, message: "Channel could not be removed." };
  refreshed(); return { ok: true };
}

export async function reorderContactChannelsAction(ids: string[]): Promise<Result> {
  if (!ids.length || ids.some((id) => !isUuid(id)) || new Set(ids).size !== ids.length) return { ok: false, message: "Invalid channel order." };
  const client = await adminClient(); const { error } = await client.rpc("reorder_contact_channels", { p_ids: ids });
  if (error) return { ok: false, message: "Channel order could not be saved." };
  refreshed(); return { ok: true };
}

export async function saveContactSubjectAction(subject: ContactSubject): Promise<Result> {
  if (!validContactSubject(subject)) return { ok: false, message: "Review the subject value and label." };
  const client = await adminClient();
  const values = { contact_id: subject.contact_id, value: subject.value.trim().toLowerCase(), label: subject.label.trim(), enabled: subject.enabled, sort_order: subject.sort_order, updated_at: new Date().toISOString() };
  const { error } = await client.from("portfolio_contact_subjects").upsert({ id: subject.id, ...values }, { onConflict: "id" });
  if (error) return { ok: false, message: "Subject could not be saved. Values must be unique." };
  refreshed(); return { ok: true };
}

export async function deleteContactSubjectAction(id: string): Promise<Result> {
  if (!isUuid(id)) return { ok: false, message: "Invalid subject." };
  const client = await adminClient(); const { error } = await client.from("portfolio_contact_subjects").delete().eq("id", id);
  if (error) return { ok: false, message: "Subject could not be removed." };
  refreshed(); return { ok: true };
}

export async function reorderContactSubjectsAction(ids: string[]): Promise<Result> {
  if (!ids.length || ids.some((id) => !isUuid(id)) || new Set(ids).size !== ids.length) return { ok: false, message: "Invalid subject order." };
  const client = await adminClient(); const { error } = await client.rpc("reorder_contact_subjects", { p_ids: ids });
  if (error) return { ok: false, message: "Subject order could not be saved." };
  refreshed(); return { ok: true };
}

export async function markContactMessageReadAction(id: string): Promise<Result> {
  if (!isUuid(id)) return { ok: false, message: "Invalid message." };
  const client = await adminClient();
  const { error } = await client.from("portfolio_contact_messages").update({ status: "read", read_at: new Date().toISOString(), archived_at: null }).eq("id", id).eq("status", "new");
  if (error) return { ok: false, message: "Message status could not be updated." };
  revalidatePath("/admin/contact"); return { ok: true };
}

export async function archiveContactMessageAction(id: string): Promise<Result> {
  if (!isUuid(id)) return { ok: false, message: "Invalid message." };
  const client = await adminClient();
  const { error } = await client.from("portfolio_contact_messages").update({ status: "archived", archived_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, message: "Message could not be archived." };
  revalidatePath("/admin/contact"); return { ok: true };
}
