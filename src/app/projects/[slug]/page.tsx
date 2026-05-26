import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CTABanner from "@/components/sections/CTABanner";
import { projects } from "@/data/projects";
import { projectDetails } from "@/data/projectDetails";
import ProjectDetailClient from "./ProjectDetailClient";
import JsonLd from "@/lib/seo/JsonLd";
import {
  SITE_URL,
  breadcrumbJsonLd,
  creativeWorkJsonLd,
} from "@/lib/seo/site";

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

  const detail = projectDetails.he?.[project.slug] ?? projectDetails.en[project.slug];
  const title = detail?.tagline ?? slug;
  const description = detail?.overview ?? "";
  const url = `${SITE_URL}/projects/${project.slug}`;
  const image = `${SITE_URL}${project.image}`;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      url,
      title,
      description,
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const projectIndex = projects.indexOf(project);
  const prevProject  = projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProject  = projects[(projectIndex + 1) % projects.length];

  const detail = projectDetails.he?.[project.slug] ?? projectDetails.en[project.slug];
  const url    = `/projects/${project.slug}`;

  return (
    <>
      <JsonLd
        data={[
          creativeWorkJsonLd({
            name: detail?.tagline ?? project.slug,
            description: detail?.overview ?? "",
            url,
            image: project.image,
            keywords: project.stack,
            liveUrl: project.liveUrl,
            codeUrl: project.githubUrl,
          }),
          breadcrumbJsonLd([
            { name: "Home",     url: "/" },
            { name: "פרויקטים", url: "/projects" },
            { name: detail?.tagline ?? project.slug, url },
          ]),
        ]}
      />
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
