/**
 * Validador do site: confere a checklist de "pronto" de docs/inovacao/PLANO-EXECUCAO.md.
 *
 * Uso: npm run validar            (gera o build, testa e escreve o relatório)
 *      npm run validar -- --fotos (também tira fotos e monta a comparação com os mockups)
 *
 * Resultado: docs/inovacao/RELATORIO-VALIDACAO.md (+ fotos em docs/inovacao/site-final/).
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { planos, contato, empresa, formatarPreco } from '../src/lib/dados.ts';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raizSite = path.resolve(aqui, '..');
const dist = path.join(raizSite, 'dist');
const docs = path.resolve(raizSite, '..', 'docs', 'inovacao');
const comFotos = process.argv.includes('--fotos');

const resultados = [];
let grupoAtual = 'Geral';
const grupo = (nome) => { grupoAtual = nome; };
const conferir = (item, ok, detalhe = '') => {
  resultados.push({ grupo: grupoAtual, item, ok: Boolean(ok), detalhe });
  console.log(`${ok ? '✅' : '❌'} [${grupoAtual}] ${item}${detalhe ? ` — ${detalhe}` : ''}`);
};

/* ---------- 1. Build ---------- */
grupo('Geral');
let buildOk = true;
try {
  execSync('npx astro check && npx astro build', { cwd: raizSite, stdio: 'pipe', shell: true });
} catch (e) {
  buildOk = false;
  console.error(String(e.stdout || e));
}
conferir('Tipos conferidos (astro check) e build sem erro', buildOk);
if (!buildOk) process.exit(1);
let testes = '';
let testesOk = true;
try {
  testes = execSync('npx vitest run', { cwd: raizSite, stdio: 'pipe' }).toString();
} catch (e) {
  testesOk = false;
  testes = String(e.stdout || e);
}
const totalTestes = testes.match(/Tests\s+(\d+) passed/)?.[1];
conferir('Testes unitários das regras (Vitest) passam', testesOk && Boolean(totalTestes), totalTestes ? `${totalTestes} testes` : testes.slice(-200));

/* ---------- servidor estático do dist/ ---------- */
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/plain', '.xml': 'application/xml' };
const servidor = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let arquivo = path.join(dist, url === '/' ? 'index.html' : url);
  // Endereço de pasta (/privacidade/) serve o index.html dela, como o Nginx faz.
  if (existsSync(arquivo) && statSync(arquivo).isDirectory()) arquivo = path.join(arquivo, 'index.html');
  if (!arquivo.startsWith(dist) || !existsSync(arquivo) || statSync(arquivo).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': tipos[path.extname(arquivo)] || 'application/octet-stream' });
  res.end(readFileSync(arquivo));
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const endereco = `http://127.0.0.1:${servidor.address().port}/`;

const navegador = await chromium.launch();
const abrir = async (largura, extras = {}) => {
  const celular = largura <= 800;
  const contexto = await navegador.newContext({ viewport: { width: largura, height: celular ? 844 : 900 }, deviceScaleFactor: celular ? 2 : 1, hasTouch: celular, isMobile: celular && largura < 600, ...extras });
  const pagina = await contexto.newPage();
  const erros = [];
  const bytes = { total: 0, urls: new Set() };
  pagina.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pagina.on('pageerror', (e) => erros.push(String(e)));
  pagina.on('request', (r) => { if (r.url().startsWith(endereco)) bytes.urls.add(new URL(r.url()).pathname); });
  await pagina.goto(endereco, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  return { pagina, contexto, erros, bytes };
};
const rolarTudo = (pagina) => pagina.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 350) { scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 25)); }
  scrollTo({ top: 0, behavior: 'instant' });
});

/* ---------- 2. Geral ---------- */
{
  const { pagina, contexto, erros, bytes } = await abrir(1440);
  await rolarTudo(pagina);
  await pagina.waitForTimeout(400);
  const tamanhos = [...bytes.urls].map((u) => ({ u, t: statSync(path.join(dist, u === '/' ? 'index.html' : u)).size }));
  const soma = tamanhos.reduce((s, x) => s + x.t, 0);
  const maiores = tamanhos.sort((a, b) => b.t - a.t).slice(0, 3).map((x) => `${x.u} ${(x.t / 1024).toFixed(0)} KB`).join(', ');
  conferir('Peso total da página ≤ 500 KB (sem compactação)', soma <= 500 * 1024, `${(soma / 1024).toFixed(0)} KB em ${tamanhos.length} arquivos; maiores: ${maiores}`);

  const ancoras = await pagina.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1));
  const quebradas = await pagina.evaluate((lista) => lista.filter((h) => !document.querySelector(h)), [...new Set(ancoras)]);
  conferir('Todo link interno leva a uma seção que existe', quebradas.length === 0, quebradas.length ? `quebrados: ${quebradas.join(', ')}` : `${new Set(ancoras).size} destinos conferidos`);

  const whats = await pagina.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"]')].map((a) => a.href));
  const errados = whats.filter((h) => !h.startsWith(`https://wa.me/${'5549998325623'}?text=`) || new URL(h).searchParams.get('text').length < 20);
  conferir(`Todo WhatsApp usa wa.me/${contato.whatsapp} com mensagem preenchida`, whats.length > 0 && errados.length === 0, `${whats.length} links${errados.length ? `; errados: ${errados.slice(0, 3).join(' ')}` : ''}`);
  // Regra de 28/09/2026: o visitante sabe pelo desenho se vai para a equipe (WhatsApp) ou para a Sol (orbe).
  const semIcone = await pagina.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"]')]
    .filter((a) => !a.querySelector('use[href="#ic-whatsapp"]')).map((a) => a.textContent.trim().slice(0, 30)));
  conferir('Todo botão de WhatsApp mostra o ícone do WhatsApp', whats.length > 0 && semIcone.length === 0, semIcone.join(' | '));
  const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
  const textoTodo = await pagina.evaluate(() => document.body.innerText);
  conferir('Número antigo (46) 99113-8360 não aparece', !/99113.?8360|991138360/.test(html + textoTodo));
  // Identificação da empresa (Decreto 7.962/2013, art. 2º): CNPJ, cidade e e-mail visíveis.
  const rodape = await pagina.$eval('.rodape-empresa', (e) => e.innerText);
  conferir('Rodapé identifica a empresa (CNPJ, cidade, e-mail)',
    [empresa.cnpj, empresa.cidade, contato.email].every((t) => rodape.includes(t)));

  const precosValidos = new Set(planos.map((p) => formatarPreco(p.preco)));
  const achados = [...textoTodo.matchAll(/R\$\s?(\d{1,3},\d{2})/g)].map((m) => m[1]);
  const invalidos = achados.filter((v) => !precosValidos.has(v));
  conferir('Todo preço na página bate com dados.ts', achados.length > 0 && invalidos.length === 0, `${achados.length} preços encontrados${invalidos.length ? `; fora da tabela: ${invalidos.join(', ')}` : ''}`);

  const cores = await pagina.evaluate(() => { const c = getComputedStyle(document.documentElement); return ['--azul', '--ciano', '--laranja', '--fundo'].map((v) => c.getPropertyValue(v).trim().toLowerCase()); });
  conferir('Cores-base iguais às da logo', cores.join(' ') === '#09a0f6 #6de9f6 #ff6a00 #020710', cores.join(' '));

  const contraste = (a, b) => {
    const lum = (hex) => { const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const textos = await pagina.evaluate(() => { const c = getComputedStyle(document.documentElement); return ['--texto', '--texto-2', '--texto-3', '--fundo', '--cartao'].map((v) => c.getPropertyValue(v).trim()); });
  const [t1, t2, t3, fundo, cartao] = textos;
  const piores = [[t2, fundo], [t3, fundo], [t2, cartao], [t3, cartao]].map(([a, b]) => contraste(a, b));
  conferir('Contraste do texto secundário ≥ 4,5:1 (fundo e cartões)', Math.min(...piores) >= 4.5, `menor: ${Math.min(...piores).toFixed(2)}:1; texto principal ${contraste(t1, fundo).toFixed(1)}:1`);

  const semNome = await pagina.evaluate(() => [...document.querySelectorAll('a, button, [role="button"], [role="tab"], input, summary')]
    .filter((el) => el.offsetParent !== null || el.closest('svg'))
    .filter((el) => !(el.getAttribute('aria-label') || el.textContent.trim() || el.labels?.length || el.getAttribute('placeholder')))
    .map((el) => el.outerHTML.slice(0, 80)));
  conferir('Todo controle tem nome acessível', semNome.length === 0, semNome.slice(0, 2).join(' | '));
  const clicaveisFalsos = await pagina.evaluate(() => [...document.querySelectorAll('[role="button"]')].filter((el) => el.getAttribute('tabindex') !== '0').length);
  conferir('Controles funcionam no teclado (role=button tem tabindex)', clicaveisFalsos === 0);

  const repetidos = await pagina.evaluate(() => { const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))]; });
  conferir('Nenhum id repetido na página', repetidos.length === 0, repetidos.join(', '));
  conferir('Zero erros no console (computador)', erros.length === 0, erros.slice(0, 2).join(' | '));
  await contexto.close();
}

