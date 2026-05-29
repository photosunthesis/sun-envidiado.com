import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { SignJWT } from "jose";
import { Resend } from "resend";
import { confirmSubscriptionEmail } from "../../emails/confirm-subscription";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const JWT_SECRET = env.JWT_SECRET;
  const SITE_URL = env.PUBLIC_SITE_URL || "https://sun-envidiado.com";

  if (!RESEND_API_KEY || !JWT_SECRET) {
    return new Response(
      JSON.stringify({ message: "Server configuration error" }),
      { status: 500 },
    );
  }

  try {
    const { email } = await request.json<{ email?: string }>();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(
        JSON.stringify({ message: "Invalid email address" }),
        { status: 400 },
      );
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h") // Token valid for 24 hours
      .sign(secret);

    const verifyUrl = `${SITE_URL}/api/verify-blog-subscription?token=${token}`;

    const resend = new Resend(RESEND_API_KEY);

    // Send verification email
    const { error } = await resend.emails.send({
      from: `Sun Envidiado's Blogs <blogs@sun-envidiado.com>`,
      to: email,
      subject: `Confirm your subscription – Sun Envidiado's Blogs`,
      html: confirmSubscriptionEmail({ verifyUrl }),
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ message: "Failed to send verification email" }),
        {
          status: 500,
        },
      );
    }

    return new Response(
      JSON.stringify({ message: "Verification email sent" }),
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
