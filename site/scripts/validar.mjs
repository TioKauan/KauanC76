/**
 * Validador do site: confere a checklist de "pronto" de docs/inovacao/PLANO-EXECUCAO.md.
 *
 * Uso: npm run validar            (gera o build, testa e escreve o relatório)
 *      npm run validar -- --fotos (também tira fotos e monta a comparação com os mockups)
 *
 * Resultado: docs/inovacao/RELATORIO-VALIDACAO.md (+ fotos em docs/inovacao/site-final/).
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  planos, contato, empresa, formatarPreco, precoPorCamera, duvidas,
  aberturaVideo, confiancaGoogle, contratoSimples, condicoesContrato, explicacaoGravador, perfis, servicosProposta, textoProposta,
  mostrarPrecos, nomePlano,
} from '../src/lib/dados.ts';

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
// Conferências novas da renovação de 11/11/2026: se o teste lançar erro (botão que não existe, clique sem resposta),
// vira um ❌ com o motivo em vez de derrubar o relatório inteiro (o script usa await no nível de cima).
const protegido = async (titulo, bloco) => {
  try {
    await bloco();
  } catch (e) {
    conferir(titulo, false, `erro no teste: ${String(e).slice(0, 220)}`);
  }
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
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/plain', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
const servidor = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let arquivo = path.join(dist, url === '/' ? 'index.html' : url);
  // Endereço de pasta (/privacidade/) serve o index.html dela, como o Nginx faz.
  if (existsSync(arquivo) && statSync(arquivo).isDirectory()) arquivo = path.join(arquivo, 'index.html');
  // Endereço que não existe: 404 com a página 404.html, como o Nginx configurado (site/README.md).
  if (!arquivo.startsWith(dist) || !existsSync(arquivo) || statSync(arquivo).isDirectory()) {
    const pagina404 = path.join(dist, '404.html');
    res.writeHead(404, { 'content-type': tipos['.html'] });
    return res.end(existsSync(pagina404) ? readFileSync(pagina404) : '404');
  }
  res.writeHead(200, { 'content-type': tipos[path.extname(arquivo)] || 'application/octet-stream' });
  res.end(readFileSync(arquivo));
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const endereco = `http://127.0.0.1:${servidor.address().port}/`;

const navegador = await chromium.launch();
// `antes(contexto)` roda antes de abrir a página (para interceptar a rede desde o primeiro pedido).
// `externos` guarda o endereço de todo pedido a outro servidor que não o do teste, desde o carregamento.
const abrir = async (largura, extras = {}, caminho = '', antes = null) => {
  const celular = largura <= 800;
  const contexto = await navegador.newContext({ viewport: { width: largura, height: celular ? 844 : 900 }, deviceScaleFactor: celular ? 2 : 1, hasTouch: celular, isMobile: celular && largura < 600, ...extras });
  if (antes) await antes(contexto);
  const pagina = await contexto.newPage();
  const erros = [];
  const bytes = { total: 0, urls: new Set() };
  const externos = [];
  pagina.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pagina.on('pageerror', (e) => erros.push(String(e)));
  pagina.on('request', (r) => {
    if (r.url().startsWith(endereco)) bytes.urls.add(new URL(r.url()).pathname);
    else if (/^https?:/.test(r.url())) externos.push(r.url());
  });
  await pagina.goto(endereco + caminho, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  return { pagina, contexto, erros, bytes, externos };
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
  const errados = whats.filter((h) => !h.startsWith(`https://wa.me/${'5546991331306'}?text=`) || new URL(h).searchParams.get('text').length < 20);
  conferir(`Todo WhatsApp usa wa.me/${contato.whatsapp} com mensagem preenchida`, whats.length > 0 && errados.length === 0, `${whats.length} links${errados.length ? `; errados: ${errados.slice(0, 3).join(' ')}` : ''}`);
  // Regra de 28/09/2026: o visitante sabe pelo desenho se vai para a equipe (WhatsApp) ou para a Sol (orbe).
  const semIcone = await pagina.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"]')]
    .filter((a) => !a.querySelector('use[href="#ic-whatsapp"]')).map((a) => a.textContent.trim().slice(0, 30)));
  conferir('Todo botão de WhatsApp mostra o ícone do WhatsApp', whats.length > 0 && semIcone.length === 0, semIcone.join(' | '));
  // Decisão do Kauan (28/09/2026, noite): o WhatsApp da equipe fica só na seção "Fale com a SC";
  // o topo e o menu do celular levam até ela, e os botões de venda abrem a Sol.
  // Desde 02/11/2026 (decisão do Kauan) o "Quero este plano" da inicial abre o WhatsApp da equipe.
  const foraPermitido = await pagina.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"]')]
    .filter((a) => !a.closest('#contato') && !a.matches('.plano-cta')).map((a) => a.textContent.trim().slice(0, 30)));
  conferir('WhatsApp da equipe só em "Fale com a SC" e nos botões "Quero este plano"', whats.length > 0 && foraPermitido.length === 0, foraPermitido.join(' | '));
  // O botão "Fale com a SC" existe uma vez só no cabeçalho (barra de cima); o menu do celular tem o item "Contato".
  const topoContato = await pagina.evaluate(() => ({
    botoes: [...document.querySelectorAll('.cabecalho-cta')].map((a) => ({ href: a.getAttribute('href'), texto: a.textContent.trim() })),
    ocorrencias: (document.querySelector('.cabecalho').textContent.match(/Fale com a SC/g) ?? []).length,
    menuContato: [...document.querySelectorAll('#menu-celular nav a[href="#contato"]')].map((a) => a.textContent.trim().replace(/^\d+/, '')),
    menuTitulo: document.querySelector('#menu-celular .menu-celular-titulo')?.textContent.trim(),
    menuBotao: document.querySelectorAll('#menu-celular a.btn').length,
  }));
  conferir('Cabeçalho: "Fale com a SC" aparece uma vez só e leva à seção de contato; o menu do celular tem o item "Contato" e o título "Soluções"',
    topoContato.botoes.length === 1 && topoContato.botoes[0].href === '#contato' && topoContato.botoes[0].texto === 'Fale com a SC' && topoContato.ocorrencias === 1
      && topoContato.menuContato.join() === 'Contato' && topoContato.menuTitulo === 'Soluções' && topoContato.menuBotao === 0, JSON.stringify(topoContato));
  const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
  const textoTodo = await pagina.evaluate(() => document.body.innerText);
  conferir('Número antigo (46) 99113-8360 não aparece', !/99113.?8360|991138360/.test(html + textoTodo));
  // Identificação da empresa (Decreto 7.962/2013, art. 2º): CNPJ, cidade e e-mail visíveis.
  const rodape = await pagina.$eval('.rodape-empresa', (e) => e.innerText);
  conferir('Rodapé identifica a empresa (CNPJ, cidade, e-mail)',
    [empresa.cnpj, empresa.cidade, contato.email].every((t) => rodape.includes(t)));

  // Valores derivados dos planos (02/11/2026): custo por câmera e a diferença entre 3 e 4 câmeras.
  const preco3 = planos.find((x) => x.cameras === 3).preco, preco4 = planos.find((x) => x.cameras === 4).preco;
  const precosValidos = new Set([...planos.map((p) => formatarPreco(p.preco)), ...planos.map((p) => precoPorCamera(p)), formatarPreco(preco4 - preco3)]);
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
    // Os botões de venda abrem a Sol; sem JavaScript, levam a "Fale com a SC". Desde 11/11/2026 o "Pedir proposta" é um só
    // (abaixo dos painéis de serviço), então a inicial tem 1 desses links, e não mais 4 (um por aba).
    vendas: [...document.querySelectorAll('a[data-sol-abrir]')].filter((a) => a.getAttribute('href') === '#contato' && getComputedStyle(a).display !== 'none').length,
    whatsContato: Boolean(document.querySelector('#contato a[href*="wa.me"]')),
    // O chat depende de JavaScript: sem ele, nem o botão da Sol aparece.
    solEscondida: document.querySelector('[data-sol]').hidden && [...document.querySelectorAll('button[data-sol-abrir]')].every((b) => b.hidden && getComputedStyle(b).display === 'none'),
  }));
  conferir('Sem JavaScript o conteúdo aparece e os contatos funcionam (botões de venda levam a "Fale com a SC")',
    semJs.planos === 5 && semJs.duvidas === 10 && semJs.escondidos === 0 && semJs.vendas === 1 && semJs.whatsContato && semJs.solEscondida, JSON.stringify(semJs));
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

  // Buscadores: robots.txt aponta o sitemap, e o sitemap lista toda página gerada (cada index.html do dist/).
  const robots = existsSync(path.join(dist, 'robots.txt')) ? readFileSync(path.join(dist, 'robots.txt'), 'utf8') : '';
  const paginasGeradas = (function listar(pasta, prefixo) {
    return readdirSync(pasta, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? listar(path.join(pasta, e.name), `${prefixo}${e.name}/`) : e.name === 'index.html' ? [prefixo] : []);
  })(dist, '/').sort();
  const noSitemap = readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f))
    .flatMap((f) => [...readFileSync(path.join(dist, f), 'utf8').matchAll(/<loc>https:\/\/somoscella\.online(\/[^<]*)<\/loc>/g)].map((m) => m[1])).sort();
  conferir('Buscadores: robots.txt aponta o sitemap, e o sitemap lista todas as páginas',
    /User-agent: \*/.test(robots) && robots.includes('Sitemap: https://somoscella.online/sitemap-index.xml') && noSitemap.join(' ') === paginasGeradas.join(' '),
    `páginas: ${paginasGeradas.join(', ')}; no sitemap: ${noSitemap.join(', ')}`);
  const sitemapXml = existsSync(path.join(dist, 'sitemap.xml')) ? readFileSync(path.join(dist, 'sitemap.xml'), 'utf8') : '';
  conferir('Buscadores: /sitemap.xml existe e é igual ao sitemap-0.xml (endereço que o Search Console sugere)',
    sitemapXml !== '' && sitemapXml === readFileSync(path.join(dist, 'sitemap-0.xml'), 'utf8'),
    sitemapXml ? `${sitemapXml.length} bytes` : 'sitemap.xml não foi gerado');
}

