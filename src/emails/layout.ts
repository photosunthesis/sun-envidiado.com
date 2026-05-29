import { emailTheme as t } from "./theme";

export interface EmailLayoutOptions {
  title: string;
  prompt: string;
  body: string;
  footer?: string;
}

// Full HTML document so the color-scheme meta can opt into the client's native
// dark mode. Templates supply only the prompt and body.
export function emailLayout({
  title,
  prompt,
  body,
  footer = "",
}: EmailLayoutOptions): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${title}</title>
  </head>
  <body style="margin: 0; background-color: ${t.bg};">
    <div style="background-color: ${t.bg}; padding: 32px 16px; font-family: ${t.fontStack};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
        <tr>
          <td style="padding: 0;">
            <p style="margin: 0 0 28px; font-size: 13px; color: ${t.dim};">${prompt}</p>

            ${body}

            <hr style="border: 0; border-top: 1px solid ${t.rule}; margin: 32px 0 24px;" />

            <p style="margin: 0 0 12px; font-size: 14px; color: ${t.strong};">Sun Envidiado</p>
            ${footer}
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 28px;">
              <tr>
                <td style="border: 1px solid ${t.rule}; border-radius: 4px; background-color: ${t.panel};">
                  <a href="${href}" style="display: inline-block; padding: 11px 22px; font-size: 14px; font-weight: 600; color: ${t.strong}; text-decoration: none;">${label}</a>
                </td>
              </tr>
            </table>`;
}

export function emailLinkFallback(url: string): string {
  return `<p style="margin: 0 0 4px; font-size: 13px; line-height: 1.7; color: ${t.dim};">
              Or paste this link into your browser:<br />
              <a href="${url}" style="color: ${t.dim}; text-decoration: underline;">${url}</a>
            </p>`;
}
