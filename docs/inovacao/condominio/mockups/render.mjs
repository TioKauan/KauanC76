/**
 * Gera as imagens do mockup do Condomínio Evoluído em 3D.
 *
 * Uso (o Playwright e o Three.js vêm de site/node_modules):
 *   node ../docs/inovacao/condominio/mockups/render.mjs            (todas)
 *   node ../docs/inovacao/condominio/mockups/render.mjs geral      (só uma)
 *
 * O Three.js é servido do disco (site/node_modules/three ou THREE_DIR), no lugar da jsDelivr.
 * A imagem 07 usa o site gerado (site/dist): rode "npm run build" antes.
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const saida = path.resolve(aqui, '..', 'imagens');
const raizSite = path.resolve(aqui, '..', '..', '..', '..', 'site');
// O Playwright é o do site (site/node_modules), não precisa instalar nada aqui.
const { chromium } = createRequire(path.join(raizSite, 'package.json'))('playwright');
const pastaThree = process.env.THREE_DIR || path.join(raizSite, 'node_modules', 'three');
if (!existsSync(path.join(pastaThree, 'build', 'three.module.js'))) {
  console.error(`Three.js não encontrado em ${pastaThree}. Instale (npm i three@0.186.1) ou defina THREE_DIR.`);
  process.exit(1);
}
mkdirSync(saida, { recursive: true });
const pedidas = process.argv.slice(2);
const quer = (n) => pedidas.length === 0 || pedidas.includes(n);

const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png' };
const servir = (raiz) => createServer((req, res) => {
  let u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (u.endsWith('/')) u += 'index.html';
  const f = path.join(raiz, u);
  if (!f.startsWith(raiz) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
const iniciar = async (raiz) => { const s = servir(raiz); await new Promise((r) => s.listen(0, '127.0.0.1', r)); return { s, url: `http://127.0.0.1:${s.address().port}` }; };

const { s: servidor, url } = await iniciar(aqui);
const navegador = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

async function abrir(largura, altura, escala) {
  const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: escala });
  await contexto.route('https://cdn.jsdelivr.net/npm/three@0.186.1/**', (rota) => {
    const rel = new URL(rota.request().url()).pathname.replace('/npm/three@0.186.1/', '');
    const f = path.join(pastaThree, rel);
    if (!existsSync(f)) return rota.fulfill({ status: 404, body: '' });
    return rota.fulfill({ status: 200, contentType: 'text/javascript', body: readFileSync(f) });
  });
  const pagina = await contexto.newPage();
  pagina.on('pageerror', (e) => console.error('erro na página:', e.message));
  pagina.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  return { contexto, pagina };
}

async function capturar(estado, largura, altura, escala, arquivo) {
  const { contexto, pagina } = await abrir(largura, altura, escala);
  await pagina.goto(`${url}/pagina.html?estado=${estado}`);
  await pagina.waitForFunction(() => window.__pronto === true, null, { timeout: 180000 });
  await pagina.waitForTimeout(300);
  await pagina.screenshot({ path: arquivo, ...(arquivo.endsWith('.jpg') ? { type: 'jpeg', quality: 90 } : {}) });
  await contexto.close();
  console.log('ok', path.basename(arquivo));
}

const DESKTOP = [
  ['geral', '01-abertura'],
  ['cameras', '02-cameras-e-pontos-cegos'],
  ['acesso', '03-acesso-facial-e-interfonia'],
  ['energia', '04-e-se-faltar-energia'],
  ['projeto', '05-monte-a-proposta'],
];
for (const [estado, nome] of DESKTOP) if (quer(estado)) await capturar(estado, 1440, 900, 1.5, path.join(saida, `${nome}.jpg`));

// Celular: três telas lado a lado, em moldura de aparelho
if (quer('celular')) {
  const telas = [];
  const temporaria = mkdtempSync(path.join(tmpdir(), 'celular-'));
  for (const estado of ['geral', 'cameras', 'energia']) {
    const arq = path.join(temporaria, `${estado}.png`);
    await capturar(estado, 390, 844, 2, arq);
    telas.push(`data:image/png;base64,${readFileSync(arq).toString('base64')}`);
  }
  const { contexto, pagina } = await abrir(1440, 1040, 1.5);
  // Mesma origem do servidor local, para a fonte carregar.
  const composicao = `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: Manrope; src: url('${url}/assets/manrope-latin-wght-normal.woff2') format('woff2'); font-weight: 200 800; }
    body { margin: 0; background: radial-gradient(900px 600px at 50% 40%, #0b2644, transparent 70%), #01050b; font-family: Manrope, sans-serif; color: #f4f7fb; }
    .titulo { text-align: center; padding: 34px 0 6px; font-size: 30px; font-weight: 600; letter-spacing: -0.04em; }
    .sub { text-align: center; color: #a9b8c8; font-size: 16px; }
    .fones { display: flex; justify-content: center; gap: 48px; padding: 26px 0 40px; }
    .fone { width: 390px; height: 844px; border-radius: 54px; padding: 12px; background: linear-gradient(145deg, #2a3442, #0d131b); box-shadow: 0 40px 80px -20px #000, inset 0 0 0 1.5px #3b4757; position: relative; }
    .fone img { width: 100%; height: 100%; border-radius: 43px; display: block; object-fit: cover; }
    .ilha { position: absolute; left: 50%; top: 22px; transform: translateX(-50%); width: 110px; height: 30px; border-radius: 20px; background: #000; }
    .rot { text-align: center; margin-top: 14px; color: #a9b8c8; font-size: 15px; }
  </style></head><body>
    <div class="titulo">No celular</div>
    <div class="sub">A maquete fica no alto da tela; o texto e os botões rolam embaixo. A Sol fica na barra fixa.</div>
    <div class="fones">${telas.map((src, i) => `<div><div class="fone"><img src="${src}"><span class="ilha"></span></div><div class="rot">${['Abertura', 'Câmeras e pontos cegos', 'E se faltar energia?'][i]}</div></div>`).join('')}</div>
  </body></html>`;
  await pagina.route(`${url}/composicao-celular.html`, (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: composicao }));
  await pagina.goto(`${url}/composicao-celular.html`);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: path.join(saida, '06-celular.jpg'), fullPage: true, type: 'jpeg', quality: 90 });
  await contexto.close();
  rmSync(temporaria, { recursive: true, force: true });
  console.log('ok 06-celular.jpg');
}

// Onde entra o link na página inicial (site real, com o link desenhado por cima)
if (quer('inicial')) {
  const dist = path.join(raizSite, 'dist');
  if (!existsSync(path.join(dist, 'index.html'))) console.error('Sem site/dist: rode npm run build para gerar a imagem 07.');
  else {
    const { s, url: urlSite } = await iniciar(dist);
    const { contexto, pagina } = await abrir(1440, 900, 1.5);
    await pagina.goto(`${urlSite}/`, { waitUntil: 'networkidle' });
    await pagina.click('.ambientes .chip[data-ambiente="condominio"]');
    await pagina.evaluate(() => {
      const icone = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 9 5v10l-9 5-9-5V7Z"/><path d="m3 7 9 5 9-5"/><path d="M12 22V12"/></svg>';
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'mock-link';
      link.innerHTML = `${icone}<span><b>Para mais soluções, conheça o Condomínio Evoluído em 3D</b><small>Câmeras, acesso facial, interfonia, rede, nobreak e alarme</small></span>`;
      const estilo = document.createElement('style');
      estilo.textContent = `.mock-link{display:flex;gap:12px;align-items:center;margin-top:10px;padding:9px 14px;border-radius:14px;border:1px solid #6de9f6;background:#6de9f612;color:#e8fbfd;text-decoration:none;box-shadow:0 0 0 4px #6de9f61f, 0 0 30px -6px #6de9f688}
        .mock-link svg{color:#6de9f6;flex-shrink:0}.mock-link b{display:block;font-size:14px}.mock-link small{display:block;font-size:12.5px;color:#a9b8c8;margin-top:2px}
        .mock-seta{position:fixed;z-index:500;font:700 14px Manrope,sans-serif;color:#031017;background:#ffc233;padding:8px 12px;border-radius:10px;box-shadow:0 10px 30px #000a}`;
      document.head.append(estilo);
      document.querySelector('.ambientes').after(link);
      const r = link.getBoundingClientRect();
      const nota = document.createElement('div');
      nota.className = 'mock-seta';
      nota.textContent = 'Novo: aparece quando "Condomínio" está escolhido';
      nota.style.left = `${r.left}px`;
      nota.style.top = `${r.bottom + 12}px`;
      document.body.append(nota);
    });
    await pagina.waitForTimeout(1400);
    await pagina.screenshot({ path: path.join(saida, '07-link-na-pagina-inicial.jpg'), type: 'jpeg', quality: 90 });
    await contexto.close();
    s.close();
    console.log('ok 07-link-na-pagina-inicial.jpg');
  }
}

await navegador.close();
servidor.close();
