import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { confirmSubscriptionEmail } from "../src/emails/confirm-subscription";
import { newPostEmail } from "../src/emails/new-post";

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

// Right frame approximates a client's dark-mode auto-invert (see .pane--dark).
const section = (e: (typeof emails)[number]) => `
    <section class="email">
      <h2 class="title">${e.label}</h2>
      <div class="panes">
        <div class="pane">
          <p class="label">Light &mdash; as sent</p>
          <iframe src="${e.slug}.html" title="${e.label}, light"></iframe>
        </div>
        <div class="pane pane--dark">
          <p class="label">Dark mode &mdash; approximate auto-invert</p>
          <iframe src="${e.slug}.html" title="${e.label}, dark approximation"></iframe>
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
        font-family: ui-monospace, Menlo, Consolas, monospace;
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
      .pane--dark iframe {
        filter: invert(1) hue-rotate(180deg);
        background: #111;
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
  ...emails.map((e) =>
    fs.writeFile(path.join(OUT_DIR, `${e.slug}.html`), e.html, "utf-8"),
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
