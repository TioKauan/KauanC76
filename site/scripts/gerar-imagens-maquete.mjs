/**
 * Gera as imagens prontas das maquetes (public/<página>/maquete*.webp) a partir da própria cena 3D:
 * condomínio, casa, comércio e empresa. Elas aparecem antes do 3D carregar e ficam no lugar dele em
 * aparelhos sem WebGL ou economizando dados.
 *
 * Uso: npm run build && npm run imagens-maquete [casa comercio ...]   (rode de novo quando uma maquete mudar)
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');
const paginas = process.argv.slice(2).length ? process.argv.slice(2) : ['condominio', 'casa', 'comercio', 'empresa'];
for (const p of paginas) if (!existsSync(path.join(dist, p, 'index.html'))) { console.error(`Rode npm run build antes (falta ${p}).`); process.exit(1); }

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
for (const pagina of paginas) {
  const saida = path.join(raiz, 'public', pagina);
  mkdirSync(saida, { recursive: true });
  for (const { nome, largura, altura, escala, celular } of [
    { nome: 'maquete.webp', largura: 1600, altura: 991, escala: 1, celular: false },
    { nome: 'maquete-celular.webp', largura: 390, altura: 929, escala: 2, celular: true },
  ]) {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: escala, isMobile: celular, hasTouch: celular, reducedMotion: 'reduce' });
    const aba = await contexto.newPage();
    await aba.goto(`http://127.0.0.1:${servidor.address().port}/${pagina}/`, { waitUntil: 'networkidle' });
    await aba.waitForFunction(() => Number(document.querySelector('[data-maquete]')?.dataset.quadros) > 1, null, { timeout: 120000 });
    const dados = await aba.evaluate(() => window.__maqueteImagem('image/webp', 0.82));
    const arquivo = path.join(saida, nome);
    writeFileSync(arquivo, Buffer.from(dados.split(',')[1], 'base64'));
    const tamanho = await aba.evaluate(() => { const c = document.querySelector('[data-maquete]'); return `${c.width}×${c.height}`; });
    console.log(`ok ${path.relative(raiz, arquivo)} (${tamanho}, ${(statSync(arquivo).size / 1024).toFixed(0)} KB)`);
    await contexto.close();
  }
}
await navegador.close();
servidor.close();
