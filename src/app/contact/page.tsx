import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ContactHero from "./ContactHero";
import ContactForm from "./ContactForm";
import ContactChannels from "./ContactChannels";

export const metadata: Metadata = {
  title: "Contact — YoniDev",
  description: "Get in touch with YoniDev. Let's build something amazing together.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="bg-bg-soft">
        <ContactHero />

        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Form */}
              <div className="lg:col-span-7">
                <ContactForm />
              </div>

              {/* Channels */}
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
