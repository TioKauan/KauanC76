/**
 * Regras do chat da Sol, a assistente virtual do site (sem DOM: rodam no
 * navegador e nos testes). A tela fica em src/scripts/sol.ts.
 *
 * Desde 28/09/2026 a Sol é um agente de captura de lead: antes da conversa, o
 * próprio site pergunta nome, WhatsApp, cidade e o que a pessoa procura
 * (roteiro fixo, sem IA), e a equipe recebe o contato assim que ele termina.
 * Depois a Sol (IA) entende o caso, mostra o plano e tira as dúvidas.
 *
 * O cérebro não mora aqui: a IA, os preços da tabela de locação e os avisos à
 * equipe ficam no n8n (fluxo "SomosCella - Sol no Site"). O site só desenha o
 * que volta, e desenha a partir de dados.ts: o cartão de um plano mostra
 * sempre o mesmo preço que o resto da página.
 */
import { planos, linkWhatsapp, type Plano } from './dados';

/** Endereço do chat no n8n. O build pode trocar com PUBLIC_SOL_URL (ver Sol.astro). */
export const SOL_URL = 'https://n8n.somoscella.online/webhook/sol-site';

export const LIMITE_MENSAGEM = 600;
export const MAX_HISTORICO = 40;
/** Tempo máximo esperando a Sol (ela consulta a base antes de responder). */
export const TEMPO_LIMITE_MS = 60_000;

export const saudacao = 'Oi! Eu sou a Sol, assistente virtual da SC Soluções. Para começar, como posso te chamar?';
export const msgWhatsappChat = 'Olá! Vim pelo chat do site e quero falar com a equipe da SC.';
export const linkWhatsappChat = (): string => linkWhatsapp(msgWhatsappChat);

/* ---------- roteiro de captura (roda no site, sem IA) ---------- */

export type Etapa = 'nome' | 'whatsapp' | 'cidade' | 'interesse' | 'outro' | 'pronto';
export interface Captura { etapa: Etapa; nome: string; whatsapp: string; cidade: string; interesse: string }

/** Botões da pergunta "o que você procura". "Outro" pede para a pessoa escrever. */
export const INTERESSES = ['Câmeras', 'Alarme', 'Controle de acesso', 'Redes e Wi-Fi', 'Outro'] as const;
/** A maioria dos clientes é da cidade da loja: um toque em vez de digitar. */
export const CIDADE_SUGERIDA = 'Francisco Beltrão';

/** Como o campo de texto se comporta em cada etapa. */
export const CAMPO: Record<Etapa, { dica: string; rotulo: string; autocompletar: string; maximo: number; numerico: boolean }> = {
  nome: { dica: 'Seu nome', rotulo: 'Seu nome', autocompletar: 'given-name', maximo: 80, numerico: false },
  whatsapp: { dica: '(46) 99123-4567', rotulo: 'Seu WhatsApp com DDD', autocompletar: 'tel-national', maximo: 20, numerico: true },
  cidade: { dica: 'Sua cidade', rotulo: 'Sua cidade', autocompletar: 'address-level2', maximo: 80, numerico: false },
  interesse: { dica: 'Escolha acima ou escreva aqui', rotulo: 'O que você procura', autocompletar: 'off', maximo: 80, numerico: false },
  outro: { dica: 'O que você procura', rotulo: 'O que você procura', autocompletar: 'off', maximo: 80, numerico: false },
  pronto: { dica: 'Escreva sua mensagem…', rotulo: 'Sua mensagem para a Sol', autocompletar: 'off', maximo: LIMITE_MENSAGEM, numerico: false },
};

export const primeiroNome = (nome: string): string => nome.trim().split(/\s+/)[0] ?? '';

/** O que a Sol pergunta ao chegar em cada etapa (a do nome é a própria saudação). */
export function pergunta(etapa: Etapa, nome = ''): string {
  switch (etapa) {
    case 'nome': return saudacao;
    case 'whatsapp': return `Prazer, ${primeiroNome(nome)}! Qual é o seu WhatsApp com DDD? É por ele que a equipe da SC fala com você.`;
    case 'cidade': return 'E qual é a sua cidade?';
    case 'interesse': return 'O que você está procurando?';
    case 'outro': return 'Me conta em poucas palavras o que você procura.';
    case 'pronto': return '';
  }
}

