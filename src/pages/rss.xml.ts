import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getCollection, render } from "astro:content";

export const GET: APIRoute = async (context) => {
  const renderers = await loadRenderers([getMDXRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const items = [];
  const siteUrl =
    context.site?.toString().replace(/\/+$/, "") || "https://sun-envidiado.com";

  for (const post of posts) {
    const { Content } = await render(post);
    const content = await container.renderToString(Content);

    const cleanContent = content
      .replace(/<picture[^>]*>/g, "")
      .replace(/<\/picture>/g, "")
      .replace(/<source[^>]*>/g, "")
      .replace(/src="\/([^"]+)"/g, `src="${siteUrl}/$1"`)
      .replace(/href="\/([^"]+)"/g, `href="${siteUrl}/$1"`)
      .replace(/srcset="\/([^"]+)"/g, `srcset="${siteUrl}/$1"`);

    items.push({
      ...post.data,
      link: `/blog/${post.id}`,
      content: cleanContent,
      pubDate: post.data.pubDate,
    });
  }

  return rss({
    title: "Sun Envidiado Blog",
    description:
      "Random thoughts from Sun about coding, gaming, life updates, and whatever else crosses my mind.",
    site: context.site?.toString() || "https://sun-envidiado.com",
    items,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<language>en-us</language><atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />`,
  });
};
