import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CTABanner from "@/components/sections/CTABanner";
import AboutHero from "./AboutHero";
import MyStory from "./MyStory";
import CurrentlyBuilding from "./CurrentlyBuilding";
import BeyondCode from "./BeyondCode";

export const metadata: Metadata = {
  title: "אודות — YoniDev",
  description:
    "מפתח Full-Stack מירושלים. בונה אפליקציות web מודרניות ומתרחבות, כלי AI ומערכות אוטומציה בעולם האמיתי.",
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
