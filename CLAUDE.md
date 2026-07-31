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

## Admin dashboard (`/admin`)

A real, auth-gated CRM/PM tool — separate from the marketing site. Hebrew, RTL.

### Routes & shell
- `src/app/admin/login` — public login page.
- `src/app/admin/(app)/` — route group for the authenticated shell (`layout.tsx` → `MobileChrome` + `Sidebar`). Pages: `/admin` (dashboard), `clients`, `personal` (personal side-projects), `tasks`, `time`, `invoices`, plus `projects/[id]`, `clients/[id]`, `tasks/[id]`, `invoices/[id]`.
- Admin pages that read the DB are server components with `export const dynamic = "force-dynamic"`; interactivity lives in `"use client"` components under `src/components/admin/`.

### Auth
- JWT session cookie `admin-session` (jose, HS256), signed with `ADMIN_SESSION_SECRET`. Login compares the submitted password to `ADMIN_PASSWORD` with `safeEqual` (constant-time) + IP rate limiting.
- `src/middleware.ts` gates `/admin/*` and `/api/admin/*` (pages redirect to login; API returns 401). `requireAdminApi()` in `lib/auth/guard.ts` is defense-in-depth for route handlers.

### Data layer (DB)
- **Neon Postgres + Drizzle ORM.** Schema: `src/lib/db/schema.ts`. Client: `src/lib/db/client.ts` (lazy proxy — throws only on first query if `DATABASE_URL` is missing, so builds don't break).
- Two domains: **client work** (`clients → projects → tasks / time_entries / project_links / communications / invoices`) and **personal projects** (`personal_projects → personal_tasks / personal_links / personal_time_entries` — no client, no billing).
- **Tags** (personal projects only): `personal_tags` is a per-project catalogue (`slug` = the English handle agents send, `label` = the Hebrew display text, `color` = a palette key), joined to tasks many-to-many through `personal_task_tags`. A tag says *which area* the work touches ("PWA", "נדל״ן"); `personalTasks.type` says what the task *is*. All reads/writes go through `src/lib/admin/tags.ts` so the admin UI and the agent API resolve tags identically — matching by slug, then by label, then creating.
- Read/aggregation helpers: `src/lib/admin/queries.ts`. Hebrew date/money/status formatting + label maps: `src/lib/admin/format.ts`.

### API routes (`src/app/api/admin/*`)
- Route handlers with `export const runtime = "nodejs"`. Validate input with zod via `parseJson`; respond with `json` / `notFound` / `serverError` from `src/lib/admin/http.ts`. Client-work and personal-* resources have parallel CRUD routes.

### Agent API (`src/app/api/agent/*`)
Narrow, token-authenticated surface so Claude Code sessions on *other* projects can keep tasks and the progress journal up to date while they work. Three endpoints only — it can't read clients/invoices and can't delete anything:

| Route | Purpose |
|---|---|
| `GET /api/agent/context` | Project list, or (with `?projectKind=&projectId=`) open tasks + their `taskKey`s and tags, checklists, recent journal, the project's tag catalogue, and the allowed enum values. |
| `POST /api/agent/task` | Upsert a task, idempotent on `(projectId, agentKey)`. Won't move status — that must be journalled. `tags` here **replaces** the task's set. |
| `POST /api/agent/log` | Journal entry + status move + checklist ticks + time entry in one request. Idempotent via `externalKey`. `tags` here is **additive**. |

- Auth: `x-agent-token` (or `Authorization: Bearer`) compared to `AGENT_API_TOKEN` with `safeEqual`, in `src/lib/auth/agent.ts`. `src/middleware.ts` gates `/api/agent/*` with the token **only** — the admin cookie is deliberately not accepted there, so a browser session can't be driven into it cross-site.
- Shared vocabulary, task resolution by `taskKey`, and update-kind mapping between the two domains live in `src/lib/agent/core.ts`.
- A tag the agent names but the project doesn't have yet is **created** (`source: "agent"`) and reported in `warnings` — the taxonomy stays honest without the agent getting stuck mid-session.
- Rows written this way carry `source: "agent"` + `agentName`; both timelines render a 🤖 badge for them. `tasks.agentKey` / `personalTasks.agentKey` are the stable slugs agents address tasks by.
- The paste-into-another-session prompt that documents all of this is `admin-sync-prompt.md` at the repo root — update it whenever these routes change.

### Migrations — IMPORTANT (env quirk)
- Generate SQL with `npm run db:generate` (writes to `drizzle/`).
- **Do NOT use `drizzle-kit push`/`migrate` here** — they use a websocket connection that this environment's corporate proxy blocks (same self-signed-cert issue that blocks `git fetch`), so they hang.
- Apply instead over Neon's HTTP driver: `node scripts/apply-migrations.mjs <drizzle/NNNN_name.sql>` with `DATABASE_URL` (load from `.env.local`) and `NODE_TLS_REJECT_UNAUTHORIZED=0` set. The DB was provisioned via `push`, so drizzle's `__drizzle_migrations` table is empty — apply only the new file's statements, never the full migrator. (Use the `/migrate` skill to do all of this.)

### Env vars
`DATABASE_URL`, `ADMIN_SESSION_SECRET`, `ADMIN_PASSWORD`, `AGENT_API_TOKEN` (≥16 chars; when unset the agent API stays closed, returning 401), plus nodemailer SMTP vars for invoice sending. `CRON_SECRET` (set in Vercel) guards the daily-digest cron route (`/api/cron/daily-digest`, scheduled in `vercel.json`); Vercel auto-injects it as a `Bearer` token.

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

## סנכרון עם לוח הבקרה של YoniDev (חובה)

העבודה בפרויקט הזה מנוהלת בלוח הבקרה של YoniDev — כלומר בפרויקט הזה עצמו, בפרודקשן.
**אתה** אחראי לעדכן שם את המשימה ואת לוג ההתקדמות — אל תחכה שיבקשו ממך.

### הגדרות

- `PROJECT_KIND` = `personal`
- `PROJECT_ID` = `2` (הפרויקט "yonidev" בלוח)
- `YONIDEV_URL`, `YONIDEV_AGENT_TOKEN` — ב-`.env.local` בלבד, לא ב-git.
  ברירת מחדל: `https://yonidev.vercel.app`. אם שרת הפיתוח רץ אפשר גם `http://localhost:3000`.

כל הקריאות נושאות `x-agent-token: $YONIDEV_AGENT_TOKEN`. אין login, אין cookie.

> על Windows כאן: `curl` דרך schannel נופל על `CRYPT_E_NO_REVOCATION_CHECK` בגלל
> ה-MITM של Rimon — הוסף `--ssl-no-revoke` לכל קריאה.

יש בדיוק שלוש נקודות קצה (מוגדרות ב-`src/app/api/agent/*` בריפו הזה):

| מתי | קריאה |
|---|---|
| בתחילת סשן | `GET /api/agent/context?projectKind=personal&projectId=2` |
| כשמתחילים משימה | `POST /api/agent/task` — יוצר או מוצא (idempotent על `taskKey`) |
| תוך כדי ובסיום | `POST /api/agent/log` — יומן + סטטוס + זמן + צ'קליסט |

### דוגמאות

```bash
curl -sS --ssl-no-revoke -H "x-agent-token: $YONIDEV_AGENT_TOKEN" \
  "$YONIDEV_URL/api/agent/context?projectKind=personal&projectId=2"
```

```bash
curl -sS --ssl-no-revoke -X POST "$YONIDEV_URL/api/agent/task" \
  -H "x-agent-token: $YONIDEV_AGENT_TOKEN" -H 'Content-Type: application/json' -d '{
  "projectKind": "personal", "projectId": 2,
  "taskKey": "dark-mode",
  "title": "מצב כהה לאתר",
  "description": "מה בדיוק צריך לעשות",
  "type": "feature", "priority": "medium", "estimateMinutes": 120,
  "acceptance": "תנאי קבלה", "steps": ["טוקנים של צבע", "מתג בהדר"],
  "tags": ["admin", "ui"]
}'
```

```bash
curl -sS --ssl-no-revoke -X POST "$YONIDEV_URL/api/agent/log" \
  -H "x-agent-token: $YONIDEV_AGENT_TOKEN" -H 'Content-Type: application/json' -d '{
  "projectKind": "personal", "projectId": 2,
  "taskKey": "dark-mode",
  "kind": "progress",
  "summary": "משפט אחד בעברית — מה נעשה",
  "details": "קבצים שנגעתי בהם, החלטות, מה נשאר",
  "status": "in_progress",
  "nextAction": "הצעד הבא הקונקרטי",
  "completedSteps": ["טוקנים של צבע"],
  "tags": ["ui"],
  "commitSha": "abc1234", "timeMinutes": 45,
  "agent": "claude-code", "externalKey": "dark-mode-2026-07-31-01"
}'
```

- `taskKey` — slug באנגלית קטנה עם מקפים, יציב. קריאה חוזרת עם אותו `taskKey` לא תיצור כפילות.
- **`tags`** — על מה העבודה (אזור בפרויקט), לא מה סוג המשימה. קח את הסלאגים מ-`project.tags`
  שחוזר ב-`context`. ב-`/task` הרשימה **מחליפה** את מה שיש; ב-`/log` היא **מתווספת**.
  התגיות של הריפו הזה: `admin` (לוח בקרה), `db` (בסיס נתונים), `agent-api` (API סוכנים),
  `ui` (ממשק) — הוסף חדשות רק כשבאמת אין מתאימה, ואז עם `{"slug":"x","label":"עברית"}`.
- ערכי enum מגיעים ב-`vocabulary` שבתשובת `context` — אל תנחש.
  `kind`: `progress|decision|blocker|commit|research|bug|note|handoff`.
  `status`: `todo|in_progress|waiting|blocked|done|canceled`. **זו הדרך היחידה להזיז משימה.**
- `externalKey` — מפתח ייחודי לעדכון; ניסיון חוזר עם אותו מפתח מחזיר `"duplicate": true`.
- `commitSha` לבד מספיק — הלוח בונה את הקישור לגיטהאב לפי הריפו של הפרויקט.

### מתי לעדכן

1. **בתחילת משימה** — `POST /api/agent/task`, ואז `log` עם `"status": "in_progress"`.
2. **תוך כדי** — `log` אחרי כל צעד משמעותי: פיצ'ר, החלטה, באג שנפתר, חסימה, קומיט.
3. **בסיום** — `log` עם סיכום, `"status": "done"`, ו-`nextAction` אם נשאר משהו פתוח.

**אל תשאל רשות לפני כל עדכון** — פשוט עשה, וציין בשורה אחת מה נכתב ולאיזה `url`.

### כללים

- `summary` / `details` / `nextAction` **בעברית**, ענייני. `summary` = שורה אחת עד 500 תווים.
- `taskKey` נשמר כאן ב-`CLAUDE.md` ליד תיאור המשימה.
- אל תנסה בלולאה אחרי שגיאה: `401` = טוקן, `404` = משימה לא קיימת, `422` = שדה לא תקין
  (פירוט ב-`issues`). דווח ותמשיך לעבוד.
- אם הלוח לא זמין — המשך לעבוד וציין בסוף שהעדכון לא נשמר.
- **זהירות מיוחדת בריפו הזה:** שינוי ב-`src/app/api/agent/*` או ב-`src/lib/agent/core.ts`
  משנה את ה-API שאתה עצמך משתמש בו. אחרי דיפלוי כזה, ודא ב-`context` שהכל עדיין עונה,
  ועדכן את `admin-sync-prompt.md` (ה-prompt להדבקה בפרויקטים אחרים) ואת הסעיף הזה.
