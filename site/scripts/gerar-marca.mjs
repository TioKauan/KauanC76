// Gera favicon, ícone da tela inicial e imagem de compartilhamento (Open Graph)
// a partir dos arquivos oficiais em scripts/marca/. Uso: node scripts/gerar-marca.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
// Arquivos embutidos como data URI (a página gerada não pode ler file:// direto).
const tipos = { png: 'image/png', webp: 'image/webp', woff2: 'font/woff2' };
const marca = (f) => `data:${tipos[f.split('.').pop()]};base64,${readFileSync(path.join(aqui, 'marca', f)).toString('base64')}`;
const saida = path.join(aqui, '..', 'public', 'marca');

const navegador = await chromium.launch();
const pagina = await navegador.newPage();

for (const [tamanho, nome] of [[64, 'favicon-64.png'], [180, 'icone-180.png']]) {
  await pagina.setViewportSize({ width: tamanho, height: tamanho });
  await pagina.setContent(`<body style="margin:0;background:#020710"><img src="${marca('sc-simbolo.png')}" style="width:${tamanho}px;height:${tamanho}px;display:block"></body>`);
  await pagina.waitForLoadState('networkidle');
  await pagina.screenshot({ path: path.join(saida, nome) });
}

await pagina.setViewportSize({ width: 1200, height: 630 });
await pagina.setContent(`<html><head><style>
@font-face{font-family:M;src:url('${marca('manrope-latin-wght-normal.woff2')}');font-weight:200 800}
body{margin:0;width:1200px;height:630px;background:radial-gradient(700px 400px at 80% 20%,#0b2a4a,transparent 70%),radial-gradient(500px 300px at 10% 100%,#ff6a0020,transparent 70%),#020710;font-family:M,sans-serif;color:#f4f7fb;display:flex;flex-direction:column;justify-content:center;padding:0 80px;box-sizing:border-box}
.logo{width:320px;height:120px;position:relative;overflow:hidden;margin-bottom:34px}.logo img{position:absolute;width:392px;left:-30px;top:-59px;mix-blend-mode:lighten}
h1{font-size:62px;line-height:1.05;letter-spacing:-.045em;margin:0;font-weight:600}
h1 span{background:linear-gradient(95deg,#6de9f6,#09a0f6);-webkit-background-clip:text;color:transparent}
p{font-size:26px;color:#a9b8c8;margin:24px 0 0}p b{color:#ffb070}
</style></head><body><div class="logo"><img src="${marca('sc-logo.webp')}"></div>
<h1>Tecnologia não deve apenas estar instalada.<br><span>Ela precisa funcionar.</span></h1>
<p>Locação de câmeras a partir de <b>R$ 49,90/mês</b> · somoscella.online</p></body></html>`);
await pagina.waitForLoadState('networkidle');
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: path.join(saida, 'og-imagem.png') });
await navegador.close();
console.log('Marca gerada em public/marca/');
