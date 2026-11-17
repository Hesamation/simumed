"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  dir as dirOf,
  isLocale,
  type Locale,
} from "./config";
import { dictFor, type Dict } from "./dict";
import { localeNum } from "./format";

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dict;
  /** Locale-aware digits: Persian in `fa`, Latin in `en`. */
  num: (v: number | string) => string;
  /** Locale-aware percentage: "۴۲٪" in `fa`, "42%" in `en`. */
  pct: (v: number | string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

function persist(locale: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* private mode etc. — preference just won't persist */
  }
}

function applyDocumentAttrs(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = dirOf(locale);
}

/** Server render and first client render both use `initialLocale` (from the
 *  locale cookie) — no hydration mismatch. A stored preference is honoured
 *  post-mount only when it disagrees with the cookie (e.g. cookie cleared),
 *  which is a rare, client-only correction. */
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    const cookieMatch = document.cookie
      .split(";")
      .some(
        (c) =>
          c.trim() === `${LOCALE_COOKIE}=${locale}` ||
          c.trim().startsWith(`${LOCALE_COOKIE}=${locale};`),
      );
    if (isLocale(stored) && stored !== locale && !cookieMatch) {
      // Post-mount correction for the rare case where localStorage holds a
      // preference but the locale cookie is gone (server rendered the
      // default). Runs once; the common path (cookie present) never enters.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot divergence repair, not a derived-state pattern
      setLocaleState(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyDocumentAttrs(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persist(next);
    applyDocumentAttrs(next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: dirOf(locale),
      t: dictFor(locale),
      num: (v: number | string) => localeNum(locale, v),
      pct: (v: number | string) =>
        `${localeNum(locale, v)}${locale === "fa" ? "٪" : "%"}`,
      setLocale,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LocaleProvider>");
  return ctx;
}
