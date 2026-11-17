"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useI18n } from "@/lib/i18n/locale-context";

export default function Login() {
  const router = useRouter();
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(
          res.status === 429 ? t.login.errorRate : t.login.errorWrong,
        );
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError(t.login.errorNet);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <LocaleSwitcher />
      <Card size="sm" className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">{t.login.title}</CardTitle>
          <CardDescription>{t.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Input
              type="password"
              autoComplete="current-password"
              placeholder={t.login.placeholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
            {error && (
              <p className="text-xs leading-5 text-destructive">{error}</p>
            )}
            <Button type="submit" size="lg" disabled={busy || !password}>
              {busy ? t.login.busy : t.login.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
