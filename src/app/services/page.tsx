import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CTABanner from "@/components/sections/CTABanner";
import Process from "@/components/sections/Process";
import ServicesHero from "./ServicesHero";
import ServicesDetail from "./ServicesDetail";
import JsonLd from "@/lib/seo/JsonLd";
import { SITE_URL, breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/site";

const title = "שירותים";
const description =
  "פיתוח Full-Stack, אינטגרציות AI, בוטים, אוטומציות ותכנון APIs על ידי YoniDev — מהרעיון לפרודקשן.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/services" },
  openGraph: {
    url: `${SITE_URL}/services`,
    title,
    description,
  },
};

export default function ServicesPage() {
  const services = [
    serviceJsonLd({
      name: "פיתוח Full-Stack",
      description: "אפליקציות web מודרניות עם Next.js, React ו-TypeScript — UI, backend, DB ו-deploy.",
      url: "/services#fullstack",
      serviceType: "Full-Stack Web Development",
    }),
    serviceJsonLd({
      name: "אינטגרציות AI",
      description: "שילוב מודלי שפה (OpenAI, Claude) במוצרים — RAG על MongoDB Vector Search, סוכנים, מודרציית תוכן, חיפוש סמנטי.",
      url: "/services#ai",
      serviceType: "AI Integration",
    }),
    serviceJsonLd({
      name: "בוטים ל-WhatsApp",
      description: "בוטים עסקיים עם זיכרון שיחות, חילוץ ישויות, CRM ותשובות מבוססות AI בעברית.",
      url: "/services#bots",
      serviceType: "WhatsApp Bot Development",
    }),
    serviceJsonLd({
      name: "אוטומציה ואינטגרציות",
      description: "חיבור Google Workspace, MQTT, מערכות עסקיות פנימיות; CRON workers ו-schedulers.",
      url: "/services#automation",
      serviceType: "Workflow Automation",
    }),
    serviceJsonLd({
      name: "תכנון ובניית APIs",
      description: "REST APIs נקיים ומתועדים עם Fastify או Express, אימות JWT, rate limiting ו-OpenAPI.",
      url: "/services#apis",
      serviceType: "API Design",
    }),
  ];

  return (
    <>
      <JsonLd
        data={[
          ...services,
          breadcrumbJsonLd([
            { name: "Home",    url: "/" },
            { name: "שירותים", url: "/services" },
          ]),
        ]}
      />
      <Navbar />
      <main>
        <ServicesHero />
        <ServicesDetail />
        <Process />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
