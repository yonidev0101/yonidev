import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CTABanner from "@/components/sections/CTABanner";
import ProjectsClient from "./ProjectsClient";
import JsonLd from "@/lib/seo/JsonLd";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo/site";
import { projects } from "@/data/projects";
import { projectDetails } from "@/data/projectDetails";

const title = "פרויקטים";
const description =
  "מבחר עבודות של YoniDev — אפליקציות web, כלי AI, בוטים ואוטומציות בפרודקשן.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/projects" },
  openGraph: {
    url: `${SITE_URL}/projects`,
    title,
    description,
  },
};

export default function ProjectsPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: `${SITE_URL}/projects`,
    name: title,
    description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((p, i) => {
        const detail =
          projectDetails.he?.[p.slug] ?? projectDetails.en[p.slug];
        return {
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/projects/${p.slug}`,
          name: detail?.tagline ?? p.slug,
        };
      }),
    },
  };

  return (
    <>
      <JsonLd
        data={[
          itemList,
          breadcrumbJsonLd([
            { name: "Home",     url: "/" },
            { name: "פרויקטים", url: "/projects" },
          ]),
        ]}
      />
      <Navbar />
      <main>
        <ProjectsClient />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
