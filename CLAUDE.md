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
  app/          # Routes (App Router). layout.tsx + page.tsx only at root so far.
  components/
    sections/   # Full-page sections: Hero, Stats, Services, FeaturedProjects, Process, Technologies, CTABanner
    shared/     # Layout-level: Navbar, Footer, Logo
    ui/         # shadcn primitives (button, badge, card, separator) — do not edit directly
  data/         # Static content: projects.ts, services.ts, technologies.ts
  lib/          # utils.ts (cn helper)
```

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
