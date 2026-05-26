import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import Services from "@/components/sections/Services";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import Process from "@/components/sections/Process";
import Technologies from "@/components/sections/Technologies";
import CTABanner from "@/components/sections/CTABanner";
import JsonLd from "@/lib/seo/JsonLd";
import { SITE, SITE_URL, serviceJsonLd } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    url: SITE_URL,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export default function Home() {
  const services = [
    serviceJsonLd({
      name: "פיתוח Full-Stack",
      description: "אפליקציות ווב מודרניות עם Next.js, React ו-TypeScript מהרעיון עד הפרודקשן.",
      url: "/services#fullstack",
      serviceType: "Full-Stack Web Development",
    }),
    serviceJsonLd({
      name: "אינטגרציות AI",
      description: "שילוב LLMs (OpenAI, Claude) במוצרים — RAG, חיפוש סמנטי, סוכנים ושיחות חכמות.",
      url: "/services#ai",
      serviceType: "AI Integration",
    }),
    serviceJsonLd({
      name: "בוטים ל-WhatsApp ול-Telegram",
      description: "בוטים עסקיים עם זיכרון, CRM, חיפוש שיחות חכם ותשובות AI בעברית.",
      url: "/services#bots",
      serviceType: "Bot Development",
    }),
    serviceJsonLd({
      name: "אוטומציות",
      description: "אוטומציה של תהליכים עסקיים — Google Workspace, MQTT, CRON workers ואינטגרציות מותאמות.",
      url: "/services#automation",
      serviceType: "Workflow Automation",
    }),
    serviceJsonLd({
      name: "תכנון APIs",
      description: "REST APIs נקיים, מתועדים וסקיילביליים עם Fastify / Express ו-MongoDB.",
      url: "/services#apis",
      serviceType: "API Design",
    }),
  ];

  return (
    <>
      <JsonLd data={services} />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Services />
        <FeaturedProjects />
        <Process />
        <Technologies />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
