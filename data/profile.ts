export const navigation = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Tech Stack" },
  { id: "contact", label: "Contact" },
];
// TODO: Replace nulls with owner-verified destinations, never prototype URLs.
export const profile = {
  email: null,
  github: null,
  linkedin: null,
  instagram: null,
  cv: null,
} as {
  email: string | null;
  github: string | null;
  linkedin: string | null;
  instagram: string | null;
  cv: string | null;
};
