// Usage: pnpm tsx scripts/bearblog-export.ts <slug>
// Reads src/content/blog/<slug>/index.{md,mdx}, converts the Astro frontmatter
// to Bear Blog's plaintext header format, rewrites relative blog links to
// absolute URLs, and writes bearblog-out/<slug>.txt for pasting into Bear's editor.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://sun-envidiado.com";
const CONTENT_DIR = "src/content/blog";
const OUT_DIR = "bearblog-out";

type Frontmatter = {
  title?: string;
  description?: string;
  pubDate?: string;
  tags?: string[];
  cover?: string;
};

function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("No frontmatter block found");
  const [, fmRaw, body] = match;
  const fm: Record<string, unknown> = {};
  for (const line of fmRaw.split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    const val = rawVal.trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      fm[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    } else {
      fm[key] = val.replace(/^['"]|['"]$/g, "");
    }
  }
  return { fm: fm as Frontmatter, body: body.trim() };
}

function transformBody(body: string): { body: string; warnings: string[] } {
  const warnings: string[] = [];
  let out = body;
  out = out.replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, "").trim();
  out = out.replace(/\]\((\/[^)]+)\)/g, `](${SITE}$1)`);
  if (/<[A-Z][A-Za-z0-9]*[\s/>]/.test(out)) {
    warnings.push("Body contains JSX-looking tags — review before pasting");
  }
  if (/^---\s*$/m.test(out)) {
    warnings.push("Body contains '---' horizontal rules — fine in markdown, but double-check rendering");
  }
  return { body: out, warnings };
}

function truncateAtWord(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen - 40 ? cut.slice(0, lastSpace) : cut) + "…";
}

async function fetchOgImage(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${SITE}/blog/${slug}`);
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: pnpm tsx scripts/bearblog-export.ts <slug>");
    process.exit(1);
  }

  const mdx = join(CONTENT_DIR, slug, "index.mdx");
  const md = join(CONTENT_DIR, slug, "index.md");
  const path = existsSync(mdx) ? mdx : existsSync(md) ? md : null;
  if (!path) {
    console.error(`No post found at ${mdx} or ${md}`);
    process.exit(1);
  }

  const raw = readFileSync(path, "utf-8");
  const { fm, body } = parseFrontmatter(raw);
  const { body: transformedBody, warnings } = transformBody(body);

  if (!fm.title || !fm.pubDate) {
    console.error("Post is missing required frontmatter (title, pubDate)");
    process.exit(1);
  }

  const publishedDate = new Date(fm.pubDate).toISOString().slice(0, 10);
  const tags = (fm.tags ?? []).join(", ");
  const rawDescription = (fm.description ?? "").replace(/\s+/g, " ").trim();
  const description = truncateAtWord(rawDescription, 200);
  if (description !== rawDescription) {
    warnings.push(
      `meta_description truncated ${rawDescription.length} → ${description.length} chars (Bear caps at 200)`,
    );
  }
  const ogImage = fm.cover ? await fetchOgImage(slug) : null;

  const headerLines = [
    `title: ${fm.title}`,
    `link: ${slug}`,
    `published_date: ${publishedDate}`,
    `canonical_url: ${SITE}/blog/${slug}`,
    description && `meta_description: ${description}`,
    tags && `tags: ${tags}`,
    ogImage
      ? `meta_image: ${ogImage}`
      : fm.cover && `# meta_image: TODO — grab og:image from ${SITE}/blog/${slug} once live`,
  ].filter(Boolean);

  const footer = `\n\n---\n\n*I'm Sun Envidiado, and if you wandered in from somewhere, my home is at [sun-envidiado.com](${SITE}).*`;
  const output = `${headerLines.join("\n")}\n___\n${transformedBody}${footer}\n`;

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const outFile = join(OUT_DIR, `${slug}.txt`);
  writeFileSync(outFile, output, "utf-8");

  console.log(`Wrote ${outFile}`);
  console.log("\nIn Bear's new-post editor at bearblog.dev/<your-blog>/dashboard/posts/new/:");
  console.log("  1. Copy the lines ABOVE the ___ → paste into the top header field");
  console.log("  2. Copy the lines BELOW the ___ → paste into the body textarea");
  console.log("  3. (Don't paste the ___ line itself anywhere.) Click Publish.");
  if (!ogImage && fm.cover) {
    console.log("  (cover image: live post not reachable — meta_image left as TODO)");
  }
  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

main();
