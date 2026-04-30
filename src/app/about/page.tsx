import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CTABanner from "@/components/sections/CTABanner";
import AboutHero from "./AboutHero";
import MyStory from "./MyStory";
import CurrentlyBuilding from "./CurrentlyBuilding";
import BeyondCode from "./BeyondCode";

export const metadata: Metadata = {
  title: "About — YoniDev",
  description:
    "Full-Stack Developer from Jerusalem. Building modern, scalable web applications, AI tools, and real-world automation systems.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <AboutHero />
        <MyStory />
        <CurrentlyBuilding />
        <BeyondCode />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
