"use client";

import { useI18n } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/** Visible EN | فارسی toggle. Switching is instant (no reload, session
 *  preserved); the choice is persisted to a cookie (server render parity)
 *  and localStorage. */
export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  const options: { value: Locale; label: string }[] = [
    { value: "en", label: t.localeSwitch.en },
    { value: "fa", label: t.localeSwitch.fa },
  ];

  return (
    <div
      role="group"
      aria-label={t.localeSwitch.aria}
      className={cn(
        "inline-flex items-center rounded-full border bg-card p-0.5 text-xs font-medium",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setLocale(o.value)}
          aria-pressed={locale === o.value}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors duration-150",
            locale === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
