import { Music, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ProjectStatus = "live" | "dev" | "mvp";

export interface CurrentProject {
  id: string;
  status: ProjectStatus;
  stack: string[];
  link?: string;
}

export interface Passion {
  id: "teaching" | "hardware";
  icon: LucideIcon;
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

export const passions: Passion[] = [
  { id: "teaching", icon: Music },
  { id: "hardware", icon: Cpu },
];
