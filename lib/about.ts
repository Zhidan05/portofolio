export type Profile = {
  name: string; class: string; specialization: string; affiliation: string;
  location: string; record_id: string; class_meta: string;
  bio_paragraph_1: string; bio_paragraph_2: string; bio_paragraph_3: string;
  bio_highlight: string; directive: string;
};
export type AboutItem = { id: string; label: string; code?: string; sort_order: number };
export type AboutData = { profile: Profile; interests: AboutItem[]; tools: AboutItem[]; focus: AboutItem[]; revision: string | null };
