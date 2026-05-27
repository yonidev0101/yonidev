export interface Technology {
  name: string;
  icon: string;
  color: string;
}

export const technologies: Technology[] = [
  { name: "React",         icon: "SiReact",         color: "#61DAFB" },
  { name: "Next.js",       icon: "SiNextdotjs",     color: "#000000" },
  { name: "Node.js",       icon: "SiNodedotjs",     color: "#339933" },
  { name: "TypeScript",    icon: "SiTypescript",    color: "#3178C6" },
  { name: "MongoDB",       icon: "SiMongodb",       color: "#47A248" },
  { name: "Tailwind CSS",  icon: "SiTailwindcss",   color: "#06B6D4" },
  { name: "OpenAI",        icon: "SiOpenai",        color: "#412991" },
  { name: "WhatsApp",      icon: "SiWhatsapp",      color: "#25D366" },
  { name: "Vercel",        icon: "SiVercel",        color: "#000000" },
  { name: "Git",           icon: "SiGit",           color: "#F05032" },
  { name: "N8N",           icon: "SiN8n",           color: "#EA4B71" },
  { name: "Rust",          icon: "SiRust",          color: "#CE422B" },
  { name: "Flutter",       icon: "SiFlutter",       color: "#02569B" },
  { name: "Docker",        icon: "SiDocker",        color: "#2496ED" },
  { name: "Framer Motion", icon: "SiFramer",        color: "#0055FF" },
  { name: "Supabase",      icon: "SiSupabase",      color: "#3ECF8E" },
  { name: "Cloudinary",    icon: "SiCloudinary",    color: "#3448C5" },
  { name: "Redis",         icon: "SiRedis",         color: "#DC382D" },
];

export type StatKey = "yearsBuilding" | "projectsDelivered" | "serviceAreas" | "linesOfCode";

export const stats: { key: StatKey; value: string }[] = [
  { key: "yearsBuilding",     value: "3+"  },
  { key: "projectsDelivered", value: "15+" },
  { key: "serviceAreas",      value: "4"   },
  { key: "linesOfCode",       value: "∞"   },
];
