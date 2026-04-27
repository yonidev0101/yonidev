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
    slug: "project-1",
    title: "Analytics Dashboard",
    description: "Real-time analytics dashboard for tracking and managing key business metrics.",
    longDescription: "A full-stack analytics platform with live data visualization, custom reporting and role-based access control.",
    stack: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS"],
    category: "web",
    image: "/projects/project-1.png",
    featured: true,
  },
  {
    slug: "project-2",
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with payments, admin panel and inventory management.",
    longDescription: "Complete shopping experience with Stripe integration, product management, and order tracking.",
    stack: ["Next.js", "Node.js", "MongoDB", "Stripe", "Tailwind CSS"],
    category: "web",
    image: "/projects/project-2.png",
    featured: true,
  },
  {
    slug: "project-3",
    title: "AI WhatsApp Bot",
    description: "Smart WhatsApp bot with natural language understanding and business automation.",
    longDescription: "AI-powered bot handling customer inquiries, appointment booking and CRM integration.",
    stack: ["Node.js", "WhatsApp API", "OpenAI", "MongoDB"],
    category: "bot",
    image: "/projects/project-3.png",
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
