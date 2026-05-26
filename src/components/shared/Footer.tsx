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

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function Footer() {
  const t = useT();

  const navLinks = [
    { href: "/",         label: t.nav.home     },
    { href: "/about",    label: t.nav.about    },
    { href: "/services", label: t.nav.services },
    { href: "/projects", label: t.nav.projects },
    { href: "/contact",  label: t.nav.contact  },
  ];

  const serviceLinks = [
    { href: "/services#fullstack", label: t.footer.services.frontend },
    { href: "/services#fullstack", label: t.footer.services.backend  },
    { href: "/services#ai",        label: t.footer.services.ai       },
    { href: "/services#bots",      label: t.footer.services.bots     },
    { href: "/services#apis",      label: t.footer.services.apis     },
  ];

  return (
    <footer className="bg-white border-t border-border mt-0">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Logo subtitle="by STARTOP" />
            <p className="text-sm text-body leading-relaxed max-w-[200px]">
              {t.footer.tagline}
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
                href="https://linkedin.com/in/yonidev"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-text hover:text-heading hover:bg-muted transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon />
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
            <h4 className="text-sm font-semibold text-heading mb-4">{t.footer.navTitle}</h4>
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

          <div>
            <h4 className="text-sm font-semibold text-heading mb-4">{t.footer.servicesTitle}</h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((l) => (
                <li key={l.label}>
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

          <div>
            <h4 className="text-sm font-semibold text-heading mb-4">{t.footer.connectTitle}</h4>
            <p className="text-sm text-body mb-4">
              {t.footer.connectBody}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:gap-2.5 transition-all"
            >
              {t.footer.cta} <ArrowRight size={14} className="rtl:-scale-x-100" />
            </Link>
            <p className="mt-4 text-xs text-muted-text">yonidev0101@gmail.com</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border-soft flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-text">
            {t.footer.copyright}
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
            {t.footer.builtWith}
          </p>
        </div>
      </div>
    </footer>
  );
}
