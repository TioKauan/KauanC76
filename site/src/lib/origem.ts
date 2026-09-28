/**
 * De onde veio o visitante (28/09/2026). A origem vai junto com o lead do chat
 * da Sol, para o relatório semanal dizer quantos contatos cada canal trouxe e
 * quanto custou cada um (anúncio no Google, anúncio na Meta, Instagram...).
 *
 * Sem cookie e sem ferramenta de análise: lê só o endereço da página (utm_*,
 * gclid, fbclid) e o site anterior (referrer), guarda no navegador por 30 dias
 * e só sai daqui junto com o contato que a pessoa decidiu deixar na Sol.
 *
 * Modelo de atribuição: o último canal que não seja acesso direto, dentro de 30
 * dias. Quem clicou no anúncio na segunda e voltou digitando o endereço na
 * quinta conta para o anúncio.
 */

export const CHAVE_ORIGEM = 'sc-origem';
export const VALIDADE_DIAS = 30;

export const CANAIS = [
  'google_ads', 'meta_ads', 'google_busca', 'busca_outra', 'instagram', 'facebook',
  'whatsapp', 'outro_site', 'campanha', 'direto',
] as const;
export type Canal = (typeof CANAIS)[number];

export interface Origem {
  canal: Canal;
  /** utm_source, ou o site anterior quando não há utm. */
  fonte: string;
  meio: string;
  campanha: string;
  conteudo: string;
  termo: string;
  /** Código de clique do Google (gclid, gbraid ou wbraid): permite, no futuro, dizer ao Google qual clique virou cliente. */
  gclid: string;
  fbclid: string;
  /** Página em que a pessoa chegou. */
  pagina: string;
  /** Quando chegou (ISO). */
  em: string;
}

/** Texto curto e sem caractere de controle: o endereço é digitável por qualquer um. */
function limpar(v: string | null | undefined, max = 100): string {
  return String(v ?? '').replace(/[\u0000-\u001f\u007f<>"'`]/g, '').trim().slice(0, max);
}

const MEIO_PAGO = /^(cpc|ppc|paid|pago|ads?|anuncio|paid_?social|paidsocial|display|cpm)$/;
const FONTE_GOOGLE = /^(google|googleads|google_ads|adwords|gads)$/;
const FONTE_META = /^(facebook|fb|instagram|ig|meta|facebook_ads|meta_ads)$/;

/** Canal a partir do site anterior (sem utm no endereço). */
function canalDoSiteAnterior(host: string, proprio: string): Canal {
  if (!host || host === proprio || host.endsWith(`.${proprio}`)) return 'direto';
  if (/(^|\.)google\.[a-z.]+$/.test(host)) return 'google_busca';
  if (/(^|\.)(bing\.com|duckduckgo\.com|search\.yahoo\.com|yahoo\.com|ecosia\.org|search\.brave\.com)$/.test(host)) return 'busca_outra';
  if (/(^|\.)instagram\.com$/.test(host)) return 'instagram';
  if (/(^|\.)(facebook\.com|fb\.com|messenger\.com)$/.test(host)) return 'facebook';
  if (/(^|\.)(whatsapp\.com|wa\.me)$/.test(host)) return 'whatsapp';
  return 'outro_site';
}

function hostDe(endereco: string): string {
  try { return new URL(endereco).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; }
}

/**
 * Origem desta visita. `proprio` é o endereço do próprio site: navegar de uma
 * página nossa para outra é acesso direto, não "outro site".
 */
export function lerOrigem(endereco: string, anterior: string, agora: Date, proprio = 'somoscella.online'): Origem {
  let p = new URLSearchParams();
  let pagina = '/';
  try {
    const u = new URL(endereco);
    p = u.searchParams;
    pagina = limpar(u.pathname, 100) || '/';
  } catch { /* endereço estranho: fica sem utm */ }

  const dono = proprio.toLowerCase().replace(/^www\./, '');
  const fonteUtm = limpar(p.get('utm_source')).toLowerCase();
  const meio = limpar(p.get('utm_medium')).toLowerCase();
  const gclid = limpar(p.get('gclid') || p.get('gbraid') || p.get('wbraid'), 200);
  const fbclid = limpar(p.get('fbclid'), 200);
  const hostAnterior = hostDe(anterior);

  let canal: Canal;
  if (gclid) canal = 'google_ads';
  else if (fonteUtm && MEIO_PAGO.test(meio)) {
    canal = FONTE_GOOGLE.test(fonteUtm) ? 'google_ads' : FONTE_META.test(fonteUtm) ? 'meta_ads' : 'campanha';
  } else if (fonteUtm) {
    canal = /^(google|gmb|google_perfil|perfil_google)$/.test(fonteUtm) ? 'google_busca'
      : /^(instagram|ig)$/.test(fonteUtm) ? 'instagram'
      : /^(facebook|fb)$/.test(fonteUtm) ? 'facebook'
      : /^(whatsapp|wa)$/.test(fonteUtm) ? 'whatsapp'
      : 'campanha';
  } else {
    canal = canalDoSiteAnterior(hostAnterior, dono);
    // O Facebook e o Instagram colocam fbclid em todo link clicado lá dentro (post ou anúncio).
    if (canal === 'direto' && fbclid) canal = 'facebook';
  }

  return {
    canal,
    fonte: fonteUtm || (canal === 'direto' ? '' : limpar(hostAnterior)),
    meio,
    campanha: limpar(p.get('utm_campaign')),
    conteudo: limpar(p.get('utm_content')),
    termo: limpar(p.get('utm_term')),
    gclid,
    fbclid,
    pagina,
    em: agora.toISOString(),
  };
}

/** Acesso direto não apaga um canal de verdade guardado há menos de 30 dias. */
export function escolherOrigem(nova: Origem, guardada: Origem | null, agora: Date): Origem {
  if (nova.canal !== 'direto' || !guardada) return nova;
  const idade = agora.getTime() - Date.parse(guardada.em);
  return idade >= 0 && idade < VALIDADE_DIAS * 86_400_000 ? guardada : nova;
}

/** O que está guardado no navegador, conferido campo a campo (pode ter sido mexido). */
export function lerOrigemGuardada(bruto: string | null): Origem | null {
  if (!bruto) return null;
  try {
    const d = JSON.parse(bruto) as Record<string, unknown>;
    if (!d || typeof d !== 'object' || !CANAIS.includes(d.canal as Canal) || typeof d.em !== 'string' || Number.isNaN(Date.parse(d.em))) {
      return null;
    }
    const txt = (k: string, max = 100) => limpar(typeof d[k] === 'string' ? (d[k] as string) : '', max);
    return {
      canal: d.canal as Canal,
      fonte: txt('fonte'), meio: txt('meio'), campanha: txt('campanha'), conteudo: txt('conteudo'), termo: txt('termo'),
      gclid: txt('gclid', 200), fbclid: txt('fbclid', 200), pagina: txt('pagina') || '/', em: d.em,
    };
  } catch {
    return null;
  }
}

/** O que vai junto com o lead: só os campos preenchidos. */
export function origemParaEnvio(o: Origem): Partial<Origem> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '')) as Partial<Origem>;
}