/** Quando a pessoa pergunta algo antes de terminar o roteiro: a pergunta fica guardada. */
export function retomar(etapa: Etapa): string {
  const falta: Record<Etapa, string> = {
    nome: 'como posso te chamar?',
    whatsapp: 'qual é o seu WhatsApp com DDD?',
    cidade: 'qual é a sua cidade?',
    interesse: 'me diz o que você está procurando.',
    outro: 'me conta o que você procura.',
    pronto: '',
  };
  return `Já te respondo! Antes, ${falta[etapa]}`;
}

export type ResultadoEtapa =
  | { ok: true; captura: Captura; mostrar: string }
  | { ok: false; erro: string };

/**
 * Resposta da pessoa na etapa atual. `mostrar` é o que aparece no balão dela
 * (o WhatsApp já com a máscara). Com o interesse preenchido o roteiro terminou
 * e o site envia o lead; a etapa só vira "pronto" quando o servidor confirma.
 */
export function responderEtapa(c: Captura, bruto: string): ResultadoEtapa {
  const texto = bruto.replace(/\s+/g, ' ').trim();
  switch (c.etapa) {
    case 'nome': {
      const nome = validarNome(texto);
      return nome ? { ok: true, mostrar: nome, captura: { ...c, nome, etapa: 'whatsapp' } } : { ok: false, erro: 'Me diga seu nome, por favor.' };
    }
    case 'whatsapp': {
      const w = validarWhatsapp(texto);
      return w.ok
        ? { ok: true, mostrar: mascaraWhatsapp(w.digitos), captura: { ...c, whatsapp: w.digitos, etapa: 'cidade' } }
        : { ok: false, erro: w.erro ?? 'Confira o número com DDD.' };
    }
    case 'cidade': {
      const cidade = validarCidade(texto);
      return cidade ? { ok: true, mostrar: cidade, captura: { ...c, cidade, etapa: 'interesse' } } : { ok: false, erro: 'Me diga a sua cidade, por favor.' };
    }
    case 'interesse':
    case 'outro': {
      if (c.etapa === 'interesse' && texto.toLowerCase() === 'outro') return { ok: true, mostrar: 'Outro', captura: { ...c, etapa: 'outro' } };
      if (texto.length < 2) return { ok: false, erro: 'Me conta o que você procura, por favor.' };
      return { ok: true, mostrar: texto, captura: { ...c, interesse: texto.slice(0, 80) } };
    }
    case 'pronto': return { ok: false, erro: '' };
  }
}

/** A primeira mensagem para a Sol, logo depois da captura: o que a pessoa procura. */
export function primeiraMensagem(interesse: string): string {
  return (INTERESSES as readonly string[]).includes(interesse) ? `Procuro ${interesse.toLowerCase()}` : interesse;
}

/* ---------- resposta do servidor ---------- */

export type Acao = 'whatsapp';
export interface RespostaSol {
  ok: boolean;
  resposta: string;
  /** Quantidade de câmeras de cada cartão de plano (só planos que existem em dados.ts). */
  cartoes: number[];
  opcoes: string[];
  acoes: Acao[];
  /** A pessoa disse que quer contratar e a equipe foi avisada. */
  contratar: boolean;
  /** O servidor não conhece o lead desta conversa: o site recomeça pelo roteiro. */
  semLead: boolean;
}

/** Lê a resposta do servidor sem confiar nela: devolve sempre o formato certo. */
export function lerResposta(dado: unknown, status = 200): RespostaSol {
  const d = (dado && typeof dado === 'object' ? dado : {}) as Record<string, unknown>;
  const texto = typeof d.resposta === 'string' ? d.resposta.replace(/\s+\n/g, '\n').trim().slice(0, 900) : '';
  const cameras = (Array.isArray(d.cartoes) ? d.cartoes : [])
    .map((c) => Number((c && typeof c === 'object' ? (c as Record<string, unknown>).cameras : c)))
    .filter((n) => planos.some((p) => p.cameras === n));
  const opcoes = (Array.isArray(d.opcoes) ? d.opcoes : [])
    .filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
    .map((o) => o.trim().slice(0, 32));
  const acoes = (Array.isArray(d.acoes) ? d.acoes : []).filter((a): a is Acao => a === 'whatsapp');
  const ok = d.ok === true && texto.length > 0;
  return {
    ok,
    resposta: texto,
    cartoes: [...new Set(cameras)].slice(0, 2),
    opcoes: [...new Set(opcoes)].slice(0, 5),
    acoes: [...new Set(acoes)],
    contratar: ok && d.modo === 'contratar',
    semLead: status === 403 && d.motivo === 'sem_lead',
  };
}

