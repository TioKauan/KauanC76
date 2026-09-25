/**
 * Regras do configurador "Monte seu sistema", sem nada de tela: fáceis de testar (tests/configurador.test.ts).
 */
import { planoParaCameras, nomePlano, formatarPreco, mostrarPrecos, upgrades, type Plano, type Recomendacao, type Upgrade } from './dados';
import { ambientesConfig, plantas, sistemasCondominio, nomeEm, type AmbienteConfigId, type Planta, type Retangulo } from './configurador-dados';

export interface Camera {
  id: number;
  x: number;
  y: number;
  /** Direção do campo de visão, em graus (0 = direita, 90 = para baixo). */
  angulo: number;
  nome: string;
  /** Id do ponto sugerido, quando a câmera veio de uma sugestão. */
  sugestao: string | null;
}

export interface EstadoConfigurador {
  ambiente: AmbienteConfigId;
  cameras: Camera[];
  recursos: Set<Upgrade['id']>;
  condominio: Set<string>;
}

export const dentro = (r: Retangulo, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

export function plantaDe(ambiente: AmbienteConfigId): Planta | null {
  const tipo = ambientesConfig.find((a) => a.id === ambiente)?.planta;
  return tipo ? plantas[tipo] : null;
}

export function nomeAmbiente(ambiente: AmbienteConfigId): string {
  return ambientesConfig.find((a) => a.id === ambiente)?.nome ?? ambiente;
}

/** Câmera dentro do imóvel olha para o centro dele; câmera externa olha para fora do prédio mais próximo. */
export function anguloPara(planta: Planta, x: number, y: number): number {
  const graus = (dy: number, dx: number) => (Math.atan2(dy, dx) * 180) / Math.PI;
  const centro = (r: Retangulo) => ({ cx: r.x + r.w / 2, cy: r.y + r.h / 2 });
  const interno = planta.edificios.find((r) => dentro(r, x, y));
  if (interno) {
    const { cx, cy } = centro(interno);
    return graus(cy - y, cx - x);
  }
  const distancia = (r: Retangulo) => Math.hypot(centro(r).cx - x, centro(r).cy - y);
  const perto = planta.edificios.reduce<Retangulo | null>((a, b) => (!a || distancia(b) < distancia(a) ? b : a), null);
  if (!perto) return 90;
  const { cx, cy } = centro(perto);
  return graus(y - cy, x - cx);
}

/** Nome do ponto pela área da planta; repetições ganham número: "Sala (2)". */
export function nomeDaZona(planta: Planta, ambiente: AmbienteConfigId, cameras: Camera[], x: number, y: number): string {
  const zona = planta.zonas.find((z) => dentro(z, x, y));
  const base = zona ? nomeEm(zona.nome, ambiente) : 'Área externa';
  const iguais = cameras.filter((c) => c.nome === base || c.nome.startsWith(`${base} (`)).length;
  return iguais ? `${base} (${iguais + 1})` : base;
}

/** Cabo estimado (ilustrativo): caminho em "L" até o gravador + folga de instalação. */
export function caboDe(planta: Planta, c: Pick<Camera, 'x' | 'y'>): number {
  const [dx, dy] = planta.dvr;
  return Math.round((Math.abs(c.x - dx) + Math.abs(c.y - dy)) * planta.metrosPorUnidade + planta.folga);
}

export function caboTotal(planta: Planta, cameras: Camera[]): number {
  return cameras.reduce((soma, c) => soma + caboDe(planta, c), 0);
}

export interface Resumo {
  recomendacao: Recomendacao;
  quantidade: number;
  caboEstimado: number;
  /** Metros além do incluso no plano (0 se couber). */
  caboExcedente: number;
}

export function resumir(estado: EstadoConfigurador): Resumo {
  const planta = plantaDe(estado.ambiente);
  const quantidade = estado.cameras.length;
  const caboEstimado = planta ? caboTotal(planta, estado.cameras) : 0;
  const recomendacao = estado.ambiente === 'condominio' ? ({ tipo: 'proposta', plano: null } as const) : planoParaCameras(quantidade);
  const caboExcedente = recomendacao.plano ? Math.max(0, caboEstimado - recomendacao.plano.caboMetros) : 0;
  return { recomendacao, quantidade, caboEstimado, caboExcedente };
}

const preco = (p: Plano) => (mostrarPrecos ? `R$ ${formatarPreco(p.preco)}/mês` : 'sob consulta');

export function mensagemInicial(ambiente: AmbienteConfigId): string {
  return `Olá! Estou montando meu sistema no site da SC (${nomeAmbiente(ambiente).toLowerCase()}) e gostaria de ajuda para escolher os pontos.`;
}

/** Mensagem do WhatsApp com tudo o que a pessoa montou. */
export function mensagemWhatsapp(estado: EstadoConfigurador): string {
  if (estado.ambiente === 'condominio') {
    const escolhidos = sistemasCondominio.filter((s) => estado.condominio.has(s.id)).map((s) => s.nome.toLowerCase());
    return [
      'Olá! Quero uma proposta de Condomínio Evoluído.',
      escolhidos.length ? `Sistemas de interesse: ${escolhidos.join(', ')}.` : 'Gostaria de entender o que faz sentido para o condomínio.',
      'Podemos conversar?',
    ].join('\n');
  }
  const { recomendacao: rec, quantidade: n, caboEstimado: total } = resumir(estado);
  if (!n) return mensagemInicial(estado.ambiente);
  const linhas = [
    'Olá! Montei meu sistema no site da SC.',
    `Ambiente: ${nomeAmbiente(estado.ambiente)}`,
    `Câmeras: ${n} (${estado.cameras.map((c) => c.nome.toLowerCase()).join(', ')})`,
  ];
  if (rec.tipo === 'exato') linhas.push(`Plano sugerido: ${nomePlano(rec.plano)} (${preco(rec.plano)})`, `Cabo estimado: ≈ ${total} m (o plano inclui até ${rec.plano.caboMetros} m)`);
  if (rec.tipo === 'folga') linhas.push(`Plano sugerido: ${nomePlano(rec.plano)} (${preco(rec.plano)}) ou proposta para ${n} câmeras`, `Cabo estimado: ≈ ${total} m`);
  if (rec.tipo === 'proposta') linhas.push(`Quero uma proposta personalizada para ${n} câmeras.`);
  const recursos = upgrades.filter((u) => estado.recursos.has(u.id)).map((u) => u.nome.toLowerCase());
  if (recursos.length) linhas.push(`Recursos de interesse: ${recursos.join(', ')}`);
  linhas.push('Podemos agendar uma avaliação?');
  return linhas.join('\n');
}
