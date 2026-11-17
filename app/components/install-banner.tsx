"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/locale-context";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent);
}

export function InstallBanner() {
  const { t } = useI18n();
  const [deferred, setDeferred] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    if (isIOS()) {
      // No beforeinstallprompt on iOS — show manual hint every refresh
      const t = window.setTimeout(() => {
        setIosHint(true);
        setVisible(true);
      }, 0);
      return () => window.clearTimeout(t);
    }

    // Non-iOS: show banner on every refresh while not installed.
    // This satisfies "appear on all refreshes" even when Chrome throttles
    // the native prompt after a dismissal.
    const t = window.setTimeout(() => setVisible(true), 0);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setVisible(false);
      setDeferred(null);
    });

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (!visible) return null;

  // iOS manual install hint — appears on every refresh until installed
  if (iosHint) {
    return (
      <div className="flex items-center gap-3 border-b bg-card px-3 py-2.5 text-sm sm:px-4">
        <Download className="size-4 shrink-0 text-muted-foreground" />
        <p className="flex-1 leading-6">
          {t.install.iosPre}
          <span className="font-medium">{t.install.iosShare}</span>
          {t.install.iosMid}
          <span className="font-medium">{t.install.iosAdd}</span>
          {t.install.iosPost}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label={t.install.closeAria}
          onClick={() => setVisible(false)}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  // Android/desktop — banner appears on every refresh while not installed.
  // If Chrome supplied a deferred prompt we trigger it; otherwise we show
  // the manual fallback (⋮ → Install app) so the banner is never empty.
  return (
    <div className="flex items-center gap-2 border-b bg-card px-3 py-2.5 text-sm sm:gap-3 sm:px-4">
      <Download className="size-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 leading-6">{t.install.banner}</p>
      {deferred ? (
        <Button
          size="sm"
          className="h-8 shrink-0"
          onClick={async () => {
            await deferred.prompt();
            try {
              await deferred.userChoice;
            } catch {}
            // Hide for this session only — next refresh it reappears
            setVisible(false);
            setDeferred(null);
          }}
        >
          {t.install.button}
        </Button>
      ) : (
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
          {t.install.menuHint}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        aria-label={t.install.closeAria}
        onClick={() => setVisible(false)}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
