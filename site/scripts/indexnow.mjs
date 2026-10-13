/**
 * Avisa o Bing (e, por ele, o ChatGPT e o Copilot) das páginas do site, pelo protocolo IndexNow.
 * Sem isso o Bing descobre as mudanças sozinho, só que em dias ou semanas. O Google não usa IndexNow.
 *
 * Uso: depois de publicar (as páginas e o arquivo da chave precisam estar no ar):
 *   node scripts/indexnow.mjs            → só mostra o que seria enviado
 *   node scripts/indexnow.mjs --enviar   → envia de verdade
 * A chave não é segredo: o arquivo public/<chave>.txt, no ar, é o que prova que o site é nosso.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chave } = JSON.parse(readFileSync(path.join(raiz, 'src/lib/indexnow.json'), 'utf8'));
const site = 'https://somoscella.online';
const urls = [...readFileSync(path.join(raiz, 'dist/sitemap-0.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const corpo = { host: new URL(site).host, key: chave, keyLocation: `${site}/${chave}.txt`, urlList: urls };

console.log(`${urls.length} página(s):\n${urls.join('\n')}`);
const arquivo = await fetch(corpo.keyLocation).then((r) => (r.ok ? r.text() : null)).catch(() => null);
if (arquivo?.trim() !== chave) {
  console.error(`\nO arquivo da chave não está no ar (${corpo.keyLocation}). Publique antes de enviar.`);
  process.exit(1);
}
if (!process.argv.includes('--enviar')) {
  console.log('\nModo teste: nada foi enviado. Use --enviar para avisar o Bing.');
  process.exit(0);
}
const r = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(corpo),
});
// 200 e 202 = recebido; 422/403 = chave não confere com o arquivo no ar.
console.log(`\nIndexNow respondeu ${r.status} ${r.statusText}`);
process.exit(r.status === 200 || r.status === 202 ? 0 : 1);
