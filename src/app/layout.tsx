import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YoniDev — Full Stack Developer",
  description:
    "Yonatan Yaglenik — Full Stack Developer specializing in web apps, AI integrations, automations and bots. Building modern, fast and scalable digital solutions from idea to production.",
  keywords: ["Full Stack Developer", "React", "Next.js", "AI", "Automation", "WhatsApp Bot", "YoniDev"],
  authors: [{ name: "Yonatan Yaglenik", url: "https://yonidev.dev" }],
  openGraph: {
    title: "YoniDev — Full Stack Developer",
    description: "Building modern, fast and scalable web applications, automations and AI-powered tools.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
