export type Locale = "en" | "he";

export const LOCALES: Locale[] = ["en", "he"];
export const DEFAULT_LOCALE: Locale = "he";

export interface TranslationDict {
  nav: { home: string; about: string; services: string; projects: string; contact: string; cta: string; menu: string; };
  hero: { eyebrow: string; headingLine1: string; headingLine2: string; headingLine3: string; body: string; ctaPrimary: string; ctaSecondary: string; available: string; logoAlt: string; };
  stats: { yearsBuilding: string; projectsDelivered: string; serviceAreas: string; linesOfCode: string; };
  services: {
    eyebrow: string; heading: string; body: string;
    items: {
      fullstack: { title: string; description: string };
      ai: { title: string; description: string };
      bots: { title: string; description: string };
      apis: { title: string; description: string };
    };
  };
  projects: {
    eyebrow: string; headingLine1: string; headingLine2: string; body: string;
    seeAll: string; prevAria: string; nextAria: string; viewAria: string;
    items: {
      yoniverse: { title: string; description: string };
      "al-hamacom": { title: string; description: string };
      "ai-whatsapp-bot": { title: string; description: string };
      "categories-game": { title: string; description: string };
      "git-explorer": { title: string; description: string };
    };
  };
  process: {
    eyebrow: string; headingLine1: string; headingLine2: string;
    stepLabel: string; stepOf: string;
    items: {
      discover: { title: string; description: string };
      design: { title: string; description: string };
      develop: { title: string; description: string };
      deliver: { title: string; description: string };
    };
  };
  technologies: { eyebrow: string; };
  cta: { headingLine1: string; headingLine2: string; body: string; button: string; };
  projectDetail: {
    overview: string;
    problem: string;
    solution: string;
    features: string;
    techStack: string;
    howToRun: string;
    prerequisites: string;
    liveSite: string;
    sourceCode: string;
    backToProjects: string;
    prevProject: string;
    nextProject: string;
  };
  projectsPage: {
    meta: { title: string; description: string };
    eyebrow: string;
    headingLine1: string;
    headingLine2: string;
    body: string;
    filters: { all: string; web: string; ai: string; bot: string; automation: string };
    viewLive: string;
    caseStudy: string;
    workshopEyebrow: string;
    workshopHeading: string;
    workshopBody: string;
    workshopProject1Name: string;
    workshopProject1Desc: string;
    noProjects: string;
  };
  footer: {
    tagline: string; navTitle: string; builtWithTitle: string;
    connectTitle: string; connectBody: string; cta: string; copyright: string; builtWith: string;
  };
  locale: { switchTo: string; ariaLabel: string; };
  contact: {
    meta: { title: string; description: string };
    hero: { eyebrow: string; headingLine1: string; headingLine2: string; body: string; available: string };
    form: {
      name: string; namePlaceholder: string;
      email: string; emailPlaceholder: string;
      phone: string; phonePlaceholder: string; phoneOptional: string;
      projectType: { label: string; options: { web: string; ai: string; bot: string; api: string; other: string } };
      budget: { label: string; options: { lt5: string; mid: string; high: string; top: string; unsure: string } };
      timeline: { label: string; options: { asap: string; short: string; medium: string; flexible: string } };
      message: string; messagePlaceholder: string;
      submit: string; sending: string;
      requiredMark: string;
      charCount: string;
      extrasShow: string; extrasHide: string;
      errors: { required: string; email: string; phone: string; messageMin: string; messageMax: string; generic: string };
      success: { heading: string; body: string; again: string };
      serverError: string;
    };
    channels: {
      whatsapp: { label: string; subLabel: string; prefill: string };
      email: { label: string; copy: string; copied: string };
      responseTime: string;
    };
  };
  about: {
    meta: { title: string; description: string };
    hero: { eyebrow: string; headingLine1: string; headingLine2: string; body: string; ctaPrimary: string; ctaSecondary: string; available: string; portraitAlt: string };
    story: { eyebrow: string; heading: string; p1: string; p2: string; p3: string; p4: string; pullQuote: string };
    building: {
      eyebrow: string; heading: string;
      statusLive: string; statusDev: string; statusMvp: string;
      items: {
        "al-hamacom": { title: string; description: string };
        yoniverse:    { title: string; description: string };
        frame:        { title: string; description: string };
      };
    };
    passions: {
      eyebrow: string; heading: string;
      items: {
        teaching: { title: string; description: string };
        hardware: { title: string; description: string };
      };
    };
  };
  servicesPage: {
    meta: { title: string; description: string };
    hero: { eyebrow: string; headingLine1: string; headingLine2: string; body: string };
    items: {
      fullstack: { title: string; tagline: string; description: string; bullets: [string, string, string]; useCase: string };
      ai:        { title: string; tagline: string; description: string; bullets: [string, string, string]; useCase: string };
      bots:      { title: string; tagline: string; description: string; bullets: [string, string, string]; useCase: string };
      apis:      { title: string; tagline: string; description: string; bullets: [string, string, string]; useCase: string };
    };
    useCaseLabel: string;
  };
}

