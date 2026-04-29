"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  translations,
  type TranslationDict,
} from "./translations";

const STORAGE_KEY = "yonidev:locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: TranslationDict;
  dir: "ltr" | "rtl";
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

function applyDocAttrs(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
}

// External store integration — reads/subscribes to localStorage, with a
// matching server snapshot so SSR and the first client render agree.
const localeStore = {
  subscribe(callback: () => void) {
    if (typeof window === "undefined") return () => {};
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) callback();
    };
    window.addEventListener("storage", handler);
    window.addEventListener("yonidev:locale-change", callback);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("yonidev:locale-change", callback);
    };
  },
  getSnapshot(): Locale {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      return isLocale(v) ? v : DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  },
  getServerSnapshot(): Locale {
    return DEFAULT_LOCALE;
  },
  write(next: Locale) {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event("yonidev:locale-change"));
  },
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getSnapshot,
    localeStore.getServerSnapshot
  );

  // Keep <html dir/lang> in sync with the active locale on the client.
  if (typeof document !== "undefined") {
    applyDocAttrs(locale);
  }

  const setLocale = useCallback((next: Locale) => {
    localeStore.write(next);
    applyDocAttrs(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "he" : "en");
  }, [locale, setLocale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: translations[locale],
      dir: locale === "he" ? "rtl" : "ltr",
    }),
    [locale, setLocale, toggleLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useT(): TranslationDict {
  return useLocale().t;
}

/** Inline script to set initial dir/lang before hydration to avoid flash. */
export const localeInitScript = `(function(){try{var k='${STORAGE_KEY}';var v=localStorage.getItem(k);if(v!=='en'&&v!=='he')v='${DEFAULT_LOCALE}';document.documentElement.lang=v;document.documentElement.dir=v==='he'?'rtl':'ltr';}catch(e){}})();`;
