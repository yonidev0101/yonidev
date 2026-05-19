export type ProjectSlug =
  | "yoniverse"
  | "al-hamacom"
  | "ai-whatsapp-bot"
  | "categories-game"
  | "git-explorer";

export interface Project {
  slug: ProjectSlug;
  stack: string[];
  category: "web" | "ai" | "automation" | "bot";
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: "yoniverse",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    category: "web",
    image: "/projects/yoniverse.png",
    featured: true,
  },
  {
    slug: "al-hamacom",
    stack: ["Next.js", "Node.js", "MongoDB", "Tailwind CSS"],
    category: "web",
    image: "/projects/al-hamacom.png",
    featured: true,
  },
  {
    slug: "ai-whatsapp-bot",
    stack: ["Node.js", "WhatsApp API", "OpenAI", "MongoDB"],
    category: "bot",
    image: "/projects/yoniverse.png",
    featured: true,
  },
  {
    slug: "categories-game",
    stack: ["Next.js", "Node.js", "Socket.IO", "OpenAI", "MongoDB"],
    category: "web",
    image: "/projects/categories-game.png",
    featured: false,
  },
  {
    slug: "git-explorer",
    stack: ["Tauri", "React", "Rust", "TypeScript"],
    category: "web",
    image: "/projects/git-explorer.png",
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
