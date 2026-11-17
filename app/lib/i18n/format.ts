import type { Locale } from "./config";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Locale-aware digits: Persian digits + Persian decimal mark in `fa`,
 *  Latin digits in `en`. Accepts numbers or digit strings. */
export function localeNum(locale: Locale, v: number | string): string {
  const s = typeof v === "number" ? String(v) : v;
  if (locale !== "fa") return s;
  return s.replace(/\d/g, (d) => FA_DIGITS[Number(d)]).replace(".", "٫");
}

/** Locale-aware long date. `fa` keeps the Persian calendar rendering the
 *  app has always used; `en` uses a long English date. */
export function localeDate(locale: Locale, d: Date): string {
  return d.toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
