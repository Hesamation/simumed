import type { MetadataRoute } from "next";
import { dir } from "@/lib/i18n/config";
import { dictFor } from "@/lib/i18n/dict";
import { serverLocale } from "@/lib/i18n/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await serverLocale();
  const t = dictFor(locale);
  return {
    name: t.manifest.name,
    short_name: t.manifest.shortName,
    description: t.manifest.description,
    lang: locale,
    dir: dir(locale),
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f4f9f8",
    theme_color: "#17809c",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
