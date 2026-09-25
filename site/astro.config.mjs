// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Site estático: `npm run build` gera a pasta dist/, que vai para o Nginx do VPS.
export default defineConfig({
  site: 'https://somoscella.online',
  integrations: [sitemap()],
  build: { assets: 'assets' },
  devToolbar: { enabled: false },
});
