"use server";

import { createClient } from "@supabase/supabase-js";
import type { ContactSubmission, ContactSubmissionResult } from "@/lib/contact";
import { validateContactSubmission } from "@/lib/contactValidation";
import { getSupabaseConfig, supabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";
import { readPublicContact } from "@/services/publicContactService";

export async function submitContactAction(payload: ContactSubmission): Promise<ContactSubmissionResult> {
  if (!supabaseConfigured) return { ok: false, message: "> DISPATCH_SERVICE_UNAVAILABLE" };
  const contact = await readPublicContact();
  if (!contact.submissionAvailable) return { ok: false, message: "> DISPATCH_SERVICE_UNAVAILABLE" };
  const validation = validateContactSubmission(payload, contact.settings, contact.subjects);
  if (!validation.ok) {
    if (validation.spam) return { ok: false, message: "> TRANSMISSION_FAILED" };
    return { ok: false, message: "> CHECK_PAYLOAD_FIELDS", fieldErrors: validation.fieldErrors };
  }
  try {
    const { url, key } = getSupabaseConfig();
    const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const { data, error } = await client.rpc("submit_contact_message", {
      p_sender_name: validation.value.name,
      p_sender_email: validation.value.email,
      p_subject_value: validation.value.subject,
      p_message: validation.value.message,
    });
    if (error || data !== true) return { ok: false, message: "> TRANSMISSION_FAILED" };
    return { ok: true, message: "> MESSAGE_DISPATCHED_SUCCESSFULLY" };
  } catch {
    return { ok: false, message: "> TRANSMISSION_FAILED" };
  }
}
