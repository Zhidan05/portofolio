export type ContactChannelStatus = "active" | "pending" | "hidden";
export type ContactMessageStatus = "new" | "read" | "archived";

export interface ContactSettings {
  id: string; section_label: string; heading: string; description: string;
  channels_heading: string; channels_status_label: string | null;
  channels_footer_title: string | null; channels_footer_text: string | null;
  form_heading: string; form_intro: string | null; submit_label: string;
  max_message_length: number; updated_at: string;
}
export interface ContactChannel {
  id: string; contact_id: string; type: string; label: string; value: string | null;
  url: string | null; status: ContactChannelStatus; status_label: string | null;
  accent: string; sort_order: number; created_at: string; updated_at: string;
}
export interface ContactSubject {
  id: string; contact_id: string; value: string; label: string; enabled: boolean;
  sort_order: number; created_at: string; updated_at: string;
}
export interface ContactMessage {
  id: string; sender_name: string; sender_email: string; subject_value: string;
  message: string; status: ContactMessageStatus; source: string; created_at: string;
  read_at: string | null; archived_at: string | null;
}
export interface PublicContactData {
  settings: ContactSettings; channels: ContactChannel[]; subjects: ContactSubject[];
  submissionAvailable: boolean;
}
export interface AdminContactData extends PublicContactData { messages: ContactMessage[]; }
export interface ContactSubmission {
  name: string; email: string; subject: string; message: string;
  company_website: string; initialized_at: number;
}
export type ContactSubmissionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string>> };