/* ---------- Buscadores: dados da empresa e página 404 ---------- */
grupo('Buscadores');
{
  // Dados estruturados (schema.org) na inicial: os mesmos do rodapé, com o telefone da equipe (sem link de WhatsApp).
  const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
  const blocos = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  let grafo = [];
  try { grafo = blocos.length === 1 ? JSON.parse(blocos[0])['@graph'] : []; } catch { grafo = []; }
  const negocio = grafo.find((g) => g['@type'] === 'LocalBusiness');
  const siteLd = grafo.find((g) => g['@type'] === 'WebSite');
  const cidade = empresa.cidade.replace(/\s+/g, ' ');
  conferir('Inicial tem os dados da empresa para o Google (schema.org): nome, CNPJ, cidade e e-mail iguais aos do rodapé',
    negocio && siteLd && negocio.name === empresa.nome && negocio.taxID === empresa.cnpj && negocio.email === contato.email
      && `${negocio.address?.addressLocality} - ${negocio.address?.addressRegion}` === cidade && siteLd.publisher?.['@id'] === negocio['@id']
      && negocio.telephone === `+${contato.whatsapp}` && !/wa\.me/.test(blocos.join('')),
    negocio ? `${negocio.name} · ${negocio.taxID} · ${negocio.address?.addressLocality} · ${negocio.email}` : `${blocos.length} bloco(s) JSON-LD`);

  // As dúvidas que o Google lê são as da tela; a descrição da inicial e os títulos das páginas citam a cidade.
  const faq = grafo.find((g) => g['@type'] === 'FAQPage');
  const perguntasNoJson = (faq?.mainEntity ?? []).map((q) => q.name);
  const perguntasNaTela = [...html.matchAll(/<details[^>]*class="pergunta"[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  conferir('FAQPage (Google) tem as mesmas dúvidas do site, na mesma ordem',
    perguntasNoJson.join('|') === duvidas.map((d) => d.pergunta).join('|') && perguntasNoJson.join('|') === perguntasNaTela.join('|') && perguntasNoJson.length > 0,
    `${perguntasNoJson.length} no JSON; ${perguntasNaTela.length} <details> reconhecidos na tela`);
  const cidadeNome = empresa.cidade.replace(/\s+/g, ' ').split(' - ')[0];
  const metaDe = (arquivo) => {
    const h = readFileSync(path.join(dist, arquivo), 'utf8');
    return { t: h.match(/<title>([^<]*)<\/title>/)?.[1] ?? '', d: h.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '' };
  };
  const semCidade = ['index.html', 'casa/index.html', 'comercio/index.html', 'empresa/index.html', 'condominio/index.html']
    .filter((f) => { const m = metaDe(f); return !m.t.includes(cidadeNome) && !m.d.includes(cidadeNome); });
  const semCidadeNoTitulo = ['index.html', 'casa/index.html', 'comercio/index.html', 'empresa/index.html']
    .filter((f) => !metaDe(f).t.includes(cidadeNome));
  conferir(`Título das páginas de venda cita ${cidadeNome}; todas citam a cidade no título ou na descrição`,
    semCidade.length === 0 && semCidadeNoTitulo.length === 0, `sem cidade: ${[...semCidade, ...semCidadeNoTitulo].join(', ') || 'nenhuma'}`);
  const chaveIndexNow = JSON.parse(readFileSync(path.join(raizSite, 'src/lib/indexnow.json'), 'utf8')).chave;
  conferir('IndexNow: o arquivo da chave sai no build, com só a chave, e não está no sitemap',
    existsSync(path.join(dist, `${chaveIndexNow}.txt`)) && readFileSync(path.join(dist, `${chaveIndexNow}.txt`), 'utf8') === chaveIndexNow
      && !readFileSync(path.join(dist, 'sitemap-0.xml'), 'utf8').includes(chaveIndexNow), chaveIndexNow);

  // Página 404: endereço que não existe responde 404 (não a inicial com 200) e mostra por onde continuar.
  const naoIndexadas = ['condominio/index.html', 'privacidade/index.html', 'index.html']
    .filter((f) => /<meta name="robots" content="noindex"/.test(readFileSync(path.join(dist, f), 'utf8')));
  conferir('Só a página 404 fica fora do Google (noindex); as outras são indexadas', naoIndexadas.length === 0 && existsSync(path.join(dist, '404.html'))
    && /<meta name="robots" content="noindex"/.test(readFileSync(path.join(dist, '404.html'), 'utf8')), naoIndexadas.join(', '));
  for (const largura of [1440, 390]) {
    const { pagina, contexto, erros } = await abrir(largura);
    // O navegador avisa no console que a própria página veio com 404 (é o esperado); os outros arquivos precisam carregar.
    const falhas = [];
    pagina.on('response', (resp) => { if (resp.status() >= 400 && resp.request().resourceType() !== 'document') falhas.push(new URL(resp.url()).pathname); });
    const resposta = await pagina.goto(`${endereco}um/endereco/que-nao-existe/`, { waitUntil: 'networkidle' });
    const outrosErros = erros.filter((e) => !/status of 404/.test(e));
    const r = await pagina.evaluate(() => ({
      titulo: document.querySelector('h1')?.textContent.trim(),
      caminhos: [...document.querySelectorAll('.erro-caminhos a')].map((a) => a.getAttribute('href')),
      // Esta página aparece em qualquer caminho: link relativo (planos/, ../) quebraria.
      relativos: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(\/|#|https:|mailto:)/.test(h)),
      ancorasQuebradas: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.querySelector(h)),
      whatsFora: [...document.querySelectorAll('a[href*="wa.me"]')].filter((a) => !a.closest('#contato')).length,
      estilos: getComputedStyle(document.body).fontFamily.includes('Manrope'),
      sobra: document.documentElement.scrollWidth - innerWidth,
      sol: Boolean(document.querySelector('.sol[data-chegou], [data-sol]')),
    }));
    conferir(`Endereço inexistente: responde 404 com a página "não encontrada" e caminhos para o site (${largura} px)`,
      resposta.status() === 404 && r.titulo?.includes('não existe') && r.caminhos.join(' ') === '/#planos /monte-seu-sistema/ /condominio/ /#duvidas'
        && r.relativos.length === 0 && r.ancorasQuebradas.length === 0 && r.whatsFora === 0 && r.estilos && r.sol && r.sobra <= 0
        && falhas.length === 0 && outrosErros.length === 0,
      `status ${resposta.status()}; relativos: ${r.relativos.join(' ') || 0}; âncoras quebradas: ${r.ancorasQuebradas.join(' ') || 0}; WhatsApp fora do contato: ${r.whatsFora}; sobra ${r.sobra} px; arquivos que falharam: ${falhas.join(' ') || 0}; erros: ${outrosErros.slice(0, 1).join('') || 0}`);
    await contexto.close();
  }
}

grupo('Tela 1 · Abertura');
{
  const { pagina, contexto } = await abrir(1440);
  // Abertura simples de uma coluna: sem cena, sem chips de ambiente e sem convites para as páginas de solução.
  const simples = await pagina.evaluate(() => {
    const inicio = document.querySelector('#inicio');
    return {
      cena: Boolean(document.querySelector('.cena, .cena-ambiente, .abertura-cena, #inicio svg.cena-svg')),
      chips: document.querySelectorAll('#inicio .chip, #inicio [data-ambiente], .ambientes').length,
      convites: document.querySelectorAll('#inicio [data-link-ambiente], #inicio .link-condominio, #inicio a[href="/casa/"], #inicio a[href="/comercio/"], #inicio a[href="/empresa/"], #inicio a[href="/condominio/"]').length,
      rotulosSistema: document.querySelectorAll('#inicio .rotulo, #inicio .rotulo-linha').length,
      texto: inicio.innerText,
    };
  });
  conferir('Abertura da inicial: sem cena, sem chips "Veja no seu ambiente" e sem convites para as páginas de solução',
    !simples.cena && simples.chips === 0 && simples.convites === 0 && simples.rotulosSistema === 0 && !/Veja no seu ambiente|em 3D|maquete/i.test(simples.texto),
    JSON.stringify({ ...simples, texto: undefined }));
  conferir('Abertura da inicial não promete energia no plano (o nobreak é adicional, sob orçamento)', !/energia/i.test(simples.texto), simples.texto.replace(/\s+/g, ' ').slice(0, 220));

  // Inicial enxuta (17/10/2026): o "E se…?" e a faixa de serviços ficam fora da inicial.
  const enxuta = await pagina.evaluate(() => ({
    ese: Boolean(document.querySelector('#inicio .ese, #inicio [data-situacao]')),
    faixa: Boolean(document.querySelector('.faixa-servicos')),
    monte: Boolean(document.querySelector('#monte')),
    cliente: Boolean(document.querySelector('.cliente')),
    personalize: Boolean(document.querySelector('.upgrades, .por-que')),
    botaoMonte: document.querySelector('.abertura-acoes a.btn-contorno')?.getAttribute('href'),
  }));
  conferir('Inicial enxuta: sem "E se…?", faixa de serviços, configurador, "Personalize" e Área do cliente; botão leva a /monte-seu-sistema/',
    !enxuta.ese && !enxuta.faixa && !enxuta.monte && !enxuta.cliente && !enxuta.personalize && enxuta.botaoMonte === '/monte-seu-sistema/', JSON.stringify(enxuta));
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

/* ---------- Abertura com celular e vídeo (11/11/2026) ---------- */
// O vídeo do fabricante só carrega no toque: antes dele, a página não pode falar com o Google nem com o YouTube.
{
  const hostsDoGoogle = ['youtube.com', 'youtube-nocookie.com', 'ytimg.com', 'googlevideo.com', 'google.com', 'gstatic.com'];
  const deGoogle = (url) => { try { const h = new URL(url).hostname; return hostsDoGoogle.some((d) => h === d || h.endsWith(`.${d}`)); } catch { return false; } };

  // 1. Carregar e rolar a inicial: zero pedidos a esses servidores (o ouvinte de rede liga antes do primeiro pedido).
  for (const largura of [1440, 390]) {
    const titulo = `Abertura: carregar e rolar a inicial não faz pedido a youtube.com, youtube-nocookie.com, ytimg.com, googlevideo.com, google.com nem gstatic.com (${largura} px)`;
    await protegido(titulo, async () => {
      const { pagina, contexto, externos } = await abrir(largura);
      await rolarTudo(pagina);
      await pagina.waitForTimeout(600);
      const dosGoogle = externos.filter(deGoogle);
      conferir(titulo, dosGoogle.length === 0, dosGoogle.length ? dosGoogle.slice(0, 3).join(' ') : `${externos.length} pedido(s) a outros servidores${externos.length ? `: ${externos.slice(0, 3).join(' ')}` : ''}`);
      await contexto.close();
    });
  }

  // 2. Tocar no play coloca o iframe do youtube-nocookie. A rede do Google é interceptada (resposta falsa, sem erro):
  //    o teste não depende da internet e conta os pedidos feitos antes e depois do toque.
  await protegido('Abertura: tocar no play troca a cena por um iframe de www.youtube-nocookie.com/embed/wKUPPBYbi-Q (com título, autoplay e carregamento tardio), sem abrir outra aba', async () => {
    const pedidos = [];
    const { pagina, contexto, erros } = await abrir(1440, {}, '', async (c) => {
      await c.route(/^https?:\/\/([^/]*\.)?(youtube-nocookie|youtube|ytimg|googlevideo|google|gstatic)\.com\//, async (rota) => {
        pedidos.push(rota.request().url());
        await rota.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><title>player de teste</title><p>player de teste</p>' });
      });
    });
    const antesDoToque = pedidos.length;
    const capaAntes = await pagina.evaluate(() => ({ capa: Boolean(document.querySelector('[data-video-abrir]')), iframes: document.querySelectorAll('iframe').length }));
    await pagina.locator('[data-video-abrir]').scrollIntoViewIfNeeded();
    await pagina.click('[data-video-abrir]');
    const apareceu = await pagina.waitForSelector('iframe.video-player', { timeout: 5000 }).then(() => true, () => false);
    await pagina.waitForTimeout(400);
    const player = await pagina.evaluate(() => {
      const f = document.querySelector('iframe.video-player');
      return f && {
        src: f.src, title: f.title, allow: f.allow, loading: f.getAttribute('loading'),
        dentroDoCelular: Boolean(f.closest('.celular-tela')), capaSumiu: !document.querySelector('[data-video-abrir]'),
        legenda: Boolean(document.querySelector('.video-legenda')), total: document.querySelectorAll('iframe').length,
      };
    });
    const depois = pedidos.slice(antesDoToque);
    conferir('Abertura: tocar no play troca a cena por um iframe de www.youtube-nocookie.com/embed/wKUPPBYbi-Q (com título, autoplay e carregamento tardio), sem abrir outra aba',
      antesDoToque === 0 && capaAntes.capa && capaAntes.iframes === 0 && apareceu && Boolean(player)
        && player.src.startsWith(`https://www.youtube-nocookie.com/embed/${aberturaVideo.id}?`) && player.src.includes('autoplay=1')
        && player.title.length > 20 && /autoplay/.test(player.allow) && player.loading === 'lazy'
        && player.dentroDoCelular && player.capaSumiu && player.legenda && player.total === 1
        && contexto.pages().length === 1
        && depois.some((u) => u.startsWith(`https://www.youtube-nocookie.com/embed/${aberturaVideo.id}`))
        && depois.every((u) => new URL(u).hostname === 'www.youtube-nocookie.com'),
      JSON.stringify({ pedidosAntes: antesDoToque, pedidosDepois: depois.map((u) => u.slice(0, 70)), player: player && { ...player, src: player.src.slice(0, 90) }, abas: contexto.pages().length, erros: erros.slice(0, 1) }));
    await contexto.close();
  });

  // 3. Sem JavaScript: o play é um link para o vídeo no YouTube, em nova aba.
  await protegido('Abertura sem JavaScript: o play é um link para https://www.youtube.com/watch?v=wKUPPBYbi-Q em nova aba (noopener), sem iframe e sem pedido ao Google', async () => {
    const { pagina, contexto, externos } = await abrir(1440, { javaScriptEnabled: false });
    const r = await pagina.evaluate(() => {
      const a = document.querySelector('[data-video-abrir]');
      return { href: a?.getAttribute('href') ?? null, alvo: a?.getAttribute('target') ?? null, rel: a?.getAttribute('rel') ?? '', iframes: document.querySelectorAll('iframe').length, texto: (a?.textContent ?? '').replace(/\s+/g, ' ').trim() };
    });
    conferir('Abertura sem JavaScript: o play é um link para https://www.youtube.com/watch?v=wKUPPBYbi-Q em nova aba (noopener), sem iframe e sem pedido ao Google',
      r.href === aberturaVideo.linkYoutube && r.alvo === '_blank' && /noopener/.test(r.rel) && r.iframes === 0 && /Toque para ver/.test(r.texto) && !externos.some(deGoogle), JSON.stringify({ ...r, externos: externos.filter(deGoogle).length }));
    await contexto.close();
  });

  // 4. Legenda obrigatória: logo abaixo do celular, visível, com "sob orçamento".
  for (const largura of [1440, 390]) {
    const titulo = `Abertura: a legenda do vídeo aparece logo abaixo do celular e contém "sob orçamento" (${largura} px)`;
    await protegido(titulo, async () => {
    const { pagina, contexto } = await abrir(largura);
    const l = await pagina.evaluate(() => {
      const leg = document.querySelector('.video-legenda');
      const cel = document.querySelector('.celular');
      if (!leg || !cel) return null;
      const a = leg.getBoundingClientRect();
      const b = cel.getBoundingClientRect();
      const estilo = getComputedStyle(leg);
      return { texto: leg.textContent.replace(/\s+/g, ' ').trim(), visivel: estilo.display !== 'none' && estilo.visibility !== 'hidden' && a.height > 0, abaixo: Math.round(a.top - b.bottom), logoDepois: leg.previousElementSibling === cel, naAbertura: Boolean(leg.closest('#inicio')) };
    });
    conferir(titulo,
      Boolean(l) && l.visivel && l.naAbertura && l.logoDepois && l.abaixo >= 0 && l.abaixo <= 32 && l.texto === aberturaVideo.legenda && /sob orçamento/.test(l.texto) && /preto e branco/.test(l.texto),
      l ? `${l.abaixo} px abaixo do celular; "${l.texto.slice(0, 70)}…"` : 'legenda ou celular não encontrados');
    await contexto.close();
    });
  }

  // 5. Linha de confiança: link para o Perfil da Empresa no Google, sem estrelas, nota, número nem logo; JSON-LD sem avaliações.
  await protegido('Abertura: a linha de confiança leva a perfis.googleMaps (nova aba, noopener), fica abaixo dos botões e não tem estrelas, nota, número nem logo; o JSON-LD não tem AggregateRating nem Review', async () => {
    const { pagina, contexto } = await abrir(1440);
    const linha = await pagina.evaluate(() => {
      const a = document.querySelector('[data-confianca-google]');
      const botoes = document.querySelector('.abertura-acoes');
      if (!a || !botoes) return null;
      return {
        href: a.getAttribute('href'), alvo: a.getAttribute('target'), rel: a.getAttribute('rel') ?? '', texto: a.textContent.replace(/\s+/g, ' ').trim(),
        imagens: a.querySelectorAll('img').length, naAbertura: Boolean(a.closest('#inicio')),
        abaixoDosBotoes: a.getBoundingClientRect().top >= botoes.getBoundingClientRect().bottom,
        textoAbertura: document.querySelector('#inicio').innerText,
      };
    });
    const htmlInicial = readFileSync(path.join(dist, 'index.html'), 'utf8');
    const jsonLd = [...htmlInicial.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('');
    conferir('Abertura: a linha de confiança leva a perfis.googleMaps (nova aba, noopener), fica abaixo dos botões e não tem estrelas, nota, número nem logo; o JSON-LD não tem AggregateRating nem Review',
      Boolean(linha) && linha.href === perfis.googleMaps && linha.alvo === '_blank' && /noopener/.test(linha.rel) && linha.texto === confiancaGoogle
        && linha.imagens === 0 && linha.naAbertura && linha.abaixoDosBotoes && !/[★⭐]|estrela/i.test(linha.textoAbertura)
        && jsonLd.length > 0 && !/AggregateRating|aggregateRating|"Review"|reviewRating|reviewBody/.test(jsonLd),
      linha ? `${linha.texto}; JSON-LD ${jsonLd.length} caracteres` : 'linha de confiança não encontrada');
    await contexto.close();
  });

  // 6. Celular desenhado em CSS: tela 19,5:9 com o vídeo 16:9 centralizado; duas colunas no computador, texto e depois celular no celular.
  for (const largura of [1440, 390]) {
    const titulo = `Abertura: celular deitado com tela 19,5:9 e vídeo 16:9 centralizado; ${largura >= 800 ? 'texto e celular lado a lado' : 'texto primeiro, celular embaixo, com 16 px de margem'} (${largura} px)`;
    await protegido(titulo, async () => {
    const { pagina, contexto } = await abrir(largura);
    const g = await pagina.evaluate(() => {
      const texto = document.querySelector('.abertura-texto')?.getBoundingClientRect();
      const cel = document.querySelector('.celular')?.getBoundingClientRect();
      const tela = document.querySelector('.celular-tela')?.getBoundingClientRect();
      const quadro = document.querySelector('.video-quadro')?.getBoundingClientRect();
      if (!texto || !cel || !tela || !quadro) return null;
      return {
        textoDireita: texto.right, textoBaixo: texto.bottom, celEsquerda: cel.left, celDireita: cel.right, celTopo: cel.top,
        proporcaoTela: tela.width / tela.height, proporcaoVideo: quadro.width / quadro.height,
        videoCentrado: Math.abs((quadro.left + quadro.right) / 2 - (tela.left + tela.right) / 2) < 1.5,
        videoDentro: quadro.left >= tela.left - 0.5 && quadro.right <= tela.right + 0.5 && quadro.top >= tela.top - 0.5 && quadro.bottom <= tela.bottom + 0.5,
        largura: innerWidth,
      };
    });
    const disposicao = !g ? false : largura >= 800
      ? g.textoDireita <= g.celEsquerda + 0.5
      : g.textoBaixo <= g.celTopo + 0.5 && g.celEsquerda >= 15.5 && g.celDireita <= g.largura - 15.5;
    conferir(titulo,
      Boolean(g) && disposicao && Math.abs(g.proporcaoTela - 19.5 / 9) < 0.05 && Math.abs(g.proporcaoVideo - 16 / 9) < 0.05 && g.videoCentrado && g.videoDentro,
      g ? JSON.stringify({ tela: g.proporcaoTela.toFixed(3), video: g.proporcaoVideo.toFixed(3), esq: Math.round(g.celEsquerda), dir: Math.round(g.celDireita) }) : 'elementos não encontrados');
    await contexto.close();
    });
  }
}

/* ---------- 4. Tela 2 ---------- */
grupo('Tela 2 · Planos');
{
  const { pagina, contexto } = await abrir(1440);
  const cartoes = await pagina.$$eval('.plano', (els) => els.map((e) => ({ n: Number(e.dataset.plano), cams: e.querySelectorAll('.camera-mini').length, texto: e.textContent, destaque: e.classList.contains('plano-destaque'), cta: e.querySelector('[data-plano-cta]') })).map((c) => ({
    ...c,
    cta: { href: c.cta.getAttribute('href'), plano: c.cta.dataset.solPlano, msg: c.cta.dataset.solMensagem, abreSol: c.cta.hasAttribute('data-sol-abrir'),
      orbe: Boolean(c.cta.querySelector('.sol-orbe')), whats: Boolean(c.cta.querySelector('use[href="#ic-whatsapp"]')) },
  })));
  const certos = cartoes.filter((c) => {
    const p = planos.find((x) => x.cameras === c.n);
    return p && c.cams === p.cameras && c.texto.includes(formatarPreco(p.preco)) && c.texto.includes(`${p.caboMetros} m`) && c.texto.includes(p.uso);
  });
  conferir('5 planos com preço, cabo e uso; mini-planta com exatamente N câmeras', cartoes.length === 5 && certos.length === 5, `${certos.length}/5`);
  const destaques = cartoes.filter((c) => c.destaque).map((c) => c.n);
  conferir('Destaque "Cobertura completa" só no plano de 4 câmeras', destaques.length === 1 && destaques[0] === 4 && cartoes.find((c) => c.n === 4).texto.includes('Cobertura completa'));
  const claro = await pagina.$eval('.tudo-claro', (e) => e.textContent);
  conferir('"Simples de contratar": assinatura eletrônica, taxa de instalação, mensalidades na ativação, pagamento',
    ['ZapSign', 'Taxa de instalação', 'ativação'].every((t) => claro.includes(t)));
  // Taxa de instalação = 1 mensalidade do plano, paga antecipadamente (Kauan, 25/09/2026).
  const taxas = cartoes.filter((c) => { const p = planos.find((x) => x.cameras === c.n); return c.texto.includes(`Instalação: R$ ${formatarPreco(p.preco)} (1 mensalidade)`); }).length;
  const gratis = (await pagina.evaluate(() => document.body.textContent)).match(/instalação (padrão )?(está )?inclu[sí]|sem investimento inicial|sem pagar antes/i);
  conferir('Cada plano mostra a taxa de instalação (1 mensalidade) e nada diz que a instalação é grátis', taxas === 5 && !gratis,
    `${taxas}/5${gratis ? `; achado: "${gratis[0]}"` : ''}`);
  // Desde 02/11/2026 o site mostra as condições do contrato (documento de planos), sem as regras antigas.
  const textoPag = await pagina.evaluate(() => document.body.textContent);
  const contratoVisivel = ['24 meses', '30%', 'IPCA', 'Os equipamentos são da SC', 'Foro'].filter((t) => !textoPag.includes(t));
  conferir('Bloco "Condições do contrato" mostra prazo, multa, reajuste, propriedade e foro', contratoVisivel.length === 0 && Boolean(await pagina.$('#contrato')), contratoVisivel.join(', '));
  const errado = textoPag.match(/multa de 50|50% das mensalidades|renova(ção)? autom[aá]tic[ao] por mais 24|garantia contra raio/i);
  conferir('Nenhuma condição antiga ou promessa fora do documento (50%, renovação automática, garantia contra raio)', !errado, errado ? `achado: "${errado[0]}"` : '');

  // Plano de 8 câmeras: uma linha explica o gravador de 8 canais (texto de dados.ts, ligado ao campo `gravador`); os outros não a têm.
  const plano8 = planos.find((x) => x.cameras === 8);
  const linhaGravador = plano8 ? explicacaoGravador(plano8) : null;
  const comLinhaGravador = cartoes.filter((c) => c.texto.includes('Gravador de ')).map((c) => c.n);
  conferir('Plano de 8 câmeras mostra "Gravador de 8 canais: um canal para cada câmera"; os outros planos não repetem a linha',
    linhaGravador === 'Gravador de 8 canais: um canal para cada câmera' && Boolean(cartoes.find((c) => c.n === 8)?.texto.includes(linhaGravador)) && comLinhaGravador.join() === '8',
    `planos com a linha: ${comLinhaGravador.join(', ') || 'nenhum'}`);
  // O preço de cada cartão cabe na largura dele (a grade de 5 colunas é o ponto mais apertado; scrollWidth da página não mostra isso).
  const precosCortados = await pagina.evaluate(() => [...document.querySelectorAll('.plano .preco')].filter((e) => e.scrollWidth > e.clientWidth + 1).length);
  conferir('Planos no computador: o preço de cada cartão cabe na largura do cartão (sem texto passando da borda)', precosCortados === 0, `${precosCortados} cartão(ões) com o preço cortado`);

  // Contrato em linguagem simples (11/11/2026): 5 perguntas curtas e, embaixo, um <details> com a lista completa.
  await protegido('Contrato: 5 perguntas curtas com as respostas de dados.ts e um <details> "Ler todas as condições do contrato" fechado, com todos os títulos de condicoesContrato (abre ao tocar)', async () => {
  const contrato = await pagina.evaluate(() => {
    const bloco = document.querySelector('#contrato');
    const detalhes = bloco?.querySelector('details');
    return {
      perguntas: [...(bloco?.querySelectorAll('.contrato-pergunta') ?? [])].map((h) => h.textContent.trim()),
      respostas: [...(bloco?.querySelectorAll('.contrato-item p') ?? [])].map((p) => p.textContent.trim()),
      detalhes: Boolean(detalhes), aberto: Boolean(detalhes?.open),
      resumo: (detalhes?.querySelector('summary')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      textoDetalhes: detalhes?.textContent ?? '',
      itensNoDetalhe: detalhes?.querySelectorAll('.condicao').length ?? 0,
      perguntasForaDoFaq: document.querySelectorAll('#contrato [data-pergunta], #contrato .pergunta').length,
    };
  });
  const titulosFaltando = condicoesContrato.filter((c) => !contrato.textoDetalhes.includes(c.titulo)).map((c) => c.titulo);
  await pagina.click('#contrato details summary');
  const detalheAberto = await pagina.evaluate(() => Boolean(document.querySelector('#contrato details')?.open));
  const ultimoVisivel = await pagina.locator('#contrato details .condicao').last().isVisible();
  conferir('Contrato: 5 perguntas curtas com as respostas de dados.ts e um <details> "Ler todas as condições do contrato" fechado, com todos os títulos de condicoesContrato (abre ao tocar)',
    contrato.perguntas.length === 5 && contrato.perguntas.join('|') === contratoSimples.map((q) => q.pergunta).join('|')
      && contrato.respostas.join('|') === contratoSimples.map((q) => q.resposta).join('|')
      && contrato.detalhes && !contrato.aberto && /Ler todas as condições do contrato/.test(contrato.resumo)
      && titulosFaltando.length === 0 && contrato.itensNoDetalhe === condicoesContrato.length && contrato.perguntasForaDoFaq === 0
      && detalheAberto && ultimoVisivel,
    `${contrato.perguntas.length} perguntas; ${contrato.itensNoDetalhe}/${condicoesContrato.length} condições no <details>${titulosFaltando.length ? `; faltam: ${titulosFaltando.join(', ')}` : ''}`);
  });
  const zap = await pagina.$$eval('.plano-cta', (els) => els.filter((a) => { const u = new URL(a.href); const t = u.searchParams.get('text') || ''; return u.host === 'wa.me' && /quero contratar/.test(t) && /R\$ \d/.test(t) && /instalação/.test(t); }).length);
  conferir('"Quero este plano" abre o WhatsApp da equipe com o plano, o valor e a pergunta da instalação', zap === 5, `${zap}/5`);
  const simular = await pagina.$$eval('.plano', (els) => els.filter((e) => e.querySelector('.plano-simular')?.getAttribute('href') === `/monte-seu-sistema/?cameras=${e.dataset.plano}`).length);
  conferir('"Ver no configurador" leva à página /monte-seu-sistema/ com a quantidade de câmeras do plano', simular === 5, `${simular}/5`);
  await pagina.click('#guia-redes');
  const aba = await pagina.evaluate(() => ({ redes: !document.getElementById('aba-redes').hidden, cameras: !document.getElementById('aba-cameras').hidden }));
  await pagina.focus('#guia-redes');
  await pagina.keyboard.press('ArrowRight');
  const teclado = await pagina.evaluate(() => document.activeElement.id);
  conferir('Abas de proposta funcionam (clique e setas do teclado)', aba.redes && !aba.cameras && teclado === 'guia-alarme');

  // "Pedir proposta" e o texto da proposta aparecem uma vez só (11/11/2026), abaixo dos painéis, com uma aba de serviço aberta.
  const htmlDaInicial = readFileSync(path.join(dist, 'index.html'), 'utf8');
  const vezesNoHtml = htmlDaInicial.split(textoProposta).length - 1;
  conferir('O textoProposta aparece uma vez só no HTML da inicial', vezesNoHtml === 1, `${vezesNoHtml} vez(es)`);
  await protegido('"Pedir proposta": um só botão e um só texto, abaixo do painel, visíveis nas 4 abas de serviço (cada uma com a própria mensagem) e escondidos nas câmeras; o condomínio mantém os links próprios', async () => {
  const lerProposta = () => pagina.evaluate((texto) => {
    const bloco = document.querySelector('[data-proposta-unica]');
    const botao = document.querySelector('[data-proposta-botao]');
    const painel = [...document.querySelectorAll('.painel-servico')].find((p) => !p.hidden);
    return {
      blocos: document.querySelectorAll('[data-proposta-unica]').length,
      visivel: Boolean(bloco) && !bloco.hidden && getComputedStyle(bloco).display !== 'none',
      mensagem: botao?.dataset.solMensagem ?? '',
      href: botao?.getAttribute('href') ?? null,
      orbe: Boolean(botao?.querySelector('.sol-orbe')), whats: Boolean(botao?.querySelector('use[href="#ic-whatsapp"]')),
      abreSol: Boolean(botao?.hasAttribute('data-sol-abrir')),
      botoesPedir: [...document.querySelectorAll('#planos a, #planos button')].filter((e) => /Pedir proposta/.test(e.textContent)).length,
      textoVisivel: document.body.innerText.split(texto).length - 1,
      abaixoDoPainel: Boolean(bloco && painel) && bloco.getBoundingClientRect().top >= painel.getBoundingClientRect().bottom,
      painelRepete: document.querySelectorAll('.painel-servico a[data-sol-abrir], .painel-servico [data-proposta-botao]').length,
    };
  }, textoProposta);
  const estados = [];
  for (const s of servicosProposta) {
    await pagina.click(`#guia-${s.id}`);
    estados.push({ id: s.id, ...(await lerProposta()) });
  }
  const esperadaDe = (s) => `Quero uma proposta de ${s.titulo.toLowerCase()} para o meu ambiente.`;
  const abasOk = estados.every((e, i) => e.blocos === 1 && e.visivel && e.mensagem === esperadaDe(servicosProposta[i]) && e.href === '#contato' && e.orbe && !e.whats && e.abreSol
    && e.botoesPedir === 1 && e.textoVisivel === 1 && e.abaixoDoPainel && e.painelRepete === 0);
  await pagina.click('#guia-cameras');
  const nasCameras = await lerProposta();
  const condominioLinks = await pagina.evaluate(() => {
    document.querySelector('#guia-condominio').click();
    const p = document.querySelector('#aba-condominio');
    return { conhecer: p.querySelector('a[href="/condominio/"]')?.textContent.trim(), configurador: p.querySelector('a[href="/monte-seu-sistema/?ambiente=condominio"]')?.textContent.trim() };
  });
  conferir('"Pedir proposta": um só botão e um só texto, abaixo do painel, visíveis nas 4 abas de serviço (cada uma com a própria mensagem) e escondidos nas câmeras; o condomínio mantém os links próprios',
    abasOk && !nasCameras.visivel && nasCameras.textoVisivel === 0 && Boolean(condominioLinks.conhecer) && Boolean(condominioLinks.configurador),
    JSON.stringify(estados.map((e) => ({ id: e.id, visivel: e.visivel, botoes: e.botoesPedir, texto: e.textoVisivel, msg: e.mensagem.slice(0, 40) }))));

  // Tocar no botão abre a Sol com a mensagem da aba escolhida; a página não sai do lugar.
  await pagina.route('**/webhook/sol-site', (rota) => rota.abort());
  await pagina.click('#guia-alarme');
  const mensagemDoAlarme = (await lerProposta()).mensagem;
  await pagina.click('[data-proposta-botao]');
  const solAbriu = await pagina.waitForSelector('.sol-painel.sol-painel-visivel', { timeout: 5000 }).then(() => true, () => false);
  const primeiraFala = await pagina.waitForSelector('.sol-msg-eu .sol-msg-corpo', { timeout: 5000 }).then((el) => el.textContent(), () => '');
  conferir('"Pedir proposta" abre a Sol com a mensagem da aba escolhida e a página não sai do lugar', solAbriu && (primeiraFala ?? '').trim() === mensagemDoAlarme.trim() && !pagina.url().endsWith('#contato'), `${mensagemDoAlarme} → ${primeiraFala}`);
  });
  await contexto.close();
}

/* ---------- 5. Tela 3 ---------- */
grupo('Tela 3 · Configurador (/monte-seu-sistema/)');
{
  const { pagina, contexto, erros } = await abrir(1440, {}, 'monte-seu-sistema/');
  const geral = await pagina.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    whatsFora: [...document.querySelectorAll('a[href*="wa.me"]')].filter((a) => !a.closest('#contato')).length,
    whatsDentro: document.querySelectorAll('#contato a[href*="wa.me"]').length,
    ancorasQuebradas: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.querySelector(h)),
    texto: document.body.textContent,
  }));
  conferir('Página do configurador: um título principal, WhatsApp só em "Fale com a SC", sem âncora quebrada, sem erro e sem condição contratual ou "instalação inclusa"',
    geral.h1 === 1 && geral.whatsFora === 0 && geral.whatsDentro > 0 && geral.ancorasQuebradas.length === 0 && erros.length === 0
      && !/prazo mínimo|24 meses|multa|IPCA|valor de reposição|desistência|instalação (padrão )?(está )?inclu[sí]|sem investimento inicial/i.test(geral.texto),
    JSON.stringify({ ...geral, texto: undefined, erros: erros.slice(0, 1) }));
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

  // Vindo do plano de 4 câmeras (/monte-seu-sistema/?cameras=4)
  await pagina.goto(`${endereco}monte-seu-sistema/?cameras=4`, { waitUntil: 'networkidle' });
  const r4 = await rec();
  const n4 = await nCameras();
  conferir('?cameras=4 já chega com as 4 câmeras do plano marcadas', n4 === 4 && r4.tipo === 'exato' && r4.plano === '4', `${n4} câmeras; ${r4.tipo}:${r4.plano}`);
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
  const paraSol = await pagina.$eval('[data-config-enviar]', (e) => e.dataset.solMensagem);
  conferir('Mensagem para a Sol leva ambiente, quantidade, pontos, plano, valor e recursos',
    msg === paraSol &&['Ambiente: Casa', 'Câmeras: 8', 'Plano de 8 câmeras', '159,90', 'nobreak', 'imagem colorida à noite', 'entrada principal'].every((t) => msg.includes(t)), msg.replace(/\n/g, ' / ').slice(0, 160));

  await pagina.click('[data-config-ambiente="condominio"]');
  await pagina.click('[data-cond-sistema][value="facial"] ~ .caixinha');
  const cond = await rec();
  const msgCond = await pagina.$eval('[data-mensagem]', (e) => e.textContent);
  conferir('Condomínio vai para proposta personalizada', cond.tipo === 'proposta' && msgCond.includes('Condomínio Evoluído') && msgCond.includes('controle de acesso facial'));
  await pagina.goto(`${endereco}monte-seu-sistema/?ambiente=condominio`, { waitUntil: 'networkidle' });
  const viaLink = await pagina.$eval('[data-config-ambiente="condominio"]', (b) => b.getAttribute('aria-pressed'));
  conferir('?ambiente=condominio abre o configurador no condomínio (link da aba Condomínio)', viaLink === 'true', String(viaLink));
  // Endereço antigo: /#monte vai para a página nova
  await pagina.goto(`${endereco}#monte`, { waitUntil: 'networkidle' });
  conferir('Link antigo /#monte leva a /monte-seu-sistema/', new URL(pagina.url()).pathname === '/monte-seu-sistema/', pagina.url());
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
  conferir('10 perguntas; a busca "celular" mostra a resposta certa', perguntas === 10 && visiveis[0]?.includes('pelo celular'), visiveis.join(' | '));
  await pagina.fill('[data-busca]', 'xyzabc');
  const semResultado = await pagina.$eval('[data-sem-resultado]', (e) => !e.hidden && !e.querySelector('[data-sol-pergunta]').hidden && !e.querySelector('a[href*="wa.me"]'));
  conferir('Busca sem resultado oferece perguntar para a Sol (sem WhatsApp)', semResultado);
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
  await irPara('.contato-caixa'); modos.push(await modo());
  // O configurador tem página própria desde 17/10/2026: lá a barra mostra o resumo do sistema.
  await pagina.goto(`${endereco}monte-seu-sistema/`, { waitUntil: 'networkidle' });
  await irPara('.config-planta'); modos.push(await modo());
  await pagina.goto(endereco, { waitUntil: 'networkidle' });
  conferir('Barra fixa muda conforme a seção (inicial e configurador)', modos.join(',') === 'contato,plano,contato (escondida),configurador', modos.join(' → '));
  const barraSemWhats = await pagina.$eval('.barra-fixa', (b) => !b.querySelector('a[href*="wa.me"]') && !b.querySelector('.barra-sol').hidden);
  conferir('Barra fixa sem WhatsApp: fica a Sol', barraSemWhats);

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
    // Botão fixo de WhatsApp nos botões rápidos: saiu em 28/09/2026 (noite); tem de ficar null.
    const escape = document.querySelector('.sol-rapidas a[href*="wa.me"]');
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
  conferir('Chat abre com a Sol pedindo o nome, sem botão fixo de WhatsApp (nada vai ao servidor ainda)',
    t0.ultimaSol.includes('assistente virtual') && t0.ultimaSol.endsWith('como posso te chamar?') && t0.chips.length === 0
      && t0.escape === null && t0.dica === 'Seu nome' && pedidos.length === 0,
    JSON.stringify({ escape: t0.escape?.texto, dica: t0.dica, pedidos: pedidos.length }));

  // Quem pede o WhatsApp recebe o botão da equipe na hora, e o roteiro segue na mesma pergunta.
  await falar(pagina, 'prefiro falar pelo zap', '.sol-conversa .sol-whats');
  const tPede = await pagina.evaluate(() => ({
    fala: [...document.querySelectorAll('.sol-msg-sol:not(.sol-digitando) .sol-msg-corpo')].map((m) => m.textContent).at(-1) ?? '',
    whats: [...document.querySelectorAll('.sol-conversa .sol-whats')].map((a) => ({ href: a.href, icone: Boolean(a.querySelector('use[href="#ic-whatsapp"]')) })),
    dica: document.querySelector('#sol-campo').placeholder,
  }));
  conferir('Pedir o WhatsApp no roteiro mostra o botão da equipe e continua na mesma pergunta (nada vai ao servidor)',
    tPede.whats.length === 1 && tPede.whats[0].href.startsWith(`https://wa.me/${contato.whatsapp}?text=`) && tPede.whats[0].icone
      && /no WhatsApp\. Se preferir seguir por aqui, como posso te chamar\?$/.test(tPede.fala)
      && tPede.dica === 'Seu nome' && pedidos.length === 0,
    JSON.stringify(tPede));

  await falar(pagina, 'Ana Paula');
  const t1 = await tela(pagina);
  conferir('Depois do nome, pede o WhatsApp com teclado numérico e o aviso de autorização com a política',
    t1.ultimaSol.startsWith('Prazer, Ana!') && /WhatsApp com DDD/.test(t1.ultimaSol) && t1.teclado === 'numeric'
      && /autoriza a SC Soluções a te chamar no WhatsApp/.test(t1.aviso) && t1.avisoLink === '/privacidade/' && t1.escape === null,
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
  conferir('O que a pessoa procura: 5 botões, sem WhatsApp',
    t3.ultimaSol === 'O que você está procurando?' && t3.chips.join('|') === 'Câmeras|Alarme|Controle de acesso|Redes e Wi-Fi|Outro' && t3.escape === null,
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
  // Valores derivados dos planos (02/11/2026): custo por câmera e a diferença entre 3 e 4 câmeras.
  const preco3 = planos.find((x) => x.cameras === 3).preco, preco4 = planos.find((x) => x.cameras === 4).preco;
  const precosValidos = new Set([...planos.map((p) => formatarPreco(p.preco)), ...planos.map((p) => precoPorCamera(p)), formatarPreco(preco4 - preco3)]);
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
    tReset.falas === 1 && tReset.minhas.length === 0 && tReset.ultimaSol.endsWith('como posso te chamar?') && tReset.escape === null,
    JSON.stringify({ falas: tReset.falas, minhas: tReset.minhas.length }));

  // Recarregar no meio do roteiro volta na mesma pergunta.
  await falar(pagina, 'Bia');
  await pagina.reload({ waitUntil: 'networkidle' });
  await pagina.click('.sol-lancador');
  await pagina.waitForSelector('.sol-painel.sol-painel-visivel');
  await pagina.waitForTimeout(300);
  const tMeio = await tela(pagina);
  conferir('Recarregar no meio do roteiro volta na mesma pergunta',
    tMeio.ultimaSol.startsWith('Prazer, Bia!') && tMeio.teclado === 'numeric' && tMeio.aviso !== '' && tMeio.escape === null);
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

  // "Quero este plano" da página antes do roteiro: abre a Sol, guarda a escolha e, depois da
  // captura, manda a frase com o número do plano (o servidor avisa a equipe com o plano certo).
  {
    const pedidosPlano = [];
    const { pagina: p, contexto: c } = await abrir(1440);
    await simular(p, pedidosPlano);
    // Desde 02/11/2026 o "Quero este plano" dos cartões abre o WhatsApp (conferido em "Tela 2").
    // Aqui fica a conferência do mecanismo da Sol: um botão de venda com plano escolhido
    // (data-sol-mensagem + data-sol-plano, lidos na hora do toque) abre o chat e guarda a escolha.
    await p.evaluate(() => {
      const g = document.querySelector('[data-sol-abrir]:not([data-sol-pergunta])');
      g.dataset.solMensagem = 'Quero o plano de 4 câmeras';
      g.dataset.solPlano = '4';
      g.click();
    });
    await p.waitForSelector('.sol-painel.sol-painel-visivel');
    await esperarSol(p);
    const tPlano = await tela(p);
    const url = p.url();
    await capturar(p);
    await p.waitForSelector('.sol-avisado', { timeout: 8000 });
    await esperarSol(p);
    conferir('Botão de venda com plano escolhido abre a Sol e, depois do roteiro, vai com o plano; a página não sai do lugar',
      tPlano.minhas[0] === 'Quero o plano de 4 câmeras' && tPlano.ultimaSol === 'Já te respondo! Antes, como posso te chamar?'
        && !url.endsWith('#contato') && pedidosPlano[0]?.tipo === 'lead'
        && pedidosPlano[1]?.mensagem === 'Quero o plano de 4 câmeras' && pedidosPlano[1]?.plano === 4,
      JSON.stringify(pedidosPlano.map((x) => x.tipo === 'lead' ? 'lead' : `${x.mensagem} (plano ${x.plano ?? '-'})`)));
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

/* ---------- Páginas de solução (/casa/, /comercio/, /empresa/, /condominio/) ---------- */
// Páginas leves, só de texto: sem canvas, sem maquete. Textos em src/lib/dados.ts.
grupo('Páginas de solução');
{
  const paginasSolucao = [
    { id: 'casa', nome: 'Casa' },
    { id: 'comercio', nome: 'Comércio' },
    { id: 'empresa', nome: 'Empresa' },
    { id: 'condominio', nome: 'Condomínio' },
  ];
  // O que a pessoa lê na página (o texto invisível não conta).
  const lerPagina = (p) => p.evaluate(() => ({
    titulo: document.title,
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
    canvas: document.querySelectorAll('canvas').length,
    restoDoRecurso: document.querySelectorAll('[data-maquete], [data-palco], [data-tour], [data-capitulo]').length,
    destaques: document.querySelectorAll('.solucao-destaques li').length,
    blocos: [...document.querySelectorAll('.solucao-bloco')].map((b) => ({ h2: b.querySelector('h2')?.textContent.trim(), p: b.querySelector('p')?.textContent.trim() })),
    whatsFora: [...document.querySelectorAll('a[href*="wa.me"]')].filter((a) => !a.closest('#contato')).length,
    whatsDentro: document.querySelectorAll('#contato a[href*="wa.me"]').length,
    ancorasQuebradas: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.querySelector(h)),
    texto: document.body.innerText,
    jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
    menu: ['/casa/', '/comercio/', '/empresa/', '/condominio/'].every((h) => document.querySelector(`.nav-menu a[href="${h}"]`) && document.querySelector(`.menu-celular-solucoes a[href="${h}"]`)),
  }));
  const cidadeNome = empresa.cidade.replace(/\s+/g, ' ').split(' - ')[0];

  for (const { id, nome } of paginasSolucao) {
    const { pagina, contexto, erros, bytes } = await abrir(1440, { reducedMotion: 'reduce' }, `${id}/`);
    const r = await lerPagina(pagina);
    const status = (await pagina.request.get(`${endereco}${id}/`)).status();
    conferir(`${nome}: a página responde (200), tem um só título principal, 2 a 4 blocos, destaques e nenhum canvas`,
      status === 200 && r.h1.length === 1 && r.h1[0].length > 10 && r.canvas === 0 && r.restoDoRecurso === 0 && r.destaques >= 3 && r.blocos.length >= 2 && r.blocos.length <= 4
        && r.blocos.every((b) => b.h2 && b.p) && r.ancorasQuebradas.length === 0,
      JSON.stringify({ status, h1: r.h1, canvas: r.canvas, destaques: r.destaques, blocos: r.blocos.length, ancorasQuebradas: r.ancorasQuebradas }));
    conferir(`${nome}: WhatsApp da equipe só em "Fale com a SC" e zero erros no console`, r.whatsFora === 0 && r.whatsDentro > 0 && erros.length === 0,
      `${r.whatsDentro} no contato, ${r.whatsFora} fora; erros: ${erros.slice(0, 1).join('') || 0}`);
    const infinitas = await pagina.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length);
    conferir(`${nome}: "reduzir movimento": nenhuma animação contínua roda`, infinitas === 0, `${infinitas} animações contínuas`);
    conferir(`${nome}: nada fala de maquete, 3D nem "instalação inclusa"; menu "Soluções" leva às quatro páginas`,
      !/maquete|3D|girar|gire|pontos cegos|instalação inclu|sem investimento/i.test(r.texto) && r.menu, '');
    const ld = r.jsonld.map((j) => { try { return JSON.parse(j)['@graph']; } catch { return []; } }).flat();
    const pagLd = ld.find((g) => g['@type'] === 'WebPage');
    const trilha = ld.find((g) => g['@type'] === 'BreadcrumbList');
    conferir(`${nome}: dados estruturados (schema.org) da página e título com a cidade`,
      r.jsonld.length === 1 && pagLd?.url === `${empresa.site}/${id}/` && trilha?.itemListElement?.length === 2 && r.titulo.includes(cidadeNome), `${r.jsonld.length} bloco(s); ${r.titulo}`);

    const tamanhos = [...bytes.urls].map((u) => { const f = path.join(dist, u.endsWith('/') ? `${u}index.html` : u); return existsSync(f) && statSync(f).isFile() ? { u, t: statSync(f).size } : null; }).filter(Boolean);
    const peso = tamanhos.reduce((s, x) => s + x.t, 0);
    conferir(`${nome}: página leve (peso total ≤ 300 KB, sem compactação)`, peso <= 300 * 1024, `${(peso / 1024).toFixed(0)} KB em ${tamanhos.length} arquivos`);

    if (id === 'condominio') {
      // Condomínio é proposta personalizada: nada de preço, dias de gravação nem quantidade de câmeras.
      conferir('Condomínio: sem preço, dias de gravação, quantidade de câmeras, prazo de contrato nem "instalação inclusa"',
        !/R\$|\d+\s*(dias|câmeras)|aproximadamente|instalação inclusa|sem investimento|24 meses|multa|mensalidade/i.test(r.texto), r.texto.match(/R\$|\d+\s*(dias|câmeras)|aproximadamente|mensalidade/i)?.[0] ?? '');
      const botao = await pagina.evaluate(() => {
        const a = document.querySelector('.solucao-acoes a[data-sol-abrir]');
        return a && { href: a.getAttribute('href'), msg: a.dataset.solMensagem, orbe: Boolean(a.querySelector('.sol-orbe')), whats: Boolean(a.querySelector('use[href="#ic-whatsapp"]')), config: document.querySelector('.solucao-acoes a[href="/monte-seu-sistema/?ambiente=condominio"]') !== null };
      });
      conferir('Condomínio: o botão de proposta tem o orbe da Sol, leva a #contato sem JavaScript e abre o chat da Sol',
        botao && botao.href === '#contato' && botao.msg?.length > 20 && botao.orbe && !botao.whats && botao.config, JSON.stringify(botao));
      await pagina.click('.solucao-acoes a[data-sol-abrir]');
      await pagina.waitForSelector('.sol-painel.sol-painel-visivel', { timeout: 5000 });
      conferir('Condomínio: "Pedir proposta" abre a Sol e a página não sai do lugar', !pagina.url().endsWith('#contato'), pagina.url());
      await pagina.keyboard.press('Escape');
    } else {
      conferir(`${nome}: planos de 1 a 8 câmeras, gravação de aproximadamente 10 dias, imagens no celular dependem de energia e internet, premium sob orçamento`,
        /Planos de 1 a 8 câmeras/.test(r.texto) && /aproximadamente 10 dias/.test(r.texto) && /energia e de internet/.test(r.texto) && /sob orçamento/.test(r.texto)
          && !/24 meses|multa|IPCA/i.test(r.texto), '');
      const botoes = await pagina.evaluate((amb) => ({
        planos: document.querySelector('.solucao-acoes a[href="/#planos"]')?.textContent.trim(),
        config: document.querySelector(`.solucao-acoes a[href="/monte-seu-sistema/?ambiente=${amb}"]`)?.textContent.trim(),
        whats: document.querySelectorAll('.solucao-acoes a[href*="wa.me"]').length,
      }), id);
      conferir(`${nome}: botões levam aos planos (/#planos) e ao configurador (?ambiente=${id})`, Boolean(botoes.planos) && Boolean(botoes.config) && botoes.whats === 0, JSON.stringify(botoes));
    }
    await contexto.close();

    // Celular: sem rolagem lateral, botões ≥ 44 px, menu com "Contato", sem erros
    const cel = await abrir(390, {}, `${id}/`);
    await rolarTudo(cel.pagina);
    const celInfo = await cel.pagina.evaluate(() => ({
      sobra: document.documentElement.scrollWidth - innerWidth,
      pequenos: [...document.querySelectorAll('.solucao-acoes a, .rodape-nav a, .menu-botao')].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height < 44; }).map((el) => `${el.textContent.trim().slice(0, 20)} ${Math.round(el.getBoundingClientRect().height)}`),
      contatoNoMenu: Boolean(document.querySelector('#menu-celular nav a[href="#contato"]')),
    }));
    conferir(`${nome} no celular: sem rolagem lateral, toques ≥ 44 px, item "Contato" no menu e sem erros`,
      celInfo.sobra <= 0 && celInfo.pequenos.length === 0 && celInfo.contatoNoMenu && cel.erros.length === 0, JSON.stringify({ ...celInfo, erros: cel.erros.slice(0, 1) }));
    await cel.contexto.close();
    for (const largura of [360, 768, 1024]) {
      const t = await abrir(largura, {}, `${id}/`);
      const sobra = await t.pagina.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (sobra > 0) conferir(`${nome} sem rolagem horizontal em ${largura} px`, false, `${sobra} px`);
      await t.contexto.close();
    }

    // Sem JavaScript: todo o texto e os botões continuam lá; o de proposta leva a "Fale com a SC"
    const semJs = await abrir(1440, { javaScriptEnabled: false }, `${id}/`);
    const info = await semJs.pagina.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      blocos: document.querySelectorAll('.solucao-bloco').length,
      contato: Boolean(document.querySelector('#contato a[href*="wa.me"]')),
      botoes: [...document.querySelectorAll('.solucao-acoes a')].map((a) => a.getAttribute('href')).join(' '),
    }));
    const botoesEsperados = id === 'condominio' ? '#contato /monte-seu-sistema/?ambiente=condominio' : `/#planos /monte-seu-sistema/?ambiente=${id}`;
    conferir(`${nome} sem JavaScript: texto, blocos, contato e botões funcionam`, info.h1 === 1 && info.blocos >= 2 && info.contato && info.botoes === botoesEsperados, JSON.stringify(info));
    await semJs.contexto.close();
  }

  // Inicial: sem os convites antigos; a aba dos planos, o configurador e o menu levam às páginas de solução
  const ini = await abrir(1440);
  const outros = await ini.pagina.evaluate(() => ({
    planos: document.querySelector('#aba-condominio a[href="/condominio/"]')?.textContent.trim(),
    menu: ['/casa/', '/comercio/', '/empresa/', '/condominio/'].every((h) => document.querySelector(`.nav-menu a[href="${h}"]`) && document.querySelector(`.menu-celular-solucoes a[href="${h}"]`)),
    rodape: ['/casa/', '/comercio/', '/empresa/', '/condominio/'].every((h) => document.querySelector(`.rodape-nav a[href="${h}"]`)),
  }));
  await ini.pagina.goto(`${endereco}monte-seu-sistema/`, { waitUntil: 'networkidle' });
  outros.configurador = await ini.pagina.evaluate(() => document.querySelector('[data-condominio] a[href="/condominio/"]')?.textContent.trim());
  conferir('Inicial leva às páginas de solução: aba "Condomínio" dos planos, menu "Soluções" e rodapé; o configurador também (sem falar em 3D)',
    Boolean(outros.planos) && Boolean(outros.configurador) && outros.menu && outros.rodape && !/3D|maquete/i.test(`${outros.planos} ${outros.configurador}`), JSON.stringify(outros));
  await ini.contexto.close();

  // O pacote gerado não leva Three.js, maquete nem imagens de maquete
  const arquivosDist = (function listar(pasta) {
    return readdirSync(pasta, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listar(path.join(pasta, e.name)) : [path.join(pasta, e.name)]));
  })(dist);
  const comThree = arquivosDist.filter((f) => /\.(js|mjs|html|css)$/.test(f)).filter((f) => /WebGLRenderer|WebGL2RenderingContext|REVISION\s*=|THREE\./.test(readFileSync(f, 'utf8')));
  const restosMaquete = arquivosDist.filter((f) => /maquete|[\\/]assets[\\/]cena\./i.test(f));
  const paginasComCanvas = paginasSolucao.filter((p) => /<canvas/i.test(readFileSync(path.join(dist, p.id, 'index.html'), 'utf8')));
  conferir('Pacote gerado (dist): sem Three.js, sem arquivo de maquete e sem canvas nas páginas de solução',
    comThree.length === 0 && restosMaquete.length === 0 && paginasComCanvas.length === 0 && paginasSolucao.every((p) => existsSync(path.join(dist, p.id, 'index.html'))),
    `três: ${comThree.length}; maquete: ${restosMaquete.length}; canvas: ${paginasComCanvas.length}`);
  const jsDist = arquivosDist.filter((f) => f.endsWith('.js') && !f.includes(`${path.sep}calculadoras${path.sep}`)).reduce((s, f) => s + statSync(f).size, 0);
  console.log(`   (JavaScript do dist, sem o service worker das calculadoras: ${(jsDist / 1024).toFixed(0)} KB)`);
}

