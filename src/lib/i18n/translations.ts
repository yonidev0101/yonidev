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
        phonePlaceholder: "+1 (555) 000-0000",
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
          heading: "Thanks — I'll get back to you within 24 hours",
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
        responseTime: "Usually replies within 24 hours",
      },
    },
    about: {
      meta: {
        title: "About — YoniDev",
        description: "Full-Stack Developer from Jerusalem. Building modern, scalable web applications, AI tools, and real-world automation systems.",
      },
      hero: {
        eyebrow: "About Me",
        headingLine1: "Building things that",
        headingLine2: "solve real problems",
        body: "Full-Stack Developer from Jerusalem. I work across the whole stack — from pixel-perfect UIs to scalable server architecture — and I love the moment an idea becomes real.",
        ctaPrimary: "View My Work",
        ctaSecondary: "Let's Talk",
        available: "Available for new projects",
        portraitAlt: "Yonatan Yaglenik — YoniDev",
      },
      story: {
        eyebrow: "My Story",
        heading: "From curiosity to craft",
        p1: "Hey 👋 I'm Yonatan. I got into coding because, honestly, I'm a little obsessed with the moment an idea turns into something real — you click a button, and stuff actually happens. That feeling never gets old.",
        p2: "These days I work across the whole stack — from the pixels in your browser all the way down to the database holding everything together. I've shipped community platforms, AI tools, WhatsApp bots, browser automations, and IoT projects running on Raspberry Pis 🍓. Basically: if it has code in it, I've probably tried to break and rebuild it.",
        p3: "What I really care about? How something is built — not just whether it works. Clean architecture, a modern stack, scalable from day one, and code that the next dev (let's be honest, usually me six months later 😅) can actually read.",
        p4: "When I'm not coding for clients, I'm probably tinkering with something else 🛠️ — a multi-agent AI experiment, a smart photo frame on a Raspberry Pi, or another ESP32 project slowly taking over the apartment. These weird side projects always feed back into the client work. Every random experiment teaches me something I end up bringing to the next thing.",
        pullQuote: "I keep it direct. No fluff, step-by-step.",
      },
      building: {
        eyebrow: "Currently Building",
        heading: "Beyond client work",
        statusLive: "Live",
        statusDev: "In Development",
        statusMvp: "MVP",
        items: {
          "al-hamacom": {
            title: "AL-HAMACOM",
            description: "A neighborhood platform connecting residents with local services, events, and community boards. Built for Jerusalem, starting with Ramot.",
          },
          yoniverse: {
            title: "Yoniverse",
            description: "A personal AI ecosystem with a multi-agent architecture — one Brain to coordinate them all. An ongoing R&D playground that keeps evolving.",
          },
          frame: {
            title: "Yoniverse Frame",
            description: "A smart digital photo frame running on a Raspberry Pi 4, displaying curated memories in a custom React kiosk interface.",
          },
        },
      },
      passions: {
        eyebrow: "Beyond Code",
        heading: "When I close the editor",
        items: {
          teaching: { title: "Teaching melodica", description: "I volunteer at a youth club teaching kids melodica with a number-based notation system — 1 to 7 instead of sheet music. Watching them play their first song in 10 minutes never gets old." },
          hardware: { title: "Tinkering with hardware", description: "ESP32 sensors, smart-home automations, Raspberry Pi setups. Half my apartment is slowly becoming a side project. If it has a chip and wires, I want to take it apart." },
        },
      },
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
          heading: "תודה — אחזור אליך תוך 24 שעות",
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
        responseTime: "בדרך כלל עונה תוך 24 שעות",
      },
    },
    about: {
      meta: {
        title: "אודות — YoniDev",
        description: "מפתח Full-Stack מירושלים. בונה אפליקציות web מודרניות ומתרחבות, כלי AI ומערכות אוטומציה בעולם האמיתי.",
      },
      hero: {
        eyebrow: "אודות",
        headingLine1: "בונה דברים שפותרים",
        headingLine2: "בעיות אמיתיות",
        body: "מפתח Full-Stack מירושלים. אני עובד לאורך כל הסטאק — מ-UI מדויק לפיקסל ועד ארכיטקטורת שרת מתרחבת — ואני אוהב את הרגע שבו רעיון הופך לאמיתי.",
        ctaPrimary: "לעבודות שלי",
        ctaSecondary: "בוא נדבר",
        available: "זמין לפרויקטים חדשים",
        portraitAlt: "יהונתן יגלניק — YoniDev",
      },
      story: {
        eyebrow: "הסיפור שלי",
        heading: "מסקרנות למקצוע",
        p1: "היי 👋 אני יהונתן. נכנסתי לקוד כי, בכנות, אני קצת אובססיבי לרגע שבו רעיון הופך למשהו אמיתי — לוחצים על כפתור, ובאמת קורה משהו. הרגע הזה אף פעם לא יתיישן.",
        p2: "היום אני עובד על כל הסטאק — מהפיקסלים בדפדפן ועד הדאטהבייס שמחזיק את הכל. השקתי פלטפורמות קהילתיות, כלי AI, בוטים בוואטסאפ, אוטומציות לדפדפן ופרויקטי IoT שרצים על Raspberry Pi 🍓. בעיקרון, אם יש בזה קוד, כנראה ניסיתי לשבור ולבנות איתו משהו מחדש.",
        p3: "מה שבאמת חשוב לי? איך משהו נבנה — לא רק אם זה עובד. ארכיטקטורה נקייה, סטאק מודרני, מתרחב מהיום הראשון, וקוד שהמפתח הבא (בואו נודה בזה, בדרך כלל אני בעוד חצי שנה 😅) באמת יוכל לקרוא.",
        p4: "כשאני לא מקודד ללקוחות, אני בטח מתעסק במשהו אחר 🛠️ — ניסוי AI עם כמה agents, מסגרת תמונה חכמה על Raspberry Pi, או עוד פרויקט ESP32 שלאט-לאט משתלט לי על הדירה. ה-side projects המוזרים האלה תמיד מזינים בחזרה את העבודה ללקוחות. כל ניסוי אקראי מלמד אותי משהו שאני מביא לפעם הבאה.",
        pullQuote: "אני שומר על זה ישיר. בלי מסביב, צעד-צעד.",
      },
      building: {
        eyebrow: "במלאכה כעת",
        heading: "מעבר לעבודה ללקוחות",
        statusLive: "פעיל",
        statusDev: "בפיתוח",
        statusMvp: "MVP",
        items: {
          "al-hamacom": {
            title: "על המקום",
            description: "פלטפורמה שכונתית שמחברת תושבים לשירותים מקומיים, אירועים ולוחות קהילתיים. נבנתה עבור ירושלים, מתחילה עם רמות.",
          },
          yoniverse: {
            title: "Yoniverse",
            description: "מערכת AI אישית עם ארכיטקטורת multi-agent — Brain אחד שמתאם את כולם. מגרש ניסוי ופיתוח שממשיך להתפתח.",
          },
          frame: {
            title: "Yoniverse Frame",
            description: "מסגרת תמונה דיגיטלית חכמה שרצה על Raspberry Pi 4, מציגה זיכרונות נבחרים בממשק React בסגנון kiosk.",
          },
        },
      },
      passions: {
        eyebrow: "מעבר לקוד",
        heading: "כשהעורך נסגר",
        items: {
          teaching: { title: "מלמד מלודיקה", description: "מתנדב במועדון נוער ומלמד ילדים מלודיקה לפי שיטת מספרים — 1 עד 7 במקום תווים. לראות אותם מנגנים שיר ראשון תוך 10 דקות זה משהו שלא נמאס." },
          hardware: { title: "מתעסק עם חומרה", description: "חיישני ESP32, אוטומציות בית חכם, פרויקטים על Raspberry Pi. חצי דירה אצלי בהדרגה הופכת ל-side project. אם יש לזה שבב וחוטים, אני רוצה לפתוח את זה." },
        },
      },
    },
  },
};