export const translations: Record<Locale, TranslationDict> = {
  en: {
    servicesPage: {
      meta: {
        title: "Services — YoniDev",
        description: "Full-stack development, AI integrations, bots, and API services by YoniDev.",
      },
      hero: {
        eyebrow: "What I Do",
        headingLine1: "From Idea",
        headingLine2: "to Production",
        body: "Clean code, powerful functionality and great user experience — end to end.",
      },
      useCaseLabel: "For example",
      items: {
        fullstack: {
          title: "Full-Stack Development",
          tagline: "Complete web products, start to finish",
          description:
            "I design and build full web applications — from the interface users see to the server logic and database behind it. Every project is optimised for speed, scalability and maintainability.",
          bullets: [
            "Pixel-perfect UI with React / Next.js",
            "Scalable backends with Node.js and TypeScript",
            "Database design & cloud deployment",
          ],
          useCase:
            "A marketplace platform with real-time listings, auth, and an admin dashboard",
        },
        ai: {
          title: "AI Integrations",
          tagline: "Smart features wired into your product",
          description:
            "I connect LLM APIs (OpenAI, Claude, Gemini) into real products — not demos. RAG pipelines, semantic search, smart agents and context-aware features that actually ship.",
          bullets: [
            "LLM-powered features (chat, summary, classification)",
            "RAG pipelines with vector search",
            "Custom AI agents with tool use",
          ],
          useCase:
            "An internal knowledge bot that answers questions from your company docs",
        },
        bots: {
          title: "Bots & Automation",
          tagline: "Automate the repetitive, scale the rest",
          description:
            "WhatsApp and Telegram bots that understand natural language, plus workflow automations with N8N or custom code. Anything that runs in the background so you don't have to.",
          bullets: [
            "WhatsApp / Telegram bots with NLP",
            "N8N automation flows and custom scripts",
            "Scheduled jobs and background workers",
          ],
          useCase:
            "A WhatsApp bot that qualifies leads and books calls — without lifting a finger",
        },
        apis: {
          title: "API & Integrations",
          tagline: "Connect your stack, sync your data",
          description:
            "REST and GraphQL APIs, third-party integrations, and data pipelines. I build the glue between your systems so everything talks to everything.",
          bullets: [
            "RESTful and GraphQL API design",
            "Third-party service integrations",
            "Data syncing and ETL pipelines",
          ],
          useCase:
            "Syncing CRM contacts to a mailing list and triggering Slack alerts on new deals",
        },
      },
    },
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      projects: "Projects",
      contact: "Contact",
      cta: "Let's Talk",
      menu: "Toggle menu",
    },
    hero: {
      eyebrow: "Full Stack Developer",
      headingLine1: "Your Idea.",
      headingLine2: "My Code.",
      headingLine3: "Our Result.",
      body: "Full-stack developer building Next.js apps and digital tools for businesses that want to grow and move faster.",
      ctaPrimary: "View My Work",
      ctaSecondary: "Let's Work Together",
      available: "Available for new projects",
      logoAlt: "YoniDev Y logo",
    },
    stats: {
      yearsBuilding: "Years Building",
      projectsDelivered: "Projects Delivered",
      serviceAreas: "Service Areas",
      linesOfCode: "Lines of Code",
    },
    services: {
      eyebrow: "What I Do",
      heading: "From Idea to Production",
      body: "I build full-stack digital products tailored to your business — from the first line of code to the moment it goes live.",
      items: {
        fullstack: {
          title: "Full-Stack Development",
          description: "Complete web apps built with Next.js — from pixel-perfect UI all the way to server architecture and database.",
        },
        ai: {
          title: "AI Integrations",
          description: "Custom AI features and tools — from integrating OpenAI & Claude APIs to building full AI-powered products from scratch.",
        },
        bots: {
          title: "Bots & Automation",
          description: "WhatsApp & Telegram bots with natural language understanding, plus N8N workflows and custom automation scripts.",
        },
        apis: {
          title: "API & Integrations",
          description: "Connecting platforms, syncing data and automating business processes end-to-end.",
        },
      },
    },
    projects: {
      eyebrow: "Featured Work",
      headingLine1: "Projects That",
      headingLine2: "Make an Impact",
      body: "A selection of recent work where ideas turned into powerful digital solutions.",
      seeAll: "See All Projects",
      prevAria: "Previous project",
      nextAria: "Next project",
      viewAria: "View",
      items: {
        yoniverse: {
          title: "Yoniverse",
          description: "A full-screen AI command center — one AI brain that manages tasks, connects to phone, email, WhatsApp, and IoT devices, keeping you focused on what to do next.",
        },
        "al-hamacom": {
          title: "Al HaMacom",
          description: "A neighborhood community platform connecting local residents and businesses in one place.",
        },
        "ai-whatsapp-bot": {
          title: "Boti",
          description: "A smart WhatsApp bot that listens to business conversations, remembers every detail, and answers questions about them in seconds using AI.",
        },
        "categories-game": {
          title: "ארץ עיר — Categories Game",
          description: "Real-time multiplayer Hebrew word game with AI-powered answer validation and Socket.IO live sync.",
        },
        "git-explorer": {
          title: "GitExplorer",
          description: "Native desktop file explorer with a full Git client built in — browse files and manage your entire Git workflow from one Tauri app.",
        },
      },
    },
    process: {
      eyebrow: "How I Work",
      headingLine1: "Simple Process,",
      headingLine2: "Powerful Results",
      stepLabel: "Step",
      stepOf: "of",
      items: {
        discover: {
          title: "Discover",
          description: "A quick call or WhatsApp chat to understand your idea, your goals, and what success actually looks like for you.",
        },
        design: {
          title: "Plan",
          description: "A thorough spec — the right questions, clear requirements, and a defined scope before a single line of code is written.",
        },
        develop: {
          title: "Develop",
          description: "Building with clean, structured code and AI-assisted tools like Claude Code. You get regular updates throughout so there are no surprises.",
        },
        deliver: {
          title: "Deliver",
          description: "Full deployment, a walkthrough so you understand everything, and ongoing support after launch. Clean, documented code that's yours to keep.",
        },
      },
    },
    technologies: {
      eyebrow: "Technologies I Use",
    },
    projectDetail: {
      overview: "Overview",
      problem: "The Problem",
      solution: "The Solution",
      features: "Key Features",
      techStack: "Tech Stack",
      howToRun: "How to Run",
      prerequisites: "Prerequisites",
      liveSite: "Live Site",
      sourceCode: "Source Code",
      backToProjects: "All Projects",
      prevProject: "Previous",
      nextProject: "Next",
    },
    projectsPage: {
      meta: { title: "Projects — YoniDev", description: "A curated selection of web apps, AI tools, bots, and automation systems built by YoniDev." },
      eyebrow: "Selected Work",
      headingLine1: "Projects That",
      headingLine2: "Make an Impact",
      body: "Every project here started as a real problem and ended as a working product.",
      filters: { all: "All", web: "Web", ai: "AI", bot: "Bots", automation: "Automation" },
      viewLive: "View Live",
      caseStudy: "Case Study",
      workshopEyebrow: "Up Next",
      workshopHeading: "In the Workshop",
      workshopBody: "Projects currently in design or early development.",
      workshopProject1Name: "Smart Frame",
      workshopProject1Desc: "A Raspberry Pi wall display that shows photos, reminders, and live data — responds to voice, reads sensors, and syncs with the Yoniverse brain.",
      noProjects: "No projects in this category yet.",
    },
    cta: {
      headingLine1: "Ready to build",
      headingLine2: "something real?",
      body: "Tell me what you need — I'll make it happen.",
      button: "Get In Touch",
    },
    footer: {
      tagline:
        "Full-stack developer building web apps, AI tools, bots, and automation systems.",
      navTitle: "Navigation",
      builtWithTitle: "Built With",
      connectTitle: "Let's Connect",
      connectBody: "Have a project in mind? I'd love to hear about it.",
      cta: "Let's Talk",
      copyright: "© 2026 YoniDev by STARTOP. All rights reserved.",
      builtWith: "CODE YOUR DREAM",
    },
    locale: {
      switchTo: "עברית",
      ariaLabel: "Switch to Hebrew",
    },
    contact: {
      meta: {
        title: "Contact — YoniDev",
        description: "Get in touch with YoniDev. Let's build something amazing together.",
      },
      hero: {
        eyebrow: "Get in Touch",
        headingLine1: "Let's Build Something",
        headingLine2: "Together",
        body: "Have a project in mind or want to explore how we can work together? Reach out — I'd love to hear from you.",
        available: "Available for new projects",
      },
      form: {
        name: "Full Name",
        namePlaceholder: "Your name",
        email: "Email Address",
        emailPlaceholder: "you@example.com",
        phone: "Phone",
        phonePlaceholder: "+972 50 000 0000",
        phoneOptional: "Optional",
        projectType: {
          label: "Project Type",
          options: { web: "Web App", ai: "AI / LLM", bot: "Bot", api: "API / Integration", other: "Other" },
        },
        budget: {
          label: "Budget",
          options: { lt5: "< $5k", mid: "$5k – $15k", high: "$15k – $50k", top: "$50k+", unsure: "Not Sure" },
        },
        timeline: {
          label: "Timeline",
          options: { asap: "ASAP", short: "1–3 months", medium: "3–6 months", flexible: "Flexible" },
        },
        message: "Message",
        messagePlaceholder: "Tell me about your project, goals, or any questions you have…",
        submit: "Send Message",
        sending: "Sending…",
        requiredMark: "*",
        charCount: "{n}/{max}",
        extrasShow: "Add project details (optional)",
        extrasHide: "Hide project details",
        errors: {
          required: "This field is required",
          email: "Enter a valid email address",
          phone: "Enter a valid phone number",
          messageMin: "Message must be at least 10 characters",
          messageMax: "Message must be under 1500 characters",
          generic: "This field is invalid",
        },
        success: {
          heading: "Thanks — I'll get back to you within 1–2 days",
          body: "Your message has been received. Talk soon!",
          again: "Send another message",
        },
        serverError: "Something went wrong. Try again, or email me directly at yonidev0101@gmail.com",
      },
      channels: {
        whatsapp: {
          label: "WhatsApp",
          subLabel: "Tap to chat",
          prefill: "Hi, I found your portfolio and I'd love to discuss a project!",
        },
        email: {
          label: "Email",
          copy: "Copy",
          copied: "Copied!",
        },
        responseTime: "Usually replies within 1–2 days",
      },
    },
    about: {
      meta: {
        title: "About — YoniDev",
        description: "Full-Stack Developer. Building modern, scalable web applications, AI tools, bots, and automation systems.",
      },
      hero: {
        eyebrow: "About Me",
        headingLine1: "From curiosity",
        headingLine2: "to craft",
        body: "Full-Stack Developer, self-taught. I work across the whole stack — from pixel-perfect UIs to scalable server architecture — and I love the moment an idea becomes real.",
        ctaPrimary: "View My Work",
        ctaSecondary: "Let's Talk",
        available: "Available for new projects",
        portraitAlt: "Yonatan Yaglenik — YoniDev",
      },
      story: {
        eyebrow: "My Story",
        heading: "From curiosity to craft",
        p1: "Hey 👋 I'm Yonatan. It started with a Java course — university lecture videos I had no real reason to watch. I watched most of them, then couldn't help myself and started trying things out. That's pretty much where I've been ever since.",
        p2: "Fully self-taught, and honestly I prefer it that way — I learn best by doing. These days I work across the whole stack: from the UI in your browser all the way to the server and database behind it. Along the way I've built web apps, AI tools, WhatsApp bots, automations, and IoT projects.",
        p3: "What I really care about? Not just whether something works — but how it's built. Clean architecture, a modern stack, and code that the next developer (let's be honest, usually me six months later 😅) can actually read.",
        p4: "The thing about me is this genuinely doesn't feel like work. It's my hobby, my passion — the thing I naturally gravitate toward even in my free time. A new site, a game, a bot, an AI experiment, an ESP32 build — there's always something.",
        pullQuote: "I learn best by doing.",
      },
      building: {
        eyebrow: "Currently Building",
        heading: "Beyond client work",
        statusLive: "Live",
        statusDev: "In Development",
        statusMvp: "Planned",
        items: {
          "al-hamacom": {
            title: "AL-HAMACOM",
            description: "A neighborhood community platform connecting local residents and businesses in one place. Pre-launch.",
          },
          yoniverse: {
            title: "Yoniverse",
            description: "A personal AI ecosystem with a multi-agent architecture — one Brain to coordinate them all. An ongoing R&D playground that keeps evolving.",
          },
          frame: {
            title: "Yoniverse Frame",
            description: "A smart digital photo frame on a Raspberry Pi 4 — a planned project waiting for the right moment to build.",
          },
        },
      },
      passions: {
        eyebrow: "Beyond Code",
        heading: "When I close the editor",
        items: {
          teaching: { title: "Hardware & IoT", description: "ESP32 sensors, smart-home automations, Raspberry Pi setups. Half my apartment is slowly becoming a side project. If it has a chip and wires, I want to take it apart." },
          hardware: { title: "Always learning something new", description: "Whether it's a new language, a different architecture, or a random rabbit hole at 2am — I'm genuinely curious about how things work and I can't stop exploring." },
        },
      },
    },
  },
  he: {
    servicesPage: {
      meta: {
        title: "שירותים — YoniDev",
        description: "פיתוח Full-Stack, שילובי AI, בוטים ו-API על ידי YoniDev.",
      },
      hero: {
        eyebrow: "מה אני עושה",
        headingLine1: "מרעיון",
        headingLine2: "לייצור",
        body: "קוד נקי, פונקציונליות עוצמתית וחוויית משתמש מצוינת — מקצה לקצה.",
      },
      useCaseLabel: "לדוגמה",
      items: {
        fullstack: {
          title: "פיתוח Full-Stack",
          tagline: "מוצרי web מלאים, מההתחלה ועד הסוף",
          description:
            "אני מעצב ובונה אפליקציות web שלמות — מהממשק שהמשתמשים רואים ועד לוגיקת השרת ומסד הנתונים מאחוריו. כל פרויקט מותאם למהירות, יכולת הרחבה ותחזוקה.",
          bullets: [
            "UI מדויק לפיקסל עם React / Next.js",
            "Backends מתרחבים עם Node.js ו-TypeScript",
            "עיצוב מסד נתונים ופריסה לענן",
          ],
          useCase:
            "פלטפורמת מרקטפלייס עם מודעות בזמן אמת, התחברות ודאשבורד ניהול",
        },
        ai: {
          title: "שילובי AI",
          tagline: "פיצ'רים חכמים משולבים במוצר שלך",
          description:
            "אני מחבר ממשקי LLM (OpenAI, Claude, Gemini) למוצרים אמיתיים — לא דמואים. צינורות RAG, חיפוש סמנטי, agents חכמים ופיצ'רים מבוססי הקשר שבאמת יוצאים לאוויר.",
          bullets: [
            "פיצ'רים מבוססי LLM (צ'אט, סיכום, סיווג)",
            "צינורות RAG עם חיפוש וקטורי",
            "Agents AI מותאמים עם שימוש בכלים",
          ],
          useCase:
            "בוט ידע פנימי שעונה על שאלות מהמסמכים של החברה שלך",
        },
        bots: {
          title: "בוטים ואוטומציה",
          tagline: "אוטומציה של החוזר, הרחבה של השאר",
          description:
            "בוטים לוואטסאפ וטלגרם שמבינים שפה טבעית, בנוסף לאוטומציות זרימת עבודה עם N8N או קוד מותאם. כל מה שרץ ברקע כדי שאתה לא תצטרך.",
          bullets: [
            "בוטים לוואטסאפ / טלגרם עם NLP",
            "זרימות N8N וסקריפטים מותאמים",
            "עבודות מתוזמנות ו-workers ברקע",
          ],
          useCase:
            "בוט וואטסאפ שמכשיר לידים ומזמין שיחות — בלי לגעת בזה",
        },
        apis: {
          title: "API ואינטגרציות",
          tagline: "חיבור הסטאק שלך, סנכרון הנתונים שלך",
          description:
            "ממשקי REST ו-GraphQL, אינטגרציות עם צד שלישי וצינורות נתונים. אני בונה את הדבק בין המערכות שלך כדי שהכל ידבר עם הכל.",
          bullets: [
            "עיצוב ממשקי RESTful ו-GraphQL",
            "אינטגרציות שירות צד שלישי",
            "סנכרון נתונים וצינורות ETL",
          ],
          useCase:
            "סנכרון אנשי קשר מ-CRM לרשימת תפוצה עם התראות Slack על עסקאות חדשות",
        },
      },
    },
    nav: {
      home: "בית",
      about: "אודות",
      services: "שירותים",
      projects: "פרויקטים",
      contact: "צור קשר",
      cta: "בוא נדבר",
      menu: "תפריט",
    },
    hero: {
      eyebrow: "מפתח Full Stack",
      headingLine1: "הרעיון שלך.",
      headingLine2: "הקוד שלי.",
      headingLine3: "התוצאה שלנו.",
      body: "מפתח Full-Stack שבונה אפליקציות Next.js וכלים דיגיטליים לעסקים שרוצים לצמוח ולהתייעל.",
      ctaPrimary: "לעבודות שלי",
      ctaSecondary: "בואו נעבוד יחד",
      available: "זמין לפרויקטים חדשים",
      logoAlt: "לוגו Y של YoniDev",
    },
    stats: {
      yearsBuilding: "שנות פיתוח",
      projectsDelivered: "פרויקטים בייצור",
      serviceAreas: "תחומי שירות",
      linesOfCode: "שורות קוד",
    },
    services: {
      eyebrow: "מה אני עושה",
      heading: "מהרעיון לייצור",
      body: "אני בונה מוצרים דיגיטליים מלאים המותאמים לעסק שלך — מהשורה הראשונה של קוד עד הרגע שזה עולה לאוויר.",
      items: {
        fullstack: {
          title: "פיתוח Full-Stack",
          description:
            "אפליקציות Web מלאות עם Next.js — מממשק מדויק לפיקסל ועד ארכיטקטורת שרת ומסד נתונים.",
        },
        ai: {
          title: "שילובי AI",
          description: "פיצ'רים וכלי AI מותאמים — משילוב OpenAI ו-Claude ועד בניית מוצרים מבוססי AI מאפס.",
        },
        bots: {
          title: "בוטים ואוטומציה",
          description:
            "בוטים ל-WhatsApp ו-Telegram עם הבנת שפה טבעית, תהליכי N8N וסקריפטים אוטומציה מותאמים.",
        },
        apis: {
          title: "API ואינטגרציות",
          description:
            "חיבור פלטפורמות, סנכרון נתונים ואוטומציה של תהליכים עסקיים מקצה לקצה.",
        },
      },
    },
    projects: {
      eyebrow: "עבודות נבחרות",
      headingLine1: "פרויקטים",
      headingLine2: "שעושים את ההבדל",
      body: "מבחר עבודות אחרונות שבהן רעיונות הפכו לפתרונות דיגיטליים עוצמתיים.",
      seeAll: "לכל הפרויקטים",
      prevAria: "פרויקט קודם",
      nextAria: "הפרויקט הבא",
      viewAria: "צפייה",
      items: {
        yoniverse: {
          title: "Yoniverse",
          description: "סביבת עבודה על כל המסך עם מוח AI אחד שמנהל משימות, מחובר לפלאפון, אימייל, WhatsApp ו-IoT — ממוקד, נקי ועובד בשבילך.",
        },
        "al-hamacom": {
          title: "על המקום",
          description: "פלטפורמה קהילתית-שכונתית שמחברת בין תושבים ועסקים מקומיים במקום אחד.",
        },
        "ai-whatsapp-bot": {
          title: "Boti",
          description: "בוט WhatsApp חכם שמאזין לשיחות העסקיות שלך, זוכר כל פרט, ועונה על שאלות לגביהם בשנייה עם AI.",
        },
        "categories-game": {
          title: "ארץ עיר — Categories Game",
          description: "משחק ארץ עיר מולטיפלייר בזמן אמת עם שיפוט תשובות מבוסס AI וסנכרון חי דרך Socket.IO.",
        },
        "git-explorer": {
          title: "GitExplorer",
          description: "סייר קבצים נייטיב לשולחן עבודה עם לקוח Git מובנה — לדפדף בקבצים ולנהל את כל זרימת העבודה עם Git מאפליקציית Tauri אחת.",
        },
      },
    },
    process: {
      eyebrow: "איך אני עובד",
      headingLine1: "תהליך פשוט,",
      headingLine2: "תוצאות עוצמתיות",
      stepLabel: "שלב",
      stepOf: "מתוך",
      items: {
        discover: {
          title: "הבנה",
          description: "שיחה קצרה או וואטסאפ כדי להבין את הרעיון, המטרות שלך, ומה נראה לך כמו הצלחה.",
        },
        design: {
          title: "תכנון",
          description: "אפיון מסודר — שאלות נכונות, דרישות ברורות והגדרת היקף לפני שמתחילים לכתוב קוד.",
        },
        develop: {
          title: "פיתוח",
          description: "בנייה עם קוד נקי ומסודר וכלי AI כמו Claude Code. מעדכן אותך לאורך כל הדרך בלי הפתעות.",
        },
        deliver: {
          title: "מסירה",
          description: "העלאה לאוויר, הדרכה מלאה כדי שתבין הכל, ותמיכה אחרי ההשקה. קוד נקי ומתועד שנשאר אצלך.",
        },
      },
    },
    technologies: {
      eyebrow: "הטכנולוגיות שאני עובד איתן",
    },
    projectDetail: {
      overview: "סקירה",
      problem: "הבעיה",
      solution: "הפתרון",
      features: "פיצ'רים מרכזיים",
      techStack: "סטאק טכנולוגי",
      howToRun: "איך להריץ",
      prerequisites: "דרישות מוקדמות",
      liveSite: "לאתר החי",
      sourceCode: "קוד מקור",
      backToProjects: "כל הפרויקטים",
      prevProject: "הקודם",
      nextProject: "הבא",
    },
    projectsPage: {
      meta: { title: "פרויקטים — YoniDev", description: "מבחר עבודות — אפליקציות Web, כלי AI, בוטים ואוטומציות שנבנו על ידי YoniDev." },
      eyebrow: "עבודות נבחרות",
      headingLine1: "פרויקטים",
      headingLine2: "שעושים את ההבדל",
      body: "כל פרויקט כאן התחיל כבעיה אמיתית וסיים כמוצר עובד.",
      filters: { all: "הכל", web: "Web", ai: "AI", bot: "בוטים", automation: "אוטומציה" },
      viewLive: "לאתר החי",
      caseStudy: "קייס סטאדי",
      workshopEyebrow: "בתכנון",
      workshopHeading: "בסדנה",
      workshopBody: "פרויקטים שנמצאים כרגע בתכנון או בפיתוח מוקדם.",
      workshopProject1Name: "מסגרת חכמה",
      workshopProject1Desc: "תצוגת קיר מבוססת Raspberry Pi שמציגה תמונות, תזכורות ומידע חי — מגיבה לקול, קוראת חיישנים ומסונכרנת עם מוח Yoniverse.",
      noProjects: "אין פרויקטים בקטגוריה הזו עדיין.",
    },
    cta: {
      headingLine1: "מוכן לבנות",
      headingLine2: "משהו אמיתי?",
      body: "תגיד לי מה אתה צריך — אני אדאג לשאר.",
      button: "צור קשר",
    },
    footer: {
      tagline:
        "מפתח Full-Stack שבונה אפליקציות web, כלי AI, בוטים ומערכות אוטומציה.",
      navTitle: "ניווט",
      builtWithTitle: "נבנה עם",
      connectTitle: "בואו נתחבר",
      connectBody: "יש לך פרויקט? אשמח לשמוע.",
      cta: "בוא נדבר",
      copyright: "© 2026 YoniDev by STARTOP. כל הזכויות שמורות.",
      builtWith: "CODE YOUR DREAM",
    },
    locale: {
      switchTo: "EN",
      ariaLabel: "Switch to English",
    },
    contact: {
      meta: {
        title: "צור קשר — YoniDev",
        description: "צור קשר עם YoniDev. בואו נבנה יחד משהו מדהים.",
      },
      hero: {
        eyebrow: "צור קשר",
        headingLine1: "בואו נבנה משהו",
        headingLine2: "יחד",
        body: "יש לך פרויקט בראש או רוצה לבדוק איך נוכל לעבוד יחד? כתוב לי — אשמח לשמוע.",
        available: "זמין לפרויקטים חדשים",
      },
      form: {
        name: "שם מלא",
        namePlaceholder: "השם שלך",
        email: "כתובת אימייל",
        emailPlaceholder: "you@example.com",
        phone: "טלפון",
        phonePlaceholder: "+972 50 000 0000",
        phoneOptional: "אופציונלי",
        projectType: {
          label: "סוג פרויקט",
          options: { web: "אפליקציית Web", ai: "AI / LLM", bot: "בוט", api: "API / אינטגרציה", other: "אחר" },
        },
        budget: {
          label: "תקציב",
          options: { lt5: "פחות מ-₪20K", mid: "₪20K–₪50K", high: "₪50K–₪200K", top: "₪200K+", unsure: "לא בטוח" },
        },
        timeline: {
          label: "לוח זמנים",
          options: { asap: "בהקדם", short: "1–3 חודשים", medium: "3–6 חודשים", flexible: "גמיש" },
        },
        message: "הודעה",
        messagePlaceholder: "ספר לי על הפרויקט, המטרות, או כל שאלה שיש לך…",
        submit: "שלח הודעה",
        sending: "שולח…",
        requiredMark: "*",
        charCount: "{n}/{max}",
        extrasShow: "הוסף פרטי פרויקט (אופציונלי)",
        extrasHide: "הסתר פרטי פרויקט",
        errors: {
          required: "שדה זה הוא חובה",
          email: "הכנס כתובת אימייל תקנית",
          phone: "הכנס מספר טלפון תקני",
          messageMin: "ההודעה חייבת להכיל לפחות 10 תווים",
          messageMax: "ההודעה חייבת להיות עד 1500 תווים",
          generic: "שדה זה אינו תקין",
        },
        success: {
          heading: "תודה — אחזור אליך תוך 1–2 ימים",
          body: "ההודעה שלך התקבלה. נדבר בקרוב!",
          again: "שלח הודעה נוספת",
        },
        serverError: "משהו השתבש. נסה שוב, או שלח לי ישירות אימייל ל-yonidev0101@gmail.com",
      },
      channels: {
        whatsapp: {
          label: "וואטסאפ",
          subLabel: "לחץ לצ׳אט",
          prefill: "היי, ראיתי את הפורטפוליו שלך ואשמח לדבר על פרויקט!",
        },
        email: {
          label: "אימייל",
          copy: "העתק",
          copied: "הועתק!",
        },
        responseTime: "בדרך כלל עונה תוך 1–2 ימים",
      },
    },
    about: {
      meta: {
        title: "אודות — YoniDev",
        description: "מפתח Full-Stack. בונה אפליקציות web מודרניות ומתרחבות, כלי AI, בוטים ומערכות אוטומציה.",
      },
      hero: {
        eyebrow: "אודות",
        headingLine1: "מסקרנות",
        headingLine2: "למקצוע",
        body: "מפתח Full-Stack, למדתי לבד. אני עובד לאורך כל הסטאק — מ-UI מדויק לפיקסל ועד ארכיטקטורת שרת מתרחבת — ואני אוהב את הרגע שבו רעיון הופך לאמיתי.",
        ctaPrimary: "לעבודות שלי",
        ctaSecondary: "בוא נדבר",
        available: "זמין לפרויקטים חדשים",
        portraitAlt: "יהונתן יגלניק — YoniDev",
      },
      story: {
        eyebrow: "הסיפור שלי",
        heading: "מסקרנות למקצוע",
        p1: "היי 👋 אני יהונתן. זה התחיל מקורס ג'אווה — סרטוני הרצאות מהאוניברסיטה הפתוחה שלא היה לי סיבה מיוחדת לראות. ראיתי את רובם, ואז כבר לא יכולתי לעצור את עצמי מלנסות דברים. ופחות או יותר ככה נשארתי.",
        p2: "למדתי לבד, ובכנות מעדיף את זה כך — אני לומד הכי טוב תוך כדי עבודה. היום אני עובד על כל הסטאק: מה-UI בדפדפן ועד השרת ומסד הנתונים מאחוריו. בדרך בניתי אפליקציות Web, כלי AI, בוטים בוואטסאפ, אוטומציות ופרויקטי IoT.",
        p3: "מה שבאמת חשוב לי? לא רק אם משהו עובד — אלא איך הוא נבנה. ארכיטקטורה נקייה, סטאק מודרני, וקוד שהמפתח הבא (בואו נודה בזה, בדרך כלל אני בעוד חצי שנה 😅) באמת יוכל לקרוא.",
        p4: "הדבר עליי הוא שזה באמת לא מרגיש לי כמו עבודה. זה התחביב שלי, התשוקה שלי — הדבר שאני מוצא את עצמי עושה גם בזמן הפנוי. אתר חדש, משחק, בוט, ניסוי AI, פרויקט ESP32 — תמיד יש משהו.",
        pullQuote: "אני לומד הכי טוב תוך כדי עבודה.",
      },
      building: {
        eyebrow: "במלאכה כעת",
        heading: "מעבר לעבודה ללקוחות",
        statusLive: "פעיל",
        statusDev: "בפיתוח",
        statusMvp: "מתוכנן",
        items: {
          "al-hamacom": {
            title: "על המקום",
            description: "פלטפורמה קהילתית-שכונתית שמחברת תושבים ועסקים מקומיים במקום אחד. לפני השקה.",
          },
          yoniverse: {
            title: "Yoniverse",
            description: "מערכת AI אישית עם ארכיטקטורת multi-agent — Brain אחד שמתאם את כולם. מגרש ניסוי ופיתוח שממשיך להתפתח.",
          },
          frame: {
            title: "Yoniverse Frame",
            description: "מסגרת תמונה דיגיטלית חכמה על Raspberry Pi 4 — פרויקט מתוכנן שמחכה לזמן הנכון לבנות.",
          },
        },
      },
      passions: {
        eyebrow: "מעבר לקוד",
        heading: "כשהעורך נסגר",
        items: {
          teaching: { title: "חומרה ו-IoT", description: "חיישני ESP32, אוטומציות בית חכם, פרויקטים על Raspberry Pi. חצי דירה אצלי בהדרגה הופכת ל-side project. אם יש לזה שבב וחוטים, אני רוצה לפתוח את זה." },
          hardware: { title: "תמיד לומד משהו חדש", description: "בין אם זו שפה חדשה, ארכיטקטורה אחרת, או חור ארנבת אקראי בשתיים בלילה — אני סקרן לאמיתו לגבי איך דברים עובדים ולא מפסיק לחקור." },
        },
      },
    },
  },
};
