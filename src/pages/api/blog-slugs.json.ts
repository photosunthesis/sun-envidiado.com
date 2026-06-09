import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");
  const slugs = posts.map((post) => post.id);

  return new Response(JSON.stringify(slugs), {
    headers: { "content-type": "application/json" },
  });
};
