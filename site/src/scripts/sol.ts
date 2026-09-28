import { mostrarPrecos, formatarPreco, nomePlano, textoTaxaInstalacao, rotuloTaxa } from '../lib/dados';
import { icone } from '../lib/icones';
import { iconeWhatsapp } from '../lib/marcas';
import {
  LIMITE_MENSAGEM, MAX_HISTORICO, TEMPO_LIMITE_MS, CAMPO, INTERESSES, CIDADE_SUGERIDA,
  saudacao, linkWhatsappChat, pergunta, retomar, responderEtapa, primeiraMensagem,
  lerResposta, lerRespostaLead, planoDoCartao, trechos, mascaraWhatsapp, lerEstado, estadoNovo,
  type EstadoSol, type RespostaSol, type Acao,
} from '../lib/sol';
import { CHAVE_ORIGEM, lerOrigem, escolherOrigem, lerOrigemGuardada, origemParaEnvio, type Origem } from '../lib/origem';
import { exigir, todos } from './dom';
import { reduzirMovimento } from './movimento';

/**
 * Chat da Sol: abre o painel, faz o roteiro de captura, conversa com o n8n e
 * desenha cartões de plano, botões rápidos e o botão do WhatsApp da equipe.
 * As regras ficam em src/lib/sol.ts.
 *
 * 28/09/2026: a Sol virou agente de captura de lead. O roteiro (nome,
 * WhatsApp, cidade e o que a pessoa procura) é fixo e roda aqui, sem IA; a
 * equipe recebe o contato assim que ele termina, e só então a Sol (IA) entra.
 * "Prefiro falar no WhatsApp" fica à mão durante todo o roteiro.
 */

const CHAVE = 'sc-sol-2';
/** Conversa da versão anterior (cartão de contato no fim): não serve para o roteiro. */
const CHAVE_ANTIGA = 'sc-sol';