for (const largura of [360, 390, 768, 1024, 1440]) {
  const { pagina, contexto, erros } = await abrir(largura);
  await rolarTudo(pagina);
  const sobra = await pagina.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  conferir(`Sem rolagem horizontal em ${largura} px`, sobra <= 0, sobra > 0 ? `${sobra} px sobrando` : '');
  if (largura === 390) {
    conferir('Zero erros no console (celular)', erros.length === 0, erros.slice(0, 2).join(' | '));
    const pequenos = await pagina.evaluate(() => {
      const alvo = 'button, a.btn, [role="tab"], summary, .chip, label.opcao, .ese-opcao, .plano-simular, .ese-acao, .menu-botao, .rodape-nav a, .voltar-topo, .sugestao-ponto, .camera-ponto, .rodape-empresa a, .contato-email a';
      return [...document.querySelectorAll(alvo)]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[hidden]'); })
        .map((el) => { const r = el.getBoundingClientRect(); return { el: (el.className?.baseVal ?? el.className) || el.tagName, texto: el.textContent.trim().slice(0, 24), h: Math.round(r.height), w: Math.round(r.width) }; })
        .filter((x) => x.h < 44);
    });
    conferir('Celular: botões e controles com área de toque ≥ 44 px', pequenos.length === 0, pequenos.length ? pequenos.slice(0, 4).map((p) => `${p.el} "${p.texto}" ${p.w}×${p.h}`).join('; ') : '');
  }
  await contexto.close();
}

{
  const { pagina, contexto } = await abrir(1440, { reducedMotion: 'reduce' });
  await rolarTudo(pagina);
  await pagina.waitForTimeout(600);
  const infinitas = await pagina.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length);
  const escondidos = await pagina.evaluate(() => [...document.querySelectorAll('[data-revelar]')].filter((el) => getComputedStyle(el).opacity !== '1').length);
  conferir('"Reduzir movimento": nenhuma animação contínua roda', infinitas === 0, `${infinitas} animações contínuas`);
  conferir('"Reduzir movimento": todo conteúdo aparece sem animação', escondidos === 0, `${escondidos} blocos escondidos`);
  await contexto.close();
}

{
  const { pagina, contexto } = await abrir(1440, { javaScriptEnabled: false });
  const semJs = await pagina.evaluate(() => ({
    planos: document.querySelectorAll('.plano').length,
    duvidas: document.querySelectorAll('[data-pergunta]').length,
    escondidos: [...document.querySelectorAll('[data-revelar]')].filter((el) => getComputedStyle(el).opacity !== '1').length,
    enviar: document.querySelector('[data-config-enviar]').href,
    // O chat depende de JavaScript: sem ele, nem o botão da Sol aparece.
    solEscondida: document.querySelector('[data-sol]').hidden && [...document.querySelectorAll('[data-sol-abrir]')].every((b) => b.hidden && getComputedStyle(b).display === 'none'),
  }));
  conferir('Sem JavaScript o conteúdo aparece e os contatos funcionam', semJs.planos === 5 && semJs.duvidas === 7 && semJs.escondidos === 0 && semJs.enviar.includes('wa.me/') && semJs.solEscondida, JSON.stringify({ ...semJs, enviar: semJs.enviar.slice(0, 30) }));
  await contexto.close();
}

/* ---------- 3. Tela 1 ---------- */
{
  // Política de privacidade: exigida pela Meta para a API oficial do WhatsApp.
  const { pagina, contexto, erros } = await abrir(390);
  const temLink = await pagina.evaluate(() => Boolean(document.querySelector('.rodape a[href="/privacidade/"]')));
  await pagina.goto(`${endereco}privacidade/`, { waitUntil: 'networkidle' });
  const priv = await pagina.evaluate(() => ({
    titulo: document.querySelector('h1')?.textContent.trim(),
    secoes: document.querySelectorAll('main h2').length,
    sobra: document.documentElement.scrollWidth - innerWidth,
  }));
  conferir('Rodapé tem link para a Política de privacidade', temLink);
  conferir('/privacidade/ abre com as 9 seções, sem erro no console e sem rolagem lateral',
    priv.titulo === 'Política de privacidade' && priv.secoes === 9 && erros.length === 0 && priv.sobra <= 0,
    `${priv.secoes} seções; erros: ${erros.slice(0, 1).join('') || 0}; sobra ${priv.sobra} px`);
  await contexto.close();
}

