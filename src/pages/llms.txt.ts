import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_CONFIG } from '../utils/seo';

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
  const siteUrl = context.site?.toString().replace(/\/+$/, '') || SITE_CONFIG.siteUrl;

  const lines: string[] = [
    `# ${SITE_CONFIG.siteName}`,
    `> ${SITE_CONFIG.defaultDescription}`,
    '',
    '## Blog posts',
  ];

  for (const post of posts) {
    lines.push(
      `- [${post.data.title}](${siteUrl}/blog/${post.id}): ${post.data.description}`,
    );
  }

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
