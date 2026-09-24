import "server-only";
import { requireAdmin } from "@/lib/admin";
import type { AdminContactData, ContactChannel, ContactMessage, ContactSettings, ContactSubject } from "@/lib/contact";

export async function readAdminContact(): Promise<AdminContactData> {
  const { client } = await requireAdmin();
  if (!client) throw new Error("Contact administration is unavailable.");
  const [settingsResult, channelsResult, subjectsResult, messagesResult] = await Promise.all([
    client.from("portfolio_contact").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    client.from("portfolio_contact_channels").select("*").order("sort_order", { ascending: true }),
    client.from("portfolio_contact_subjects").select("*").order("sort_order", { ascending: true }),
    client.from("portfolio_contact_messages").select("*").order("created_at", { ascending: false }).limit(250),
  ]);
  const error = settingsResult.error || channelsResult.error || subjectsResult.error || messagesResult.error;
  if (error || !settingsResult.data) throw new Error("Contact records could not be loaded. Apply the Contact migration and retry.");
  return {
    settings: settingsResult.data as ContactSettings,
    channels: (channelsResult.data || []) as ContactChannel[],
    subjects: (subjectsResult.data || []) as ContactSubject[],
    messages: (messagesResult.data || []) as ContactMessage[],
    submissionAvailable: true,
  };
}
