export interface Technology {
  name: string;
  icon: string;
  color: string;
}

export const technologies: Technology[] = [
  { name: "React",       icon: "SiReact",       color: "#61DAFB" },
  { name: "Next.js",     icon: "SiNextdotjs",   color: "#000000" },
  { name: "Node.js",     icon: "SiNodedotjs",   color: "#339933" },
  { name: "TypeScript",  icon: "SiTypescript",  color: "#3178C6" },
  { name: "MongoDB",     icon: "SiMongodb",     color: "#47A248" },
  { name: "Tailwind CSS",icon: "SiTailwindcss", color: "#06B6D4" },
  { name: "Python",      icon: "SiPython",      color: "#3776AB" },
  { name: "OpenAI",      icon: "SiOpenai",      color: "#412991" },
  { name: "WhatsApp",    icon: "SiWhatsapp",    color: "#25D366" },
  { name: "Vercel",      icon: "SiVercel",      color: "#000000" },
  { name: "Git",         icon: "SiGit",         color: "#F05032" },
  { name: "Zapier",      icon: "SiZapier",      color: "#FF4A00" },
];

export const stats = [
  { value: "5+",  label: "Years Building"       },
  { value: "20+", label: "Projects Delivered"   },
  { value: "4",   label: "Service Areas"        },
  { value: "∞",   label: "Lines of Code"        },
];
