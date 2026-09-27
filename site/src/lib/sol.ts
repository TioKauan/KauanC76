/**
 * Regras do chat da Sol, a assistente virtual do site (sem DOM: rodam no
 * navegador e nos testes). A tela fica em src/scripts/sol.ts.
 *
 * O cérebro não mora aqui: a IA, os preços da tabela de locação e a decisão
 * de quando oferecer o contato ficam no n8n (fluxo "SomosCella - Sol no Site").
 * O site só desenha o que volta, e desenha a partir de dados.ts: o cartão de
 * um plano mostra sempre o mesmo preço que o resto da página.
 */
import { planos, linkWhatsapp, type Plano } from './dados';

/** Endereço do chat no n8n. O build pode trocar com PUBLIC_SOL_URL (ver Sol.astro). */
export const SOL_URL = 'https://n8n.somoscella.online/webhook/sol-site';

export const LIMITE_MENSAGEM = 600;
export const MAX_HISTORICO = 40;
/** Tempo máximo esperando a Sol (ela consulta a base antes de responder). */
export const TEMPO_LIMITE_MS = 60_000;

export const saudacao = 'Oi! Eu sou a Sol, assistente virtual da SC Soluções. Me conta: o que você quer proteger?';
export const sugestoesIniciais = ['Minha casa', 'Meu comércio', 'Quanto custa?', 'Já sou cliente'];
export const msgWhatsappChat = 'Olá! Vim pelo chat do site e quero falar com a equipe da SC.';
export const linkWhatsappChat = (): string => linkWhatsapp(msgWhatsappChat);

export type Acao = 'contato' | 'whatsapp';
export interface RespostaSol {
  ok: boolean;
  resposta: string;
  /** Quantidade de câmeras de cada cartão de plano (só planos que existem em dados.ts). */
  cartoes: number[];
  opcoes: string[];
  acoes: Acao[];
  contatoOk: boolean;
}

/** Lê a resposta do servidor sem confiar nela: devolve sempre o formato certo. */
export function lerResposta(dado: unknown): RespostaSol {
  const d = (dado && typeof dado === 'object' ? dado : {}) as Record<string, unknown>;
  const texto = typeof d.resposta === 'string' ? d.resposta.replace(/\s+\n/g, '\n').trim().slice(0, 900) : '';
  const cameras = (Array.isArray(d.cartoes) ? d.cartoes : [])
    .map((c) => Number((c && typeof c === 'object' ? (c as Record<string, unknown>).cameras : c)))
    .filter((n) => planos.some((p) => p.cameras === n));
  const opcoes = (Array.isArray(d.opcoes) ? d.opcoes : [])
    .filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
    .map((o) => o.trim().slice(0, 32));
  const acoes = (Array.isArray(d.acoes) ? d.acoes : []).filter((a): a is Acao => a === 'contato' || a === 'whatsapp');
  return {
    ok: d.ok === true && texto.length > 0,
    resposta: texto,
    cartoes: [...new Set(cameras)].slice(0, 2),
    opcoes: [...new Set(opcoes)].slice(0, 4),
    acoes: [...new Set(acoes)],
    contatoOk: d.contato_ok === true,
  };
}

export function planoDoCartao(cameras: number): Plano | undefined {
  return planos.find((p) => p.cameras === cameras);
}

/** Pedaço de uma linha: *negrito* vira negrito; nada vira HTML (a tela usa textContent). */
export interface Trecho { texto: string; negrito: boolean }

export function trechos(texto: string): Trecho[][] {
  return texto.split('\n').map((linha) => {
    const partes: Trecho[] = [];
    const negrito = /\*([^*\n]{1,160})\*/g;
    let fim = 0;
    for (const m of linha.matchAll(negrito)) {
      const i = m.index ?? 0;
      if (i > fim) partes.push({ texto: linha.slice(fim, i), negrito: false });
      partes.push({ texto: m[1] ?? '', negrito: true });
      fim = i + m[0].length;
    }
    if (fim < linha.length) partes.push({ texto: linha.slice(fim), negrito: false });
    return partes;
  });
}

