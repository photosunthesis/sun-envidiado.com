// @ts-check
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

/** @type {Record<string, { pubDate?: string; updatedDate?: string }> | null} */
let blogPostDates = null;
async function getBlogPostDates() {
  if (blogPostDates) return blogPostDates;
  const { default: fg } = await import("fast-glob");
  const { readFileSync } = await import("node:fs");
  blogPostDates = Object.fromEntries(
    fg.sync("src/content/blog/**/index.{md,mdx}").flatMap((file) => {
      const slug = file.match(/blog\/([^/]+)\/index\.(?:md|mdx)$/)?.[1];
      if (!slug) return [];
      const fm =
        readFileSync(file, "utf-8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ??
        "";
      const pubDate = fm
        .match(/^pubDate:\s*['"]?([^'"\n]+?)['"]?\s*$/m)?.[1]
        ?.trim();
      const updatedDate = fm
        .match(/^updatedDate:\s*['"]?([^'"\n]+?)['"]?\s*$/m)?.[1]
        ?.trim();
      return [[`/blog/${slug}`, { pubDate, updatedDate }]];
    }),
  );
  return blogPostDates;
}

// https://astro.build/config
export default defineConfig({
  site: "https://sun-envidiado.com",
  trailingSlash: "never",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  build: {
    format: "file",
  },
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
  },
  adapter: cloudflare({
    imageService: { build: "compile", runtime: "passthrough" },
    prerenderEnvironment: "node",
  }),
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-geist",
      weights: [400, 600],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      fallbacks: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Consolas",
        "monospace",
      ],
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.local(),
      name: "Aspekta",
      cssVariable: "--font-aspekta",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/Aspekta-600.woff2"],
            weight: 600,
            style: "normal",
          },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      // noindex pages stay out of the sitemap; the integration never reads
      // the robots meta, so they have to be listed here by name.
      filter: (page) =>
        !page.endsWith("/blog-subscription-success") &&
        !page.endsWith("/work/resume"),
      async serialize(item) {
        const pathname = new URL(item.url).pathname.replace(/\/$/, "");
        const dates = (await getBlogPostDates())[pathname];
        if (dates) {
          const lastmod = dates.updatedDate || dates.pubDate;
          if (lastmod) item.lastmod = new Date(lastmod).toISOString();
        }
        return item;
      },
    }),
    mdx(),
  ],
});
