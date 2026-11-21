<div align="center">
  <img src="public/android-chrome-512x512.png" alt="Site Icon" width="120">
</div>

A small personal site built with Astro and inspired by vim and terminal interfaces, with about, blog (RSS and email newsletter), work, and contact pages. Live at [sun-envidiado.com](https://sun-envidiado.com).

---

### What's in here 📦

- **Blog** — posts written in MDX, with an RSS feed and an email newsletter. Readers can subscribe with their email, confirm through a signed link, and get new posts in their inbox shortly after they go live. Images get blurry [ThumbHash](https://evanw.github.io/thumbhash/) placeholders while they load.
- **Work** — projects I've built and a résumé. The résumé is rendered as its own page and turned into a downloadable `/resume.pdf` at build time using Cloudflare Browser Rendering.
- **About & contact** — a bit about me and ways to reach me.
- **Extras** — a sitemap, `robots.txt`, and an `llms.txt` for AI crawlers.

### How it works ⚙️

Most pages are prerendered at build time, so the site is mostly static and fast. The only parts that run on request are the newsletter subscribe and confirm endpoints and `llms.txt`, all served by Cloudflare Workers. When a new post is published, a script compares local posts against what's already live and schedules a newsletter broadcast through Resend.

Blog posts are also cross-posted to [sun-envidiado.bearblog.dev](https://sun-envidiado.bearblog.dev/), with a small script that converts each post's MDX into Bear Blog's format.

### Built with 🛠️

- [Astro](https://astro.build) — site framework, with MDX, RSS, and sitemap integrations
- [Tailwind CSS](https://tailwindcss.com) v4 — styling
- [Cloudflare Workers](https://workers.cloudflare.com) — hosting and on-request routes, deployed with Wrangler
- [Resend](https://resend.com) — subscription confirmations and newsletter emails
- [jose](https://github.com/panva/jose) — signed tokens for subscription confirmation links
- [Sharp](https://sharp.pixelplumbing.com) and [ThumbHash](https://github.com/evanw/thumbhash) — image optimization and placeholders
- Geist, Geist Mono, and Aspekta — fonts

### Project layout 🏗️

```
src/
├─ assets/       # logo and local fonts
├─ components/   # UI components (status bar, newsletter form, SEO, etc.)
├─ content/      # blog posts (MDX) and their assets
├─ emails/       # subscription and new-post email templates
├─ layouts/      # shared page layout
├─ pages/        # routes, including API endpoints, RSS, robots.txt, and llms.txt
├─ styles/       # Tailwind entry and global styles
└─ utils/        # SEO, text, and image helpers

scripts/         # newsletter, résumé PDF, email previews, image optimization, Bear Blog export
```

### License 🪪

This project is licensed under the [MIT License](LICENSE). Feel free to use this as inspiration for your own projects.
