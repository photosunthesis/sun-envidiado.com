import { emailTheme as t } from "./theme";
import { emailButton, emailLayout, emailLinkFallback } from "./layout";

export interface ConfirmSubscriptionEmailData {
  verifyUrl: string;
}

export function confirmSubscriptionEmail({
  verifyUrl,
}: ConfirmSubscriptionEmailData): string {
  const body = `<p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: ${t.fg};">
              Hi there,
            </p>

            <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.7; color: ${t.fg};">
              Thanks for subscribing. To finalize everything just confirm your
              email address below &mdash; it helps me keep the list clean and
              secure.
            </p>

            ${emailButton(verifyUrl, "Confirm subscription &rarr;")}

            ${emailLinkFallback(verifyUrl)}

            <p style="margin: 28px 0 0; font-size: 13px; line-height: 1.7; color: ${t.dim};">
              If you didn't request this, you can safely ignore this email.
            </p>`;

  return emailLayout({
    title: "Confirm your subscription",
    prompt: "~/subscribe",
    body,
  });
}