/* ---------- Toque onde quer câmera (/casa/ e /comercio/) ---------- */
// Ferramenta de src/components/ToqueCamera.astro: cada ponto marcado é uma câmera e o plano sai de planoParaCameras (dados.ts).
// O clique é dado direto no botão (el.click()) porque os pontos ficam sobre a foto e o rótulo de um pode cobrir o vizinho.
grupo('Toque onde quer câmera');
{
  const fachadasToque = [{ id: 'casa', nome: 'Casa' }, { id: 'comercio', nome: 'Comércio' }];
  const plano3 = planos.find((p) => p.cameras === 3);
  const plano8 = planos.find((p) => p.cameras === 8);
  const precoEsperado = (p) => (mostrarPrecos ? `R$ ${formatarPreco(p.preco)}` : 'Sob consulta');
  const botaoPonto = (pagina, i) => pagina.locator('[data-toque] button[data-ponto]').nth(i);
  const tocar = async (pagina, indices) => { for (const i of indices) await botaoPonto(pagina, i).evaluate((b) => b.click()); };
  const lerToque = (pagina) => pagina.evaluate(() => {
    const raiz = document.querySelector('[data-toque]');
    const visivel = (el) => Boolean(el) && !el.hidden && !el.closest('[hidden]');
    const q = (n) => raiz.querySelector(`[data-toque-${n}]`);
    const botoes = [...raiz.querySelectorAll('button[data-ponto]')];
    const cta = q('cta');
    return {
      pontos: botoes.length,
      pressionados: botoes.filter((b) => b.getAttribute('aria-pressed') === 'true').length,
      semAriaPressed: botoes.filter((b) => !['true', 'false'].includes(b.getAttribute('aria-pressed'))).length,
      rotulosMarcados: botoes.filter((b) => b.getAttribute('aria-pressed') === 'true' && /, marcada$/.test(b.getAttribute('aria-label') ?? '')).length,
      desabilitados: botoes.filter((b) => b.disabled).length,
      rotulos: botoes.map((b) => b.querySelector('.toque-rotulo')?.textContent.trim()),
      ariaLive: q('nome')?.closest('[aria-live]')?.getAttribute('aria-live') ?? null,
      qtd: q('qtd')?.textContent.trim(),
      conviteVisivel: visivel(q('convite')),
      planoVisivel: visivel(q('plano')),
      nome: q('nome')?.textContent.trim(),
      preco: q('preco')?.textContent.trim(),
      avisoVisivel: visivel(q('aviso')),
      aviso: q('aviso')?.textContent.trim(),
      ctaVisivel: visivel(cta),
      ctaTexto: cta?.textContent.replace(/\s+/g, ' ').trim(),
      ctaHref: cta?.getAttribute('href') ?? null,
      ctaClasse: cta?.classList.contains('plano-cta') ?? false,
      whatsForaDoContato: [...document.querySelectorAll('a[href*="wa.me"]')].filter((a) => !a.closest('#contato')).length,
    };
  });

  for (const { id, nome } of fachadasToque) {
    await protegido(`${nome}: Toque onde quer câmera`, async () => {
      const imagensFora = [];
      const { pagina, contexto, erros } = await abrir(1440, {}, `${id}/`, async (ctx) => {
        ctx.on('request', (r) => { if (r.resourceType() === 'image' && /^https?:/.test(r.url()) && !r.url().startsWith(endereco)) imagensFora.push(r.url()); });
      });
      await rolarTudo(pagina);

      // Estado inicial: convite, nada marcado, pontos ligados e sem link de WhatsApp (o botão ainda não existe)
      const ini = await lerToque(pagina);
      conferir(`${nome}: ferramenta começa com o convite, nenhum ponto marcado, pontos ativos e sem link de WhatsApp fora de "Fale com a SC"`,
        ini.pontos >= 6 && ini.pressionados === 0 && ini.semAriaPressed === 0 && ini.desabilitados === 0 && ini.conviteVisivel && !ini.planoVisivel && !ini.ctaVisivel
          && ini.ctaHref === null && ini.whatsForaDoContato === 0 && ini.qtd === '0 câmeras marcadas', JSON.stringify(ini));

      // 3 pontos: Plano de 3 câmeras, preço de dados.ts e botão "Quero este plano" com a mensagem
      await tocar(pagina, [0, 1, 2]);
      const t3 = await lerToque(pagina);
      const msg3 = t3.ctaHref ? new URL(t3.ctaHref).searchParams.get('text') ?? '' : '';
      const marcados3 = t3.rotulos.slice(0, 3);
      conferir(`${nome}: 3 pontos marcados mostram o ${nomePlano(plano3)} com o preço de dados.ts (${precoEsperado(plano3)}) e a contagem "3 câmeras marcadas"`,
        t3.planoVisivel && !t3.conviteVisivel && t3.nome === nomePlano(plano3) && t3.preco === precoEsperado(plano3) && t3.qtd === '3 câmeras marcadas' && !t3.avisoVisivel,
        JSON.stringify({ nome: t3.nome, preco: t3.preco, qtd: t3.qtd, aviso: t3.avisoVisivel }));
      conferir(`${nome}: "Quero este plano" abre wa.me/${contato.whatsapp} com "${nomePlano(plano3)}" e os pontos marcados, sem "instalação inclusa"`,
        t3.ctaVisivel && t3.ctaClasse && /Quero este plano/.test(t3.ctaTexto ?? '') && Boolean(t3.ctaHref?.startsWith(`https://wa.me/${contato.whatsapp}?text=`))
          && msg3.includes(nomePlano(plano3)) && marcados3.every((r) => r && msg3.includes(r)) && !/instalação inclu/i.test(msg3) && t3.whatsForaDoContato === 1,
        JSON.stringify({ href: t3.ctaHref?.slice(0, 60), msg: msg3, marcados3, whatsFora: t3.whatsForaDoContato }));
      conferir(`${nome}: aria-pressed dos pontos acompanha a marcação (3 "true", rótulo "marcada") e o resultado é aria-live`,
        t3.pressionados === 3 && t3.rotulosMarcados === 3 && t3.semAriaPressed === 0 && t3.ariaLive === 'polite', JSON.stringify({ pressionados: t3.pressionados, rotulosMarcados: t3.rotulosMarcados, ariaLive: t3.ariaLive }));

      // Mais três (seis no total): não há plano fixo de 6, então vale o de 8 câmeras com o aviso de folga
      await tocar(pagina, [3, 4, 5]);
      const t6 = await lerToque(pagina);
      conferir(`${nome}: 6 pontos marcados mostram o ${nomePlano(plano8)} com o aviso de folga`,
        t6.planoVisivel && t6.nome === nomePlano(plano8) && t6.preco === precoEsperado(plano8) && t6.avisoVisivel && /Você marcou 6 pontos/.test(t6.aviso ?? '') && /folga/.test(t6.aviso ?? '')
          && t6.qtd === '6 câmeras marcadas' && t6.pressionados === 6, JSON.stringify({ nome: t6.nome, preco: t6.preco, aviso: t6.aviso, qtd: t6.qtd }));

      // Desmarca tudo: volta o convite inicial
      await tocar(pagina, [0, 1, 2, 3, 4, 5]);
      const t0 = await lerToque(pagina);
      conferir(`${nome}: desmarcar tudo devolve o convite inicial, sem plano nem botão de WhatsApp`,
        t0.conviteVisivel && !t0.planoVisivel && !t0.ctaVisivel && t0.ctaHref === null && t0.pressionados === 0 && t0.qtd === '0 câmeras marcadas' && t0.whatsForaDoContato === 0, JSON.stringify(t0));

      // Imagens: nenhuma de outro domínio (pedidos de rede e <img> da página)
      const imgs = await pagina.evaluate(() => [...document.images].map((i) => i.currentSrc || i.src).filter(Boolean));
      const imgsFora = imgs.filter((u) => !u.startsWith(endereco) && !u.startsWith('data:'));
      conferir(`${nome}: nenhuma imagem vem de domínio diferente do site e a página tem zero erros no console`,
        imagensFora.length === 0 && imgsFora.length === 0 && imgs.length > 0 && erros.length === 0, JSON.stringify({ pedidosFora: imagensFora, imgFora: imgsFora, imagens: imgs.length, erros: erros.slice(0, 1) }));
      await contexto.close();
    });

    // Sem JavaScript: pontos desativados e um caminho para os planos
    await protegido(`${nome} sem JavaScript: Toque onde quer câmera`, async () => {
      const semJs = await abrir(1440, { javaScriptEnabled: false }, `${id}/`);
      const info = await semJs.pagina.evaluate(() => {
        const raiz = document.querySelector('[data-toque]');
        const botoes = [...raiz.querySelectorAll('button[data-ponto]')];
        const aviso = raiz.querySelector('[data-toque-semjs]');
        return {
          pontos: botoes.length,
          desabilitados: botoes.filter((b) => b.disabled).length,
          avisoVisivel: Boolean(aviso) && !aviso.hidden && aviso.getClientRects().length > 0,
          linkPlanos: Boolean(aviso?.querySelector('a[href="/#planos"]')),
          resultadoOculto: raiz.querySelector('[data-toque-resultado]')?.hidden === true,
          whatsFora: [...document.querySelectorAll('a[href*="wa.me"]')].filter((a) => !a.closest('#contato')).length,
        };
      });
      conferir(`${nome} sem JavaScript: pontos desativados, resultado escondido e link para /#planos`,
        info.pontos >= 6 && info.desabilitados === info.pontos && info.avisoVisivel && info.linkPlanos && info.resultadoOculto && info.whatsFora === 0, JSON.stringify(info));
      await semJs.contexto.close();
    });

    // 375 px, com a ferramenta aberta (seis pontos marcados mostram o resultado inteiro)
    await protegido(`${nome} em 375 px: Toque onde quer câmera`, async () => {
      const cel = await abrir(375, {}, `${id}/`);
      await tocar(cel.pagina, [0, 1, 2, 3, 4, 5]);
      await rolarTudo(cel.pagina);
      const m = await cel.pagina.evaluate(() => ({ largura: document.documentElement.clientWidth, sobra: document.documentElement.scrollWidth - 375 }));
      conferir(`${nome} em 375 px com a ferramenta usada: scrollWidth ≤ 375`, m.sobra <= 0 && m.largura === 375 && cel.erros.length === 0, JSON.stringify({ ...m, erros: cel.erros.slice(0, 1) }));
      await cel.contexto.close();
    });

    // Acessibilidade (axe) só na seção da ferramenta, com 3 pontos marcados
    await protegido(`${nome}: axe na ferramenta`, async () => {
      const achados = [];
      for (const largura of [1440, 390]) {
        const { pagina, contexto } = await abrir(largura, { reducedMotion: 'reduce' }, `${id}/`);
        await tocar(pagina, [0, 1, 2]);
        await rolarTudo(pagina);
        const r = await new AxeBuilder({ page: pagina }).include('#ferramenta').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        for (const v of r.violations) achados.push(`${largura}px: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ')}`);
        await contexto.close();
      }
      conferir(`${nome}: nenhuma violação de acessibilidade na seção da ferramenta (computador e celular)`, achados.length === 0, achados.slice(0, 3).join('; '));
    });
  }
}