grupo('Tela 1 · Abertura');
{
  const { pagina, contexto } = await abrir(1440);
  const ambientes = await pagina.$$eval('.ambientes .chip', (b) => b.map((x) => x.dataset.ambiente));
  let trocas = 0;
  for (const a of ambientes) {
    await pagina.click(`.ambientes .chip[data-ambiente="${a}"]`);
    const visivel = await pagina.$$eval('.cena-ambiente', (els) => els.filter((e) => !e.hidden).map((e) => e.dataset.ambiente));
    const rotulos = await pagina.$$eval(`.cena-ambiente[data-ambiente="${a}"] .rotulo`, (r) => r.length);
    if (visivel.length === 1 && visivel[0] === a && rotulos === 5) trocas++;
  }
  conferir('Os 4 ambientes trocam a cena e os rótulos', ambientes.length === 4 && trocas === 4, `${trocas}/4`);

  await pagina.click('.ambientes .chip[data-ambiente="casa"]');
  const titulos = new Set();
  for (const s of ['normal', 'energia', 'internet', 'visita']) {
    await pagina.click(`[data-situacao="${s}"]`);
    titulos.add(await pagina.textContent('[data-ese-titulo]'));
  }
  conferir('Os 4 cenários do "E se…?" mudam a cena e o texto', titulos.size === 4);
  await pagina.click('[data-situacao="energia"]');
  const antes = await pagina.$eval('.cena-ambiente[data-ambiente="casa"] .no[data-sistema="cameras"]', (n) => n.dataset.estado);
  await pagina.click('.ese-reserva');
  const depois = await pagina.$eval('.cena-ambiente[data-ambiente="casa"] .no[data-sistema="cameras"]', (n) => n.dataset.estado);
  conferir('Em "Faltou energia" o nobreak pode ser ligado', antes === 'off' && depois === 'reserva', `${antes} → ${depois}`);
  await contexto.close();

  for (const largura of [1440, 390]) {
    const { pagina: p, contexto: c } = await abrir(largura);
    // No computador: quadro de preço. No celular: botão "Ver planos a partir de R$ 49,90" acima da barra fixa.
    const topo = await p.evaluate((cel) => {
      const el = document.querySelector(cel ? '.abertura-acoes .btn-primario' : '.preco-chamada');
      const barra = document.querySelector('.barra-fixa').getBoundingClientRect();
      return { fim: el.getBoundingClientRect().bottom, alt: Math.round(cel ? barra.top : innerHeight), texto: el.innerText };
    }, largura < 800);
    conferir(`"A partir de R$ 49,90/mês" visível sem rolar em ${largura} px`, topo.fim <= topo.alt && topo.texto.includes('49,90'), `fim do bloco em ${Math.round(topo.fim)} de ${topo.alt} px`);
    await c.close();
  }
}

/* ---------- 4. Tela 2 ---------- */
grupo('Tela 2 · Planos');
{
  const { pagina, contexto } = await abrir(1440);
  const cartoes = await pagina.$$eval('.plano', (els) => els.map((e) => ({ n: Number(e.dataset.plano), cams: e.querySelectorAll('.camera-mini').length, texto: e.textContent, destaque: e.classList.contains('plano-destaque'), cta: e.querySelector('[data-plano-cta]').href })));
  const certos = cartoes.filter((c) => {
    const p = planos.find((x) => x.cameras === c.n);
    return p && c.cams === p.cameras && c.texto.includes(formatarPreco(p.preco)) && c.texto.includes(`${p.caboMetros} m`) && c.texto.includes(p.uso);
  });
  conferir('5 planos com preço, cabo e uso; mini-planta com exatamente N câmeras', cartoes.length === 5 && certos.length === 5, `${certos.length}/5`);
  const destaques = cartoes.filter((c) => c.destaque).map((c) => c.n);
  conferir('Destaque "Cobertura completa" só no plano de 4 câmeras', destaques.length === 1 && destaques[0] === 4 && cartoes.find((c) => c.n === 4).texto.includes('Cobertura completa'));
  const claro = await pagina.$eval('.tudo-claro', (e) => e.textContent);
  conferir('"Simples de contratar": assinatura eletrônica, taxa de instalação, mensalidades na ativação, pagamento',
    ['ZapSign', 'Taxa de instalação', 'ativação', 'PIX'].every((t) => claro.includes(t)));
  // Taxa de instalação = 1 mensalidade do plano, paga antecipadamente (Kauan, 25/09/2026).
  const taxas = cartoes.filter((c) => { const p = planos.find((x) => x.cameras === c.n); return c.texto.includes(`Instalação: R$ ${formatarPreco(p.preco)} (1 mensalidade)`); }).length;
  const gratis = (await pagina.evaluate(() => document.body.textContent)).match(/instalação (padrão )?(está )?inclu[sí]|sem investimento inicial|sem pagar antes/i);
  conferir('Cada plano mostra a taxa de instalação (1 mensalidade) e nada diz que a instalação é grátis', taxas === 5 && !gratis,
    `${taxas}/5${gratis ? `; achado: "${gratis[0]}"` : ''}`);
  // As condições contratuais ficam no contrato (25/09/2026); o site não repete prazo, multa etc.
  const contratuais = /prazo mínimo|24 meses|multa|IPCA|valor de reposição|desistência/i;
  const achadoContratual = (await pagina.evaluate(() => document.body.textContent)).match(contratuais);
  conferir('Condições contratuais ficam no contrato (sem prazo mínimo, multa ou cobranças extras no site)', !achadoContratual, achadoContratual ? `achado: "${achadoContratual[0]}"` : '');
  const ctas = cartoes.filter((c) => { const t = new URL(c.cta).searchParams.get('text'); const p = planos.find((x) => x.cameras === c.n); return t.includes(`${p.cameras} ${p.cameras > 1 ? 'câmeras' : 'câmera'}`) && t.includes(formatarPreco(p.preco)); });
  conferir('"Quero este plano" leva nome e valor do plano ao WhatsApp', ctas.length === 5, `${ctas.length}/5`);
  await pagina.click('#guia-redes');
  const aba = await pagina.evaluate(() => ({ redes: !document.getElementById('aba-redes').hidden, cameras: !document.getElementById('aba-cameras').hidden }));
  await pagina.focus('#guia-redes');
  await pagina.keyboard.press('ArrowRight');
  const teclado = await pagina.evaluate(() => document.activeElement.id);
  conferir('Abas de proposta funcionam (clique e setas do teclado)', aba.redes && !aba.cameras && teclado === 'guia-alarme');
  await contexto.close();
}

