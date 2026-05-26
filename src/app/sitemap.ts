import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,         changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/about`,    changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/contact`,  changeFrequency: "yearly",  priority: 0.7 },
  ].map((r) => ({ ...r, lastModified }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: p.featured ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
