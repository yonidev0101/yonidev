export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const services: Service[] = [
  {
    id: "fullstack",
    title: "Full-Stack Development",
    description:
      "End-to-end web apps and sites — from pixel-perfect UI to scalable server architecture.",
    icon: "Code2",
  },
  {
    id: "ai",
    title: "AI Integrations",
    description:
      "LLM APIs, RAG systems and smart features built into your product seamlessly.",
    icon: "Sparkles",
  },
  {
    id: "bots",
    title: "Bots & Automation",
    description:
      "WhatsApp & Telegram bots with natural language, plus Make / Zapier / custom code workflows.",
    icon: "Bot",
  },
  {
    id: "apis",
    title: "API & Integrations",
    description:
      "Connecting platforms, syncing data and automating business processes end-to-end.",
    icon: "Plug",
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Discover",
    description: "Understanding your idea, goals and requirements.",
    icon: "Search",
  },
  {
    number: "02",
    title: "Design",
    description: "Planning, wireframing and designing the solution.",
    icon: "PenTool",
  },
  {
    number: "03",
    title: "Develop",
    description: "Writing clean, efficient and scalable code.",
    icon: "Code2",
  },
  {
    number: "04",
    title: "Deliver",
    description: "Testing, deploying and continuous support.",
    icon: "Rocket",
  },
];
