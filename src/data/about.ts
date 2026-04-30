import { Zap, Layers, GitBranch, Languages, Music, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ProjectStatus = "live" | "dev" | "mvp";

export interface CurrentProject {
  id: string;
  status: ProjectStatus;
  stack: string[];
  link?: string;
}

export interface Principle {
  id: "direct" | "modern" | "stepwise" | "languages";
  icon: LucideIcon;
}

export interface Passion {
  id: "teaching" | "hardware";
  icon: LucideIcon;
}

export interface TechCategory {
  id: "frontend" | "backend" | "data" | "ai" | "infra" | "iot";
  items: string[];
}

export const currentProjects: CurrentProject[] = [
  {
    id: "al-hamacom",
    status: "live",
    stack: ["Next.js", "MongoDB", "Redis"],
    link: "https://al-hamacom-dev.vercel.app",
  },
  {
    id: "yoniverse",
    status: "dev",
    stack: ["Node.js", "Fastify", "MongoDB", "Multi-Agent"],
  },
  {
    id: "frame",
    status: "mvp",
    stack: ["React", "Vite", "Raspberry Pi 4", "Kiosk"],
  },
];

export const principles: Principle[] = [
  { id: "direct",    icon: Zap },
  { id: "modern",    icon: Layers },
  { id: "stepwise",  icon: GitBranch },
  { id: "languages", icon: Languages },
];

export const passions: Passion[] = [
  { id: "teaching", icon: Music },
  { id: "hardware", icon: Cpu },
];

export const techCategories: TechCategory[] = [
  { id: "frontend", items: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Flutter"] },
  { id: "backend",  items: ["Node.js", "TypeScript", "Fastify", "Express"] },
  { id: "data",     items: ["MongoDB", "PostgreSQL", "Redis", "Qdrant"] },
  { id: "ai",       items: ["OpenAI", "Anthropic", "Make", "Zapier", "n8n"] },
  { id: "infra",    items: ["Vercel", "Cloudinary", "GitHub", "Docker"] },
  { id: "iot",      items: ["ESP32", "Raspberry Pi", "Arduino"] },
];
