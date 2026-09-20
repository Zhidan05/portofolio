export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  accent: "green" | "cyan" | "violet";
  detail: string;
  github: string | null;
  demo: string | null;
};
// TODO: Add verified repository/demo URLs and project screenshots when supplied.
export const projects: Project[] = [
  {
    id: "01",
    title: "PPE Compliance Detection",
    category: "Computer Vision / AI",
    description:
      "Real-time computer vision for detecting incomplete personal protective equipment. A practical safety-monitoring pipeline with Telegram integration.",
    technologies: ["Python", "Ultralytics YOLO", "OpenCV", "Telegram"],
    accent: "green",
    detail: "DETECTION_PIPELINE // PERSONAL PROTECTIVE EQUIPMENT",
    github: null,
    demo: null,
  },
  {
    id: "02",
    title: "Employee Attendance — Face Recognition",
    category: "Computer Vision / Web",
    description:
      "An employee attendance system using face identification and recognition, connecting computer vision with a web-based attendance workflow.",
    technologies: ["InsightFace", "ArcFace", "Python", "Web technologies"],
    accent: "cyan",
    detail: "FACE_IDENTIFICATION // ATTENDANCE WORKFLOW",
    github: null,
    demo: null,
  },
  {
    id: "03",
    title: "SIMBA — Sistem Informasi Magang Berbasis Aplikasi",
    category: "Full Stack Web",
    description:
      "A full-stack internship management system that brings internship administration and its supporting workflows into one web application.",
    technologies: ["Laravel", "MySQL", "Bootstrap", "JavaScript"],
    accent: "violet",
    detail: "INTERNSHIP_MANAGEMENT // FULL-STACK APPLICATION",
    github: null,
    demo: null,
  },
  {
    id: "04",
    title: "InnoElectrica Expo 2026",
    category: "Modern Event Platform",
    description:
      "An interactive event website and platform, bringing event information to life through a modern interface and considered motion.",
    technologies: ["Next.js", "Tailwind CSS", "Framer Motion"],
    accent: "green",
    detail: "EVENT_PLATFORM // INTERACTIVE EXPERIENCES",
    github: null,
    demo: null,
  },
];