/* ---------- 5. Tela 3 ---------- */
grupo('Tela 3 · Configurador');
{
  const { pagina, contexto } = await abrir(1440);
  await pagina.locator('#monte').scrollIntoViewIfNeeded();
  const clicarPlanta = (x, y) => pagina.evaluate(([px, py]) => {
    const s = document.querySelector('[data-planta]'); const r = s.getBoundingClientRect(); const k = r.width / 818;
    s.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: r.left + px * k, clientY: r.top + py * k }));
  }, [x, y]);
  const rec = () => pagina.$eval('[data-recomendacao]', (e) => ({ tipo: e.dataset.tipo, plano: e.dataset.planoRecomendado, texto: e.textContent }));
  const nCameras = () => pagina.$$eval('[data-camada="cameras"] [data-cam]', (c) => c.length);

  await clicarPlanta(460, 150);
  const um = await nCameras();
  await pagina.click('[data-camada="cameras"] [data-cam]');
  const zero = await nCameras();
  conferir('Tocar na planta adiciona câmera; tocar na câmera remove', um === 1 && zero === 0);

  await pagina.focus('[data-camada="sugestoes"] [data-sug]');
  await pagina.keyboard.press('Enter');
  const peloTeclado = await nCameras();
  conferir('Pontos sugeridos funcionam no teclado', peloTeclado === 1);
  await pagina.click('[data-config-limpar]');

  const esperado = { 1: 'exato:1', 2: 'exato:2', 3: 'exato:3', 4: 'exato:4', 5: 'folga:8', 6: 'folga:8', 7: 'folga:8', 8: 'exato:8', 9: 'proposta:' };
  const pontos = [[460, 150], [520, 150], [230, 300], [300, 300], [650, 300], [700, 300], [420, 330], [520, 330], [240, 150]];
  const obtido = {};
  for (let i = 0; i < pontos.length; i++) {
    await clicarPlanta(...pontos[i]);
    const r = await rec();
    obtido[i + 1] = `${r.tipo}:${r.plano}`;
  }
  const errados = Object.entries(esperado).filter(([n, v]) => obtido[n] !== v);
  conferir('Plano calculado: 1-4 exato, 5-7 → 8 com proposta, 8 exato, 9+ proposta', errados.length === 0, errados.map(([n]) => `${n}→${obtido[n]}`).join(', '));

  await pagina.click('[data-config-limpar]');
  await pagina.click('[data-configurar="4"]', { force: true }).catch(() => pagina.evaluate(() => document.querySelector('[data-configurar="4"]').click()));
  const r4 = await rec();
  const excedeAntes = r4.texto.includes('Passa cerca');
  await clicarPlanta(460, 150);
  await pagina.click('[data-camada="cameras"] [data-cam]:last-of-type');
  const caboTexto = await pagina.$eval('.cabo-linha', (e) => e.textContent);
  for (const [x, y] of [[40, 40], [780, 40], [40, 440], [780, 440]]) await clicarPlanta(x, y);
  const r8 = await rec();
  conferir('Cabo estimado × incluso atualiza e avisa quando passa do limite', r4.tipo === 'exato' && !excedeAntes && /≈ \d+ m de 80 m/.test(caboTexto) && r8.texto.includes('Passa cerca'), caboTexto);

  await pagina.click('[data-recurso][value="nobreak"] ~ .caixinha');
  await pagina.click('[data-recurso][value="colorida"] ~ .caixinha');
  const msg = await pagina.$eval('[data-mensagem]', (e) => e.textContent);
  const href = await pagina.$eval('[data-config-enviar]', (e) => new URL(e.href).searchParams.get('text'));
  conferir('Mensagem leva ambiente, quantidade, pontos, plano, valor e recursos',
    msg === href && ['Ambiente: Casa', 'Câmeras: 8', 'Plano de 8 câmeras', '159,90', 'nobreak', 'imagem colorida à noite', 'entrada principal'].every((t) => msg.includes(t)), msg.replace(/\n/g, ' / ').slice(0, 160));

  await pagina.click('[data-config-ambiente="condominio"]');
  await pagina.click('[data-cond-sistema][value="facial"] ~ .caixinha');
  const cond = await rec();
  const msgCond = await pagina.$eval('[data-mensagem]', (e) => e.textContent);
  conferir('Condomínio vai para proposta personalizada', cond.tipo === 'proposta' && msgCond.includes('Condomínio Evoluído') && msgCond.includes('controle de acesso facial'));
  await contexto.close();
}

/* ---------- 6. Tela 4 ---------- */
grupo('Tela 4 · Como funciona');
{
  const { pagina, contexto } = await abrir(1440);
  const acesas = () => pagina.$$eval('.etapa', (e) => e.filter((x) => x.hasAttribute('data-acesa')).length);
  const inicio = await acesas();
  await pagina.evaluate(() => { const l = document.querySelector('[data-linha-tempo]'); scrollTo({ top: l.getBoundingClientRect().top + scrollY - 380, behavior: 'instant' }); });
  const sequencia = [];
  for (let i = 0; i < 6; i++) { await pagina.waitForTimeout(450); sequencia.push(await acesas()); }
  const crescente = sequencia.every((v, i) => i === 0 || v >= sequencia[i - 1]);
  conferir('Linha do tempo acende etapa por etapa', inicio === 0 && crescente && sequencia[0] < 5 && sequencia.at(-1) === 5, `${inicio} → ${sequencia.join(' → ')}`);
  const perguntas = await pagina.$$eval('[data-pergunta]', (p) => p.length);
  await pagina.fill('[data-busca]', 'posso ver pelo celular?');
  const visiveis = await pagina.$$eval('[data-pergunta]:not([hidden]) summary', (s) => s.map((x) => x.textContent.trim()));
  conferir('7 perguntas; a busca "celular" mostra a resposta certa', perguntas === 7 && visiveis[0]?.includes('pelo celular'), visiveis.join(' | '));
  await pagina.fill('[data-busca]', 'xyzabc');
  const semResultado = await pagina.$eval('[data-sem-resultado]', (e) => !e.hidden);
  conferir('Busca sem resultado oferece perguntar pelo WhatsApp', semResultado);
  const cliente = await pagina.$eval('.cliente', (e) => e.textContent);
  conferir('Área do cliente identificada como exemplo ("em breve")', /em breve/i.test(cliente) && /exemplo/i.test(cliente));
  await contexto.close();
}

