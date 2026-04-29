export type ProjectSlug =
  | "yoniverse"
  | "al-hamacom"
  | "ai-whatsapp-bot"
  | "project-4"
  | "project-5";

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
    slug: "project-4",
    stack: ["React", "Node.js", "Socket.io", "PostgreSQL"],
    category: "web",
    image: "/projects/project-4.png",
    featured: false,
  },
  {
    slug: "project-5",
    stack: ["Node.js", "Make", "REST APIs", "TypeScript"],
    category: "automation",
    image: "/projects/project-5.png",
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
