import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CTABanner from "@/components/sections/CTABanner";
import ProjectsClient from "./ProjectsClient";

export const metadata: Metadata = {
  title: "פרויקטים — YoniDev",
  description:
    "מבחר עבודות — אפליקציות Web, כלי AI, בוטים ואוטומציות שנבנו על ידי YoniDev.",
};

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main>
        <ProjectsClient />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
