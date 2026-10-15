import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { confirmSubscriptionEmail } from "../src/emails/confirm-subscription";
import { newPostEmail } from "../src/emails/new-post";
import { emailTheme } from "../src/emails/theme";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../.preview");
const INDEX_FILE = path.join(OUT_DIR, "index.html");

const emails = [
  {
    slug: "new-post",
    label: "New post announcement",
    html: newPostEmail({
      title: "The first concert I ever went to",
      description:
        "I didn't know any of the songs, lost my friends in the crowd, and somehow still walked out changed. A few notes on going alone.",
      url: "https://sun-envidiado.com/blog/sample-post",
      unsubscribeUrl: "#",
    }),
  },
  {
    slug: "confirm-subscription",
    label: "Subscription confirmation",
    html: confirmSubscriptionEmail({ verifyUrl: "#" }),
  },
];

const section = (e: (typeof emails)[number]) => `
    <section class="email">
      <h2 class="title">${e.label}</h2>
      <div class="panes">
        <div class="pane">
          <p class="label">Light &mdash; as sent</p>
          <iframe src="${e.slug}-light.html" title="${e.label}, light"></iframe>
        </div>
        <div class="pane pane--dark">
          <p class="label">Dark mode</p>
          <iframe src="${e.slug}-dark.html" title="${e.label}, dark"></iframe>
        </div>
      </div>
    </section>`;

const index = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Email previews</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        background: #efefef;
        font-family: ${emailTheme.fontStack};
        color: #333;
      }
      .email { margin: 0 0 40px; }
      .title { font-size: 14px; margin: 0 0 12px; }
      .panes {
        display: grid;
        gap: 24px;
        grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      }
      .pane { display: flex; flex-direction: column; }
      .label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #777;
        margin: 0 0 8px;
      }
      iframe {
        width: 100%;
        height: 620px;
        border: 1px solid #ddd;
        border-radius: 6px;
        background: #fff;
      }
    </style>
  </head>
  <body>
    ${emails.map(section).join("\n")}
  </body>
</html>
`;

await fs.mkdir(OUT_DIR, { recursive: true });
await Promise.all([
  ...emails.flatMap((e) =>
    ["original", "light", "dark"].map((mode) =>
      fs.writeFile(
        path.join(
          OUT_DIR,
          `${e.slug}${mode === "original" ? "" : `-${mode}`}.html`,
        ),
        mode === "original"
          ? e.html
          : e.html.replace(
              "@media (prefers-color-scheme: dark)",
              mode === "dark" ? "@media all" : "@media not all",
            ),
        "utf-8",
      ),
    ),
  ),
  fs.writeFile(INDEX_FILE, index, "utf-8"),
]);

console.log(`✅ Wrote ${emails.length} email previews to ${INDEX_FILE}`);
console.log(`   file://${INDEX_FILE}`);

if (process.argv.includes("--open") || process.argv.includes("-o")) {
  const opener =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "explorer"
        : "xdg-open";
  execFile(opener, [INDEX_FILE], (err) => {
    if (err) console.warn(`Could not auto-open the browser: ${err.message}`);
  });
}
