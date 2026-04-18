// @ts-check
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import purgecss from 'astro-purgecss';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://sun-envidiado.com',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  adapter: cloudflare({
    imageService: 'custom',
    prerenderEnvironment: 'node',
  }),
  integrations: [sitemap(), mdx(), purgecss()],
});