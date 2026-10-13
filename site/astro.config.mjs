// @ts-check
import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * O @astrojs/sitemap gera sitemap-index.xml + sitemap-0.xml, mas o Search Console e o Bing sugerem
 * "sitemap.xml" e dão "não foi possível buscar" (404) nesse endereço. Depois do build, copia a lista
 * de páginas para /sitemap.xml: os dois endereços funcionam e têm sempre o mesmo conteúdo.
 */
function sitemapXml() {
  return {
    name: 'sc-sitemap-xml',
    hooks: {
      /** @param {{ dir: URL }} opcoes */
      'astro:build:done': ({ dir }) => {
        const pasta = fileURLToPath(dir);
        // Com mais de uma lista (sitemap-1.xml, acima de 45 mil páginas), o certo seria o índice.
        const origem = existsSync(`${pasta}/sitemap-1.xml`) ? 'sitemap-index.xml' : 'sitemap-0.xml';
        copyFileSync(`${pasta}/${origem}`, `${pasta}/sitemap.xml`);
      },
    },
  };
}

// Site estático: `npm run build` gera a pasta dist/, que vai para o Nginx do VPS.
export default defineConfig({
  site: 'https://somoscella.online',
  integrations: [sitemap(), sitemapXml()],
  build: { assets: 'assets' },
  devToolbar: { enabled: false },
});
