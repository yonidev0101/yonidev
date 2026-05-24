# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm run lint     # eslint
npm run start    # serve production build
```

**The dev server is usually running in the background.** Do NOT run `npm run build` — it kills the dev server. To verify code before pushing, use `npm run lint` for quick checks. Only run `npm run build` explicitly if the user asks for it or the dev server is confirmed to be stopped.

## Architecture

**Next.js 16 App Router** — no Pages Router. Read `node_modules/next/dist/docs/` before using any routing, metadata, or data-fetching API; this version has breaking changes from earlier Next.js.

### Directory layout

```
src/
  app/          # Routes (App Router): /, /about, /services, /projects, /contact
  components/
    sections/   # Full-page sections: Hero, Stats, Services, FeaturedProjects, Process, Technologies, CTABanner
    shared/     # Layout-level + animation primitives (see below)
    ui/         # shadcn primitives (button, badge, card, separator) — do not edit directly
  data/         # Static content: projects.ts, services.ts, technologies.ts
  lib/          # utils.ts (cn helper)
```

### Shared animation components

| Component | File | Use |
|---|---|---|
| `ScrambleText` | `shared/ScrambleText.tsx` | Character-scramble reveal for **page-load h1s** (always visible). Use `animate`, NOT `whileInView`. Pass `delay` in seconds. |
| `RevealText` | `shared/RevealText.tsx` | Clip-path slide-up reveal for **scroll-triggered h2s**. Uses `whileInView` — only for elements not visible on load. |
| `SideText` | `shared/SideText.tsx` | Vertical decorative text at section edges (desktop only). Uses `writing-mode: vertical-rl` + scroll parallax. |
| `SectionReveal` | `shared/SectionReveal.tsx` | Generic fade+slide wrapper for scroll-triggered content blocks. |
| `ScrollKineticText` | `shared/ScrollKineticText.tsx` | Two-row horizontal kinetic text driven by scroll. Intended as absolute background element inside sections. |

**Animation conventions:**
- All `whileInView` viewports use `{ once: true, amount: 0.08 }` — triggers early so content is already animating as user scrolls to it.
- Page-load headings (h1): `ScrambleText` + `motion.span` slide (`y: "105%" → "0%"`, ease `[0.33, 1, 0.68, 1]`).
- Scroll headings (h2): `RevealText` with staggered `delay` per line (0.05 / 0.13 for two lines).
- Framer Motion `ease` must be a named string or `EasingFunction` — raw `number[]` arrays cause TS build errors. Exception: cubic-bezier arrays like `[0.33, 1, 0.68, 1]` are valid as they match the `BezierDefinition` type.

### Design system

All design tokens live in `src/app/globals.css` inside `@theme inline {}` (Tailwind v4 syntax — not `tailwind.config.ts`). Key tokens:

| Token | Value | Use |
|---|---|---|
| `brand-500` | `#2B7FFF` | Primary blue — CTAs, icons, accents |
| `heading` | `#0F172A` | All headings |
| `body` | `#64748B` | Body text |
| `bg-soft` | `#F8FAFC` | Page background |

Utility classes defined in `globals.css`: `.container`, `.section-eyebrow`, `.section-heading`, `.section-body`, `.card-base`, `.halo-blue`, `.float-slow`, `.float-card-{1,2,3}`.

**Font:** `Plus Jakarta Sans` loaded via `next/font/google` as `--font-plus-jakarta`. Hebrew fallback: `Heebo`.

### Client vs Server components

- Any component using Framer Motion (`motion.*`, `AnimatePresence`, `useInView`) or React hooks needs `"use client"` at the top.
- `Navbar`, `Hero`, `Stats`, `Services`, `FeaturedProjects`, `Process`, `Technologies`, `CTABanner` are all client components.
- `Footer`, `Logo`, `layout.tsx`, `page.tsx` are server components.

### Data layer

Content is in `src/data/` as plain TypeScript — no CMS or database yet:
- `projects.ts` — `Project[]` with `slug`, `stack`, `category`, `featured`, image path. Image files go in `public/projects/`.
- `services.ts` — `Service[]` + `processSteps[]` used by Services and Process sections.
- `technologies.ts` — tech logos (`public/tech/*.svg`) + `stats[]`.

To add a project: add an entry to `projects.ts` and place its screenshot at `public/projects/<slug>.png`.

### Known lucide-react limitations

This version does **not** export `Github` or `Linkedin`. Use inline SVG for social icons (see `Footer.tsx` for the pattern).

### Framer Motion types

The `ease` property in Framer Motion variants must be a named string (`"easeOut"`, `"easeInOut"`) or `EasingFunction`, **not** a raw `number[]` array — that causes a TypeScript build error.

## Git workflow

- **`main`** — production only. Never commit directly.
- All work goes on `feature/<name>` or `fix/<name>` branches, then merge to `main`.
- Commit format: `feat:`, `fix:`, `chore:`, `style:` prefix.
- Vercel auto-deploys on push to `main`.

## Assets

| Path | Purpose |
|---|---|
| `public/logo/y-logo.png` | Standalone Y mark — used in Hero float and Navbar |
| `public/logo/y-logo-full.png` | Y + "YoniDev" text — for OG images / splash |
| `public/tech/*.svg` | Tech logo SVGs for the Technologies section |
| `public/projects/*.png` | Project screenshots — filename must match `project.image` in data |
