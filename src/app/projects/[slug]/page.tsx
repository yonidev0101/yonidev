import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CTABanner from "@/components/sections/CTABanner";
import { projects } from "@/data/projects";
import { projectDetails } from "@/data/projectDetails";
import ProjectDetailClient from "./ProjectDetailClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};

  const detail = projectDetails.en[project.slug];
  return {
    title: `${detail?.tagline ?? slug} — YoniDev`,
    description: detail?.overview ?? "",
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const projectIndex = projects.indexOf(project);
  const prevProject  = projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProject  = projects[(projectIndex + 1) % projects.length];

  return (
    <>
      <Navbar />
      <main>
        <ProjectDetailClient
          project={project}
          prevProject={prevProject}
          nextProject={nextProject}
        />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
