/**
 * Descrição de uma maquete 3D, só com dados (sem DOM e sem Three.js).
 * O motor (src/scripts/maquete/cena.ts) desenha qualquer maquete descrita assim; a cobertura das
 * câmeras (cobertura.ts) e os testes leem os mesmos dados. Cada página tem a sua:
 * condomínio (lib/condominio/maquete.ts) e casa, comércio e empresa (lib/ambientes/).
 *
 * Unidades em metros. Planta vista de cima: x para a direita, z para a frente (a rua fica em z alto).
 * "rumo" em graus: 0 = para a rua (+z), 90 = para a direita (+x), 180 = para os fundos.
 */
import type { NomeIcone } from '../icones';

export interface Retangulo { x0: number; x1: number; z0: number; z1: number }
export type Ponto2 = readonly [x: number, z: number];
export type Ponto3 = readonly [x: number, y: number, z: number];
export type Segmento = readonly [ax: number, az: number, bx: number, bz: number];

export interface CameraMaquete {
  id: number;
  nome: string;
  x: number;
  y: number;
  z: number;
  rumo: number;
  /** Abertura horizontal da lente, em graus. */
  abertura: number;
  /** Até onde a imagem é útil na maquete, em metros. */
  alcance: number;
  /** Presa num poste (e não numa parede). */
  poste?: boolean;
  /** Dentro de um imóvel (aparece com o telhado aberto). */
  interna?: boolean;
}

/** Prédio fechado (blocos do condomínio): caixa com andares e janelas. */
export interface Predio extends Retangulo {
  id: string;
  nome: string;
  andares: number;
  /** Pé-direito de cada andar. */
  pe: number;
  /** Fração das janelas acesas à noite (padrão: 0,46; prédios de serviço quase todas). */
  acesas?: number;
}

/** Abertura numa parede, medida em metros a partir do primeiro ponto da parede. */
export interface Vao {
  de: number;
  ate: number;
  /** porta: passagem (não bloqueia a visão) · janela, vitrine e garagem: bloqueiam. */
  tipo: 'porta' | 'janela' | 'vitrine' | 'garagem';
}
export interface Parede { seg: Segmento; externa?: boolean; vaos?: readonly Vao[] }

/** Imóvel em corte (casa, loja, escritório): paredes, cômodos e um telhado que sai. */
export interface Edificacao {
  id: string;
  nome: string;
  contorno: Retangulo;
  /** Altura das paredes. */
  altura: number;
  paredes: readonly Parede[];
  telhado: 'duas-aguas' | 'laje';
  /** Faixa de luz na fachada (letreiro sem texto), na parede da frente. */
  letreiro?: { x0: number; x1: number };
}

export type TipoMovel = 'caixa' | 'cama' | 'sofa' | 'mesa' | 'mesa-redonda' | 'prateleira' | 'gondola' | 'balcao' | 'bancada' | 'carro' | 'van' | 'servidor';
export interface Movel extends Retangulo {
  tipo: TipoMovel;
  /** Para onde a frente do móvel aponta (sofá, cama, carro); 0 = +z. */
  rumo?: number;
  cor?: number;
}

export type TipoSuperficie = 'gramado' | 'piso' | 'interno' | 'deck' | 'agua' | 'areia';
export interface Superficie { r: Retangulo; tipo: TipoSuperficie }

export interface Muro { seg: Segmento; altura: number }
/** Portão de grade, na frente do lote (z constante). */
export interface Grade { x0: number; x1: number; z: number; altura: number }

export type Enfeite =
  | { tipo: 'playground'; r: Retangulo }
  | { tipo: 'guarda-sol'; x: number; z: number };

export interface Carro { x: number; z: number; cor: number; rumo?: number }
export interface Pessoa { x: number; z: number; cor: number; papel: 'visitante' | 'morador' }