export function iniciarSol(): void {
  const achado = document.querySelector<HTMLElement>('[data-sol]');
  if (!achado) return;
  const raiz: HTMLElement = achado; // const com tipo: o TypeScript leva a garantia para as funções internas
  const url = raiz.dataset.solUrl ?? '';
  const lancador = exigir<HTMLButtonElement>('[data-sol-lancador]', raiz);
  const painel = exigir('[data-sol-painel]', raiz);
  const conversa = exigir('[data-sol-conversa]', raiz);
  const rapidas = exigir('[data-sol-rapidas]', raiz);
  const aviso = exigir('[data-sol-aviso]', raiz);
  const form = exigir<HTMLFormElement>('[data-sol-form]', raiz);
  const campo = exigir<HTMLTextAreaElement>('[data-sol-campo]', raiz);
  const rotuloCampo = exigir('[data-sol-rotulo]', raiz);
  const btnEnviar = exigir<HTMLButtonElement>('[data-sol-enviar]', raiz);
  const toque = () => window.matchMedia('(pointer: coarse)').matches;
  const celular = () => window.matchMedia('(max-width: 800px)').matches;

  let estado: EstadoSol = carregar();
  const origem: Origem = guardarOrigem();
  let aberto = false;
  let desenhado = false;
  let esperando = false;
  /** Último cartão de plano mostrado: o botão rápido "Quero este plano" vai com ele. */
  let ultimoPlano: number | null = null;

  /* ---------- guardar a conversa no navegador ---------- */
  function carregar(): EstadoSol {
    try { localStorage.removeItem(CHAVE_ANTIGA); } catch { /* navegador sem armazenamento */ }
    try { return lerEstado(localStorage.getItem(CHAVE)); } catch { return estadoNovo(); }
  }
  function salvar(): void {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ ...estado, historico: estado.historico.slice(-MAX_HISTORICO) }));
    } catch { /* navegador sem armazenamento: a conversa só não sobrevive ao recarregar */ }
  }
  /** De onde a pessoa veio (anúncio, Instagram, busca...): vai junto com o lead. Ver src/lib/origem.ts. */
  function guardarOrigem(): Origem {
    const agora = new Date();
    const nova = lerOrigem(window.location.href, document.referrer, agora, window.location.hostname);
    let guardada: Origem | null = null;
    try { guardada = lerOrigemGuardada(localStorage.getItem(CHAVE_ORIGEM)); } catch { /* sem armazenamento */ }
    const vale = escolherOrigem(nova, guardada, agora);
    try { localStorage.setItem(CHAVE_ORIGEM, JSON.stringify(vale)); } catch { /* sem armazenamento: vale só nesta página */ }
    return vale;
  }

  /* ---------- pequenos construtores de tela ---------- */
  function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe = '', texto = ''): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto) e.textContent = texto;
    return e;
  }
  function comIcone(alvo: HTMLElement, nome: Parameters<typeof icone>[0], tamanho = 16): void {
    alvo.insertAdjacentHTML('afterbegin', icone(nome, { tamanho, traco: 2 }));
  }
  function pintarTexto(alvo: HTMLElement, texto: string): void {
    alvo.replaceChildren();
    trechos(texto).forEach((linha, i) => {
      if (i) alvo.append(el('br'));
      for (const t of linha) alvo.append(t.negrito ? el('strong', '', t.texto) : document.createTextNode(t.texto));
    });
  }
  function rolarFim(): void {
    conversa.scrollTo({ top: conversa.scrollHeight, behavior: reduzirMovimento() ? 'auto' : 'smooth' });
  }
  const pausa = (ms: number) => new Promise<void>((pronto) => window.setTimeout(pronto, ms));
  function balao(de: 'sol' | 'eu', texto: string, animar: boolean): HTMLElement {
    const b = el('div', `sol-msg sol-msg-${de}${animar ? ' sol-entra' : ''}`);
    b.append(el('span', 'sr', de === 'sol' ? 'Sol disse: ' : 'Você disse: '));
    const corpo = el('span', 'sol-msg-corpo');
    pintarTexto(corpo, texto);
    b.append(corpo);
    conversa.append(b);
    rolarFim();
    return b;
  }
  /** Revela a resposta palavra por palavra (instantâneo com "reduzir movimento"). */
  function revelar(b: HTMLElement, texto: string): Promise<void> {
    const corpo = b.querySelector<HTMLElement>('.sol-msg-corpo');
    if (!corpo || reduzirMovimento() || texto.length > 420) return Promise.resolve();
    const palavras = texto.split(/(\s+)/);
    const passo = Math.max(12, Math.min(38, 900 / Math.max(1, palavras.length)));
    let i = 0;
    return new Promise((pronto) => {
      const avancar = () => {
        i += 2;
        let parcial = palavras.slice(0, i).join('');
        if ((parcial.match(/\*/g) ?? []).length % 2) parcial += '*';
        pintarTexto(corpo, parcial);
        if (i < palavras.length) window.setTimeout(avancar, passo);
        else { pintarTexto(corpo, texto); pronto(); }
        rolarFim();
      };
      corpo.textContent = '';
      avancar();
    });
  }
  function digitando(): () => void {
    const b = el('div', 'sol-msg sol-msg-sol sol-digitando sol-entra');
    b.setAttribute('aria-label', 'A Sol está escrevendo');
    b.append(el('i'), el('i'), el('i'));
    conversa.append(b);
    rolarFim();
    return () => b.remove();
  }
  /** Balão da pessoa, guardado no histórico. */
  function registrar(texto: string): void {
    balao('eu', texto, true);
    estado.historico.push({ de: 'eu', texto });
    salvar();
  }

  /* ---------- cartões ---------- */
  function cartaoPlano(cameras: number): HTMLElement | null {
    const p = planoDoCartao(cameras);
    if (!p) return null;
    const c = el('article', `sol-plano${p.destaque ? ' sol-plano-destaque' : ''} sol-surge`);
    c.setAttribute('aria-label', nomePlano(p));
    if (p.destaque) {
      const selo = el('span', 'selo selo-laranja sol-plano-selo', p.destaque);
      comIcone(selo, 'sparkles', 13);
      c.append(selo);
    }
    const topo = el('div', 'sol-plano-topo');
    const titulo = el('h3', '', `${p.cameras} ${p.cameras > 1 ? 'câmeras' : 'câmera'}`);
    const preco = el('p', 'sol-plano-preco');
    if (mostrarPrecos) preco.append(el('small', '', 'R$'), el('strong', '', formatarPreco(p.preco)), el('em', '', '/mês'));
    else preco.append(el('strong', '', 'Sob consulta'));
    topo.append(titulo, preco);
    c.append(topo, el('p', 'sol-plano-uso', p.uso));
    const cabo = el('p', 'sol-plano-cabo', `Instalação: ${textoTaxaInstalacao(p)}${mostrarPrecos ? ` (${rotuloTaxa})` : ''} · até ${p.caboMetros} m de cabo`);
    comIcone(cabo, 'cable', 14);
    c.append(cabo);
    const lista = el('ul', 'sol-plano-lista');
    for (const item of [`${p.cameras} ${p.cameras > 1 ? 'câmeras' : 'câmera'} 2 MP ou superior`, 'Gravação local ≈ 10 dias', `${p.gravador} e imagens no celular`, 'Revisão semestral e manutenção']) {
      const li = el('li', '', item);
      comIcone(li, 'check', 14);
      lista.append(li);
    }
    c.append(lista);
    const acoes = el('div', 'sol-plano-acoes');
    const quero = el('button', 'btn btn-primario btn-p', 'Quero este plano');
    quero.type = 'button';
    quero.dataset.solQuero = String(p.cameras);
    quero.addEventListener('click', () => void enviar(`Quero o ${nomePlano(p).toLowerCase()}.`, p.cameras));
    const ver = el('a', 'sol-link', 'Ver na página');
    ver.href = `#plano-${p.cameras}`;
    ver.addEventListener('click', (e) => { e.preventDefault(); verNaPagina(p.cameras); });
    acoes.append(quero, ver);
    c.append(acoes);
    return c;
  }
  function verNaPagina(cameras: number): void {
    if (celular()) fechar();
    document.getElementById('guia-cameras')?.click();
    const alvo = document.getElementById(`plano-${cameras}`);
    if (!alvo) return;
    alvo.scrollIntoView({ behavior: reduzirMovimento() ? 'auto' : 'smooth', block: 'center', inline: 'center' });
    alvo.classList.add('plano-realce');
    window.setTimeout(() => alvo.classList.remove('plano-realce'), 2600);
  }
  function linkWhatsapp(classe: string, texto: string, tamanhoIcone: number): HTMLAnchorElement {
    const a = el('a', classe, texto);
    a.href = linkWhatsappChat();
    a.target = '_blank';
    a.rel = 'noopener';
    a.insertAdjacentHTML('afterbegin', iconeWhatsapp(tamanhoIcone));
    return a;
  }
  const botaoWhatsapp = (animar = true) =>
    linkWhatsapp(`btn btn-contorno btn-p sol-whats${animar ? ' sol-surge' : ''}`, 'Falar com a equipe no WhatsApp', 17);
  /** "Quero contratar": confirma que a equipe foi avisada e em qual número ela vai chamar. */
  function cartaoAvisado(animar = true): HTMLElement {
    const c = el('div', `sol-avisado${animar ? ' sol-surge' : ''}`);
    const t = el('p', 'sol-avisado-titulo', 'Pedido enviado à equipe');
    comIcone(t, 'circle-check', 18);
    c.append(t, el('p', 'sol-avisado-sub', `Vão te chamar no WhatsApp ${mascaraWhatsapp(estado.captura.whatsapp)}.`));
    return c;
  }
  function mostrarRapidas(lista: readonly string[]): void {
    rapidas.replaceChildren();
    lista.forEach((texto, i) => {
      const b = el('button', 'chip sol-chip sol-surge', texto);
      b.type = 'button';
      b.style.setProperty('--atraso', `${i * 60}ms`);
      b.addEventListener('click', () => {
        const plano = ultimoPlano && /^quero (este|esse) plano$/i.test(texto) ? ultimoPlano : undefined;
        void enviar(texto, plano);
      });
      rapidas.append(b);
    });
    // Durante o roteiro, quem não quer deixar os dados vai direto para a equipe.
    if (!estado.leadOk) {
      const w = linkWhatsapp('chip sol-chip sol-chip-whats sol-surge', 'Prefiro falar no WhatsApp', 16);
      w.style.setProperty('--atraso', `${lista.length * 60}ms`);
      rapidas.append(w);
    }
    rolarFim(); // os botões encolhem a conversa: a última mensagem continua à vista
  }

  /* ---------- roteiro de captura ---------- */
  /** Ajusta o campo de texto e os botões rápidos para a etapa atual. */
  function prepararEtapa(): void {
    const etapa = estado.captura.etapa;
    const c = CAMPO[etapa];
    campo.placeholder = c.dica;
    campo.inputMode = c.numerico ? 'numeric' : 'text';
    campo.setAttribute('autocomplete', c.autocompletar);
    campo.maxLength = c.maximo;
    rotuloCampo.textContent = c.rotulo;
    aviso.hidden = etapa !== 'whatsapp';
    if (etapa === 'interesse') mostrarRapidas(INTERESSES);
    else if (etapa === 'cidade') mostrarRapidas([CIDADE_SUGERIDA]);
    else if (etapa !== 'pronto') mostrarRapidas([]);
    else rolarFim();
  }

  /** Fala da Sol no roteiro (sem IA), com uma pausa curta de "escrevendo". */
  async function falarSol(texto: string, acoes: Acao[] = []): Promise<void> {
    ocupar(true);
    const tirar = digitando();
    await pausa(reduzirMovimento() ? 0 : 450);
    tirar();
    ocupar(false);
    const b = balao('sol', texto, true);
    estado.historico.push({ de: 'sol', texto, ...(acoes.length ? { acoes } : {}) });
    salvar();
    await revelar(b, texto);
    if (acoes.includes('whatsapp')) conversa.append(botaoWhatsapp());
    rolarFim();
  }

  /** Uma resposta do roteiro. Com o roteiro completo, o lead vai para a equipe. */
  async function capturar(texto: string): Promise<void> {
    const r = responderEtapa(estado.captura, texto);
    rapidas.replaceChildren();
    registrar(r.ok ? r.mostrar : texto);
    if (!r.ok) {
      await falarSol(r.erro);
      prepararEtapa();
      return;
    }
    estado.captura = r.captura;
    salvar();
    if (r.captura.interesse) {
      await enviarLead();
      return;
    }
    await falarSol(pergunta(r.captura.etapa, r.captura.nome));
    prepararEtapa();
  }

  async function enviarLead(): Promise<void> {
    const c = estado.captura;
    ocupar(true);
    let tirar = digitando();
    const { dado } = await postar({
      tipo: 'lead',
      sessao: estado.sessao,
      lead: { nome: c.nome, whatsapp: c.whatsapp, cidade: c.cidade, interesse: c.interesse, aceite: true, origem: origemParaEnvio(origem) },
    });
    const lead = lerRespostaLead(dado);
    if (!lead.ok) {
      tirar();
      ocupar(false);
      estado.captura = { ...c, interesse: '', etapa: 'interesse' };
      salvar();
      await falarSol(lead.erro || 'Não consegui registrar agora. Tente de novo em instantes ou fale com a equipe no WhatsApp.', ['whatsapp']);
      prepararEtapa();
      return;
    }
    // Lead gravado e equipe avisada: agora a conversa é com a Sol (IA).
    const primeira = estado.pendente || primeiraMensagem(c.interesse);
    estado = { ...estado, captura: { ...c, etapa: 'pronto' }, leadOk: true, pendente: '' };
    salvar();
    prepararEtapa();
    tirar();
    tirar = digitando();
    const r = await pedirSol(primeira);
    tirar();
    ocupar(false);
    await mostrarResposta(r);
  }

  /* ---------- conversa com o n8n ---------- */
  async function postar(corpo: Record<string, unknown>): Promise<{ status: number; dado: unknown }> {
    const controle = new AbortController();
    const relogio = window.setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        signal: controle.signal,
      });
      return { status: resp.status, dado: await resp.json().catch(() => null) };
    } catch {
      return { status: 0, dado: null };
    } finally {
      window.clearTimeout(relogio);
    }
  }
  async function pedirSol(texto: string, plano?: number): Promise<RespostaSol> {
    const { status, dado } = await postar({ tipo: 'mensagem', sessao: estado.sessao, mensagem: texto, ...(plano ? { plano } : {}) });
    return lerResposta(dado, status);
  }

  async function enviar(bruto: string, plano?: number): Promise<void> {
    const texto = bruto.replace(/\s+/g, ' ').trim().slice(0, LIMITE_MENSAGEM);
    if (!texto || esperando) return;
    if (!estado.leadOk) {
      await capturar(texto);
      return;
    }
    rapidas.replaceChildren();
    registrar(texto);
    ocupar(true);
    const tirar = digitando();
    const r = await pedirSol(texto, plano);
    tirar();
    ocupar(false);
    // O servidor não conhece mais esta conversa: recomeça pelo roteiro.
    if (r.semLead) {
      recomecar();
      return;
    }
    await mostrarResposta(r);
  }

  async function mostrarResposta(r: RespostaSol): Promise<void> {
    const texto = r.resposta || 'Não consegui responder agora. Tente de novo em instantes ou fale com a equipe no WhatsApp.';
    const acoes: Acao[] = r.resposta ? [...r.acoes] : ['whatsapp'];
    const b = balao('sol', texto, true);
    estado.historico.push({ de: 'sol', texto, cartoes: r.cartoes, acoes, ...(r.contratar ? { avisado: true } : {}) });
    salvar();
    await revelar(b, texto);
    for (const n of r.cartoes) {
      const c = cartaoPlano(n);
      if (c) { conversa.append(c); ultimoPlano = n; }
    }
    if (acoes.includes('whatsapp')) conversa.append(botaoWhatsapp());
    if (r.contratar) conversa.append(cartaoAvisado());
    rolarFim();
    mostrarRapidas(r.opcoes);
  }

  function ocupar(sim: boolean): void {
    esperando = sim;
    atualizarEnvio();
  }
  function atualizarEnvio(): void {
    btnEnviar.disabled = esperando || !campo.value.trim();
    raiz.toggleAttribute('data-esperando', esperando);
  }

  /* ---------- abrir, fechar e desenhar ---------- */
  function desenhar(): void {
    conversa.replaceChildren();
    ultimoPlano = null;
    // A saudação abre toda conversa (não fica guardada: é sempre a mesma) e já pede o nome.
    balao('sol', saudacao, !estado.historico.length);
    for (const item of estado.historico) {
      balao(item.de, item.texto, false);
      for (const n of item.cartoes ?? []) {
        const c = cartaoPlano(n);
        if (c) { c.classList.remove('sol-surge'); conversa.append(c); ultimoPlano = n; }
      }
      if (item.acoes?.includes('whatsapp')) conversa.append(botaoWhatsapp(false));
      if (item.avisado) conversa.append(cartaoAvisado(false));
    }
    rapidas.replaceChildren();
    prepararEtapa();
    rolarFim();
    desenhado = true;
  }

  function abrir(): void {
    if (aberto) return;
    aberto = true;
    if (!desenhado) desenhar();
    painel.hidden = false;
    raiz.toggleAttribute('data-aberto', true);
    lancador.setAttribute('aria-expanded', 'true');
    document.documentElement.toggleAttribute('data-sol-aberta', true);
    requestAnimationFrame(() => {
      painel.classList.add('sol-painel-visivel');
      rolarFim();
      if (toque()) conversa.focus({ preventScroll: true });
      else campo.focus({ preventScroll: true });
    });
  }

  function fechar(): void {
    if (!aberto) return;
    aberto = false;
    const tinhaFoco = painel.contains(document.activeElement);
    painel.classList.remove('sol-painel-visivel');
    raiz.toggleAttribute('data-aberto', false);
    lancador.setAttribute('aria-expanded', 'false');
    document.documentElement.toggleAttribute('data-sol-aberta', false);
    window.setTimeout(() => { if (!aberto) painel.hidden = true; }, reduzirMovimento() ? 0 : 260);
    if (tinhaFoco) lancador.focus({ preventScroll: true });
  }

  function recomecar(): void {
    estado = estadoNovo();
    salvar();
    desenhar();
    campo.focus({ preventScroll: true });
  }

  function ajustarCampo(): void {
    campo.style.height = 'auto';
    campo.style.height = `${Math.min(campo.scrollHeight, 128)}px`;
    atualizarEnvio();
  }

  /** Pergunta vinda da página (caixa de dúvidas). Antes do fim do roteiro, fica guardada. */
  async function perguntarDaPagina(texto: string): Promise<void> {
    if (estado.leadOk) {
      await enviar(texto);
      return;
    }
    if (esperando) return;
    estado.pendente = texto.slice(0, LIMITE_MENSAGEM);
    rapidas.replaceChildren();
    registrar(estado.pendente);
    await falarSol(retomar(estado.captura.etapa));
    prepararEtapa();
  }

  /* ---------- ligações ---------- */
  lancador.addEventListener('click', () => (aberto ? fechar() : abrir()));
  exigir('[data-sol-fechar]', raiz).addEventListener('click', fechar);
  exigir('[data-sol-recomecar]', raiz).addEventListener('click', recomecar);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (esperando) return;
    const texto = campo.value;
    campo.value = '';
    ajustarCampo();
    void enviar(texto);
  });
  campo.addEventListener('input', () => {
    if (estado.captura.etapa === 'whatsapp') campo.value = mascaraWhatsapp(campo.value);
    ajustarCampo();
  });
  campo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });
  painel.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.stopPropagation();
    fechar();
  });

  // Botões "fale com a Sol" espalhados pela página (escondidos sem JavaScript)
  // e o texto da barra fixa do celular (evento de src/scripts/barra.ts).
  document.addEventListener('sc:abrir-sol', abrir);
  for (const gatilho of todos<HTMLElement>('[data-sol-abrir]')) {
    gatilho.hidden = false;
    gatilho.addEventListener('click', () => {
      abrir();
      const texto = gatilho.hasAttribute('data-sol-pergunta')
        ? document.querySelector<HTMLInputElement>('[data-busca]')?.value.trim()
        : '';
      if (texto) void perguntarDaPagina(texto);
    });
  }

  atualizarEnvio();
  raiz.hidden = false;
  window.setTimeout(() => raiz.toggleAttribute('data-chegou', true), 1200);
}
