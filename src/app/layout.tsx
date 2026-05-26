import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Heebo } from "next/font/google";
import "./globals.css";
import { LocaleProvider, localeInitScript } from "@/lib/i18n/LocaleProvider";

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
  title: {
    default: "YoniDev — Code Your Dream",
    template: "%s · YoniDev",
  },
  description:
    "יונתן יגלניק — מפתח Full Stack המתמחה באפליקציות ווב, אינטגרציות AI, אוטומציות ובוטים. בונה פתרונות דיגיטליים מודרניים, מהירים וסקיילביליים מרעיון לפרודקשן.",
  keywords: ["מפתח Full Stack", "פיתוח ווב", "React", "Next.js", "AI", "אוטומציה", "בוט WhatsApp", "YoniDev"],
  authors: [{ name: "יונתן יגלניק", url: "https://yonidev.dev" }],
  openGraph: {
    title: "YoniDev — Code Your Dream",
    description: "בונה אפליקציות ווב, אוטומציות וכלים מבוססי AI — מודרניים, מהירים וסקיילביליים.",
    type: "website",
    locale: "he_IL",
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
      </head>
      <body className="min-h-full flex flex-col">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
