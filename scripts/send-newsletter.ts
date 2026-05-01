import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { Resend } from "resend";
import Parser from "rss-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_SEGMENT_ID = process.env.BLOG_SEGMENT_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://sun-envidiado.com";
const BLOG_DIR = path.join(__dirname, "../src/content/blog");
const RSS_URL = `${SITE_URL}/rss.xml`;

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

async function getPublishedBlogs(): Promise<Set<string>> {
  const parser = new Parser();
  const publishedSlugs = new Set<string>();

  try {
    console.log(`📡 Fetching RSS feed from ${RSS_URL}...`);
    const feed = await parser.parseURL(RSS_URL);

    for (const item of feed.items) {
      if (item.link) {
        const urlObj = new URL(item.link);
        const slug = urlObj.pathname.split("/").filter(Boolean).pop();
        if (slug) {
          publishedSlugs.add(slug);
        }
      }
    }
    console.log(`✅ Found ${publishedSlugs.size} published posts in RSS feed.`);
  } catch (error) {
    console.warn(
      `⚠️ Could not fetch or parse RSS feed (${RSS_URL}). Assuming this is a first deployment or feed is broken.`,
    );
    console.warn(`Details: ${(error as Error).message}`);
  }

  return publishedSlugs;
}

async function getNewBlogs(): Promise<
  Array<{ slug: string; metadata: BlogMetadata }>
> {
  const publishedSlugs = await getPublishedBlogs();
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

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222; max-width: 600px; padding: 20px; line-height: 1.6;">
      <p style="font-size: 16px; color: #333; margin-bottom: 24px;">
        I just published a new blog post!
      </p>
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #09090b;">${blog.metadata.title}</h3>
      <p style="font-size: 16px; color: #666; margin-bottom: 24px; font-style: italic; border-left: 2px solid #e4e4e7; padding-left: 16px;">
        "${blog.metadata.description}"
      </p>
      <div style="margin: 32px 0;">
        <a href="${blogUrl}" style="background-color: #09090b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 15px;">Read Full Article</a>
      </div>
      <p style="font-size: 14px; color: #666; margin-bottom: 24px;">
        Or copy and paste this link into your browser: <br>
        <a href="${blogUrl}" style="color: #666; text-decoration: underline;">${blogUrl}</a>
      </p>
      
      <div style="margin-top: 48px;">
        <p style="margin: 0; font-size: 16px; color: #333; font-weight: 600;">
          Sun Envidiado
        </p>
        <p style="margin: 16px 0 0; font-size: 13px; color: #a1a1aa;">
          If you'd like to stop receiving these emails, you can <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #a1a1aa; text-decoration: underline;">unsubscribe here</a>.
        </p>
      </div>
    </div>
  `;

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

  const newBlogs = await getNewBlogs();

  if (newBlogs.length === 0) {
    console.log("✅ No new blogs found (compared to RSS feed).");
    return;
  }

  console.log(
    `📧 Found ${newBlogs.length} new blog(s) that are not in the RSS feed:\n`,
  );

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
