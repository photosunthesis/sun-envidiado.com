import { emailDarkTheme as dark, emailTheme as t } from "./theme";

export interface EmailLayoutOptions {
  title: string;
  body: string;
  signoff: string;
  footer?: string;
}

export function emailLayout({
  title,
  body,
  signoff,
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
    <style>
      :root { color-scheme: light dark; supported-color-schemes: light dark; }
      @media (prefers-color-scheme: dark) {
        .email-bg { background-color: ${dark.bg} !important; }
        .email-fg { color: ${dark.fg} !important; }
        .email-muted { color: ${dark.muted} !important; }
        .email-dim { color: ${dark.dim} !important; }
        .email-strong { color: ${dark.strong} !important; }
        .email-panel { background-color: ${dark.panel} !important; }
        .email-rule { border-color: ${dark.rule} !important; }
      }
    </style>
  </head>
  <body class="email-bg email-fg" style="margin: 0; background-color: ${t.bg}; color: ${t.fg}; font-family: ${t.fontStack};">
    <div class="email-bg" style="background-color: ${t.bg}; padding: 32px 16px; font-family: ${t.fontStack};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
        <tr>
          <td style="padding: 0; font-family: ${t.fontStack};">
            ${body}

            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td height="36" style="height: 36px; font-size: 0; line-height: 36px;">&nbsp;</td></tr></table>

            <p class="email-fg" style="margin: 0 0 12px; font-size: 14px; color: ${t.fg};">${signoff}</p>
            <p class="email-strong" style="margin: 0 0 12px; font-size: 14px; color: ${t.strong};">Sun Envidiado</p>
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
                <td class="email-panel email-rule" style="border: 1px solid ${t.rule}; border-radius: 4px; background-color: ${t.panel};">
                  <a class="email-strong" href="${href}" style="display: inline-block; padding: 11px 22px; font-family: ${t.fontStack}; font-size: 14px; font-weight: 600; color: ${t.strong}; text-decoration: none;">${label}</a>
                </td>
              </tr>
            </table>`;
}

export function emailLinkFallback(url: string): string {
  return `<p class="email-dim" style="margin: 0 0 4px; font-size: 13px; line-height: 1.7; color: ${t.dim};">
              Or paste this link into your browser:<br />
              <a class="email-dim" href="${url}" style="color: ${t.dim}; text-decoration: underline;">${url}</a>
            </p>`;
}
