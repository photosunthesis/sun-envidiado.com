<div align="center">
  <img src="public/android-chrome-512x512.png" alt="Site Icon" width="120">
</div>

A small personal site built with Astro and inspired by vim and terminal interfaces, with about, blog (RSS and email newsletter), work, and contact pages. Live at [sun-envidiado.com](https://sun-envidiado.com).

---

### Tech stack 🛠️

- Astro — prerendered pages with MDX for blog content
- Tailwind CSS v4 — utility-first styles (see `src/styles/global.css`)
- Cloudflare Workers — deployment and dynamic subscription endpoints via `@astrojs/cloudflare` and `wrangler`
- Resend — newsletter delivery (see `scripts/send-newsletter.ts`)
- `pnpm` — package management

### Quick start ⚡️

Use pnpm `11.1.2` and a Node.js version matching `^22.22.3 || ^24.16.0 || >=26.3.0`, as specified in `package.json`.

1. Install dependencies

    ```bash
    pnpm install
    ```

2. Run dev server (local preview)

    ```bash
    pnpm run dev
    # open http://localhost:4321
    ```

3. Build for production, or build and preview locally

    ```bash
    pnpm build
    ```

    For a local production preview, this command includes the build:

    ```bash
    pnpm preview
    ```

    Builds also generate `/resume.pdf` using Cloudflare Browser Rendering. Set the credentials described below to enable this; missing credentials skip PDF generation locally but fail the build in CI.

4. Deploy to Cloudflare

    ```bash
    pnpm deploy
    ```

This builds the site and deploys it using Wrangler. Authenticate Wrangler with your Cloudflare account and configure the subscription endpoint variables in the Worker's environment before deploying.

### Environment and newsletter setup

Copy `.env.example` to `.env` for the build and newsletter scripts, then fill in the variables needed for the features you use:

| Variable                             | Purpose                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`                     | Send subscription confirmations and newsletters through Resend                                             |
| `JWT_SECRET`                         | Sign and verify subscription confirmation tokens                                                           |
| `PUBLIC_SITE_URL`                    | Base URL for subscription links and newsletter publication checks; defaults to `https://sun-envidiado.com` |
| `BLOG_SEGMENT_ID`                    | Resend segment for blog subscribers and newsletter broadcasts                                              |
| `CLOUDFLARE_ACCOUNT_ID`              | Cloudflare account used for résumé PDF generation                                                          |
| `CLOUDFLARE_BROWSER_RENDERING_TOKEN` | API token for Cloudflare Browser Rendering                                                                 |

The subscription endpoints read the first four variables from Cloudflare Worker runtime bindings. Configure those separately from the `.env` values used by scripts.

`pnpm deploy` builds and deploys without running the newsletter script. Run `pnpm newsletter` before deploying to check local posts against the published `/api/blog-slugs.json` and schedule broadcasts for new posts 30 minutes later. `pnpm build:prod` runs that same newsletter check before building; it does not deploy.

Use `pnpm preview:emails` to preview the email templates locally.

### Project structure 🏗️

```
src/
├─ components/          # reusable UI components
├─ content/             # blog posts (MDX) and their assets
├─ content.config.ts    # content collection configuration
├─ emails/              # subscription and newsletter email templates
├─ layouts/
│   └─ BaseLayout.astro # shared site layout; résumé uses its own HTML layout
├─ pages/
│   ├─ index.astro      # homepage
│   ├─ blog/            # blog posts
│   ├─ work/            # work / projects and résumé
│   ├─ api/             # endpoints (e.g. subscription)
│   └─ ...              # about, contact, 404, rss, etc.
├─ styles/
│   └─ global.css       # Tailwind entry + global styles
└─ utils/               # utility functions

scripts/
├─ optimize-images.ts   # image optimization
├─ send-newsletter.ts   # newsletter dispatch (Resend)
├─ preview-emails.ts    # local email template previews
├─ resume-pdf.ts        # renders /resume.pdf via Cloudflare Browser Rendering
└─ bearblog-export.ts   # export posts for cross-posting to Bear Blog
```

### Cross-posting 🐻

Blog posts are also cross-posted to [sun-envidiado.bearblog.dev](https://sun-envidiado.bearblog.dev/). Use `scripts/bearblog-export.ts` to convert a post's Astro frontmatter and MDX body into Bear Blog's plaintext format:

```bash
pnpm tsx scripts/bearblog-export.ts <slug>
# output: bearblog-out/<slug>.txt — paste into Bear's editor
```

### License 🪪

This project is licensed under the [MIT License](LICENSE). Feel free to use this as inspiration for your own projects.