/** Resposta do envio do lead: ok, ou o motivo da recusa em português. */
export function lerRespostaLead(dado: unknown): { ok: boolean; erro: string } {
  const d = (dado && typeof dado === 'object' ? dado : {}) as Record<string, unknown>;
  return {
    ok: d.ok === true && d.lead_ok === true,
    erro: typeof d.resposta === 'string' ? d.resposta.trim().slice(0, 300) : '',
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

/* ---------- validação dos dados da captura ---------- */

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

/** As mesmas regras do banco (sc_site_whatsapp_valido), para avisar antes de enviar. */
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

export function validarNome(valor: string): string | null {
  const nome = valor.replace(/\s+/g, ' ').trim();
  return nome.length >= 2 && nome.length <= 80 && /\p{L}/u.test(nome) ? nome : null;
}

export function validarCidade(valor: string): string | null {
  const cidade = valor.replace(/\s+/g, ' ').trim();
  return cidade.length >= 2 && cidade.length <= 80 && /\p{L}/u.test(cidade) ? cidade : null;
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
  /** Esta resposta confirmou que a equipe foi avisada ("quero contratar"). */
  avisado?: boolean;
}
export interface EstadoSol {
  sessao: string;
  historico: ItemHistorico[];
  captura: Captura;
  /** O servidor confirmou o lead: a partir daqui a conversa é com a Sol (IA). */
  leadOk: boolean;
  /** Pergunta feita antes do fim do roteiro: vira a primeira mensagem para a Sol. */
  pendente: string;
}

export function capturaNova(): Captura {
  return { etapa: 'nome', nome: '', whatsapp: '', cidade: '', interesse: '' };
}

export function estadoNovo(): EstadoSol {
  return { sessao: novaSessao(), historico: [], captura: capturaNova(), leadOk: false, pendente: '' };
}

const ETAPAS: readonly Etapa[] = ['nome', 'whatsapp', 'cidade', 'interesse', 'outro', 'pronto'];

/** A captura guardada só vale se a etapa bate com os dados que já existem. */
function lerCaptura(bruto: unknown, leadOk: boolean): Captura | null {
  const c = (bruto && typeof bruto === 'object' ? bruto : {}) as Record<string, unknown>;
  const texto = (v: unknown) => (typeof v === 'string' ? v : '');
  const etapa = ETAPAS.find((e) => e === c.etapa) ?? null;
  const nome = validarNome(texto(c.nome)) ?? '';
  const w = validarWhatsapp(texto(c.whatsapp));
  const whatsapp = w.ok ? w.digitos : '';
  const cidade = validarCidade(texto(c.cidade)) ?? '';
  const interesse = texto(c.interesse).replace(/\s+/g, ' ').trim().slice(0, 80);
  const esperada: Etapa = !nome ? 'nome' : !whatsapp ? 'whatsapp' : !cidade ? 'cidade'
    : leadOk && interesse ? 'pronto' : etapa === 'outro' ? 'outro' : 'interesse';
  if (etapa !== esperada) return null;
  return { etapa: esperada, nome, whatsapp, cidade, interesse: esperada === 'pronto' ? interesse : '' };
}

/** Lê o que ficou guardado; qualquer coisa estranha vira uma conversa nova. */
export function lerEstado(bruto: string | null): EstadoSol {
  try {
    const d = JSON.parse(bruto ?? 'null') as Record<string, unknown> | null;
    if (!d || typeof d.sessao !== 'string' || !UUID.test(d.sessao)) return estadoNovo();
    const captura = lerCaptura(d.captura, d.leadOk === true);
    if (!captura) return estadoNovo();
    const historico = (Array.isArray(d.historico) ? d.historico as Partial<ItemHistorico>[] : [])
      .filter((i): i is ItemHistorico => !!i && (i.de === 'sol' || i.de === 'eu') && typeof i.texto === 'string')
      .slice(-MAX_HISTORICO)
      .map((i) => ({
        de: i.de,
        texto: i.texto.slice(0, 900),
        ...(Array.isArray(i.cartoes) ? { cartoes: i.cartoes.filter((n) => planos.some((p) => p.cameras === n)) } : {}),
        ...(Array.isArray(i.acoes) ? { acoes: i.acoes.filter((a) => a === 'whatsapp') } : {}),
        ...(i.avisado === true ? { avisado: true } : {}),
      }));
    return {
      sessao: d.sessao,
      historico,
      captura,
      leadOk: captura.etapa === 'pronto',
      pendente: typeof d.pendente === 'string' ? d.pendente.slice(0, LIMITE_MENSAGEM) : '',
    };
  } catch {
    return estadoNovo();
  }
}
