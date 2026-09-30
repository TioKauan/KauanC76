/**
 * Gera a imagem pronta da maquete do condomínio (public/condominio/*.webp) a partir da própria cena 3D.
 * Ela aparece antes do 3D carregar e fica no lugar dele em aparelhos sem WebGL ou economizando dados.
 *
 * Uso: npm run build && node scripts/gerar-imagem-condominio.mjs   (rode de novo quando a maquete mudar)
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');
const saida = path.join(raiz, 'public', 'condominio');
if (!existsSync(path.join(dist, 'condominio', 'index.html'))) { console.error('Rode npm run build antes.'); process.exit(1); }
mkdirSync(saida, { recursive: true });

const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png' };
const servidor = createServer((req, res) => {
  let u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (u.endsWith('/')) u += 'index.html';
  const f = path.join(dist, u);
  if (!f.startsWith(dist) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const navegador = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

// Tamanho da janela escolhido para o palco (altura da tela menos o cabeçalho) sair no tamanho da imagem.
for (const { nome, largura, altura, escala, celular } of [
  { nome: 'maquete.webp', largura: 1600, altura: 991, escala: 1, celular: false },
  { nome: 'maquete-celular.webp', largura: 390, altura: 848, escala: 2, celular: true },
]) {
  const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: escala, isMobile: celular, hasTouch: celular, reducedMotion: 'reduce' });
  const pagina = await contexto.newPage();
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/condominio/`, { waitUntil: 'networkidle' });
  await pagina.waitForFunction(() => Number(document.querySelector('[data-maquete]')?.dataset.quadros) > 2, null, { timeout: 120000 });
  const dados = await pagina.evaluate(() => window.__maqueteImagem('image/webp', 0.82));
  const arquivo = path.join(saida, nome);
  writeFileSync(arquivo, Buffer.from(dados.split(',')[1], 'base64'));
  const tamanho = await pagina.evaluate(() => { const c = document.querySelector('[data-maquete]'); return `${c.width}×${c.height}`; });
  console.log(`ok ${path.relative(raiz, arquivo)} (${tamanho}, ${(statSync(arquivo).size / 1024).toFixed(0)} KB)`);
  await contexto.close();
}
await navegador.close();
servidor.close();
