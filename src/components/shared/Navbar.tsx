"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "./Logo";
import LocaleToggle from "./LocaleToggle";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function Navbar() {
  const t = useT();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/",         label: t.nav.home     },
    { href: "/about",    label: t.nav.about    },
    { href: "/services", label: t.nav.services },
    { href: "/projects", label: t.nav.projects },
    { href: "/contact",  label: t.nav.contact  },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-border shadow-[0_1px_12px_rgba(15,23,42,0.06)]"
          : "bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between h-20">
        <Logo />

        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    isActive ? "text-heading" : "text-body hover:text-heading"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute bottom-0 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-1 h-1 rounded-full bg-brand-500"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <LocaleToggle />
          <Link
            href="/contact"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-500 text-brand-500 text-sm font-semibold hover:bg-brand-500 hover:text-white transition-all duration-200"
          >
            {t.nav.cta}
            <ArrowRight size={15} className="rtl:-scale-x-100" />
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LocaleToggle compact />
          <button
            className="p-2 rounded-lg text-heading"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t.nav.menu}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-white border-b border-border px-4 pb-6"
          >
            <ul className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-brand-50 text-brand-600"
                        : "text-body hover:bg-muted hover:text-heading"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-full bg-brand-500 text-white text-sm font-semibold"
            >
              {t.nav.cta} <ArrowRight size={15} className="rtl:-scale-x-100" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
