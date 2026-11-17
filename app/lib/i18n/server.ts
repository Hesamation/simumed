import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { DEFAULT_LOCALE } from "./config";

/** Locale for RSC/server components (layout metadata, manifest): the cookie
 *  set by the switcher; falls back to the default for fresh visitors. */
export async function serverLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