/** Texto para ler em voz alta: sem asterisco e com valor falado como gente fala. */
export function textoParaFala(texto: string): string {
  return texto
    .replace(/\*/g, '')
    .replace(/R\$\s?(\d{1,3}(?:\.\d{3})*),(\d{2})/g, (_m, reais: string, centavos: string) => {
      const r = reais.replace(/\./g, '');
      return centavos === '00' ? `${r} reais` : `${r} reais e ${Number(centavos)} centavos`;
    })
    .replace(/\s?\/\s?mês/g, ' por mês')
    .replace(/(\d)\s?m\b/g, '$1 metros')
    .replace(/\bSC\b/g, 'S C')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Frases para a fala (o Chrome corta falas muito longas de uma vez só). */
export function frasesParaFala(texto: string, max = 180): string[] {
  const frases = textoParaFala(texto).match(/[^.!?…]+[.!?…]*/g) ?? [];
  const saida: string[] = [];
  for (const f of frases.map((x) => x.trim()).filter(Boolean)) {
    const ultima = saida.at(-1);
    if (ultima && ultima.length + f.length + 1 <= max) saida[saida.length - 1] = `${ultima} ${f}`;
    else saida.push(f);
  }
  return saida;
}

/* ---------- WhatsApp do cartão de contato ---------- */

/** "(46) 99123-4567" enquanto a pessoa digita. */
export function mascaraWhatsapp(valor: string): string {
  let d = valor.replace(/\D/g, '');
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  if (resto.length <= 4) return `(${ddd}) ${resto}`;
  const corte = resto.length === 9 ? 5 : 4;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

export interface ResultadoWhatsapp { ok: boolean; digitos: string; erro?: string }

/** As mesmas regras do banco (sc_site_registrar_contato), para avisar antes de enviar. */
export function validarWhatsapp(valor: string): ResultadoWhatsapp {
  let d = valor.replace(/\D/g, '');
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) d = d.slice(2);
  const erro = 'Confira o número com DDD, por exemplo (46) 99123-4567.';
  if (d.length !== 10 && d.length !== 11) return { ok: false, digitos: d, erro };
  const local = d.slice(2);
  if (Number(d.slice(0, 2)) < 11 || local.startsWith('0') || local.startsWith('1') || /^(\d)\1{7,}$/.test(local)) {
    return { ok: false, digitos: d, erro };
  }
  if (d.length === 11 && !local.startsWith('9')) {
    return { ok: false, digitos: d, erro: 'Celular com DDD tem 11 dígitos e começa com 9 depois do DDD.' };
  }
  return { ok: true, digitos: d };
}

/** Telefone escrito no meio da conversa ("me chama no 46 99123-4567"): só os dígitos, se for válido. */
export function acharTelefone(texto: string): string | null {
  const m = texto.match(/(?:\+?55[\s.-]?)?\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/);
  if (!m) return null;
  const r = validarWhatsapp(m[0]);
  return r.ok ? r.digitos : null;
}

export function validarNome(valor: string): string | null {
  const nome = valor.replace(/\s+/g, ' ').trim();
  return nome.length >= 2 && nome.length <= 80 ? nome : null;
}

/* ---------- sessão e conversa guardadas no navegador ---------- */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function novaSessao(): string {
  const c = globalThis.crypto;
  if (typeof c?.randomUUID === 'function') return c.randomUUID();
  const b = new Uint8Array(16);
  c.getRandomValues(b);
  b[6] = ((b[6] ?? 0) & 0x0f) | 0x40;
  b[8] = ((b[8] ?? 0) & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export interface ItemHistorico {
  de: 'sol' | 'eu';
  texto: string;
  cartoes?: number[];
  acoes?: Acao[];
}
export interface EstadoSol {
  sessao: string;
  historico: ItemHistorico[];
  /** Ler as respostas em voz alta. */
  voz: boolean;
  contatoOk: boolean;
}

export function estadoNovo(): EstadoSol {
  return { sessao: novaSessao(), historico: [], voz: false, contatoOk: false };
}

/** Lê o que ficou guardado; qualquer coisa estranha vira uma conversa nova. */
export function lerEstado(bruto: string | null): EstadoSol {
  try {
    const d = JSON.parse(bruto ?? 'null') as Partial<EstadoSol> | null;
    if (!d || typeof d.sessao !== 'string' || !UUID.test(d.sessao)) return estadoNovo();
    const historico = (Array.isArray(d.historico) ? d.historico : [])
      .filter((i): i is ItemHistorico => !!i && (i.de === 'sol' || i.de === 'eu') && typeof i.texto === 'string')
      .slice(-MAX_HISTORICO)
      .map((i) => ({
        de: i.de,
        texto: i.texto.slice(0, 900),
        ...(Array.isArray(i.cartoes) ? { cartoes: i.cartoes.filter((n) => planos.some((p) => p.cameras === n)) } : {}),
        ...(Array.isArray(i.acoes) ? { acoes: i.acoes.filter((a) => a === 'contato' || a === 'whatsapp') } : {}),
      }));
    return { sessao: d.sessao, historico, voz: d.voz === true, contatoOk: d.contatoOk === true };
  } catch {
    return estadoNovo();
  }
}
