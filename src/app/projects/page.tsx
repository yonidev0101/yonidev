import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CTABanner from "@/components/sections/CTABanner";
import ProjectsClient from "./ProjectsClient";

export const metadata: Metadata = {
  title: "Projects — YoniDev",
  description:
    "A curated selection of web apps, AI tools, bots, and automation systems built by YoniDev.",
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
