// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    sitemap(),
  ],
  site: 'https://bibliadobrasil.com',
  trailingSlash: 'always',
  redirects: {
    '/salmos': '/biblia/salmos/',
    '/sobre': '/',
    '/sobre/': '/',
    '/termos': '/politica-cookies/',
    '/termos/': '/politica-cookies/',
    '/temas/familia': '/temas/familia/',
  },
});
