import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CTABanner from "@/components/sections/CTABanner";
import AboutHero from "./AboutHero";
import MyStory from "./MyStory";
import JsonLd from "@/lib/seo/JsonLd";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo/site";

const title = "אודות";
const description =
  "יונתן יגלניק — מפתח Full-Stack מירושלים. בונה אפליקציות web מודרניות וסקיילביליות, כלי AI, בוטים ומערכות אוטומציה.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    url: `${SITE_URL}/about`,
    title,
    description,
    type: "profile",
  },
};

export default function AboutPage() {
  const aboutPage = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${SITE_URL}/about`,
    name: title,
    description,
    mainEntity: { "@id": `${SITE_URL}/#person` },
  };

  return (
    <>
      <JsonLd
        data={[
          aboutPage,
          breadcrumbJsonLd([
            { name: "Home",  url: "/" },
            { name: "אודות", url: "/about" },
          ]),
        ]}
      />
      <Navbar />
      <main>
        <AboutHero />
        <MyStory />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
