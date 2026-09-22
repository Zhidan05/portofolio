export type ExperienceStatus = "active" | "inactive" | "completed";
export type ExperienceAccent = "primary" | "secondary" | "tertiary" | "custom";

export interface ExperienceTag {
  id: string;
  label: string;
  sort_order: number;
}

export interface ExperienceRecord {
  id: string;
  organization: string;
  role: string;
  description: string;
  start_label: string;
  end_label: string | null;
  status: ExperienceStatus;
  status_label: string;
  accent: ExperienceAccent;
  custom_accent_color: string | null;
  is_current: boolean;
  sort_order: number;
  published: boolean;
  tags: ExperienceTag[];
}
