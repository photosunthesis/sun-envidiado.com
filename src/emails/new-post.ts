import { emailTheme as t } from "./theme";
import { emailButton, emailLayout, emailLinkFallback } from "./layout";

export interface NewPostEmailData {
  title: string;
  description: string;
  url: string;
  unsubscribeUrl?: string;
}

export function newPostEmail({
  title,
  description,
  url,
  unsubscribeUrl = "{{{RESEND_UNSUBSCRIBE_URL}}}",
}: NewPostEmailData): string {
  const body = `<p class="email-fg" style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: ${t.fg};">
              I just published a new blog post!
            </p>

            <h1 class="email-strong" style="margin: 0 0 16px; font-size: 20px; font-weight: 600; line-height: 1.4; color: ${t.strong};">${title}</h1>

            <p class="email-muted email-rule" style="margin: 0 0 28px; padding-left: 16px; border-left: 2px solid ${t.rule}; font-size: 15px; line-height: 1.7; color: ${t.muted};">
              ${description}
            </p>

            ${emailButton(url, "Read blog &rarr;")}

            ${emailLinkFallback(url)}`;

  const footer = `<p class="email-dim" style="margin: 36px 0 0; font-size: 12px; line-height: 1.6; color: ${t.dim};">
              If you'd like to stop receiving these emails, you can <a class="email-dim" href="${unsubscribeUrl}" style="color: ${t.dim}; text-decoration: underline;">unsubscribe here</a>.
            </p>`;

  return emailLayout({ title, body, signoff: "Until next time,", footer });
}
