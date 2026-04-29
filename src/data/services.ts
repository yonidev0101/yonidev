export type ServiceId = "fullstack" | "ai" | "bots" | "apis";
export type ProcessId = "discover" | "design" | "develop" | "deliver";

export interface Service {
  id: ServiceId;
  icon: string;
}

export interface ProcessStep {
  id: ProcessId;
  number: string;
  icon: string;
}

export const services: Service[] = [
  { id: "fullstack", icon: "Code2" },
  { id: "ai",        icon: "Sparkles" },
  { id: "bots",      icon: "Bot" },
  { id: "apis",      icon: "Plug" },
];

export const processSteps: ProcessStep[] = [
  { id: "discover", number: "01", icon: "Search" },
  { id: "design",   number: "02", icon: "PenTool" },
  { id: "develop",  number: "03", icon: "Code2" },
  { id: "deliver",  number: "04", icon: "Rocket" },
];
