"use client";


import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import Logo from "./Logo";
import { useT } from "@/lib/i18n/LocaleProvider";

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}


export default function Footer() {
  const t = useT();
  const f = t.footer;

  const navLinks = [
    { href: "/",         label: t.nav.home     },
    { href: "/about",    label: t.nav.about    },
    { href: "/services", label: t.nav.services },
    { href: "/projects", label: t.nav.projects },
    { href: "/contact",  label: t.nav.contact  },
  ];

  return (
    <footer className="bg-white border-t border-border mt-0">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Logo subtitle="by STARTOP" />
            <p className="text-sm text-body leading-relaxed max-w-[200px]">
              {f.tagline}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/yonidev"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-text hover:text-heading hover:bg-muted transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon />
              </a>
              <a
                href="mailto:yonidev0101@gmail.com"
                className="p-2 rounded-lg text-muted-text hover:text-heading hover:bg-muted transition-colors"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-heading mb-4">{f.navTitle}</h4>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-body hover:text-brand-500 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Built with */}
          <div>
            <h4 className="text-sm font-semibold text-heading mb-4">{f.builtWithTitle}</h4>
            <ul className="flex flex-col gap-2">
              {["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Claude Code"].map((tech) => (
                <li key={tech} className="text-sm text-muted-text">{tech}</li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold text-heading mb-4">{f.connectTitle}</h4>
            <p className="text-sm text-body mb-4">{f.connectBody}</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:gap-2.5 transition-all"
            >
              {f.cta} <ArrowRight size={14} className="rtl:-scale-x-100" />
            </Link>
            <p className="mt-4 text-xs text-muted-text">yonidev0101@gmail.com</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border-soft flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-text">
            {f.copyright}
            {/* Discreet admin entry — looks like a decorative dot, but it's a link */}
            <Link
              href="/admin"
              aria-label="admin"
              className="text-muted-text hover:text-heading transition-colors ms-1.5"
            >
              ·
            </Link>
          </p>
          <p className="text-xs font-bold tracking-[0.22em] text-brand-500" dir="ltr">
            {f.builtWith}
          </p>
        </div>
      </div>
    </footer>
  );
}
