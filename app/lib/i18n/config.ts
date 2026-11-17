export type Locale = "en" | "fa";

/** Public default is English (README + demo are English). Flip this one
 *  line to make Persian the default for fresh visitors. */
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "simumed_locale";
export const LOCALE_STORAGE_KEY = "simumed_locale";

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "fa";
}

export function dir(locale: Locale): "ltr" | "rtl" {
  return locale === "fa" ? "rtl" : "ltr";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "fa" : "en";
}

/** Parse a cookie header value for the locale cookie (pure; testable). */
export function localeFromCookieHeader(header: string | null): Locale | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const name = part.slice(0, eq).trim();
    if (name !== LOCALE_COOKIE) continue;
    const value = part.slice(eq + 1).trim();
    if (isLocale(value)) return value;
    return null;
  }
  return null;
}

/** Single source of truth for locale resolution: explicit value (client
 *  session) wins, then cookie, then the default. */
export function pickLocale(explicit: unknown, cookieHeader: string | null): Locale {
  if (isLocale(explicit)) return explicit;
  return localeFromCookieHeader(cookieHeader) ?? DEFAULT_LOCALE;
}
