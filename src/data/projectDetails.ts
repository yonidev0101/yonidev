import type { Locale } from "@/lib/i18n/translations";
import type { ProjectSlug } from "@/data/projects";

export interface SetupStep {
  label: string;
  command?: string;
  note?: string;
}

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface ProjectDetailContent {
  tagline: string;
  overview: string;
  problem: string;
  solution: string;
  features: ProjectFeature[];
  highlights: string[];
  setup: {
    prerequisites: string[];
    steps: SetupStep[];
  };
}

export const projectDetails: Record<Locale, Record<ProjectSlug, ProjectDetailContent>> = {
  en: {
    yoniverse: {
      tagline:
        "A personal AI operating system that unifies your devices, automations, and daily life through one intelligent brain.",
      overview:
        "Yoniverse OS is a full-stack personal operating system built as a Turbo monorepo spanning 10 apps and services. " +
        "It connects a Windows desktop overlay, an Android app, a WhatsApp bot, ESP32 smart home devices, and a Next.js web dashboard — " +
        "all orchestrated by an AI-powered Brain server running on a Raspberry Pi. " +
        "The system understands natural language in Hebrew and English, learns user habits proactively, and automates daily routines across every surface.",
      problem:
        "Personal productivity tools are scattered across disconnected apps with no shared context — your phone doesn't know what's on your desktop, " +
        "your smart home doesn't react to your calendar, and no single AI assistant understands your full daily context across devices and services.",
      solution:
        "A central Brain server (Fastify v5 + MongoDB + multi-provider LLM) acts as the orchestration hub for every surface. " +
        "Each client — Windows desktop built with Tauri v2 and Rust, Android app in Flutter, WhatsApp via Baileys, and ESP32 smart home devices — " +
        "connects to the Brain through WebSocket or REST. The Brain runs node-cron schedulers every minute to fire proactive analyzers, " +
        "maintains a persistent user model, extracts knowledge from conversations, and streams real-time updates through an SSE event bus.",
      features: [
        {
          title: "AI Brain Server",
          description:
            "Fastify v5 server with 25+ REST routes, multi-provider LLM support (OpenAI, OpenRouter, Gemini) and automatic fallback, " +
            "a plugin system for extensibility, and a cron scheduler running proactive analyzers — contact drift, spending anomalies, routine breaks, follow-up detection.",
        },
        {
          title: "Cross-Platform Clients",
          description:
            "Windows overlay built with Tauri v2 (React + Rust + Tokio, native Windows APIs via the windows crate), " +
            "Android app with Flutter and Riverpod, web dashboard in Next.js 14, and a WhatsApp bot via @whiskeysockets/baileys — all sharing one Brain backend.",
        },
        {
          title: "Smart Home Integration",
          description:
            "MQTT-based control (Mosquitto on Pi) of ESP32 devices with an IR blaster and DHT11 sensor. " +
            "The Brain translates natural-language commands into MQTT device commands in real time.",
        },
        {
          title: "Automation Engine",
          description:
            "Natural-language automation creation in Hebrew via a dedicated NL endpoint. " +
            "Supports four trigger types — time-based, WhatsApp keyword, device state, and system events — with 10 pre-built catalog templates.",
        },
        {
          title: "Proactive Intelligence",
          description:
            "Background analyzers run on a cron schedule and push insights before the user asks: morning briefings, " +
            "unanswered follow-ups, calendar conflicts, spending anomalies, and contact engagement drops.",
        },
      ],
      highlights: [
        "Turbo monorepo with 10 apps sharing @yoniverse/types and @yoniverse/protocol (Zod-validated cross-service contracts)",
        "Multi-LLM fallback chain — OpenAI → OpenRouter → Gemini — behind a single generateText() interface with zero client changes",
        "Tauri v2 Rust backend uses Tokio async + the windows crate to call native Windows APIs (audio endpoints, COM, power management)",
        "SSE event bus at /api/events/stream decouples the Brain from the Desktop for real-time push without polling",
        "Docker on Raspberry Pi with --network host so the Brain reaches Mosquitto MQTT on localhost without extra networking",
        "Clerk JWT auth shared across all surfaces (web, desktop, mobile) with Fastify JWT plugin protecting every Brain route",
      ],
      setup: {
        prerequisites: [
          "Node.js 20+",
          "pnpm 9.15+",
          "MongoDB instance (local or Atlas)",
          "Rust toolchain + Tauri CLI v2 (for desktop)",
          "Docker (for Raspberry Pi deploy)",
          "OpenAI or OpenRouter API key",
        ],
        steps: [
          { label: "Clone and install dependencies", command: "git clone <repo-url> && cd yoniverse-v2 && pnpm install" },
          { label: "Configure environment variables", command: "cp .env.example apps/brain/.env", note: "Fill in MONGODB_URI, OPENAI_API_KEY, CLERK_SECRET_KEY, MQTT_HOST" },
          { label: "Start the Brain server", command: "pnpm dev:brain" },
          { label: "Start the web dashboard", command: "pnpm dev:web" },
          { label: "Run the desktop app (requires Rust)", command: "cd apps/desktop && pnpm tauri dev" },
          { label: "Deploy Brain to Raspberry Pi", note: "Run the full Docker deploy script from CLAUDE.md (tar → scp → docker build → docker run --network host)" },
        ],
      },
    },

    "al-hamacom": {
      tagline:
        "A full-stack Hebrew community portal connecting Jerusalem neighborhood residents through forums, classifieds, real estate, and local business discovery.",
      overview:
        "al-hamacom702 is a neighborhood-centric platform serving Jerusalem communities (Ramot, Har Nof, Pisgat Ze'ev) with five integrated modules: community forum, classifieds board, real estate listings, local business directory, and user profiles. The app features AI-powered semantic search across all content types, a full payment system with automatic Israeli invoice generation, and a PWA for mobile users. Built with Next.js 15 App Router, React 19, MongoDB Atlas, and deployed on Vercel.",
      problem:
        "Jerusalem neighborhood residents lacked a single trusted platform for local communication — discussions were fragmented across WhatsApp groups, local businesses had no searchable directory, real estate listings were scattered across unrelated sites, and there was no unified way to post or find local classifieds.",
      solution:
        "The platform uses Next.js dynamic routing ([siteArea]) to serve multiple neighborhoods from a single codebase. MongoDB Atlas provides both document storage and vector search, with OpenAI text-embedding-3-large generating 3072-dimension embeddings for semantic search across all content. Cardcom Low Profile API handles payments with automatic Israeli hashbonit (invoice) generation. Upstash Redis enforces per-route rate limiting with 20+ distinct tiers, and NextAuth.js v4 supports both Google OAuth and email/password authentication with reCAPTCHA v3.",
      features: [
        {
          title: "Community Forum with AI Moderation",
          description:
            "Threaded discussions with categories, sticky posts, soft-delete with anonymization, and OpenAI-powered content moderation that flags harmful content before it goes live.",
        },
        {
          title: "Semantic Search Across All Modules",
          description:
            "OpenAI text-embedding-3-large embeddings stored in MongoDB Atlas enable vector search across forum posts, classifieds, real estate, and business listings — returning contextually relevant results even when exact keywords don't match.",
        },
        {
          title: "Classifieds & Real Estate Listings",
          description:
            "A full classifieds board (second-hand, lost & found, miscellaneous) and a real estate module (rentals and sales) with image uploads via Cloudinary, advanced filters, and interactive maps via Leaflet.",
        },
        {
          title: "Local Business Directory with Premium Memberships",
          description:
            "Businesses, institutions, and non-profits can list with hours, prayer times (for synagogues), contact details, and optional premium features (highlighted listing, extended description, logo) paid via Cardcom with automatic Israeli tax invoice.",
        },
        {
          title: "Unified User Profiles & Favorites",
          description:
            "A single profile tracks favorites, listings, notifications, and payment history across all five modules. Zustand global stores (favorites, reports, share) keep UI state synchronized without prop drilling.",
        },
      ],
      highlights: [
        "Next.js 15 App Router with dynamic [siteArea] segment — one codebase serves multiple neighborhoods, with middleware redirecting between them based on a cookie.",
        "MongoDB Atlas Vector Search with OpenAI text-embedding-3-large (3072 dimensions) for semantic search in forum, board, info, and nadlan collections.",
        "Cardcom Low Profile API integration with automatic Israeli hashbonit (invoice) and zikui (credit note) generation, recurring billing via saved payment tokens, and full transaction tracking.",
        "Upstash Redis sliding-window rate limiting with 20+ named tiers (AUTH_LOGIN: 10/5min, SEARCH_VECTOR: 30/min, PAYMENT: 10/hour, etc.) — fail-open on timeout to avoid blocking real users.",
        "NextAuth.js v4 with Google OAuth + credentials provider, reCAPTCHA v3 on login, JWT sessions with 6-hour re-validation, and role-based access (user / moderator / admin / superadmin).",
        "Soft-delete with audit trail: every model stores deletedAt, deletionType, and a versions[] array that snapshots every field change — enabling full content history without hard deletes.",
        "PWA via next-pwa with push notifications, Sentry error tracking, Mixpanel event analytics, and Vercel Speed Insights — all running in production.",
      ],
      setup: {
        prerequisites: [
          "Node.js 18+",
          "pnpm 9+",
          "MongoDB Atlas cluster with Vector Search index enabled",
          "Cardcom merchant account (for payment features)",
          "Upstash Redis database (for rate limiting)",
          "Cloudinary account (for image uploads)",
          "OpenAI API key (for embeddings and moderation)",
          "Google OAuth credentials (for social login)",
        ],
        steps: [
          { label: "Clone the repository", command: "git clone <repo-url> && cd al-hamacom-dev" },
          { label: "Install dependencies", command: "pnpm install" },
          { label: "Create environment file", note: "Copy .env.example to .env.local and fill in all required variables: MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OPENAI_API_KEY, CARDCOM_TERMINAL_NUMBER, CARDCOM_API_NAME, CARDCOM_API_PASSWORD, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, Cloudinary credentials, and SMTP settings." },
          { label: "Start the development server", command: "pnpm dev" },
          { label: "(Optional) Seed forum content", command: "pnpm seed:forum:celebrations" },
          { label: "(Optional) Generate OpenAI embeddings for existing content", command: "pnpm add:forum:embeddings && pnpm add:info:embeddings" },
          { label: "Open in browser", note: "Navigate to http://localhost:3000 — middleware will redirect to /ramot automatically." },
        ],
      },
    },

    "ai-whatsapp-bot": {
      tagline: "The smart memory of your business — a WhatsApp bot that listens, remembers every detail, and answers questions in seconds.",
      overview:
        "WhatsApp Business Bot listens to private conversations between business partners, stores every message with a semantic embedding in MongoDB Atlas, and lets users query their own conversation history using natural language. It integrates with Gmail, Google Calendar, and Google Drive, and delivers real-time civil-defense (Oref/Tzofar) alerts — all from a single WhatsApp chat.",
      problem:
        "Business partners who coordinate exclusively over WhatsApp constantly lose track of decisions: agreed prices, client phone numbers, meeting times, open commitments. The chat history is long and searching it manually is slow and unreliable. There is no structured way to ask 'What did we agree with Danny?' and get a precise answer.",
      solution:
        "Every incoming message is stored in MongoDB and embedded asynchronously using OpenAI text-embedding-3-small (1536 dimensions). When a user asks a question (triggered by keywords like 'בותי'), the query is classified by GPT-4o-mini, then routed to MongoDB Atlas Vector Search which retrieves the 15 most semantically similar messages. Claude Sonnet (with GPT-4o-mini as fallback) generates a Hebrew answer from that context window. Entity extraction runs fire-and-forget after each save, building cumulative contact profiles. A nightly GPT-4o digest at 00:30 IL time merges duplicate profiles and generates proactive insights.",
      features: [
        {
          title: "Semantic Search & AI Q&A",
          description:
            "Answers Hebrew natural-language questions about past conversations using MongoDB Atlas Vector Search (cosine similarity, 1536-dim embeddings) and Claude Sonnet as the primary LLM, with GPT-4o-mini as fallback.",
        },
        {
          title: "Voice Message Transcription",
          description:
            "Automatically transcribes incoming voice messages with OpenAI Whisper, detecting audio format from magic bytes and converting with fluent-ffmpeg when needed, then embeds and stores the transcript like any other message.",
        },
        {
          title: "Contact Memory & Entity Profiles",
          description:
            "Extracts contacts, phone numbers, amounts, dates, and commitments from every message and maintains cumulative per-person profiles with lazy LLM summary generation — queryable via 'פרופיל [name]'.",
        },
        {
          title: "Google Workspace Integration",
          description:
            "Polls Gmail every 5 minutes and analyzes emails with AI; sends WhatsApp reminders 30 minutes before Google Calendar events; and scans a Google Drive folder for call recordings to transcribe and embed.",
        },
        {
          title: "Real-Time Civil Defense Alerts (Oref/Tzofar)",
          description:
            "Maintains a persistent WebSocket connection to tzevaadom.co.il and forwards city-specific Red Alert notifications to WhatsApp chats, with a shelter state machine (entering → sheltering → clear) and per-chat city preferences.",
        },
        {
          title: "Web Dashboard & CRM",
          description:
            "Fastify-served admin dashboard protected by a timing-safe PIN, with tabs for contact profiles, CRM leads, reminders, chat management, status posts, and a live Ask-the-Bot interface — all behind Helmet CSP, rate-limiting, and Zod body validation.",
        },
      ],
      highlights: [
        "Dual-LLM strategy: Claude Sonnet (primary, better Hebrew) → GPT-4o-mini (fallback) — swapped at runtime based on ANTHROPIC_API_KEY presence",
        "Fire-and-forget embedding pipeline: messages are saved to MongoDB synchronously, embeddings generated asynchronously — never blocks the WhatsApp event loop",
        "Upsert-first pattern (findOneAndUpdate + upsert:true) on every message write — idempotent against WhatsApp's duplicate delivery",
        "Oref shelter state machine: 4 phases (none → entering → sheltering → clear) with city-specific countdown timers sourced from official Pikud HaOref threat tables",
        "Nightly GPT-4o digest: runs at 00:30 IL time, merges alias profiles, runs memory audit (missing phones, conflicting amounts, stale leads), and pushes proactive insights to WhatsApp",
        "Agent-style query planner: classifyQuery() routes to one of 7 handlers (reminder, profile, cross-chat, temporal, summary, lead, general) before hitting vector search",
        "Full ESM-only TypeScript codebase (tsx for dev, tsc for prod); strict mode with no implicit any; all imports use .js extensions",
        "Production license validation with asymmetric key signing — skipped automatically in development",
      ],
      setup: {
        prerequisites: [
          "Node.js 18 or later",
          "pnpm (package manager)",
          "MongoDB Atlas cluster with a Vector Search index (1536 dimensions, cosine, field: embedding) — see MONGODB_SETUP.md",
          "OpenAI API key (required for embeddings and Whisper)",
          "Anthropic API key (optional — enables Claude Sonnet for Q&A)",
          "A WhatsApp account to scan the QR code on first run",
          "Google OAuth credentials (optional — enables Gmail, Calendar, Drive integrations)",
        ],
        steps: [
          { label: "Install dependencies", command: "pnpm install" },
          { label: "Copy the environment template", command: "cp .env.example .env" },
          {
            label: "Fill in required environment variables",
            note: "Open .env and set at minimum: MONGODB_URI, OPENAI_API_KEY, ADMIN_PIN. Add ANTHROPIC_API_KEY to enable Claude.",
          },
          {
            label: "Set up the MongoDB Atlas Vector Search index",
            note: "Follow MONGODB_SETUP.md to create an index named 'message_vector_index' on the messages collection (field: embedding, dimensions: 1536, similarity: cosine).",
          },
          { label: "Start in development mode (shows QR code on first run)", command: "pnpm dev" },
          {
            label: "Scan the QR code with WhatsApp",
            note: "Open WhatsApp → Linked Devices → Link a Device and scan the terminal QR. Session is saved to auth_info_baileys/ for future runs.",
          },
          {
            label: "Open the web dashboard",
            note: "Navigate to http://localhost:3000 and log in with your ADMIN_PIN.",
          },
        ],
      },
    },

    "categories-game": {
      tagline: "Real-time multiplayer Hebrew word game with AI-powered answer validation.",
      overview:
        "A full-stack multiplayer adaptation of the classic Israeli word game ארץ עיר (Country City). Players race to fill 8 Hebrew categories before anyone else finishes, then watch an AI judge evaluate every submission for accuracy. The game runs entirely in-memory and degrades gracefully — MongoDB, Redis, and the OpenAI API are all optional.",
      problem:
        "The classic pen-and-paper word game has no good digital multiplayer version that handles the nuances of Hebrew — where final-letter variants, duplicate detection, and category-fit are hard to judge fairly at speed. Manual judging creates arguments; pure string matching is too strict for a living language.",
      solution:
        "The server holds authoritative room state in a Node.js Map and pushes updates over Socket.IO. When a round ends, each player's answers go through a three-stage pipeline: rule validation (letter position rules), OpenAI structured-JSON validation for Hebrew category fit, then duplicate-detection across all submissions. Scoring is computed server-side from the combined results. MongoDB and Redis are wired in as optional layers for persistence and future horizontal scaling.",
      features: [
        {
          title: "Live Round Engine",
          description:
            "The first player to submit a complete answer set triggers a configurable countdown, giving late players a grace window before the round locks. All transitions — lobby → in_round → countdown → validating → round_results — are broadcast over Socket.IO so every client stays in sync.",
        },
        {
          title: "AI Answer Validation",
          description:
            "OpenAI's API scores each Hebrew answer against its category using a strict JSON schema response. The service handles Hebrew final-letter normalization, times out at 20 seconds, and falls back to lenient deterministic validation when the API is unavailable.",
        },
        {
          title: "Host Override Controls",
          description:
            "After AI validation completes, the host can manually flip any answer's validity before scores are revealed, handling edge cases the model gets wrong.",
        },
        {
          title: "Classic & Advanced Modes",
          description:
            "Classic mode requires answers to start with a single random Hebrew letter; Advanced mode draws two letters that must both appear anywhere in the answer, raising the difficulty significantly.",
        },
        {
          title: "Reactions & Live Presence",
          description:
            "Players can fire emoji reactions that float across everyone's screen in real time. The UI tracks which players are online and shows a per-category 'pressure gauge' indicating how many others have already answered each field.",
        },
      ],
      highlights: [
        "npm workspaces monorepo — shared TypeScript types and pure game-logic functions consumed by both Next.js and Express without a build step",
        "Three-tier optional persistence: in-memory Map (always), MongoDB snapshots (if URI present), Redis pub/sub (if URL present) — the server starts and runs without either",
        "OpenAI structured output with a strict JSON schema ensures the validation response is always machine-readable, with a 20-second timeout and deterministic fallback",
        "Unique-answer scoring incentive (15 pts) versus duplicate penalty (5 pts) drives strategic divergence between players",
        "Socket.IO room isolation — each game room is a named namespace channel; the session token stored in localStorage re-authenticates the socket on reconnect",
        "Deployed to Railway via Dockerfile pair (Dockerfile.web / Dockerfile.server) using direct file upload — no git remote needed",
      ],
      setup: {
        prerequisites: [
          "Node.js 22+",
          "Docker (for local MongoDB + Redis)",
          "OpenAI API key (optional — game works without it)",
        ],
        steps: [
          { label: "Clone and install dependencies", command: "npm install" },
          { label: "Copy environment variables", command: "cp .env.example .env", note: "Add OPENAI_API_KEY to enable AI validation; leave blank for deterministic fallback" },
          { label: "Start MongoDB and Redis", command: "docker compose up -d", note: "Optional — the server runs fully in-memory without them" },
          { label: "Start the Express + Socket.IO server", command: "npm run dev:server", note: "Runs on http://localhost:4000" },
          { label: "Start the Next.js frontend", command: "npm run dev:web", note: "Runs on http://localhost:3000" },
        ],
      },
    },

    "git-explorer": {
      tagline:
        "A desktop file explorer with a full Git client built in — browse files and manage your entire Git workflow from one native app.",
      overview:
        "GitExplorer is a native desktop application built with Tauri 2.0 and React 19 that combines a traditional file explorer with a complete Git client. The Rust backend shells out to the system Git CLI to execute over 60 Git operations, while the React frontend renders real-time status indicators on every file and folder. The UI is written entirely in Hebrew with full RTL layout support.",
      problem:
        "Developers constantly switch between a file explorer and a separate Git GUI (or the terminal) to understand what changed, stage files, and sync with remotes. Most Git GUIs are disconnected from the filesystem view, so you lose context about where files live in the project tree.",
      solution:
        "A single Tauri window hosts both a full file browser and a Git panel side-by-side. The Rust layer executes native Git CLI commands (no libgit2 dependency) and returns structured JSON to React via Tauri's invoke() IPC bridge. Custom React hooks — one per Git domain — fetch and cache that data, then merge file system entries with their Git statuses and last-commit metadata before rendering.",
      features: [
        {
          title: "Live Git Status in the File Tree",
          description:
            "Every file and folder displays a color-coded badge (modified, staged, untracked, deleted, conflict) updated on each refresh. Folder badges aggregate the statuses of all descendant files so you can spot changes deep in the tree at a glance.",
        },
        {
          title: "Full Staging Area Management",
          description:
            "Stage, unstage, or discard individual files or everything at once directly from the file list or the dedicated Git panel. A modal diff viewer shows the exact line-level changes before you commit.",
        },
        {
          title: "Branch & Merge Workflow",
          description:
            "Create, rename, delete, and switch branches from the Git toolbar. The toolbar also shows the current branch, the number of commits ahead/behind the remote, and a stash counter.",
        },
        {
          title: "Remote Sync (Push / Pull / Fetch)",
          description:
            "Push, pull, and fetch with configurable options (force, set-upstream, rebase) through modal dialogs. The app tracks ahead/behind counts and updates them after every operation.",
        },
        {
          title: "GitHub CLI Integration",
          description:
            "A dedicated modal lets you create a new GitHub repository and push the current repo to it in one step, using the GitHub CLI (gh) under the hood — no manual remote setup required.",
        },
      ],
      highlights: [
        "Tauri 2.0 IPC architecture: Rust commands are invoked from React via `invoke()`, keeping all system calls in a sandboxed native process",
        "60+ Rust Git commands covering staging, commits, branches, stash, tags, remotes, history, diff, blame, cherry-pick, rebase, and revert",
        "Git executed via `std::process::Command` (native CLI, not libgit2), with `CREATE_NO_WINDOW` on Windows to suppress console popups",
        "Tailwind CSS 4.x with `tailwindcss-rtl` plugin for automatic RTL conversion of direction-based utility classes",
        "15 custom React hooks — one per domain (useGitSync, useBranches, useStash, useRemotes, useTags, useAdvancedGit…) — keeping App.tsx as a thin coordinator",
        "Path normalization layer converts Windows backslashes to forward slashes before matching Git status output to file entries",
        "Persistent navigation state (last path, history) stored via `@tauri-apps/plugin-store`",
      ],
      setup: {
        prerequisites: [
          "Node.js 18+ and pnpm (`npm i -g pnpm`)",
          "Rust toolchain 1.77.2+ (`rustup update stable`)",
          "Git installed and available on PATH",
          "Tauri system dependencies for your platform (WebView2 on Windows, webkit2gtk on Linux)",
        ],
        steps: [
          { label: "Install dependencies", command: "pnpm install" },
          {
            label: "Run in development mode",
            command: "pnpm tauri dev",
            note: "Starts the Vite dev server on port 1420 and opens the Tauri window with hot-module replacement",
          },
          {
            label: "Build production bundle",
            command: "pnpm tauri build",
            note: "Produces a platform-native installer in src-tauri/target/release/bundle/",
          },
        ],
      },
    },
  },

  he: {
    yoniverse: {
      tagline:
        "מערכת הפעלה אישית מבוססת AI שמחברת את כל המכשירים, האוטומציות והשגרה היומית דרך מוח אחד חכם.",
      overview:
        "Yoniverse OS היא מערכת הפעלה אישית full-stack הבנויה כ-Turbo monorepo הכולל 10 אפליקציות ושירותים. " +
        "המערכת מחברת חלון overlay לWindows, אפליקציית Android, בוט WhatsApp, מכשירי בית חכם ESP32 ולוח בקרה ב-Next.js — " +
        "כולם מתואמים על ידי שרת Brain מבוסס AI הרץ על Raspberry Pi. " +
        "המערכת מבינה שפה טבעית בעברית ובאנגלית, לומדת הרגלים באופן יזום ומאפשרת אוטומציה של שגרות יומיות בכל משטח.",
      problem:
        "כלי פרודוקטיביות אישית מפוזרים בין אפליקציות מנותקות ללא הקשר משותף — הטלפון לא יודע מה קורה במחשב, " +
        "הבית החכם לא מגיב לפי הלוח שנה, ואין עוזר AI אחד שמבין את ההקשר היומי המלא שלך לאורך כל המכשירים והשירותים.",
      solution:
        "שרת Brain מרכזי (Fastify v5 + MongoDB + LLM מרובה ספקים) משמש כצומת תיאום לכל המשטחים. " +
        "כל לקוח — חלון Windows שנבנה עם Tauri v2 ו-Rust, אפליקציית Flutter, WhatsApp דרך Baileys, ומכשירי ESP32 — " +
        "מתחבר ל-Brain דרך WebSocket או REST. ה-Brain מריץ מתזמן node-cron כל דקה לניתוחים יזומים, " +
        "מתחזק מודל משתמש מתמשך, מחלץ ידע משיחות ומזרים עדכונים בזמן אמת דרך SSE event bus.",
      features: [
        {
          title: "שרת AI מרכזי (Brain)",
          description:
            "שרת Fastify v5 עם 25+ נתיבי REST, תמיכה ב-LLM מרובה ספקים (OpenAI, OpenRouter, Gemini) עם fallback אוטומטי, " +
            "מערכת plugins להרחבה, ומתזמן cron שמריץ ניתוחים יזומים — נטישת אנשי קשר, חריגות בהוצאות, שבירת שגרות, זיהוי follow-up.",
        },
        {
          title: "לקוחות חוצי-פלטפורמה",
          description:
            "חלון Windows overlay עם Tauri v2 (React + Rust + Tokio, API נייטיב של Windows דרך crate windows), " +
            "אפליקציית Android ב-Flutter ו-Riverpod, לוח בקרה ב-Next.js 14, ובוט WhatsApp דרך @whiskeysockets/baileys — כולם על אותו Backend.",
        },
        {
          title: "אינטגרציית בית חכם",
          description:
            "שליטה מבוססת MQTT (Mosquitto על Pi) במכשירי ESP32 עם IR blaster וחיישן DHT11. " +
            "ה-Brain מתרגם פקודות בשפה טבעית לפקודות MQTT למכשיר בזמן אמת.",
        },
        {
          title: "מנוע אוטומציות",
          description:
            "יצירת אוטומציות בשפה טבעית בעברית דרך endpoint ייעודי. " +
            "תומך בארבעה סוגי טריגרים — מבוסס זמן, מילת מפתח בWhatsApp, מצב מכשיר, ואירועי מערכת — עם 10 תבניות מוכנות.",
        },
        {
          title: "בינה יזומה",
          description:
            "ניתוחים רצים בCron ומעלים תובנות לפני שהמשתמש שואל: תדריכי בוקר, follow-up ללא מענה, " +
            "התנגשויות לוח שנה, חריגות הוצאות וירידה במעורבות עם אנשי קשר.",
        },
      ],
      highlights: [
        "Turbo monorepo עם 10 אפליקציות החולקות @yoniverse/types ו-@yoniverse/protocol (חוזים בין-שירותיים עם Zod)",
        "שרשרת fallback בין LLMs — OpenAI → OpenRouter → Gemini — מאחורי ממשק generateText() אחד ללא שינוי בלקוח",
        "Rust backend של Tauri v2 משתמש ב-Tokio async ובcrate windows לקריאת API נייטיב של Windows (אודיו, COM, ניהול חשמל)",
        "SSE event bus ב-/api/events/stream מנתק את ה-Brain מה-Desktop לדחיפה בזמן אמת ללא polling",
        "Docker על Raspberry Pi עם --network host כדי ש-Brain יגיע ל-Mosquitto MQTT על localhost ללא ניתוב נוסף",
        "Clerk JWT משותף לכל המשטחים (ווב, Desktop, מובייל) עם Fastify JWT plugin שמאבטח כל נתיב ב-Brain",
      ],
      setup: {
        prerequisites: [
          "Node.js 20+",
          "pnpm 9.15+",
          "MongoDB (מקומי או Atlas)",
          "Rust toolchain + Tauri CLI v2 (לדסקטופ)",
          "Docker (לdeploy על Raspberry Pi)",
          "OpenAI או OpenRouter API key",
        ],
        steps: [
          { label: "שכפול והתקנת תלויות", command: "git clone <repo-url> && cd yoniverse-v2 && pnpm install" },
          { label: "הגדרת משתני סביבה", command: "cp .env.example apps/brain/.env", note: "מלא את MONGODB_URI, OPENAI_API_KEY, CLERK_SECRET_KEY, MQTT_HOST" },
          { label: "הפעלת שרת ה-Brain", command: "pnpm dev:brain" },
          { label: "הפעלת לוח הבקרה", command: "pnpm dev:web" },
          { label: "הרצת אפליקציית הדסקטופ (דורש Rust)", command: "cd apps/desktop && pnpm tauri dev" },
          { label: "Deploy של ה-Brain ל-Raspberry Pi", note: "הרץ את סקריפט Docker המלא מ-CLAUDE.md (tar → scp → docker build → docker run --network host)" },
        ],
      },
    },

    "al-hamacom": {
      tagline:
        "פורטל קהילתי מלא בעברית המחבר תושבי שכונות ירושלים דרך פורום, לוח מודעות, נדל\"ן וספריית עסקים מקומיים.",
      overview:
        "אל-המקום702 הוא פלטפורמה שכונתית המשרתת קהילות ירושלמיות (רמות, הר נוף, פסגת זאב) עם חמישה מודולים משולבים: פורום קהילתי, לוח מודעות, מאגר נדל\"ן, ספריית עסקים מקומיים וניהול פרופיל משתמש. האפליקציה כוללת חיפוש סמנטי מבוסס AI על פני כל סוגי התוכן, מערכת תשלומים מלאה עם הפקת חשבוניות ישראליות אוטומטית, ו-PWA למשתמשי מובייל. נבנתה עם Next.js 15 App Router, React 19, MongoDB Atlas ו-Vercel.",
      problem:
        "לתושבי שכונות ירושלים לא היה פלטפורמה אחת ואמינה לתקשורת מקומית — שיחות היו מפוזרות בין קבוצות WhatsApp, לעסקים מקומיים לא הייתה חשיפה דיגיטלית מסודרת, מודעות נדל\"ן היו מפוזרות בין אתרים שונים ולא היה מקום מרכזי לפרסם או למצוא מודעות שכונתיות.",
      solution:
        "הפלטפורמה משתמשת ב-routing דינמי של Next.js ([siteArea]) כדי לשרת מספר שכונות מבסיס קוד אחד. MongoDB Atlas מספקת אחסון מסמכים וחיפוש וקטורי, כשאמבדינגים של OpenAI text-embedding-3-large (3072 מימדים) מאפשרים חיפוש סמנטי על כל התוכן. Cardcom Low Profile API מטפל בתשלומים עם הפקת חשבוניות ישראליות אוטומטית. Upstash Redis מאכף rate limiting עם 20+ רמות שונות, ו-NextAuth.js v4 תומך ב-Google OAuth ובאימות email/סיסמה עם reCAPTCHA v3.",
      features: [
        {
          title: "פורום קהילתי עם מודרציה AI",
          description:
            "פורום עם שרשורים, קטגוריות, פוסטים מוצמדים, מחיקה רכה עם אנונימיזציה ומודרציה תוכן מבוססת OpenAI שמסמנת תוכן פוגעני לפני פרסום.",
        },
        {
          title: "חיפוש סמנטי על פני כל המודולים",
          description:
            "אמבדינגים של OpenAI text-embedding-3-large המאוחסנים ב-MongoDB Atlas מאפשרים חיפוש וקטורי על פוסטים, מודעות, נדל\"ן ועסקים — ומחזירים תוצאות רלוונטיות גם כשהמילות מפתח המדויקות לא קיימות.",
        },
        {
          title: "לוח מודעות ומאגר נדל\"ן",
          description:
            "לוח מודעות מלא (יד שנייה, אבידות ומציאות, כללי) ומודול נדל\"ן (שכירות ומכירה) עם העלאת תמונות דרך Cloudinary, פילטרים מתקדמים ומפות אינטראקטיביות דרך Leaflet.",
        },
        {
          title: "ספריית עסקים מקומיים עם מנוי פרמיום",
          description:
            "עסקים, מוסדות וגמחים יכולים לפרסם עם שעות פתיחה, זמני תפילה (לבתי כנסת), פרטי קשר ופיצ'רים פרמיום (הבלטה, תיאור מורחב, לוגו) שמשולמים דרך Cardcom עם חשבונית מס אוטומטית.",
        },
        {
          title: "פרופיל משתמש ומועדפים מאוחדים",
          description:
            "פרופיל יחיד עוקב אחר מועדפים, מודעות, התראות והיסטוריית תשלומים על פני כל חמשת המודולים. חנויות Zustand גלובליות שומרות על סינכרון ה-UI ללא prop drilling.",
        },
      ],
      highlights: [
        "Next.js 15 App Router עם סגמנט דינמי [siteArea] — בסיס קוד אחד משרת מספר שכונות, עם middleware שמנתב ביניהן לפי cookie.",
        "MongoDB Atlas Vector Search עם OpenAI text-embedding-3-large (3072 מימדים) לחיפוש סמנטי באוספי forum, board, info ו-nadlan.",
        "שילוב Cardcom Low Profile API עם הפקת חשבוניות (מסמך 305) וזיכויים אוטומטיים, חיוב חוזר דרך טוקן שמור, ומעקב עסקאות מלא.",
        "Upstash Redis sliding-window rate limiting עם 20+ רמות שמות (AUTH_LOGIN: 10/5min, SEARCH_VECTOR: 30/min, PAYMENT: 10/hour) — fail-open בזמן timeout.",
        "NextAuth.js v4 עם Google OAuth + credentials, reCAPTCHA v3 בהתחברות, JWT sessions עם אימות מחדש כל 6 שעות וניהול הרשאות (user / moderator / admin / superadmin).",
        "מחיקה רכה עם audit trail מלא: כל מודל שומר deletedAt, deletionType ומערך versions[] שמצלם כל שינוי שדה — היסטוריית תוכן מלאה ללא מחיקות קשות.",
        "PWA דרך next-pwa עם התראות push, Sentry לדיווח שגיאות, Mixpanel לאנליטיקה ו-Vercel Speed Insights — הכל פעיל בפרודקשן.",
      ],
      setup: {
        prerequisites: [
          "Node.js 18+",
          "pnpm 9+",
          "MongoDB Atlas cluster עם Vector Search index מופעל",
          "חשבון Cardcom (לפיצ'רי תשלומים)",
          "Upstash Redis database (לrate limiting)",
          "חשבון Cloudinary (להעלאת תמונות)",
          "OpenAI API key (לאמבדינגים ומודרציה)",
          "Google OAuth credentials (להתחברות חברתית)",
        ],
        steps: [
          { label: "שכפול הרפוזיטורי", command: "git clone <repo-url> && cd al-hamacom-dev" },
          { label: "התקנת תלויות", command: "pnpm install" },
          { label: "יצירת קובץ סביבה", note: "העתק .env.example ל-.env.local ומלא את כל המשתנים הנדרשים: MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OPENAI_API_KEY, CARDCOM_TERMINAL_NUMBER, CARDCOM_API_NAME, CARDCOM_API_PASSWORD, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, פרטי Cloudinary ו-SMTP." },
          { label: "הפעלת שרת הפיתוח", command: "pnpm dev" },
          { label: "(אופציונלי) זריעת תוכן לפורום", command: "pnpm seed:forum:celebrations" },
          { label: "(אופציונלי) יצירת אמבדינגים לתוכן קיים", command: "pnpm add:forum:embeddings && pnpm add:info:embeddings" },
          { label: "פתיחה בדפדפן", note: "גש ל-http://localhost:3000 — ה-middleware יעביר אוטומטית ל-/ramot." },
        ],
      },
    },

    "ai-whatsapp-bot": {
      tagline: "הזיכרון החכם של העסק שלך — בוט WhatsApp שמקשיב, זוכר כל פרט, ועונה על שאלות בשנייה.",
      overview:
        "WhatsApp Business Bot מקשיב לשיחות פרטיות בין שותפים עסקיים, שומר כל הודעה עם embedding סמנטי ב-MongoDB Atlas, ומאפשר לשאול שאלות על היסטוריית השיחה בשפה טבעית. הוא משתלב עם Gmail, Google Calendar ו-Google Drive, ומספק התראות פיקוד עורף (אורף / צבע אדום) בזמן אמת — הכל ישירות מתוך שיחת WhatsApp.",
      problem:
        "שותפים עסקיים שמתנהלים בעיקר דרך WhatsApp מאבדים כל הזמן פרטים חשובים: מחירים שסוכמו, מספרי טלפון של לקוחות, מועדי פגישות, הבטחות פתוחות. היסטוריית הצ'אט ארוכה, חיפוש ידני בה איטי ולא אמין, ואין דרך מובנית לשאול 'מה סיכמנו עם דני?' ולקבל תשובה מדויקת.",
      solution:
        "כל הודעה נכנסת נשמרת ב-MongoDB ומקבלת embedding באופן אסינכרוני בעזרת text-embedding-3-small של OpenAI (1536 ממדים). כשמשתמש שואל שאלה (מופעל על ידי מילות טריגר כמו 'בותי'), GPT-4o-mini מסווג את השאלה ומפנה אותה ל-MongoDB Atlas Vector Search שמוציא את 15 ההודעות הדומות ביותר סמנטית. Claude Sonnet (עם GPT-4o-mini כגיבוי) מייצר תשובה בעברית מתוך חלון ההקשר הזה. חילוץ ישויות רץ ב-fire-and-forget אחרי כל שמירה ומעדכן פרופילי אנשי קשר. דיג'סט לילי של GPT-4o ב-00:30 שעון ישראל ממזג פרופילים כפולים ומייצר תובנות יזומות.",
      features: [
        {
          title: "חיפוש סמנטי ושאלות-תשובות AI",
          description:
            "עונה על שאלות בעברית בשפה טבעית על שיחות עבר באמצעות MongoDB Atlas Vector Search (דמיון קוסינוס, 1536 ממדים) ו-Claude Sonnet כמודל הראשי, עם GPT-4o-mini כגיבוי.",
        },
        {
          title: "תמלול הודעות קוליות",
          description:
            "מתמלל אוטומטית הודעות קוליות נכנסות עם Whisper של OpenAI, מזהה את פורמט האודיו לפי magic bytes וממיר עם fluent-ffmpeg לפי הצורך, ואז מבצע embed ושמירה כמו הודעה רגילה.",
        },
        {
          title: "זיכרון אנשי קשר ופרופילים",
          description:
            "מחלץ אנשי קשר, מספרי טלפון, סכומים, תאריכים והתחייבויות מכל הודעה ומתחזק פרופיל מצטבר לכל אדם עם יצירת סיכום LLM עצלנית — שאילתה דרך 'פרופיל [שם]'.",
        },
        {
          title: "אינטגרציה עם Google Workspace",
          description:
            "סורק Gmail כל 5 דקות ומנתח מיילים ב-AI; שולח תזכורות WhatsApp 30 דקות לפני אירועי Google Calendar; וסורק תיקיית Google Drive לאיתור הקלטות שיחה לתמלול ולאיחסון.",
        },
        {
          title: "התראות פיקוד עורף בזמן אמת (אורף / צבע אדום)",
          description:
            "שומר על חיבור WebSocket קבוע ל-tzevaadom.co.il ומעביר התראות אזעקה ספציפיות לעיר לצ'אטי WhatsApp, עם state machine למרחב המוגן (כניסה → המתנה → ניתן לצאת) והעדפות עיר לכל צ'אט.",
        },
        {
          title: "לוח ניהול ו-CRM",
          description:
            "לוח ניהול בנוי על Fastify, מוגן ב-PIN בטוח-עיתוי, עם טאבים לפרופילי אנשי קשר, לידים של CRM, תזכורות, ניהול צ'אטים, פוסטים לסטטוס, ו-Ask-the-Bot חי — עם Helmet CSP, הגבלת קצב, ואימות גוף-בקשה עם Zod.",
        },
      ],
      highlights: [
        "אסטרטגיית dual-LLM: Claude Sonnet (ראשי, עברית טובה יותר) ← GPT-4o-mini (גיבוי) — מוחלף בזמן ריצה לפי קיום ANTHROPIC_API_KEY",
        "צינור embedding fire-and-forget: הודעות נשמרות ב-MongoDB סינכרונית, ה-embeddings מיוצרים אסינכרונית — לא חוסם את לולאת האירועים של WhatsApp",
        "תבנית upsert-first (findOneAndUpdate + upsert:true) בכל כתיבת הודעה — אידמפוטנטי מפני העברה כפולה של WhatsApp",
        "State machine למרחב המוגן של אורף: 4 שלבים (none → entering → sheltering → clear) עם ספירות לאחור ספציפיות לעיר מטבלאות האיום הרשמיות של פיקוד העורף",
        "דיג'סט GPT-4o לילי: רץ ב-00:30 שעון ישראל, ממזג פרופילי כינויים, מפעיל ביקורת זיכרון (טלפונים חסרים, סכומים סותרים, לידים ישנים) ושולח תובנות יזומות ל-WhatsApp",
        "מתכנן שאילתות בסגנון Agent: classifyQuery() מפנה לאחד מ-7 מטפלים (תזכורת, פרופיל, cross-chat, טמפורלי, סיכום, ליד, כללי) לפני שמגיע לחיפוש הווקטורי",
        "קוד TypeScript ESM-only מלא (tsx בפיתוח, tsc בפרודקשן); מצב strict ללא any מרומז; כל ה-imports משתמשים בסיומת .js",
        "ולידציית רישיון פרודקשן עם חתימה אסימטרית — נדלג אוטומטית במצב פיתוח",
      ],
      setup: {
        prerequisites: [
          "Node.js 18 ומעלה",
          "pnpm (מנהל החבילות)",
          "MongoDB Atlas עם אינדקס Vector Search (1536 ממדים, cosine, שדה: embedding) — ראה MONGODB_SETUP.md",
          "מפתח OpenAI API (נדרש עבור embeddings ו-Whisper)",
          "מפתח Anthropic API (אופציונלי — מפעיל את Claude Sonnet לשאלות-תשובות)",
          "חשבון WhatsApp לסריקת קוד QR בהפעלה הראשונה",
          "Google OAuth credentials (אופציונלי — מפעיל את Gmail, Calendar, Drive)",
        ],
        steps: [
          { label: "התקנת תלויות", command: "pnpm install" },
          { label: "העתקת תבנית הסביבה", command: "cp .env.example .env" },
          {
            label: "מילוי משתני סביבה נדרשים",
            note: "פתח את .env והגדר לפחות: MONGODB_URI, OPENAI_API_KEY, ADMIN_PIN. הוסף ANTHROPIC_API_KEY כדי להפעיל את Claude.",
          },
          {
            label: "הגדרת אינדקס Vector Search ב-MongoDB Atlas",
            note: "עקוב אחר MONGODB_SETUP.md כדי ליצור אינדקס בשם 'message_vector_index' על קולקציית messages (שדה: embedding, ממדים: 1536, similarity: cosine).",
          },
          { label: "הפעלה במצב פיתוח (מציג QR בהפעלה ראשונה)", command: "pnpm dev" },
          {
            label: "סריקת קוד QR עם WhatsApp",
            note: "פתח WhatsApp ← מכשירים מקושרים ← קשר מכשיר וסרוק את ה-QR בטרמינל. הסשן נשמר ב-auth_info_baileys/ להפעלות עתידיות.",
          },
          {
            label: "פתיחת לוח הניהול",
            note: "נווט ל-http://localhost:3000 והתחבר עם ה-ADMIN_PIN שהגדרת.",
          },
        ],
      },
    },

    "categories-game": {
      tagline: "משחק ארץ עיר מולטיפלייר בזמן אמת עם שיפוט תשובות מבוסס בינה מלאכותית.",
      overview:
        "גרסה דיגיטלית מלאה של משחק ארץ עיר הקלאסי לכמה שחקנים במקביל. השחקנים מתחרים למלא 8 קטגוריות בעברית לפני כל האחרים, ואז מודל AI שופט כל תשובה. השרת עובד לגמרי בזיכרון — MongoDB, Redis ו-OpenAI הם אופציונליים לחלוטין.",
      problem:
        "למשחק הנייר והעיפרון הישן אין גרסה דיגיטלית טובה שמתמודדת עם הניואנסים של עברית — אותיות סופיות, זיהוי כפילויות, והתאמה לקטגוריה הם דברים שקשה לשפוט מהר באופן הוגן. שיפוט ידני מוביל לוויכוחים; התאמת מחרוזות בלבד היא נוקשה מדי לשפה חיה.",
      solution:
        "השרת שומר את מצב החדר ב-Map בזיכרון Node.js ודוחף עדכונים דרך Socket.IO. בסיום כל סיבוב, תשובות כל שחקן עוברות שלושה שלבים: ולידציה לפי חוקי האות, ולידציה של התאמה לקטגוריה דרך OpenAI עם פלט JSON מובנה, ואז זיהוי כפילויות בין כל המשתתפים. הניקוד מחושב בשרת מהתוצאות המשולבות.",
      features: [
        {
          title: "מנוע סיבובים בזמן אמת",
          description:
            "השחקן הראשון שסיים מפעיל ספירה לאחור הניתנת להגדרה, ומאפשרת לשאר שחקנים חלון גרייס. כל המעברים — המתנה, סיבוב פעיל, ספירה לאחור, ולידציה, תוצאות — משודרים דרך Socket.IO כך שכל הלקוחות מסונכרנים.",
        },
        {
          title: "ולידציה חכמה בעברית",
          description:
            "ה-API של OpenAI בודק כל תשובה עברית מול הקטגוריה שלה באמצעות JSON schema קשיח. השירות מטפל בנורמליזציה של אותיות סופיות, מגביל לזמן תגובה של 20 שניות, ונסוג לולידציה דטרמיניסטית אם ה-API לא זמין.",
        },
        {
          title: "עקיפת ולידציה למנחה",
          description:
            "לאחר שה-AI סיים, המנחה יכול להעיף ידנית את תוקף כל תשובה לפני חשיפת הניקוד — לטיפול במקרים שהמודל טעה בהם.",
        },
        {
          title: "מצב קלאסי ומתקדם",
          description:
            "במצב קלאסי התשובות חייבות להתחיל באות עברית אקראית אחת; במצב מתקדם נבחרות שתי אותיות שחייבות להופיע איפשהו בתשובה — מה שמגביר משמעותית את הקושי.",
        },
        {
          title: "תגובות ונוכחות שחקנים",
          description:
            "שחקנים יכולים לשגר תגובות אמוג׳י שצפות על המסך של כולם בזמן אמת. הממשק מציג מי מחובר ומד לחץ לכל קטגוריה — כמה שחקנים כבר ענו עליה.",
        },
      ],
      highlights: [
        "מונורפו npm workspaces — טיפוסי TypeScript ולוגיקת משחק נקייה משותפים בין Next.js ל-Express ללא שלב בנייה",
        "שלוש שכבות אחסון אופציונליות: Map בזיכרון (תמיד), MongoDB snapshots (אם יש URI), Redis pub/sub (אם יש URL) — השרת עולה ועובד בלעדיהן",
        "פלט מובנה של OpenAI עם JSON schema קשיח מבטיח שתגובת הולידציה תמיד ניתנת לפענוח, עם timeout של 20 שניות ו-fallback דטרמיניסטי",
        "מבנה ניקוד שמתגמל מקוריות: תשובה ייחודית מקבלת 15 נקודות, תשובה כפולה רק 5 — מה שמעודד שחקנים לחשוב באופן שונה",
        "בידוד חדרים ב-Socket.IO — כל חדר משחק הוא ערוץ נפרד; טוקן הסשן ב-localStorage מאמת מחדש את החיבור בעת התחברות מחדש",
        "פריסה ל-Railway דרך זוג Dockerfiles (Dockerfile.web / Dockerfile.server) עם העלאת קבצים ישירה — ללא צורך ב-git remote",
      ],
      setup: {
        prerequisites: [
          "Node.js גרסה 22 ומעלה",
          "Docker (עבור MongoDB ו-Redis מקומיים)",
          "מפתח OpenAI API (אופציונלי — המשחק עובד גם בלעדיו)",
        ],
        steps: [
          { label: "התקנת תלויות", command: "npm install" },
          { label: "העתקת משתני סביבה", command: "cp .env.example .env", note: "הוסף OPENAI_API_KEY לולידציה חכמה; ריק = ולידציה דטרמיניסטית" },
          { label: "הפעלת MongoDB ו-Redis", command: "docker compose up -d", note: "אופציונלי — השרת עובד לגמרי בזיכרון בלעדיהם" },
          { label: "הפעלת שרת Express + Socket.IO", command: "npm run dev:server", note: "רץ על http://localhost:4000" },
          { label: "הפעלת ממשק Next.js", command: "npm run dev:web", note: "רץ על http://localhost:3000" },
        ],
      },
    },

    "git-explorer": {
      tagline:
        "סייר קבצים לשולחן עבודה עם לקוח Git מובנה — לדפדף בקבצים ולנהל את כל זרימת העבודה עם Git מאפליקציה נייטיב אחת.",
      overview:
        "GitExplorer היא אפליקציית שולחן עבודה נייטיב שנבנתה עם Tauri 2.0 ו-React 19, המשלבת סייר קבצים רגיל עם לקוח Git מלא. ה-backend בשפת Rust מבצע מעל 60 פעולות Git דרך ה-CLI הנייטיב של המערכת, בעוד ש-frontend ב-React מציג אינדיקטורי סטטוס בזמן אמת על כל קובץ ותיקייה. ממשק המשתמש כולו בעברית עם תמיכה מלאה בפריסת RTL.",
      problem:
        "מפתחים עוברים כל הזמן בין סייר קבצים לבין לקוח Git נפרד (או הטרמינל) כדי להבין מה השתנה, לבצע staging לקבצים ולסנכרן עם remote. רוב לקוחות ה-Git מנותקים מתצוגת מערכת הקבצים, ולכן אובד הקשר לגבי מיקום הקבצים בעץ הפרויקט.",
      solution:
        "חלון Tauri אחד מארח גם סייר קבצים מלא וגם פאנל Git זה לצד זה. שכבת Rust מבצעת פקודות Git CLI נייטיב (ללא תלות ב-libgit2) ומחזירה JSON מובנה ל-React דרך גשר ה-IPC של Tauri — `invoke()`. Hooks מותאמים ב-React — אחד לכל תחום Git — שולפים ומאחסנים את הנתונים, ולאחר מכן ממזגים רשומות מערכת קבצים עם סטטוסי Git ומטא-דייטה של commit אחרון לפני הרינדור.",
      features: [
        {
          title: "סטטוס Git חי בעץ הקבצים",
          description:
            "כל קובץ ותיקייה מציגים תג צבעוני (שונה, staged, לא-מעוקב, נמחק, קונפליקט) שמתעדכן בכל רענון. תגי תיקיות מצרפים את הסטטוסים של כל הקבצים הצאצאים, כך שניתן לזהות שינויים עמוק בעץ במבט אחד.",
        },
        {
          title: "ניהול Staging Area מלא",
          description:
            "ניתן לבצע stage, unstage, או discard לקבצים בודדים או לכולם בבת אחת ישירות מרשימת הקבצים או מפאנל ה-Git הייעודי. מציג diff ברמת שורה מוצג ב-modal לפני ביצוע commit.",
        },
        {
          title: "זרימת עבודה עם ענפים ומיזוג",
          description:
            "יצירה, שינוי שם, מחיקה ומעבר בין ענפים מ-Git toolbar. ה-toolbar מציג גם את הענף הנוכחי, מספר ה-commits קדימה/אחורה מה-remote ומספר הסטשים.",
        },
        {
          title: "סנכרון עם Remote (Push / Pull / Fetch)",
          description:
            "Push, pull ו-fetch עם אפשרויות הניתנות לשינוי (force, set-upstream, rebase) דרך דיאלוגים של modals. האפליקציה עוקבת אחרי ספירות ahead/behind ומעדכנת אותן לאחר כל פעולה.",
        },
        {
          title: "אינטגרציה עם GitHub CLI",
          description:
            "Modal ייעודי מאפשר ליצור repository חדש ב-GitHub ולדחוף אליו את ה-repo הנוכחי בצעד אחד, תוך שימוש ב-GitHub CLI (gh) מאחורי הקלעים — ללא צורך בהגדרת remote ידנית.",
        },
      ],
      highlights: [
        "ארכיטקטורת IPC של Tauri 2.0: פקודות Rust מופעלות מ-React דרך `invoke()`, כאשר כל קריאות המערכת נשמרות בתהליך נייטיב מבודד",
        "מעל 60 פקודות Git ב-Rust המכסות staging, commits, ענפים, stash, tags, remotes, היסטוריה, diff, blame, cherry-pick, rebase ו-revert",
        "Git מבוצע דרך `std::process::Command` (CLI נייטיב, לא libgit2), עם `CREATE_NO_WINDOW` על Windows כדי למנוע הופעת חלונות קונסול",
        "Tailwind CSS 4.x עם פלאגין `tailwindcss-rtl` להמרה אוטומטית של utility classes מבוססות-כיוון ל-RTL",
        "15 hooks מותאמים ב-React — אחד לכל תחום (useGitSync, useBranches, useStash, useRemotes, useTags, useAdvancedGit…) — כאשר App.tsx פועל כרכז דק בלבד",
        "שכבת נרמול נתיבים ממירה backslashes של Windows ל-slashes קדימה לפני התאמת פלט Git status לרשומות קבצים",
        "מצב ניווט מתמיד (נתיב אחרון, היסטוריה) מאוחסן דרך `@tauri-apps/plugin-store`",
      ],
      setup: {
        prerequisites: [
          "Node.js 18+ ו-pnpm (`npm i -g pnpm`)",
          "Rust toolchain גרסה 1.77.2+ (`rustup update stable`)",
          "Git מותקן וזמין ב-PATH של המערכת",
          "תלויות מערכת של Tauri בהתאם לפלטפורמה (WebView2 על Windows, webkit2gtk על Linux)",
        ],
        steps: [
          { label: "התקנת תלויות", command: "pnpm install" },
          {
            label: "הרצה במצב פיתוח",
            command: "pnpm tauri dev",
            note: "מפעיל את שרת Vite על פורט 1420 ופותח את חלון Tauri עם החלפת מודולים חמה",
          },
          {
            label: "בניית גרסת ייצור",
            command: "pnpm tauri build",
            note: "מייצר installer נייטיב לפלטפורמה בתיקייה src-tauri/target/release/bundle/",
          },
        ],
      },
    },
  },
};