/* ---------- 7. Tela 5 ---------- */
grupo('Tela 5 · Celular');
{
  const { pagina, contexto } = await abrir(390);
  const trilho = await pagina.$eval('.planos-trilho', (t) => ({ snap: getComputedStyle(t).scrollSnapType, rola: t.scrollWidth > t.clientWidth }));
  const pontosAntes = await pagina.$eval('[data-ir-plano][aria-current="true"]', (b) => b.dataset.irPlano);
  await pagina.evaluate(() => { const t = document.querySelector('.planos-trilho'); t.scrollIntoView({ block: 'center', behavior: 'instant' }); t.scrollBy({ left: 330, behavior: 'instant' }); });
  await pagina.waitForTimeout(600);
  const pontosDepois = await pagina.$eval('[data-ir-plano][aria-current="true"]', (b) => b.dataset.irPlano);
  conferir('Planos em carrossel com encaixe e indicador que acompanha', trilho.snap.includes('mandatory') && trilho.rola && pontosAntes === '4' && pontosDepois === '8', `${trilho.snap}; indicador ${pontosAntes} → ${pontosDepois}`);

  const modo = () => pagina.$eval('.barra-fixa', (b) => `${b.dataset.modo}${b.hasAttribute('data-escondida') ? ' (escondida)' : ''}`);
  const irPara = async (sel) => { await pagina.evaluate((s) => { const el = document.querySelector(s); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 200, behavior: 'instant' }); }, sel); await pagina.waitForTimeout(350); };
  await pagina.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await pagina.waitForTimeout(350);
  const modos = [await modo()];
  await irPara('.planos-trilho'); modos.push(await modo());
  await irPara('.config-planta'); modos.push(await modo());
  await irPara('.contato-caixa'); modos.push(await modo());
  conferir('Barra fixa muda conforme a seção', modos.join(',') === 'contato,plano,configurador,contato (escondida)', modos.join(' → '));

  await pagina.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await pagina.click('.menu-botao');
  const aberto = await pagina.$eval('#menu-celular', (m) => !m.hidden);
  await pagina.keyboard.press('Escape');
  const fechado = await pagina.$eval('#menu-celular', (m) => m.hidden);
  conferir('Menu do celular abre e fecha (também com Esc)', aberto && fechado);
  await contexto.close();
}

