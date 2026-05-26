import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ContactHero from "./ContactHero";
import ContactForm from "./ContactForm";
import ContactChannels from "./ContactChannels";
import JsonLd from "@/lib/seo/JsonLd";
import { SITE, SITE_URL, breadcrumbJsonLd } from "@/lib/seo/site";

const title = "צור קשר";
const description =
  "צור קשר עם YoniDev — בוא נבנה יחד פרויקט. מענה במייל תוך 24 שעות.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: {
    url: `${SITE_URL}/contact`,
    title,
    description,
  },
};

export default function ContactPage() {
  const contactPage = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE_URL}/contact`,
    name: title,
    description,
    mainEntity: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SITE.email,
        availableLanguage: ["he", "en"],
        areaServed: ["IL", "Worldwide"],
      },
    },
  };

  return (
    <>
      <JsonLd
        data={[
          contactPage,
          breadcrumbJsonLd([
            { name: "Home",     url: "/" },
            { name: "צור קשר", url: "/contact" },
          ]),
        ]}
      />
      <Navbar />
      <main className="bg-bg-soft">
        <ContactHero />

        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-7">
                <ContactForm />
              </div>

              <div className="lg:col-span-5 lg:sticky lg:top-28">
                <ContactChannels />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
