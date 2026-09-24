import type { PublicContactData } from "@/lib/contact";

const contactId = "00000000-0000-4000-8000-000000000007";
const epoch = "1970-01-01T00:00:00.000Z";

export const initialContact: PublicContactData = {
  settings: {
    id: contactId,
    section_label: "07 // DISPATCH_CONSOLE",
    heading: "LET'S BUILD SOMETHING USEFUL",
    description: "Interested in software engineering collaboration, computer vision research, or full-stack applications? Let's turn a useful idea into something real.",
    channels_heading: "DIRECT_CHANNELS",
    channels_status_label: "CHANNELS PENDING",
    channels_footer_title: "CHANNELS PENDING",
    channels_footer_text: "Verified contact details will be published here.",
    form_heading: "TRANSMIT_MESSAGE.SH",
    form_intro: "Contact form preview — delivery is not connected yet.",
    submit_label: "DISPATCH MESSAGE →",
    max_message_length: 1024,
    updated_at: epoch,
  },
  channels: [
    { id: "10000000-0000-4000-8000-000000000001", contact_id: contactId, type: "email", label: "PRIMARY EMAIL", value: null, url: null, status: "pending", status_label: "PENDING", accent: "primary", sort_order: 0, created_at: epoch, updated_at: epoch },
    { id: "10000000-0000-4000-8000-000000000002", contact_id: contactId, type: "github", label: "CODE REPOSITORY", value: null, url: null, status: "pending", status_label: "PENDING", accent: "secondary", sort_order: 1, created_at: epoch, updated_at: epoch },
    { id: "10000000-0000-4000-8000-000000000003", contact_id: contactId, type: "linkedin", label: "PROFESSIONAL NETWORK", value: null, url: null, status: "pending", status_label: "PENDING", accent: "tertiary", sort_order: 2, created_at: epoch, updated_at: epoch },
    { id: "10000000-0000-4000-8000-000000000004", contact_id: contactId, type: "instagram", label: "DEVELOPER DISPATCH", value: null, url: null, status: "pending", status_label: "PENDING", accent: "primary", sort_order: 3, created_at: epoch, updated_at: epoch },
  ],
  subjects: [
    { id: "20000000-0000-4000-8000-000000000001", contact_id: contactId, value: "project", label: "Project Inquiry / Contract", enabled: true, sort_order: 0, created_at: epoch, updated_at: epoch },
    { id: "20000000-0000-4000-8000-000000000002", contact_id: contactId, value: "opportunity", label: "Internship / Job Opportunity", enabled: true, sort_order: 1, created_at: epoch, updated_at: epoch },
    { id: "20000000-0000-4000-8000-000000000003", contact_id: contactId, value: "research", label: "Computer Vision / AI Research", enabled: true, sort_order: 2, created_at: epoch, updated_at: epoch },
    { id: "20000000-0000-4000-8000-000000000004", contact_id: contactId, value: "other", label: "General Dev Discussion", enabled: true, sort_order: 3, created_at: epoch, updated_at: epoch },
  ],
  submissionAvailable: false,
};
