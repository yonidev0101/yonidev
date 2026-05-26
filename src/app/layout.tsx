import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Heebo } from "next/font/google";
import "./globals.css";
import { LocaleProvider, localeInitScript } from "@/lib/i18n/LocaleProvider";
import {
  SITE,
  SITE_URL,
  organizationJsonLd,
  personJsonLd,
  websiteJsonLd,
} from "@/lib/seo/site";
import JsonLd from "@/lib/seo/JsonLd";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  generator: "Next.js",
  keywords: [
    "מפתח Full Stack",
    "פיתוח ווב",
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "AI",
    "בינה מלאכותית",
    "אוטומציה",
    "בוט WhatsApp",
    "OpenAI",
    "Claude",
    "Tauri",
    "MongoDB",
    "YoniDev",
    "Yonatan Yaglnik",
    "פרילנסר ירושלים",
  ],
  authors: [{ name: "יונתן יגלניק", url: SITE_URL }],
  creator: "יונתן יגלניק",
  publisher: SITE.name,
  category: "technology",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: "/",
    languages: {
      "he-IL": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE_URL,
    locale: SITE.locale,
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    creator: "@yonidev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${heebo.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeInitScript }} />
        <JsonLd data={[personJsonLd(), organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body className="min-h-full flex flex-col">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
