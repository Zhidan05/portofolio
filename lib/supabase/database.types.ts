import type { AboutData, Profile } from "@/lib/about";
import type { HomeData } from "@/lib/home";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type Table<Row, Insert = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
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
    };
    Views: Record<string, never>;
    Functions: {
      read_about: { Args: Record<string, never>; Returns: AboutData | null };
      save_about: { Args: { content: AboutData; expected_revision: string | null }; Returns: string };
      read_home: { Args: Record<string, never>; Returns: HomeData | null };
      save_home: { Args: { content: HomeData; expected_revision: string | null }; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
