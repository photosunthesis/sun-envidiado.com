<div align="center">
  <img src="public/android-chrome-512x512.png" alt="Site Icon" width="120">
</div>

A small personal site built with Astro and inspired by vim and terminal interfaces, with about, blog (RSS and email newsletter), work, and contact pages. Live at [sun-envidiado.com](https://sun-envidiado.com).

---

### Tech stack 🛠️

- Astro — static site generator with MDX for blog content
- Tailwind CSS v4 — utility-first styles (see `src/styles/global.css`)
- Cloudflare — deploy target via `@astrojs/cloudflare` and `wrangler`
- Resend — newsletter delivery (see `scripts/send-newsletter.ts`)
- `pnpm` — package management

### Quick start ⚡️

1. Install dependencies

```bash
pnpm install
```

2. Run dev server (local preview)

```bash
pnpm run dev
# open http://localhost:4321
```

3. Build for production

```bash
pnpm build
pnpm preview
```

4. Deploy to Cloudflare

```bash
pnpm deploy
```

### Project structure 🏗️

```
src/
├─ components/          # reusable UI components
├─ content/             # blog posts (MDX) and content config
├─ layouts/
│   └─ BaseLayout.astro # all pages use this
├─ pages/
│   ├─ index.astro      # homepage
│   ├─ blog/            # blog posts
│   ├─ work/            # work / projects
│   ├─ api/             # endpoints (e.g. subscription)
│   └─ ...              # about, contact, 404, rss, etc.
├─ styles/
│   └─ global.css       # Tailwind entry + global styles
└─ utils/               # utility functions

scripts/
├─ optimize-images.ts   # image optimization
└─ send-newsletter.ts   # newsletter dispatch (Resend)
```

### License 🪪

This project is licensed under the [MIT License](LICENSE). Feel free to use this as inspiration for your own projects.
