import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { jwtVerify } from "jose";
import { Resend } from "resend";

export const prerender = false;

export const GET: APIRoute = async ({ request, redirect }) => {
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const JWT_SECRET = env.JWT_SECRET;
  const BLOG_SEGMENT_ID = env.BLOG_SEGMENT_ID;

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) return new Response("Missing token", { status: 400 });

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const email = payload.email as string;

    const resend = new Resend(RESEND_API_KEY);

    const { data: contact, error: createContactError } =
      await resend.contacts.create({
        email: email,
        unsubscribed: false,
      });

    if (createContactError || !contact)
      throw new Error("Failed to create or update contact");

    const { error: segmentError } = await resend.contacts.segments.add({
      contactId: contact.id,
      segmentId: BLOG_SEGMENT_ID,
    });

    if (segmentError) throw new Error("Failed to add contact to segment");

    return redirect("/blog-subscription-success");
  } catch {
    return new Response("Something went wrong: ", { status: 500 });
  }
};