/* ---------- 8. Sol (chat do site) ---------- */
// O n8n não é chamado: as respostas são simuladas no próprio navegador (page.route),
// no mesmo formato do fluxo "SomosCella - Sol no Site". Desde 28/09/2026 a Sol é um
// agente de captura de lead: o site pergunta nome, WhatsApp, cidade e o que a pessoa
// procura (sem IA), manda o lead e só então a conversa com a Sol começa.
grupo('Sol · chat do site');
{
  const simular = async (pagina, pedidos) => pagina.route('**/webhook/sol-site', async (rota) => {
    const corpo = JSON.parse(rota.request().postData() || '{}');
    pedidos.push(corpo);
    const m = String(corpo.mensagem || '');
    const conversa = (resposta, extra = {}) => ({ ok: true, modo: 'conversa', resposta, cartoes: [], opcoes: [], acoes: [], ...extra });
    let status = 200;
    let r;
    if (corpo.tipo === 'lead') r = { ok: true, status: 200, lead_ok: true };
    else if (/erro/.test(m)) r = null;
    else if (/sumiu/.test(m)) { status = 403; r = { ok: false, status: 403, motivo: 'sem_lead', resposta: 'Para conversar comigo, preciso antes do seu nome e WhatsApp.', cartoes: [], opcoes: [], acoes: ['whatsapp'] }; }
    else if (corpo.plano) r = conversa('Combinado, Ana! A equipe vai te chamar no WhatsApp para combinar a vistoria.', { modo: 'contratar' });
    else if (/html/.test(m)) r = conversa('<img src=x onerror="window.__xss=1">Oi');
    else if (/^Procuro/.test(m)) r = conversa('Ana, é para casa ou para comércio?', { opcoes: ['Casa', 'Comércio'] });
    else r = conversa('O plano de 4 câmeras sai *R$ 99,90* por mês.', { cartoes: [{ tipo: 'plano', cameras: 4 }, { tipo: 'plano', cameras: 7 }], opcoes: ['Quero este plano', 'Tenho uma dúvida'] });
    if (!r) return rota.abort();
    await rota.fulfill({ status, contentType: 'application/json', body: JSON.stringify(r) });
  });
  const esperarSol = async (pagina) => {
    await pagina.waitForFunction(() => !document.querySelector('[data-sol][data-esperando]'));
    await pagina.waitForTimeout(700);
  };
  const falar = async (pagina, texto, esperar) => {
    await pagina.fill('#sol-campo', texto);
    await pagina.press('#sol-campo', 'Enter');
    if (esperar) await pagina.waitForSelector(esperar, { timeout: 8000 });
    await esperarSol(pagina);
  };
  const tocar = async (pagina, texto) => {
    await pagina.click(`.sol-rapidas .sol-chip:text-is("${texto}")`);
    await esperarSol(pagina);
  };
  const tela = (pagina) => pagina.evaluate(() => {
    const falas = [...document.querySelectorAll('.sol-msg-sol:not(.sol-digitando) .sol-msg-corpo')].map((m) => m.textContent);
    const minhas = [...document.querySelectorAll('.sol-msg-eu .sol-msg-corpo')].map((m) => m.textContent);
    const campo = document.querySelector('#sol-campo');
    const aviso = document.querySelector('[data-sol-aviso]');
    const escape = document.querySelector('.sol-rapidas .sol-chip-whats');
    return {
      ultimaSol: falas.at(-1) ?? '',
      falas: falas.length,
      minhas,
      chips: [...document.querySelectorAll('.sol-rapidas button.sol-chip')].map((c) => c.textContent),
      escape: escape ? { texto: escape.textContent.trim(), href: escape.href, icone: Boolean(escape.querySelector('use[href="#ic-whatsapp"]')) } : null,
      aviso: aviso.hidden ? '' : aviso.textContent.replace(/\s+/g, ' ').trim(),
      avisoLink: aviso.querySelector('a')?.getAttribute('href') ?? '',
      teclado: campo.inputMode,
      dica: campo.placeholder,
      rotulo: document.querySelector('[data-sol-rotulo]').textContent,
    };
  });
  /** O roteiro inteiro, do jeito mais curto: nome, WhatsApp, cidade (botão) e o que procura (botão). */
  const capturar = async (pagina) => {
    await falar(pagina, 'Ana Paula');
    await falar(pagina, '46991234567');
    await tocar(pagina, 'Francisco Beltrão');
    await tocar(pagina, 'Câmeras');
  };

  const pedidos = [];
  const { pagina, contexto, erros } = await abrir(1440);
  await simular(pagina, pedidos);
  await pagina.waitForSelector('.sol[data-chegou] .sol-lancador', { timeout: 4000 });
  await pagina.click('.sol-lancador');
  await pagina.waitForSelector('.sol-painel.sol-painel-visivel');
  await pagina.waitForTimeout(500);
  const t0 = await tela(pagina);
  conferir('Chat abre com a Sol pedindo o nome e o WhatsApp da equipe à mão (nada vai ao servidor ainda)',
    t0.ultimaSol.includes('assistente virtual') && t0.ultimaSol.endsWith('como posso te chamar?') && t0.chips.length === 0
      && t0.escape?.texto === 'Prefiro falar no WhatsApp' && t0.escape.icone && t0.escape.href.startsWith(`https://wa.me/${contato.whatsapp}?text=`)
      && t0.dica === 'Seu nome' && pedidos.length === 0,
    JSON.stringify({ escape: t0.escape?.texto, dica: t0.dica, pedidos: pedidos.length }));

  await falar(pagina, 'Ana Paula');
  const t1 = await tela(pagina);
  conferir('Depois do nome, pede o WhatsApp com teclado numérico e o aviso de autorização com a política',
    t1.ultimaSol.startsWith('Prazer, Ana!') && /WhatsApp com DDD/.test(t1.ultimaSol) && t1.teclado === 'numeric'
      && /autoriza a SC Soluções a te chamar no WhatsApp/.test(t1.aviso) && t1.avisoLink === '/privacidade/' && t1.escape !== null,
    JSON.stringify({ teclado: t1.teclado, aviso: t1.aviso.slice(0, 40) }));

  await falar(pagina, '46999999999');
  const erroTel = (await tela(pagina)).ultimaSol;
  await pagina.fill('#sol-campo', '46991234567');
  const mascara = await pagina.$eval('#sol-campo', (e) => e.value);
  await pagina.press('#sol-campo', 'Enter');
  await esperarSol(pagina);
  const t2 = await tela(pagina);
  conferir('WhatsApp é conferido antes de seguir, ganha a máscara e nada vai ao servidor',
    /Confira o número/.test(erroTel) && mascara === '(46) 99123-4567' && t2.minhas.at(-1) === '(46) 99123-4567' && pedidos.length === 0,
    `máscara ${mascara}`);
  conferir('Cidade com um toque (a da loja) e o aviso some',
    t2.ultimaSol === 'E qual é a sua cidade?' && t2.chips.join('|') === 'Francisco Beltrão' && t2.aviso === '' && t2.teclado === 'text');

  await tocar(pagina, 'Francisco Beltrão');
  const t3 = await tela(pagina);
  conferir('O que a pessoa procura: 5 botões e o WhatsApp da equipe',
    t3.ultimaSol === 'O que você está procurando?' && t3.chips.join('|') === 'Câmeras|Alarme|Controle de acesso|Redes e Wi-Fi|Outro' && t3.escape !== null,
    t3.chips.join(', '));

  await tocar(pagina, 'Câmeras');
  await pagina.waitForFunction(() => [...document.querySelectorAll('.sol-msg-sol .sol-msg-corpo')].some((m) => m.textContent.includes('casa ou para comércio')), null, { timeout: 8000 });
  await esperarSol(pagina);
  const t4 = await tela(pagina);
  const [lead, primeira] = pedidos;
  // A origem da visita vai junto (src/lib/origem.ts); aqui a página abriu direto, sem utm.
  const { origem, ...dadosLead } = lead?.lead ?? {};
  conferir('Roteiro completo vai como lead (dados só com dígitos e autorização, e a origem da visita) e a Sol entra com o que a pessoa procura',
    pedidos.length === 2 && lead.tipo === 'lead' && /^[0-9a-f-]{36}$/.test(lead.sessao ?? '')
      && JSON.stringify(dadosLead) === JSON.stringify({ nome: 'Ana Paula', whatsapp: '46991234567', cidade: 'Francisco Beltrão', interesse: 'Câmeras', aceite: true })
      && origem?.canal === 'direto' && origem?.pagina === '/' && !Number.isNaN(Date.parse(origem?.em ?? ''))
      && primeira.tipo === 'mensagem' && primeira.sessao === lead.sessao && primeira.mensagem === 'Procuro câmeras'
      && !t4.minhas.includes('Procuro câmeras') && t4.chips.join('|') === 'Casa|Comércio' && t4.escape === null && t4.dica === 'Escreva sua mensagem…',
    JSON.stringify(pedidos.map((p) => p.tipo)));

  await falar(pagina, 'quanto custa 4 câmeras?', '.sol-plano');
  const conversa = await pagina.evaluate(() => ({
    cartoes: [...document.querySelectorAll('.sol-plano')].map((c) => c.textContent),
    negrito: [...document.querySelectorAll('.sol-msg-sol strong')].map((s) => s.textContent),
    chips: [...document.querySelectorAll('.sol-chip')].map((c) => c.textContent),
    ver: document.querySelector('.sol-plano a[href="#plano-4"]') !== null,
  }));
  const p4 = planos.find((p) => p.cameras === 4);
  conferir('Mensagem vai ao n8n com a sessão e volta com texto, cartão do plano e botões rápidos',
    pedidos.at(-1)?.tipo === 'mensagem' && conversa.cartoes.length === 1 && conversa.negrito.includes('R$ 99,90')
      && conversa.chips.join('|') === 'Quero este plano|Tenho uma dúvida' && conversa.ver,
    `${conversa.cartoes.length} cartão (o de 7 câmeras, que não existe, foi descartado); botões: ${conversa.chips.join(', ')}`);
  conferir('Cartão do plano no chat usa preço, taxa de instalação e cabo de dados.ts',
    conversa.cartoes[0]?.includes(formatarPreco(p4.preco)) && conversa.cartoes[0]?.includes(`Instalação: R$ ${formatarPreco(p4.preco)} (1 mensalidade)`)
      && conversa.cartoes[0]?.includes(`${p4.caboMetros} m de cabo`) && conversa.cartoes[0]?.includes('Cobertura completa'));

  // O botão rápido "Quero este plano" vai com o plano do último cartão.
  await tocar(pagina, 'Quero este plano');
  await pagina.waitForSelector('.sol-avisado', { timeout: 8000 });
  const escolha = pedidos.at(-1) ?? {};
  const avisado = await pagina.$eval('.sol-avisado', (e) => e.textContent);
  conferir('"Quero este plano" vai com o plano do cartão e o chat mostra que a equipe foi avisada, com o número',
    escolha.plano === 4 && escolha.mensagem === 'Quero este plano' && avisado.includes('Pedido enviado à equipe') && avisado.includes('(46) 99123-4567'),
    JSON.stringify({ plano: escolha.plano, mensagem: escolha.mensagem }));
  await pagina.click('.sol-plano [data-sol-quero="4"]');
  await esperarSol(pagina);
  const doCartao = pedidos.at(-1) ?? {};
  conferir('O botão do cartão também manda o plano', doCartao.plano === 4 && doCartao.mensagem === 'Quero o plano de 4 câmeras.');

  await falar(pagina, 'html');
  const xss = await pagina.evaluate(() => ({ img: document.querySelectorAll('.sol-conversa img').length, executou: Boolean(window.__xss) }));
  conferir('Texto do servidor nunca vira HTML no chat', xss.img === 0 && !xss.executou);

  await falar(pagina, 'erro', '.sol-whats');
  const falha = await pagina.evaluate(() => ({ texto: [...document.querySelectorAll('.sol-msg-sol')].at(-1)?.textContent ?? '', whats: [...document.querySelectorAll('.sol-whats')].at(-1)?.href ?? '' }));
  conferir('Sem conexão com a Sol: aviso e botão do WhatsApp da equipe', falha.texto.includes('Não consegui') && falha.whats.startsWith(`https://wa.me/${contato.whatsapp}?text=`));

  const textoChat = await pagina.$eval('.sol-painel', (e) => e.innerText);
  const precosValidos = new Set(planos.map((p) => formatarPreco(p.preco)));
  const precosChat = [...textoChat.matchAll(/R\$\s?(\d{1,3},\d{2})/g)].map((m) => m[1]);
  conferir('Todo preço no chat bate com dados.ts', precosChat.length > 0 && precosChat.every((v) => precosValidos.has(v)), `${precosChat.length} preços`);

  await pagina.keyboard.press('Escape');
  await pagina.waitForTimeout(400);
  const fechado = await pagina.evaluate(() => ({ painel: document.querySelector('.sol-painel').hidden, foco: document.activeElement?.matches('.sol-lancador') }));
  const mensagens = await pagina.$$eval('.sol-conversa .sol-msg', (m) => m.length);
  await pagina.reload({ waitUntil: 'networkidle' });
  await pagina.click('.sol-lancador');
  await pagina.waitForSelector('.sol-painel.sol-painel-visivel');
  const depois = await pagina.$$eval('.sol-conversa .sol-msg', (m) => m.length);
  const tRecarga = await tela(pagina);
  const avisadosDepois = await pagina.$$eval('.sol-avisado', (a) => a.length);
  conferir('Esc fecha o chat (foco volta ao botão) e a conversa continua depois de recarregar, sem repetir o roteiro',
    fechado.painel && fechado.foco && depois === mensagens && tRecarga.escape === null && tRecarga.dica === 'Escreva sua mensagem…' && avisadosDepois === 2,
    `${mensagens} → ${depois} mensagens`);

  // O servidor não conhece mais o lead desta conversa (403 sem_lead): recomeça pelo roteiro.
  await falar(pagina, 'sumiu?');
  await pagina.waitForTimeout(300);
  const tReset = await tela(pagina);
  conferir('Servidor sem o lead desta conversa: o chat recomeça pelo roteiro',
    tReset.falas === 1 && tReset.minhas.length === 0 && tReset.ultimaSol.endsWith('como posso te chamar?') && tReset.escape !== null,
    JSON.stringify({ falas: tReset.falas, minhas: tReset.minhas.length }));

  // Recarregar no meio do roteiro volta na mesma pergunta.
  await falar(pagina, 'Bia');
  await pagina.reload({ waitUntil: 'networkidle' });
  await pagina.click('.sol-lancador');
  await pagina.waitForSelector('.sol-painel.sol-painel-visivel');
  await pagina.waitForTimeout(300);
  const tMeio = await tela(pagina);
  conferir('Recarregar no meio do roteiro volta na mesma pergunta',
    tMeio.ultimaSol.startsWith('Prazer, Bia!') && tMeio.teclado === 'numeric' && tMeio.aviso !== '' && tMeio.escape !== null);
  // A queda de conexão (rota.abort) e o 403 simulados acima aparecem no console do navegador: são esperados.
  const errosReais = erros.filter((e) => !/net::ERR_FAILED|status of 403/.test(e));
  conferir('Zero erros no console com o chat', errosReais.length === 0, errosReais.slice(0, 2).join(' | '));
  await contexto.close();

  // Pergunta feita na caixa de dúvidas antes do roteiro: não se perde, vira a primeira mensagem.
  {
    const pedidosDuvida = [];
    const { pagina: p, contexto: c } = await abrir(1440);
    await simular(p, pedidosDuvida);
    await p.fill('[data-busca]', 'xyzabc qwerty?');
    await p.waitForSelector('[data-sem-resultado]:not([hidden]) [data-sol-pergunta]');
    await p.click('[data-sol-pergunta]');
    await p.waitForSelector('.sol-painel.sol-painel-visivel');
    await esperarSol(p);
    const tDuvida = await tela(p);
    await capturar(p);
    await p.waitForFunction(() => [...document.querySelectorAll('.sol-msg-sol .sol-msg-corpo')].length >= 6, null, { timeout: 8000 });
    await esperarSol(p);
    conferir('Pergunta da caixa de dúvidas antes do roteiro fica guardada e vira a primeira mensagem para a Sol',
      tDuvida.minhas[0] === 'xyzabc qwerty?' && tDuvida.ultimaSol === 'Já te respondo! Antes, como posso te chamar?'
        && pedidosDuvida[0]?.tipo === 'lead' && pedidosDuvida[1]?.mensagem === 'xyzabc qwerty?',
      JSON.stringify(pedidosDuvida.map((x) => x.mensagem ?? x.tipo)));
    await c.close();
  }

  // Celular: a Sol fica na barra fixa e o chat ocupa a tela toda.
  const cel = await abrir(390);
  await simular(cel.pagina, []);
  await cel.pagina.click('.barra-sol');
  await cel.pagina.waitForSelector('.sol-painel.sol-painel-visivel');
  await cel.pagina.waitForTimeout(400);
  const pequenos = () => cel.pagina.evaluate(() => [...document.querySelectorAll('.sol-painel button, .sol-painel a.btn, .sol-painel .chip')]
    .filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && !el.closest('[hidden]'); })
    .map((el) => { const b = el.getBoundingClientRect(); return { t: el.textContent.trim().slice(0, 20) || el.getAttribute('aria-label'), h: Math.round(b.height), w: Math.round(b.width) }; })
    .filter((x) => x.h < 44 || x.w < 44));
  await falar(cel.pagina, 'Ana Paula');
  await falar(cel.pagina, '46991234567');
  // Os botões rápidos encolhem a conversa: a última mensagem tem de continuar à vista.
  const noFim = () => cel.pagina.waitForFunction(() => {
    const c = document.querySelector('.sol-conversa');
    return c.scrollHeight - c.clientHeight - c.scrollTop < 2;
  }, null, { timeout: 3000 }).then(() => true, () => false);
  await tocar(cel.pagina, 'Francisco Beltrão');
  const pequenosRoteiro = await pequenos();
  const vistaRoteiro = await noFim();
  await tocar(cel.pagina, 'Câmeras');
  await falar(cel.pagina, 'quanto custa 4 câmeras?', '.sol-plano');
  const vistaConversa = await noFim();
  const telaCel = await cel.pagina.evaluate(() => {
    const r = document.querySelector('.sol-painel').getBoundingClientRect();
    return { cheia: Math.round(r.width) === innerWidth && Math.round(r.height) === innerHeight, sobra: document.documentElement.scrollWidth - innerWidth, barra: getComputedStyle(document.querySelector('.barra-fixa')).opacity, lancador: getComputedStyle(document.querySelector('.sol-lancador')).display };
  });
  const pequenosConversa = await pequenos();
  const todosPequenos = [...pequenosRoteiro, ...pequenosConversa];
  conferir('Celular: Sol na barra fixa, chat em tela cheia, sem rolagem lateral e toques ≥ 44 px (roteiro e conversa)',
    telaCel.cheia && telaCel.sobra <= 0 && telaCel.barra === '0' && telaCel.lancador === 'none' && todosPequenos.length === 0,
    todosPequenos.length ? todosPequenos.map((p) => `${p.t} ${p.w}×${p.h}`).join('; ') : '');
  conferir('Celular: a última mensagem fica à vista com os botões rápidos na tela (roteiro e conversa)', vistaRoteiro && vistaConversa,
    JSON.stringify({ vistaRoteiro, vistaConversa }));
  conferir('Zero erros no console com o chat (celular)', cel.erros.length === 0, cel.erros.slice(0, 2).join(' | '));
  await cel.contexto.close();
}

