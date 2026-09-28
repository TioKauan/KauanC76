import { mostrarPrecos, formatarPreco, nomePlano, textoTaxaInstalacao, rotuloTaxa } from '../lib/dados';
import { icone } from '../lib/icones';
import {
  LIMITE_MENSAGEM, MAX_HISTORICO, TEMPO_LIMITE_MS, saudacao, sugestoesIniciais, linkWhatsappChat,
  lerResposta, planoDoCartao, trechos, mascaraWhatsapp, validarWhatsapp, validarNome,
  acharTelefone, lerEstado, estadoNovo,
  type EstadoSol, type RespostaSol, type Acao,
} from '../lib/sol';
import { exigir, todos } from './dom';
import { reduzirMovimento } from './movimento';

/**
 * Chat da Sol: abre o painel, conversa com o n8n e desenha cartões de plano,
 * botões rápidos, o cartão de contato e o botão do WhatsApp da equipe.
 * As regras ficam em src/lib/sol.ts.
 *
 * 28/09/2026 (teste do Kauan): a voz saiu; o cartão de contato desce até a
 * mensagem nova quando a Sol oferece o contato de novo (antes ficava perdido
 * lá em cima); "Quero este plano" manda o plano junto, e ele vai no contato.
 */

const CHAVE = 'sc-sol';

