import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CTABanner from "@/components/sections/CTABanner";
import Process from "@/components/sections/Process";
import ServicesHero from "./ServicesHero";
import ServicesDetail from "./ServicesDetail";

export const metadata: Metadata = {
  title: "Services — YoniDev",
  description:
    "Full-stack development, AI integrations, bots, and API services by YoniDev.",
};

export default function ServicesPage() {
  return (
    <>
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