/* ---------- Layout em 375 px (renovação de 11/11/2026) ---------- */
// O corpo da página tem overflow-x: clip, que esconde a sobra lateral de scrollWidth. Por isso, além de
// scrollWidth <= 375, a inicial confere a margem de 16 px, o celular dentro da tela e botões sem texto cortado.
grupo('Layout em 375 px');
{
  const paginas375 = [
    ['', 'Página inicial'], ['monte-seu-sistema/', '/monte-seu-sistema/'], ['calculadoras/', '/calculadoras/'], ['privacidade/', '/privacidade/'],
    ['casa/', '/casa/'], ['comercio/', '/comercio/'], ['empresa/', '/empresa/'], ['condominio/', '/condominio/'], ['nao-existe/', 'Página 404'],
  ];
  for (const [caminho, nome] of paginas375) {
    const { pagina, contexto } = await abrir(375, {}, caminho);
    await rolarTudo(pagina);
    const m = await pagina.evaluate(() => {
      const largura = document.documentElement.clientWidth;
      // Informativo: elementos que passam da borda direita (fora das áreas que rolam por dentro).
      const alem = [...document.body.querySelectorAll('*')]
        .filter((el) => {
          if (el.closest('.planos-trilho, .guias, svg, [hidden], .sol, .barra-fixa, .sr, .pular, .menu-celular')) return false;
          const r = el.getBoundingClientRect();
          const estilo = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && estilo.position !== 'fixed' && estilo.visibility !== 'hidden' && (r.right > largura + 1 || r.left < -1);
        })
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`);
      const texto = document.querySelector('.abertura-texto')?.getBoundingClientRect();
      const celular = document.querySelector('.celular')?.getBoundingClientRect();
      return {
        largura,
        sobra: document.documentElement.scrollWidth - largura,
        alem: [...new Set(alem)].slice(0, 5),
        esquerda: texto ? texto.left : null,
        celularDireita: celular ? celular.right : null,
        botoesCortados: [...document.querySelectorAll('.btn')]
          .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && !b.closest('[hidden], .sol') && b.scrollWidth > b.clientWidth + 1; })
          .map((b) => b.textContent.trim().slice(0, 30)),
      };
    });
    const inicialOk = caminho !== '' || (m.esquerda !== null && Math.abs(m.esquerda - 16) <= 0.5 && m.celularDireita !== null && m.celularDireita <= m.largura - 16 + 0.5);
    conferir(`${nome} em 375 px: scrollWidth ≤ 375${caminho === '' ? ', margem lateral de 16 px, celular dentro da tela' : ''} e nenhum botão com texto cortado`,
      m.largura === 375 && m.sobra <= 0 && m.botoesCortados.length === 0 && inicialOk,
      JSON.stringify({ sobra: m.sobra, cortados: m.botoesCortados, esquerda: m.esquerda, celularDireita: m.celularDireita, alemDaBorda: m.alem }));
    await contexto.close();
  }
}

/* ---------- Acessibilidade automática (axe-core, regras WCAG 2.2 A e AA) ---------- */
grupo('Acessibilidade (axe)');
{
  const regras = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
  const analisar = async (pagina, rotulo, achados) => {
    const r = await new AxeBuilder({ page: pagina }).withTags(regras).analyze();
    for (const v of r.violations) achados.push(`${rotulo}: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ')}`);
  };
  for (const [caminho, nome] of [['', 'Página inicial'], ['privacidade/', '/privacidade/'], ['condominio/', '/condominio/'], ['nao-existe/', 'Página 404'], ['monte-seu-sistema/', '/monte-seu-sistema/'], ['casa/', '/casa/'], ['comercio/', '/comercio/'], ['empresa/', '/empresa/'], ['calculadoras/', '/calculadoras/']]) {
    const achados = [];
    for (const largura of [1440, 390]) {
      const { pagina, contexto } = await abrir(largura, { reducedMotion: 'reduce' });
      if (caminho) await pagina.goto(`${endereco}${caminho}`, { waitUntil: 'networkidle' });
      await rolarTudo(pagina);
      await analisar(pagina, `${largura}px`, achados);
      await contexto.close();
    }
    conferir(`${nome}: nenhuma violação de acessibilidade (computador e celular)`, achados.length === 0, achados.slice(0, 3).join('; '));
  }
  const achadosChat = [];
  for (const largura of [1440, 390]) {
    const { pagina, contexto } = await abrir(largura, { reducedMotion: 'reduce' });
    // No celular o lançador fica escondido (a Sol abre pela barra fixa): basta estar na página.
    await pagina.waitForSelector('.sol[data-chegou] [data-sol-lancador]', { state: 'attached', timeout: 4000 });
    await pagina.evaluate(() => document.querySelector('[data-sol-lancador]').click());
    await pagina.waitForSelector('.sol-painel.sol-painel-visivel');
    await pagina.waitForTimeout(500);
    await analisar(pagina, `${largura}px`, achadosChat);
    await contexto.close();
  }
  conferir('Chat da Sol aberto: nenhuma violação de acessibilidade (computador e celular)', achadosChat.length === 0, achadosChat.slice(0, 3).join('; '));
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
    { n: '03', nome: 'monte-seu-sistema', sel: '#monte', mock: '03-monte-seu-sistema', caminho: 'monte-seu-sistema/?cameras=4', antes: async (p) => { await p.click('[data-recurso][value="colorida"] ~ .caixinha'); } },
    { n: '04', nome: 'como-funciona', sel: '#como-funciona', mock: '04-como-funciona' },
  ];
  for (const t of telas) {
    const { pagina, contexto } = await abrir(1440, {}, t.caminho ?? '');
    await rolarTudo(pagina);
    if (t.antes) await t.antes(pagina);
    await pagina.waitForTimeout(2800);
    await pagina.addStyleTag({ content: '.cabecalho,.barra-fixa,.progresso-leitura,.pular{visibility:hidden!important}' });
    await pagina.locator(t.sel).screenshot({ path: path.join(pastaFotos, `${t.n}-${t.nome}.png`) });
    await contexto.close();
  }
  for (const [nome, acao] of [['inicio', null], ['planos', '.planos-trilho'], ['configurador', '.config-planta']]) {
    const { pagina, contexto } = await abrir(390, {}, nome === 'configurador' ? 'monte-seu-sistema/?cameras=4' : '');
    await rolarTudo(pagina);
    if (acao) { await pagina.evaluate((s) => { const el = document.querySelector(s); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 140, behavior: 'instant' }); }, acao); }
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

  // Páginas de solução (/casa/, /comercio/, /empresa/, /condominio/): foto inteira no computador e no celular, sem comparação com mockup
  for (const id of ['casa', 'comercio', 'empresa', 'condominio']) {
    for (const [largura, prefixo] of [[1440, '06-solucao'], [390, '07-celular-solucao']]) {
      const { pagina, contexto } = await abrir(largura, {}, `${id}/`);
      await rolarTudo(pagina);
      await pagina.waitForTimeout(600);
      await pagina.addStyleTag({ content: '.barra-fixa,.progresso-leitura,.pular{visibility:hidden!important}' });
      await pagina.screenshot({ path: path.join(pastaFotos, `${prefixo}-${id}.png`), fullPage: true });
      await contexto.close();
    }
  }
  console.log('Páginas de solução: fotos em docs/inovacao/site-final/ (06-solucao-*.png e 07-celular-solucao-*.png)');

  // Renovação de 11/11/2026: a inicial e as páginas que usam o mesmo base.css, inteiras, no computador (1440) e no celular (375)
  for (const [caminho, nome] of [['', 'inicial'], ['monte-seu-sistema/', 'monte-seu-sistema'], ['calculadoras/', 'calculadoras'], ['privacidade/', 'privacidade'], ['nao-existe/', '404']]) {
    for (const [largura, prefixo] of [[1440, '08-pagina'], [375, '09-celular-pagina']]) {
      const { pagina, contexto } = await abrir(largura, {}, caminho);
      await rolarTudo(pagina);
      await pagina.waitForTimeout(700);
      await pagina.addStyleTag({ content: '.barra-fixa,.progresso-leitura,.pular{visibility:hidden!important}' });
      await pagina.screenshot({ path: path.join(pastaFotos, `${prefixo}-${nome}-${largura}.png`), fullPage: true });
      await contexto.close();
    }
  }
  console.log('Renovação: fotos inteiras em docs/inovacao/site-final/ (08-pagina-*-1440.png e 09-celular-pagina-*-375.png)');
}

