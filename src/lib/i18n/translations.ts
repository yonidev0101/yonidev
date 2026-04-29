export type Locale = "en" | "he";

export const LOCALES: Locale[] = ["en", "he"];
export const DEFAULT_LOCALE: Locale = "en";

export interface TranslationDict {
  nav: { home: string; about: string; services: string; projects: string; contact: string; cta: string; menu: string; };
  hero: { eyebrow: string; headingLine1: string; headingLine2: string; body: string; ctaPrimary: string; ctaSecondary: string; available: string; logoAlt: string; };
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
      "project-4": { title: string; description: string };
      "project-5": { title: string; description: string };
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
  footer: {
    tagline: string; navTitle: string; servicesTitle: string;
    services: { frontend: string; backend: string; ai: string; bots: string; apis: string; };
    connectTitle: string; connectBody: string; cta: string; copyright: string; builtWith: string;
  };
  locale: { switchTo: string; ariaLabel: string; };
}

export const translations: Record<Locale, TranslationDict> = {
  en: {
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
      headingLine1: "I Code.",
      headingLine2: "You Grow.",
      body: "Building modern, fast and scalable web applications, automations and AI-powered tools — from idea to production.",
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
      heading: "End-to-End Development",
      body: "I build complete digital solutions with clean code, powerful functionality and great user experience.",
      items: {
        fullstack: {
          title: "Full-Stack Development",
          description: "End-to-end web apps and sites — from pixel-perfect UI to scalable server architecture.",
        },
        ai: {
          title: "AI Integrations",
          description: "LLM APIs, RAG systems and smart features built into your product seamlessly.",
        },
        bots: {
          title: "Bots & Automation",
          description: "WhatsApp & Telegram bots with natural language, plus Make / Zapier / custom code workflows.",
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
          description: "Personal portfolio and project showcase with modern design and smooth animations.",
        },
        "al-hamacom": {
          title: "Al HaMacom",
          description: "Local business platform connecting users with services in their neighborhood.",
        },
        "ai-whatsapp-bot": {
          title: "AI WhatsApp Bot",
          description: "Smart WhatsApp bot with natural language understanding and business automation.",
        },
        "project-4": {
          title: "Task Management App",
          description: "Collaborative task management app with real-time updates and team features.",
        },
        "project-5": {
          title: "Business Automation Suite",
          description: "End-to-end business automation connecting CRM, invoicing and email workflows.",
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
          description: "Understanding your idea, goals and requirements.",
        },
        design: {
          title: "Design",
          description: "Planning, wireframing and designing the solution.",
        },
        develop: {
          title: "Develop",
          description: "Writing clean, efficient and scalable code.",
        },
        deliver: {
          title: "Deliver",
          description: "Testing, deploying and continuous support.",
        },
      },
    },
    technologies: {
      eyebrow: "Technologies I Use",
    },
    cta: {
      headingLine1: "Have a project",
      headingLine2: "in mind?",
      body: "Let's build something amazing together.",
      button: "Get In Touch",
    },
    footer: {
      tagline:
        "Full Stack Developer passionate about building modern, scalable and beautiful web applications.",
      navTitle: "Navigation",
      servicesTitle: "Services",
      services: {
        frontend: "Frontend Development",
        backend: "Backend Development",
        ai: "AI Integrations",
        bots: "Bots & Automation",
        apis: "API Development",
      },
      connectTitle: "Let's Connect",
      connectBody: "Available for freelance and full-time opportunities.",
      cta: "Let's Talk",
      copyright: "© 2024 YoniDev. All rights reserved.",
      builtWith: "Built with passion ❤️",
    },
    locale: {
      switchTo: "עברית",
      ariaLabel: "Switch to Hebrew",
    },
  },
  he: {
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
      headingLine1: "אני מקודד.",
      headingLine2: "אתם צומחים.",
      body: "בונה אפליקציות אינטרנט מודרניות, מהירות ומתרחבות, אוטומציות וכלים מבוססי AI — מהרעיון ועד הייצור.",
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
      heading: "פיתוח מקצה לקצה",
      body: "אני בונה פתרונות דיגיטליים מלאים עם קוד נקי, פונקציונליות עוצמתית וחוויית משתמש מצוינת.",
      items: {
        fullstack: {
          title: "פיתוח Full-Stack",
          description:
            "אפליקציות ואתרים מקצה לקצה — מ-UI מדויק לפיקסל ועד ארכיטקטורת שרת מתרחבת.",
        },
        ai: {
          title: "שילובי AI",
          description: "ממשקי LLM, מערכות RAG ופיצ'רים חכמים שמשתלבים במוצר שלך בצורה חלקה.",
        },
        bots: {
          title: "בוטים ואוטומציה",
          description:
            "בוטים ל-WhatsApp ו-Telegram עם הבנת שפה טבעית, ותהליכי Make / Zapier וקוד מותאם.",
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
          description: "פורטפוליו אישי ותצוגת פרויקטים עם עיצוב מודרני ואנימציות חלקות.",
        },
        "al-hamacom": {
          title: "על המקום",
          description: "פלטפורמת עסקים מקומיים שמחברת בין משתמשים לשירותים בסביבת המגורים.",
        },
        "ai-whatsapp-bot": {
          title: "בוט WhatsApp חכם",
          description: "בוט WhatsApp חכם עם הבנת שפה טבעית ואוטומציה עסקית.",
        },
        "project-4": {
          title: "אפליקציית ניהול משימות",
          description: "ניהול משימות שיתופי עם עדכונים בזמן אמת ופיצ'רים לצוותים.",
        },
        "project-5": {
          title: "חבילת אוטומציה לעסקים",
          description: "אוטומציה עסקית מקצה לקצה שמחברת CRM, חשבוניות ותהליכי אימייל.",
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
          title: "גילוי",
          description: "הבנת הרעיון, המטרות והדרישות שלך.",
        },
        design: {
          title: "עיצוב",
          description: "תכנון, סקיצות ועיצוב הפתרון.",
        },
        develop: {
          title: "פיתוח",
          description: "כתיבת קוד נקי, יעיל וניתן להרחבה.",
        },
        deliver: {
          title: "מסירה",
          description: "בדיקות, העלאה לאוויר ותמיכה שוטפת.",
        },
      },
    },
    technologies: {
      eyebrow: "הטכנולוגיות שאני עובד איתן",
    },
    cta: {
      headingLine1: "יש לך פרויקט",
      headingLine2: "בראש?",
      body: "בואו נבנה יחד משהו מדהים.",
      button: "צור קשר",
    },
    footer: {
      tagline:
        "מפתח Full Stack שאוהב לבנות אפליקציות מודרניות, מתרחבות ויפות.",
      navTitle: "ניווט",
      servicesTitle: "שירותים",
      services: {
        frontend: "פיתוח Frontend",
        backend: "פיתוח Backend",
        ai: "שילובי AI",
        bots: "בוטים ואוטומציה",
        apis: "פיתוח API",
      },
      connectTitle: "בואו נתחבר",
      connectBody: "זמין לעבודות פרילנס ומשרות מלאות.",
      cta: "בוא נדבר",
      copyright: "© 2024 YoniDev. כל הזכויות שמורות.",
      builtWith: "נבנה באהבה ❤️",
    },
    locale: {
      switchTo: "EN",
      ariaLabel: "Switch to English",
    },
  },
};
