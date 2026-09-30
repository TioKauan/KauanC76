import type { APIRoute } from 'astro';
import { empresa } from '../lib/dados';

/** robots.txt: libera o site inteiro para os buscadores e aponta o sitemap (gerado pelo @astrojs/sitemap). */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site ?? empresa.site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