/* ---------- Fotos e comparação com os mockups ---------- */
if (comFotos) {
  const pastaFotos = path.join(docs, 'site-final');
  const pastaComp = path.join(docs, 'comparacao');
  mkdirSync(pastaFotos, { recursive: true });
  mkdirSync(pastaComp, { recursive: true });
  const telas = [
    { n: '01', nome: 'abertura', sel: '#inicio', mock: '01-abertura' },
    { n: '02', nome: 'planos', sel: '#planos', mock: '02-planos' },
    { n: '03', nome: 'monte-seu-sistema', sel: '#monte', mock: '03-monte-seu-sistema', antes: async (p) => { await p.click('[data-configurar="4"]', { force: true }).catch(() => {}); await p.click('[data-recurso][value="colorida"] ~ .caixinha'); } },
    { n: '04', nome: 'como-funciona', sel: '#como-funciona', mock: '04-como-funciona' },
  ];
  for (const t of telas) {
    const { pagina, contexto } = await abrir(1440);
    await rolarTudo(pagina);
    if (t.antes) await t.antes(pagina);
    await pagina.waitForTimeout(2800);
    await pagina.addStyleTag({ content: '.cabecalho,.barra-fixa,.progresso-leitura,.pular{visibility:hidden!important}' });
    await pagina.locator(t.sel).screenshot({ path: path.join(pastaFotos, `${t.n}-${t.nome}.png`) });
    await contexto.close();
  }
  for (const [nome, acao] of [['inicio', null], ['planos', '.planos-trilho'], ['configurador', '.config-planta']]) {
    const { pagina, contexto } = await abrir(390);
    await rolarTudo(pagina);
    if (acao) { await pagina.evaluate((s) => { const el = document.querySelector(s); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 140, behavior: 'instant' }); }, acao); }
    if (nome === 'configurador') await pagina.evaluate(() => document.querySelector('[data-configurar="4"]').click());
    await pagina.waitForTimeout(900);
    await pagina.screenshot({ path: path.join(pastaFotos, `05-celular-${nome}.png`) });
    await contexto.close();
  }
  // Comparação lado a lado: mockup × site
  const comp = await (await navegador.newContext({ viewport: { width: 2000, height: 900 } })).newPage();
  const dataUri = (arq) => `data:image/png;base64,${readFileSync(arq).toString('base64')}`;
  const pares = [
    ...telas.map((t) => ({ n: t.n, titulo: t.nome, a: [path.join(docs, 'imagens', `${t.mock}.png`)], b: [path.join(pastaFotos, `${t.n}-${t.nome}.png`)] })),
    { n: '05', titulo: 'celular', a: [path.join(docs, 'imagens', '05-celular.png')], b: ['inicio', 'planos', 'configurador'].map((x) => path.join(pastaFotos, `05-celular-${x}.png`)) },
  ];
  for (const par of pares) {
    const coluna = (lista, rotulo) => `<div class="col"><h2>${rotulo}</h2><div class="imgs">${lista.map((f) => `<img src="${dataUri(f)}">`).join('')}</div></div>`;
    await comp.setContent(`<html><body style="margin:0;background:#0b0f14;font-family:sans-serif;color:#fff">
      <style>.linha{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px}.col h2{font-size:22px;margin:0 0 12px;color:#ffd84d}.imgs{display:flex;gap:12px;align-items:flex-start}.imgs img{min-width:0;flex:1;width:100%;border:1px solid #2b4358;border-radius:8px}</style>
      <div class="linha">${coluna(par.a, `Mockup ${par.n}`)}${coluna(par.b, `Site construído · ${par.titulo}`)}</div></body></html>`);
    await comp.screenshot({ path: path.join(pastaComp, `${par.n}-${par.titulo}.png`), fullPage: true });
  }
  console.log('Fotos em docs/inovacao/site-final/ e comparação em docs/inovacao/comparacao/');
}

await navegador.close();
servidor.close();

/* ---------- Relatório ---------- */
const total = resultados.length;
const ok = resultados.filter((r) => r.ok).length;
const grupos = [...new Set(resultados.map((r) => r.grupo))];
const md = [
  '# Relatório de validação do site',
  '',
  `Gerado por \`npm run validar\` em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.`,
  `Resultado: **${ok} de ${total} itens ✅**${ok === total ? ' — checklist completa.' : '.'}`,
  '',
  ...grupos.flatMap((g) => [`## ${g}`, '', '| | Item | Detalhe |', '|---|---|---|', ...resultados.filter((r) => r.grupo === g).map((r) => `| ${r.ok ? '✅' : '❌'} | ${r.item} | ${r.detalhe.replace(/\|/g, '/')} |`), '']),
].join('\n');
writeFileSync(path.join(docs, 'RELATORIO-VALIDACAO.md'), md);
console.log(`\n${ok}/${total} itens ok. Relatório: docs/inovacao/RELATORIO-VALIDACAO.md`);
process.exit(ok === total ? 0 : 1);
