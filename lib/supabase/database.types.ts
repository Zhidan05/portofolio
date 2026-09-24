import type { AboutData, Profile } from "@/lib/about";
import type { HomeData } from "@/lib/home";
import type { ContactChannel, ContactMessage, ContactSettings, ContactSubject, PublicContactData } from "@/lib/contact";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type Shape<Value> = { [Key in keyof Value]: Value[Key] };
type Table<Row, Insert = Partial<Row>> = {
  Row: Shape<Row>;
  Insert: Shape<Insert>;
  Update: Shape<Partial<Row>>;
  Relationships: [];
};
type ListRow = { id: string; label: string; sort_order: number; created_at: string };
// Mirrors the checked-in migration; no generated CLI configuration is present.
export type Database = {
  public: {
    Tables: {
      portfolio_admins: Table<{ user_id: string; created_at: string }, { user_id: string; created_at?: string }>;
      about_profile: Table<Profile & { id: number; updated_at: string }>;
      about_interests: Table<ListRow>;
      about_tools: Table<ListRow>;
      about_focus: Table<ListRow & { code: string }>;
      portfolio_experiences: Table<{
        id: string;
        organization: string;
        role: string;
        description: string;
        start_label: string;
        end_label: string | null;
        status: "active" | "inactive" | "completed";
        status_label: string;
        accent: "primary" | "secondary" | "tertiary" | "custom";
        custom_accent_color: string | null;
        is_current: boolean;
        sort_order: number;
        published: boolean;
        created_at: string;
        updated_at: string;
      }>;
      portfolio_experience_tags: Table<{
        id: string;
        experience_id: string;
        label: string;
        sort_order: number;
        created_at: string;
      }>;
      portfolio_contact: Table<ContactSettings, Omit<ContactSettings, "updated_at"> & { updated_at?: string }>;
      portfolio_contact_channels: Table<ContactChannel, Omit<ContactChannel, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }>;
      portfolio_contact_subjects: Table<ContactSubject, Omit<ContactSubject, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }>;
      portfolio_contact_messages: Table<ContactMessage, Omit<ContactMessage, "id" | "status" | "source" | "created_at" | "read_at" | "archived_at"> & { id?: string; status?: ContactMessage["status"]; source?: string; created_at?: string; read_at?: string | null; archived_at?: string | null }>;
    };
    Views: Record<string, never>;
    Functions: {
      read_about: { Args: Record<string, never>; Returns: AboutData | null };
      save_about: { Args: { content: AboutData; expected_revision: string | null }; Returns: string };
      read_home: { Args: Record<string, never>; Returns: HomeData | null };
      save_home: { Args: { content: HomeData; expected_revision: string | null }; Returns: string };
      save_experience: { Args: { exp_json: unknown; tags_json: unknown }; Returns: string };
      reorder_experiences: { Args: { exp_ids: string[] }; Returns: void };
      read_public_contact: { Args: Record<string, never>; Returns: Omit<PublicContactData, "submissionAvailable"> | null };
      submit_contact_message: { Args: { p_sender_name: string; p_sender_email: string; p_subject_value: string; p_message: string }; Returns: boolean };
      reorder_contact_channels: { Args: { p_ids: string[] }; Returns: void };
      reorder_contact_subjects: { Args: { p_ids: string[] }; Returns: void };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
