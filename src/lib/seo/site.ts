/**
 * Single source of truth for SEO + structured data.
 * Used by layout, sitemap, robots, llms.txt, and per-page metadata.
 */

export const SITE_URL = "https://yonidev.vercel.app";

export const SITE = {
  name: "YoniDev",
  legalName: "YoniDev",
  tagline: "Code Your Dream",
  description:
    "יונתן יגלניק — מפתח Full-Stack המתמחה באפליקציות ווב, אינטגרציות AI, אוטומציות ובוטים. בונה פתרונות דיגיטליים מודרניים, מהירים וסקיילביליים מרעיון לפרודקשן.",
  descriptionEn:
    "Yonatan Yaglnik — Full-Stack developer specializing in web applications, AI integrations, automations and bots. Builds modern, fast and scalable digital products from idea to production.",
  url: SITE_URL,
  email: "yonidev0101@gmail.com",
  locale: "he_IL",
  countryCode: "IL",
} as const;

export const PERSON = {
  name: "יונתן יגלניק",
  nameEn: "Yonatan Yaglnik",
  alternateNames: ["Yonatan Yaglnik", "Yoni Yaglnik", "YoniDev"],
  jobTitle: "Full-Stack Developer",
  jobTitleHe: "מפתח Full-Stack",
  city: "Jerusalem",
  cityHe: "ירושלים",
  country: "Israel",
  countryHe: "ישראל",
  github: "https://github.com/yonidev",
  linkedin: "https://linkedin.com/in/yonidev",
  knowsAbout: [
    "Full-Stack Development",
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Tauri",
    "Rust",
    "MongoDB",
    "Artificial Intelligence",
    "Large Language Models",
    "OpenAI",
    "Anthropic Claude",
    "Retrieval Augmented Generation",
    "WhatsApp Bots",
    "Automation",
    "REST API Design",
    "Real-time Systems",
    "WebSockets",
    "Web Performance",
  ],
} as const;

/* ---------------------------------------------------------------- */
/*  JSON-LD builders                                                */
/* ---------------------------------------------------------------- */

type Json = Record<string, unknown>;

export function personJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: PERSON.name,
    alternateName: PERSON.alternateNames,
    url: SITE_URL,
    image: `${SITE_URL}/logo/y-logo.png`,
    jobTitle: PERSON.jobTitle,
    email: `mailto:${SITE.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: PERSON.city,
      addressCountry: PERSON.country,
    },
    sameAs: [PERSON.github, PERSON.linkedin],
    knowsAbout: PERSON.knowsAbout,
    worksFor: { "@id": `${SITE_URL}/#organization` },
  };
}

export function organizationJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#organization`,
    name: SITE.name,
    alternateName: PERSON.nameEn,
    url: SITE_URL,
    logo: `${SITE_URL}/logo/y-logo.png`,
    image: `${SITE_URL}/logo/y-logo-full.png`,
    email: SITE.email,
    description: SITE.description,
    founder: { "@id": `${SITE_URL}/#person` },
    areaServed: [
      { "@type": "Country", name: "Israel" },
      { "@type": "Place", name: "Worldwide (remote)" },
    ],
    serviceType: [
      "Full-Stack Web Development",
      "AI Integration",
      "Automation",
      "Bot Development",
      "API Design",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: PERSON.city,
      addressCountry: PERSON.country,
    },
    sameAs: [PERSON.github, PERSON.linkedin],
  };
}

export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE.name,
    description: SITE.description,
    inLanguage: ["he-IL", "en"],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function serviceJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    serviceType: opts.serviceType,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "Country", name: "Israel" },
      { "@type": "Place", name: "Worldwide (remote)" },
    ],
  };
}

export function creativeWorkJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
  keywords?: string[];
  liveUrl?: string;
  codeUrl?: string;
}): Json {
  const data: Json = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    applicationCategory: "WebApplication",
    operatingSystem: "Any",
    creator: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
  if (opts.image) data.image = opts.image.startsWith("http") ? opts.image : `${SITE_URL}${opts.image}`;
  if (opts.keywords?.length) data.keywords = opts.keywords.join(", ");
  if (opts.liveUrl) data.installUrl = opts.liveUrl;
  if (opts.codeUrl) data.codeRepository = opts.codeUrl;
  return data;
}

export function faqJsonLd(items: { q: string; a: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
