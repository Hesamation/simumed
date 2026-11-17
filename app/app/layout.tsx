import type { Metadata, Viewport } from "next";
import { Vazirmatn, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { dir } from "@/lib/i18n/config";
import { dictFor } from "@/lib/i18n/dict";
import { serverLocale } from "@/lib/i18n/server";
import { RegisterSW } from "@/components/register-sw";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await serverLocale();
  const t = dictFor(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
    },
    appleWebApp: {
      capable: true,
      title: t.meta.appleTitle,
      statusBarStyle: "black-translucent",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#17809c" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1a1e" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await serverLocale();
  return (
    <html
      lang={locale}
      dir={dir(locale)}
      suppressHydrationWarning
      className={`${vazirmatn.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider initialLocale={locale}>
          <DirectionProvider direction={dir(locale)}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider delay={300}>{children}</TooltipProvider>
            </ThemeProvider>
          </DirectionProvider>
        </LocaleProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
