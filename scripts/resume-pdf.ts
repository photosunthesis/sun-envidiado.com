import "dotenv/config";
import fs from "fs/promises";
import path from "path";

const CLIENT_DIR = "dist/client";
const PAGE = path.join(CLIENT_DIR, "work/resume.html");
const OUT = path.join(CLIENT_DIR, "resume.pdf");

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_BROWSER_RENDERING_TOKEN;

if (!accountId || !token) {
  const message =
    "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_BROWSER_RENDERING_TOKEN are not set";
  if (process.env.CI) throw new Error(`resume-pdf: ${message}`);
  console.warn(`⚠️  resume-pdf: ${message}, skipping /resume.pdf`);
  process.exit(0);
}

async function selfContained(html: string): Promise<string> {
  const asset = (url: string) => fs.readFile(path.join(CLIENT_DIR, url));

  let out = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");

  for (const [tag, href] of out.matchAll(
    /<link rel="stylesheet" href="([^"]+)">/g,
  )) {
    const css = await asset(href);
    out = out.replace(tag, () => `<style>${css}</style>`);
  }

  for (const [ref, file] of out.matchAll(
    /url\(["']?(\/_astro\/[^"')]+\.woff2)["']?\)/g,
  )) {
    const data = (await asset(file)).toString("base64");
    out = out.replace(ref, () => `url(data:font/woff2;base64,${data})`);
  }

  return out.replace(
    "</body>",
    `<script>document.fonts.ready.then(() => document.documentElement.setAttribute("data-fonts-ready", ""))</script></body>`,
  );
}

const html = await selfContained(await fs.readFile(PAGE, "utf-8"));
console.log(
  `📄 Rendering ${PAGE} (${Math.round(html.length / 1024)} KB) with Browser Rendering...`,
);

const response = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/pdf`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      html,
      gotoOptions: { waitUntil: "networkidle0" },
      waitForSelector: { selector: "html[data-fonts-ready]" },
      pdfOptions: {
        preferCSSPageSize: true,
        printBackground: true,
        tagged: true,
      },
    }),
  },
);

if (
  !response.ok ||
  !response.headers.get("content-type")?.startsWith("application/pdf")
) {
  throw new Error(
    `resume-pdf: Browser Rendering responded ${response.status}: ${await response.text()}`,
  );
}

const pdf = Buffer.from(await response.arrayBuffer());
await fs.writeFile(OUT, pdf);
console.log(`✅ Wrote ${OUT} (${Math.round(pdf.byteLength / 1024)} KB)`);