/* ---------- Calculadoras de campo (/calculadoras/) ---------- */
grupo('Calculadoras de campo');
{
  const { pagina, contexto, erros } = await abrir(1440, {}, 'calculadoras/');
  const saida = (id) => pagina.$eval(`[data-saida="${id}"]`, (e) => e.textContent);
  const hd = await saida('hd');
  // 8 câmeras × 3 Mbps (4 MP em H.265) × 30 dias × 24 h = 7,776 TB; com 10 % de margem, 8,5536 TB (conta à mão).
  conferir('Calculadoras: HD com os valores iniciais dá 8,55 TB e 1 disco de 10 TB', hd.includes('8,55 TB') && hd.includes('1 × 10 TB'), hd.slice(0, 160));
  await pagina.click('#aba-cabo');
  const cabo = await saida('cabo');
  // 12 V, 1 A, 40 m, 5 %: 2·40·1 ÷ 56 ÷ 0,6 = 2,38 mm² → cabo de 2,5 mm².
  conferir('Calculadoras: cabo com os valores iniciais pede 2,38 mm² e indica 2,5 mm²', cabo.includes('2,38 mm²') && cabo.includes('2,5 mm²'), cabo.slice(0, 160));
  const painelVisivel = await pagina.$eval('#painel-cabo', (e) => !e.hidden) && await pagina.$eval('#painel-hd', (e) => e.hidden);
  conferir('Calculadoras: trocar de aba mostra só o painel escolhido', painelVisivel);
  await pagina.fill('[data-form="cabo"] [name="comprimento"]', '1000');
  const semCabo = await saida('cabo');
  conferir('Calculadoras: trecho enorme avisa que nenhum cabo serve', semCabo.includes('Nenhum cabo'), semCabo.slice(0, 120));
  await pagina.fill('[data-form="cabo"] [name="comprimento"]', '40');
  const msg = await pagina.$eval('[data-calc-cta]', (a) => a.dataset.solMensagem);
  conferir('Calculadoras: o botão da Sol leva o resumo da conta aberta', msg.startsWith('Usei as calculadoras do site. Cabo:') && msg.length <= 600, msg);
  await pagina.click('#aba-energia');
  const energia = await saida('energia');
  // 8 × 5 W + 30 W = 70 W; 70 ÷ 12 = 5,83 A; ×1,2 = 7 A → fonte de 10 A; 5,83 × 4 ÷ 0,425 = 54,9 Ah → 65 Ah.
  conferir('Calculadoras: energia com os valores iniciais dá 70 W, fonte de 10 A e bateria de 65 Ah', energia.includes('70 W') && energia.includes('10 A') && energia.includes('65 Ah'), energia.slice(0, 200));
  await pagina.click('#aba-rede');
  const rede = await saida('rede');
  // 16 × 3 = 48 Mbps; × 1,2 = 57,6 Mbps → cabe em 100 Mbps (70 %).
  conferir('Calculadoras: rede com os valores iniciais dá 57,6 Mbps e enlace de 100 Mbps', rede.includes('57,6 Mbps') && rede.includes('100 Mbps (usa até 70 %)'), rede.slice(0, 200));
  await pagina.keyboard.press('Escape');
  const extras = await pagina.evaluate(() => ({
    manifesto: document.querySelector('link[rel="manifest"]')?.getAttribute('href'),
    whatsFora: [...document.querySelectorAll('a[href*="wa.me"]')].filter((a) => !a.closest('#contato')).length,
    h1: document.querySelectorAll('h1').length,
    orbe: Boolean(document.querySelector('[data-calc-cta] .sol-orbe')),
    rodape: Boolean(document.querySelector('.rodape a[href="/calculadoras/"]')),
    menuTopo: Boolean(document.querySelector('.nav a[href="/calculadoras/"]')),
  }));
  conferir('Calculadoras: manifesto, rodapé, orbe da Sol, um h1, WhatsApp só em "Fale com a SC" e fora do menu do topo',
    extras.manifesto === '/calculadoras/manifest.webmanifest' && extras.rodape && extras.orbe && extras.h1 === 1 && extras.whatsFora === 0 && !extras.menuTopo, JSON.stringify(extras));
  // Offline: o service worker guarda a página e abre sem internet.
  const escopo = await pagina.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  await pagina.reload({ waitUntil: 'networkidle' });
  await contexto.setOffline(true);
  await pagina.reload({ waitUntil: 'domcontentloaded' });
  const titulo = await pagina.title();
  const hdOffline = await saida('hd');
  conferir('Calculadoras: service worker só em /calculadoras/ e a página abre e calcula sem internet', escopo.endsWith('/calculadoras/') && titulo.includes('Calculadoras') && hdOffline.includes('8,55 TB'), `${escopo}; ${titulo}`);
  await contexto.setOffline(false);
  const sw = readFileSync(path.join(dist, 'calculadoras', 'sw.js'), 'utf8');
  conferir('Calculadoras: o service worker é versionado, limpa caches velhos e usa rede primeiro para a página', /const VERSAO = 'sc-calculadoras-v\d+'/.test(sw) && sw.includes('caches.delete') && sw.includes('fetch(pedido)'), '');
  conferir('Calculadoras: zero erros no console', erros.length === 0, erros.slice(0, 3).join('; '));
  await contexto.close();
  const cel = await abrir(390, {}, 'calculadoras/');
  const sobra = await cel.pagina.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const pequenos = await cel.pagina.evaluate(() => [...document.querySelectorAll('.calc input, .calc select, .calc-abas .chip, [data-calc-cta]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height < 44; }).length);
  conferir('Calculadoras no celular: sem rolagem lateral e campos/botões ≥ 44 px', sobra <= 0 && pequenos === 0, `sobra ${sobra}; pequenos ${pequenos}`);
  await cel.contexto.close();
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
