import type { AboutData } from "@/lib/about";

// Original published content, also used by the migration. Never used as an editor error fallback.
export const initialAbout: AboutData = {
  profile: {
    name: "Zhidan", class: "Informatics Engineering", specialization: "Full-Stack & Vision Systems",
    affiliation: "Universitas Riau", location: "Indonesia", record_id: "ZHIDAN", class_meta: "INFORMATICS_ENGINEER",
    bio_paragraph_1: "I am an Informatics Engineering student interested in the mechanics of resilient computing. My engineering path connects structured software design, full-stack applications, and computer vision.",
    bio_paragraph_2: "I like bringing machine learning and web systems together: from face recognition and attendance workflows to safety monitoring and useful digital experiences.",
    bio_paragraph_3: "Every project is an opportunity to make technology more practical, with thoughtful requirements, readable code, and clear interfaces.",
    bio_highlight: "Informatics Engineering student",
    directive: "Simplicity in interface, rigor in architecture, practical utility over decorative hype.",
  },
  interests: ["Web Architecture", "Computer Vision & YOLO", "Edge AI & Recognition", "Network Protocols & Sockets"].map((label, sort_order) => ({ id: `interest-${sort_order}`, label, sort_order })),
  tools: ["VS Code", "Linux / WSL", "Docker", "Git", "Postman"].map((label, sort_order) => ({ id: `tool-${sort_order}`, label, sort_order })),
  focus: ["SOFTWARE DEVELOPMENT", "COMPUTER VISION", "WEB APPLICATIONS", "CONTINUOUS LEARNING"].map((label, sort_order) => ({ id: `focus-${sort_order}`, label, sort_order, code: `FOCUS_0${sort_order + 1}` })),
  revision: null,
};