/** O que cada camada desenha. Cabos e arcos têm luz andando; o resto acende com a camada. */
export type ElementoCamada =
  | { tipo: 'cabo'; pontos: readonly Ponto3[]; raio?: number; forca?: number; vel?: number; /** Só aparece com essa câmera instalada. */ camera?: number }
  | { tipo: 'arco'; de: Ponto3; para: Ponto3; altura: number }
  | { tipo: 'ponto'; pos: Ponto3 }
  | { tipo: 'sensor'; pos: Ponto3 }
  | { tipo: 'wifi'; pos: Ponto2; altura: number }
  | { tipo: 'rack'; pos: Ponto2 }
  | { tipo: 'nobreak'; pos: Ponto2 }
  | { tipo: 'leitor'; pos: Ponto2; rumo?: number }
  | { tipo: 'contorno'; pontos: readonly Ponto3[] }
  | { tipo: 'tracejado'; pontos: readonly Ponto3[] };

export interface Zona { nome: string; pos: Ponto3; /** Dentro de um imóvel: aparece com o telhado aberto. */ interna?: boolean }

export interface Maquete {
  /** Base da maquete (lote + calçada + rua). */
  tabuleiro: Retangulo;
  lote: Retangulo;
  calcada: Retangulo;
  rua: Retangulo;
  /** Desenhadas na ordem (o lote é gramado; pisos, água etc. por cima). */
  superficies: readonly Superficie[];
  /** Faixas pintadas (vagas). */
  faixas: readonly Retangulo[];
  muros: readonly Muro[];
  grades: readonly Grade[];
  predios: readonly Predio[];
  edificacoes: readonly Edificacao[];
  moveis: readonly Movel[];
  enfeites: readonly Enfeite[];
  arvores: readonly (readonly [x: number, z: number, escala: number])[];
  carros: readonly Carro[];
  postes: readonly Ponto2[];
  pessoas: readonly Pessoa[];
  cameras: readonly CameraMaquete[];
  /** Onde passam pessoas e carros: é aqui que um ponto cego importa. */
  areasDeCirculacao: readonly Retangulo[];
  camadas: Readonly<Record<string, readonly ElementoCamada[]>>;
  zonas: readonly Zona[];
  /** Faixa da rua por onde passam os carros animados (z de cada mão). */
  maos?: readonly [ida: number, volta: number];
}

/** Uma camada do projeto (botão no painel e cor na maquete). */
export interface Camada<K extends string = string> {
  id: K;
  /** Nome curto no botão. */
  curto: string;
  /** Nome completo. */
  nome: string;
  icone: NomeIcone;
  /** Cor da camada na maquete e nos botões. */
  cor: string;
  /** false: acende sozinha (no "E se…?"), sem botão no painel. */
  botao?: boolean;
}

/** Enquadramento da câmera principal: gira em volta do alvo. */
export interface Vista {
  alvo: Ponto3;
  raio: number;
  /** Graus a partir da frente (rua), girando para a direita. */
  azimute: number;
  /** Graus acima do chão. */
  elevacao: number;
  /** Fração da largura: empurra a maquete para a direita (deixa a coluna de texto livre). */
  deslocar?: number;
}

/** Um capítulo do roteiro: para onde a câmera vai e o que acende. */
export interface Capitulo<C extends string = string, K extends string = string> {
  id: C;
  /** Número no roteiro quando é um dos sistemas. */
  numero?: number;
  vista: Vista;
  vistaCelular: Vista;
  camadas: readonly K[];
  /** Camada em destaque; as outras ficam mais fracas. */
  realce?: K;
  pontosCegos?: boolean;
  visitante?: boolean;
  /** Câmera em destaque (no monitor e na maquete). */
  selecionada?: number;
  /** Câmeras no monitor (vazio = sem imagens). */
  monitor: readonly number[];
  /** Câmeras instaladas neste capítulo (sem a lista: todas). */
  instaladas?: readonly number[];
  /** false: o telhado sai e mostra os cômodos (padrão: telhado no lugar). */
  telhado?: boolean;
  /** Mostra os nomes das áreas na maquete. */
  zonas?: boolean;
  /** Mostra o número de cada câmera na maquete (dá para tocar). */
  numeros?: boolean;
  /** Capítulo do "E se…?": a maquete reage à falta de energia. */
  ese?: boolean;
  /** Sem câmeras no monitor, o painel some (no computador fica só com as camadas). */
  semPainel?: boolean;
}

export const dentro = (r: Retangulo, x: number, z: number): boolean => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
export const centro = (r: Retangulo): Ponto2 => [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2];
export const rotuloCamera = (id: number): string => `CAM ${String(id).padStart(2, '0')}`;
