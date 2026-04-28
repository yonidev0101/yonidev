export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
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
    title: "Yoniverse",
    description: "Personal portfolio and project showcase with modern design and smooth animations.",
    longDescription: "A creative portfolio site featuring custom animations, responsive design and a clean component architecture.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    category: "web",
    image: "/projects/yoniverse.png",
    featured: true,
  },
  {
    slug: "al-hamacom",
    title: "Al HaMacom",
    description: "Local business platform connecting users with services in their neighborhood.",
    longDescription: "Full-stack local services platform with search, listings, reviews and admin dashboard.",
    stack: ["Next.js", "Node.js", "MongoDB", "Tailwind CSS"],
    category: "web",
    image: "/projects/al-hamacom.png",
    featured: true,
  },
  {
    slug: "ai-whatsapp-bot",
    title: "AI WhatsApp Bot",
    description: "Smart WhatsApp bot with natural language understanding and business automation.",
    longDescription: "AI-powered bot handling customer inquiries, appointment booking and CRM integration.",
    stack: ["Node.js", "WhatsApp API", "OpenAI", "MongoDB"],
    category: "bot",
    image: "/projects/yoniverse.png",
    featured: true,
  },
  {
    slug: "project-4",
    title: "Task Management App",
    description: "Collaborative task management app with real-time updates and team features.",
    longDescription: "Full-featured project management tool with drag-and-drop boards, team collaboration and Slack notifications.",
    stack: ["React", "Node.js", "Socket.io", "PostgreSQL"],
    category: "web",
    image: "/projects/project-4.png",
    featured: false,
  },
  {
    slug: "project-5",
    title: "Business Automation Suite",
    description: "End-to-end business automation connecting CRM, invoicing and email workflows.",
    longDescription: "Custom automation system replacing manual processes with smart workflows using Make and custom code.",
    stack: ["Node.js", "Make", "REST APIs", "TypeScript"],
    category: "automation",
    image: "/projects/project-5.png",
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
