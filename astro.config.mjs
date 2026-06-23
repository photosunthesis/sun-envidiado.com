// @ts-check
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

/** @returns {import('vite').Plugin} */
function thumbhashPlugin() {
  return {
    name: "vite-thumbhash",
    enforce: "pre",
    async load(id) {
      const [filePath, query] = id.split("?");
      if (query !== "thumbhash") return null;
      const { default: sharp } = await import("sharp");
      const { rgbaToThumbHash, thumbHashToRGBA } = await import("thumbhash");
      const { data, info } = await sharp(filePath)
        .resize(100, 100, { fit: "inside" })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const hash = rgbaToThumbHash(info.width, info.height, new Uint8Array(data));
      const { w, h, rgba } = thumbHashToRGBA(hash);
      const png = await sharp(Buffer.from(rgba), {
        raw: { width: w, height: h, channels: 4 },
      }).png().toBuffer();
      return `export default "data:image/png;base64,${png.toString("base64")}"`;
    },
  };
}

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
  vite: {
    plugins: [tailwindcss(), thumbhashPlugin()],
  },
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/blog-subscription-success"),
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
