export type Accent = "default" | "primary" | "secondary" | "tertiary" | "custom";

export interface HomeProfile {
  system_location_code: string;
  system_status_text: string;
  region_primary: string;
  region_secondary: string;
  greeting: string;
  description: string;
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label: string;
  secondary_cta_url: string;
  cv_cta_label: string;
  cv_url: string;
  cv_enabled: boolean;
  workspace_terminal_user: string;
  workspace_terminal_path: string;
  workspace_label: string;
  workspace_status: string;
  project_focus_label: string;
  project_focus_value: string;
  workspace_motto: string;
  workspace_mode: string;
}

export interface HomeHeadlineSegment {
  id: string;
  line_number: number;
  text: string;
  accent: Accent;
  custom_color: string | null;
  sort_order: number;
}

export interface HomeInfoCard {
  id: string;
  label: string;
  value: string;
  accent: Accent;
  sort_order: number;
}

export interface HomeData {
  profile: HomeProfile;
  segments: HomeHeadlineSegment[];
  info_cards: HomeInfoCard[];
  revision: string | null;
}