export function iniciarSol(): void {
  const achado = document.querySelector<HTMLElement>('[data-sol]');
  if (!achado) return;
  const raiz: HTMLElement = achado; // const com tipo: o TypeScript leva a garantia para as funções internas
  const url = raiz.dataset.solUrl ?? '';
  const lancador = exigir<HTMLButtonElement>('[data-sol-lancador]', raiz);
  const painel = exigir('[data-sol-painel]', raiz);
  const conversa = exigir('[data-sol-conversa]', raiz);
  const rapidas = exigir('[data-sol-rapidas]', raiz);
  const form = exigir<HTMLFormElement>('[data-sol-form]', raiz);
  const campo = exigir<HTMLTextAreaElement>('[data-sol-campo]', raiz);
  const btnEnviar = exigir<HTMLButtonElement>('[data-sol-enviar]', raiz);
  const toque = () => window.matchMedia('(pointer: coarse)').matches;
  const celular = () => window.matchMedia('(max-width: 800px)').matches;

  let estado: EstadoSol = carregar();
  let aberto = false;
  let desenhado = false;
  let esperando = false;
  let contatoNaTela: HTMLFormElement | null = null;
  let contador = 0;

  /* ---------- guardar a conversa no navegador ---------- */
  function carregar(): EstadoSol {
    try { return lerEstado(localStorage.getItem(CHAVE)); } catch { return estadoNovo(); }
  }
  function salvar(): void {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ ...estado, historico: estado.historico.slice(-MAX_HISTORICO) }));
    } catch { /* navegador sem armazenamento: a conversa só não sobrevive ao recarregar */ }
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
  /** Leva um elemento que já existe para o fim da conversa, com um brilho para o olho achar. */
  function trazerParaBaixo(e: HTMLElement): void {
    conversa.append(e);
    e.classList.remove('sol-realce');
    void e.offsetWidth; // reinicia a animação
    e.classList.add('sol-realce');
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
    quero.addEventListener('click', () => {
      estado.plano = p.cameras;
      salvar();
      void enviar(`Quero o ${nomePlano(p).toLowerCase()}.`, p.cameras);
    });
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
  function botaoWhatsapp(): HTMLElement {
    const a = el('a', 'btn btn-contorno btn-p sol-whats sol-surge', 'Falar com a equipe no WhatsApp');
    a.href = linkWhatsappChat();
    a.target = '_blank';
    a.rel = 'noopener';
    comIcone(a, 'message-circle', 16);
    return a;
  }
  function tituloContato(): string {
    const p = estado.plano ? planoDoCartao(estado.plano) : undefined;
    return p ? `Quer o ${nomePlano(p).toLowerCase()}?` : 'Quer que a equipe te chame?';
  }
  function cartaoContato(telefone?: string | null): HTMLFormElement {
    const n = ++contador;
    const f = el('form', 'sol-contato sol-surge');
    f.noValidate = true;
    const titulo = el('p', 'sol-contato-titulo', tituloContato());
    titulo.dataset.solContatoTitulo = '';
    f.append(titulo);
    f.append(el('p', 'sol-contato-sub', 'Deixe seu nome e WhatsApp: a equipe da SC chama você para combinar a vistoria e o orçamento.'));
    const campoNome = el('input');
    Object.assign(campoNome, { id: `sol-nome-${n}`, name: 'nome', autocomplete: 'given-name', maxLength: 80, required: true, type: 'text' });
    const campoWhats = el('input');
    Object.assign(campoWhats, { id: `sol-whats-${n}`, name: 'whatsapp', type: 'tel', inputMode: 'numeric', autocomplete: 'tel-national', placeholder: '(46) 99123-4567', required: true });
    if (telefone) campoWhats.value = mascaraWhatsapp(telefone);
    campoWhats.addEventListener('input', () => { campoWhats.value = mascaraWhatsapp(campoWhats.value); });
    const rotulo = (para: HTMLInputElement, texto: string) => { const l = el('label', 'sol-campo-rotulo', texto); l.htmlFor = para.id; return l; };
    const aceite = el('input');
    Object.assign(aceite, { id: `sol-aceite-${n}`, type: 'checkbox', name: 'aceite', required: true });
    const linhaAceite = el('label', 'sol-aceite');
    linhaAceite.htmlFor = aceite.id;
    const priv = el('a', '', 'Política de privacidade');
    priv.href = '/privacidade/';
    priv.target = '_blank';
    priv.rel = 'noopener';
    linhaAceite.append(aceite, el('span', '', 'Autorizo a SC Soluções a me chamar no WhatsApp sobre este atendimento. '), priv);
    const erro = el('p', 'sol-contato-erro');
    erro.setAttribute('role', 'alert');
    erro.hidden = true;
    const enviarBtn = el('button', 'btn btn-primario', 'Pedir para a equipe me chamar');
    enviarBtn.type = 'submit';
    f.append(rotulo(campoNome, 'Nome'), campoNome, rotulo(campoWhats, 'WhatsApp com DDD'), campoWhats, linhaAceite, erro, enviarBtn);

    const falhar = (texto: string, foco?: HTMLElement) => { erro.textContent = texto; erro.hidden = false; foco?.focus(); };
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = validarNome(campoNome.value);
      if (!nome) return falhar('Me diga seu nome, por favor.', campoNome);
      const w = validarWhatsapp(campoWhats.value);
      if (!w.ok) return falhar(w.erro ?? 'Confira o número.', campoWhats);
      if (!aceite.checked) return falhar('Para a equipe te chamar, marque a autorização.', aceite);
      erro.hidden = true;
      enviarBtn.disabled = true;
      enviarBtn.textContent = 'Enviando…';
      const contatoCorpo = { nome, whatsapp: w.digitos, aceite: true, ...(estado.plano ? { plano: estado.plano } : {}) };
      const r = await postar({ tipo: 'contato', sessao: estado.sessao, contato: contatoCorpo });
      if (!r.ok) {
        enviarBtn.disabled = false;
        enviarBtn.textContent = 'Pedir para a equipe me chamar';
        return falhar(r.resposta || 'Não consegui enviar agora. Tente de novo ou fale pelo WhatsApp.');
      }
      estado.contatoOk = true;
      const feito = el('div', 'sol-contato sol-contato-ok sol-surge');
      const t = el('p', 'sol-contato-titulo', 'Recebido!');
      comIcone(t, 'circle-check', 18);
      feito.append(t, el('p', 'sol-contato-sub', `A equipe vai te chamar no WhatsApp ${mascaraWhatsapp(w.digitos)}.`));
      f.replaceWith(feito);
      contatoNaTela = null;
      await mostrarResposta({ ...r, cartoes: [], opcoes: [], acoes: [] });
    });
    contatoNaTela = f;
    return f;
  }
  /** Mostra o cartão de contato no fim da conversa: cria, ou traz o que já existe (com o que já foi digitado). */
  function mostrarContato(telefone?: string | null): void {
    if (estado.contatoOk) return;
    if (contatoNaTela?.isConnected) {
      const titulo = contatoNaTela.querySelector<HTMLElement>('[data-sol-contato-titulo]');
      if (titulo) titulo.textContent = tituloContato();
      const whats = contatoNaTela.querySelector<HTMLInputElement>('input[name="whatsapp"]');
      if (telefone && whats && !whats.value) whats.value = mascaraWhatsapp(telefone);
      trazerParaBaixo(contatoNaTela);
    } else {
      conversa.append(cartaoContato(telefone));
    }
  }
  function mostrarRapidas(lista: string[]): void {
    rapidas.replaceChildren();
    lista.forEach((texto, i) => {
      const b = el('button', 'chip sol-chip sol-surge', texto);
      b.type = 'button';
      b.style.setProperty('--atraso', `${i * 60}ms`);
      b.addEventListener('click', () => void enviar(texto));
      rapidas.append(b);
    });
  }

  /* ---------- conversa com o n8n ---------- */
  async function postar(corpo: Record<string, unknown>): Promise<RespostaSol> {
    const controle = new AbortController();
    const relogio = window.setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        signal: controle.signal,
      });
      const dado: unknown = await resp.json().catch(() => null);
      return lerResposta(dado);
    } catch {
      return { ok: false, resposta: '', cartoes: [], opcoes: [], acoes: ['whatsapp'], contatoOk: false };
    } finally {
      window.clearTimeout(relogio);
    }
  }

  async function enviar(bruto: string, plano?: number): Promise<void> {
    const texto = bruto.replace(/\s+/g, ' ').trim().slice(0, LIMITE_MENSAGEM);
    if (!texto || esperando) return;
    rapidas.replaceChildren();
    balao('eu', texto, true);
    estado.historico.push({ de: 'eu', texto });
    salvar();
    const telefone = estado.contatoOk ? null : acharTelefone(texto);
    esperando = true;
    atualizarEnvio();
    const tirar = digitando();
    const r = await postar({ tipo: 'mensagem', sessao: estado.sessao, mensagem: texto, ...(plano ? { plano } : {}) });
    tirar();
    esperando = false;
    atualizarEnvio();
    await mostrarResposta(r, telefone);
  }

  async function mostrarResposta(r: RespostaSol, telefone: string | null = null): Promise<void> {
    const texto = r.resposta || 'Não consegui responder agora. Tente de novo em instantes ou fale com a equipe no WhatsApp.';
    const acoes: Acao[] = r.resposta ? [...r.acoes] : ['whatsapp'];
    if (r.contatoOk) estado.contatoOk = true;
    if (telefone && !acoes.includes('contato')) acoes.push('contato');
    const b = balao('sol', texto, true);
    estado.historico.push({ de: 'sol', texto, cartoes: r.cartoes, acoes });
    salvar();
    await revelar(b, texto);
    for (const n of r.cartoes) { const c = cartaoPlano(n); if (c) conversa.append(c); }
    if (acoes.includes('whatsapp')) conversa.append(botaoWhatsapp());
    if (acoes.includes('contato')) mostrarContato(telefone);
    rolarFim();
    mostrarRapidas(r.opcoes);
  }

  function atualizarEnvio(): void {
    btnEnviar.disabled = esperando || !campo.value.trim();
    raiz.toggleAttribute('data-esperando', esperando);
  }

  /* ---------- abrir, fechar e desenhar ---------- */
  function desenhar(): void {
    conversa.replaceChildren();
    contatoNaTela = null;
    // A saudação abre toda conversa (não fica guardada: é sempre a mesma).
    balao('sol', saudacao, !estado.historico.length);
    if (!estado.historico.length) {
      mostrarRapidas(sugestoesIniciais);
    } else {
      estado.historico.forEach((item, i) => {
        balao(item.de, item.texto, false);
        for (const n of item.cartoes ?? []) { const c = cartaoPlano(n); if (c) { c.classList.remove('sol-surge'); conversa.append(c); } }
        if (item.acoes?.includes('whatsapp')) conversa.append(botaoWhatsapp());
        if (i === estado.historico.length - 1 && item.acoes?.includes('contato') && !estado.contatoOk) conversa.append(cartaoContato());
      });
      rolarFim();
    }
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
    rapidas.replaceChildren();
    desenhar();
    campo.focus({ preventScroll: true });
  }

  function ajustarCampo(): void {
    campo.style.height = 'auto';
    campo.style.height = `${Math.min(campo.scrollHeight, 128)}px`;
    atualizarEnvio();
  }

  /* ---------- ligações ---------- */
  lancador.addEventListener('click', () => (aberto ? fechar() : abrir()));
  exigir('[data-sol-fechar]', raiz).addEventListener('click', fechar);
  exigir('[data-sol-recomecar]', raiz).addEventListener('click', recomecar);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = campo.value;
    campo.value = '';
    ajustarCampo();
    void enviar(texto);
  });
  campo.addEventListener('input', ajustarCampo);
  campo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });
  painel.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.stopPropagation();
    fechar();
  });

  // Botões "fale com a Sol" espalhados pela página (escondidos sem JavaScript).
  for (const gatilho of todos<HTMLElement>('[data-sol-abrir]')) {
    gatilho.hidden = false;
    gatilho.addEventListener('click', () => {
      abrir();
      const pergunta = gatilho.hasAttribute('data-sol-pergunta')
        ? document.querySelector<HTMLInputElement>('[data-busca]')?.value.trim()
        : '';
      if (pergunta) void enviar(pergunta);
    });
  }

  atualizarEnvio();
  raiz.hidden = false;
  window.setTimeout(() => raiz.toggleAttribute('data-chegou', true), 1200);
}
