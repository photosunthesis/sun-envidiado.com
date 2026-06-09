import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { Resend } from "resend";
import { fileURLToPath } from "url";
import { newPostEmail } from "../src/emails/new-post";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_SEGMENT_ID = process.env.BLOG_SEGMENT_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://sun-envidiado.com";
const BLOG_DIR = path.join(__dirname, "../src/content/blog");
const SLUGS_URL = `${SITE_URL}/api/blog-slugs.json`;

interface BlogMetadata {
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
}

async function getBlogMetadata(blogPath: string): Promise<BlogMetadata | null> {
  try {
    const indexPath = path.join(blogPath, "index.mdx");
    const content = await fs.readFile(indexPath, "utf-8");

    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;

    const frontmatter = frontmatterMatch[1];

    const titleMatch = frontmatter.match(/title:\s*("(.*)"|'(.*)')/);
    const title = titleMatch ? titleMatch[2] || titleMatch[3] : null;

    const descriptionMatch = frontmatter.match(
      /description:\s*("(.*)"|'(.*)')/,
    );
    const description = descriptionMatch
      ? descriptionMatch[2] || descriptionMatch[3]
      : null;

    const pubDateMatch = frontmatter.match(/pubDate:\s*("(.*)"|'(.*)')/);
    const pubDate = pubDateMatch ? pubDateMatch[2] || pubDateMatch[3] : null;

    const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/)?.[1];
    const tags = tagsMatch
      ? tagsMatch.split(",").map((tag) => tag.trim().replace(/["']/g, ""))
      : [];

    if (!title || !description || !pubDate) return null;

    return { title, description, pubDate, tags };
  } catch (error) {
    console.error(`Error reading blog metadata from ${blogPath}:`, error);
    return null;
  }
}

async function getPublishedSlugs(): Promise<Set<string> | null> {
  try {
    const res = await fetch(SLUGS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const slugs = (await res.json()) as string[];
    console.log(`✅ Found ${slugs.length} published posts.`);
    return new Set(slugs);
  } catch (error) {
    // If we can't see what's live, we can't tell what's new — better to send
    // nothing than to risk re-announcing every post.
    console.warn(`⚠️ Couldn't reach ${SLUGS_URL}: ${(error as Error).message}`);
    return null;
  }
}

async function getNewBlogs(
  publishedSlugs: Set<string>,
): Promise<Array<{ slug: string; metadata: BlogMetadata }>> {
  const blogDirs = await fs.readdir(BLOG_DIR);
  const newBlogs: Array<{ slug: string; metadata: BlogMetadata }> = [];

  console.log(`📂 Scanning local blog directory: ${BLOG_DIR}`);

  for (const dir of blogDirs) {
    if (dir.startsWith(".")) continue;

    const blogPath = path.join(BLOG_DIR, dir);

    try {
      const stats = await fs.stat(blogPath);
      if (!stats.isDirectory()) continue;
    } catch {
      continue;
    }

    if (publishedSlugs.has(dir)) {
      continue;
    }

    const metadata = await getBlogMetadata(blogPath);
    if (metadata) {
      newBlogs.push({ slug: dir, metadata });
    }
  }

  return newBlogs.sort(
    (a, b) =>
      new Date(a.metadata.pubDate).getTime() -
      new Date(b.metadata.pubDate).getTime(),
  );
}

async function sendNewsletter(blog: { slug: string; metadata: BlogMetadata }) {
  if (!RESEND_API_KEY || !BLOG_SEGMENT_ID) {
    console.warn(
      "⚠️ Missing RESEND_API_KEY or BLOG_SEGMENT_ID. Skipping email sending.",
    );
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  const baseUrl = SITE_URL.endsWith("/") ? SITE_URL.slice(0, -1) : SITE_URL;
  const blogUrl = `${baseUrl}/blog/${blog.slug}`;

  const emailHtml = newPostEmail({
    title: blog.metadata.title,
    description: blog.metadata.description,
    url: blogUrl,
  });

  console.log(`   ✉️ Sending email for: ${blog.metadata.title}`);

  const { data, error } = await resend.broadcasts.create({
    segmentId: BLOG_SEGMENT_ID!,
    from: `Sun Envidiado's Blogs <blogs@sun-envidiado.com>`,
    subject: `${blog.metadata.title} – Sun Envidiado`,
    html: emailHtml,
    name: blog.metadata.title,
    scheduledAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    send: true,
  });

  if (error) throw error;

  return data;
}

async function main() {
  console.log("🔍 Checking for new blog posts to announce...");

  if (SITE_URL.includes("localhost")) {
    console.log(
      "⚠️ SITE_URL contains localhost. Running in dry-run mode (no emails will be sent).",
    );
  }

  const publishedSlugs = await getPublishedSlugs();
  if (!publishedSlugs) {
    console.log("🚫 Can't tell what's already published. Skipping.");
    return;
  }

  const newBlogs = await getNewBlogs(publishedSlugs);

  if (newBlogs.length === 0) {
    console.log("✅ No new blogs found.");
    return;
  }

  console.log(`📧 Found ${newBlogs.length} new blog(s) to announce:\n`);

  for (const blog of newBlogs) {
    console.log(`   - ${blog.metadata.title} (${blog.slug})`);
  }

  if (SITE_URL.includes("localhost")) {
    console.log("\n🚫 Dry-run finished. No emails sent.");
    return;
  }

  console.log("\n📮 Sending newsletters...\n");

  for (const blog of newBlogs) {
    try {
      await sendNewsletter(blog);
      console.log(`   ✅ Sent: ${blog.slug}\n`);
    } catch (error) {
      console.error(`   ❌ Failed to send newsletter for ${blog.slug}:`, error);
    }
  }

  console.log("🎉 Newsletter check complete!");
}

main().catch(console.error);
