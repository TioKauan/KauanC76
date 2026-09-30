/**
 * Maquete do Condomínio Evoluído: o que existe no lote e onde.
 * Só dados (sem DOM e sem Three.js): a cena 3D, a cobertura das câmeras e os testes leem daqui.
 * Condomínio ILUSTRATIVO: não representa um cliente nem a quantidade de câmeras de uma proposta.
 *
 * Unidades em metros. Planta vista de cima: x para a direita, z para a frente (rua em z > 22).
 * "rumo" das câmeras em graus: 0 = para a rua (+z), 90 = para a direita (+x), 180 = para os fundos.
 */

export interface Retangulo { x0: number; x1: number; z0: number; z1: number }
export type Ponto2 = readonly [x: number, z: number];
export type Ponto3 = readonly [x: number, y: number, z: number];

export interface Predio extends Retangulo {
  id: 'bloco-a' | 'bloco-b' | 'salao' | 'portaria' | 'tecnico';
  nome: string;
  andares: number;
  /** Pé-direito de cada andar. */
  pe: number;
}

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
}

/** Área murada do condomínio. */
export const LOTE: Retangulo = { x0: -30, x1: 30, z0: -22, z1: 22 };
/** Base da maquete (lote + calçada + rua). */
export const TABULEIRO: Retangulo = { x0: -36, x1: 36, z0: -27, z1: 31 };
export const CALCADA: Retangulo = { x0: TABULEIRO.x0, x1: TABULEIRO.x1, z0: LOTE.z1, z1: 24.2 };
export const RUA: Retangulo = { x0: TABULEIRO.x0, x1: TABULEIRO.x1, z0: 24.2, z1: TABULEIRO.z1 };

/** Aberturas no muro da frente (z = LOTE.z1). */
export const PORTAO_VEICULOS = { x0: 2, x1: 9 } as const;
export const PORTAO_PEDESTRES = { x0: -2.5, x1: -1.1 } as const;

export const PREDIOS: readonly Predio[] = [
  { id: 'bloco-a', nome: 'Bloco A', x0: -26, x1: -12, z0: -19, z1: -8, andares: 6, pe: 3 },
  { id: 'bloco-b', nome: 'Bloco B', x0: 4, x1: 18, z0: -19, z1: -8, andares: 6, pe: 3 },
  { id: 'salao', nome: 'Salão de festas', x0: -27, x1: -18, z0: -3, z1: 4, andares: 1, pe: 4.2 },
  { id: 'portaria', nome: 'Portaria', x0: -8, x1: -2.6, z0: 18.6, z1: 22.4, andares: 1, pe: 3.2 },
  { id: 'tecnico', nome: 'Quadro técnico', x0: -8, x1: -4.4, z0: 15.6, z1: 18.6, andares: 1, pe: 2.8 },
];

export const CAMERAS: readonly CameraMaquete[] = [
  { id: 1, nome: 'Portões, lado da rua', x: 9.7, y: 3.0, z: 22.6, rumo: 276, abertura: 64, alcance: 17 },
  { id: 2, nome: 'Entrada de pedestres', x: 1.4, y: 3.2, z: 17.2, rumo: 330, abertura: 78, alcance: 9, poste: true },
  { id: 3, nome: 'Garagem', x: 9.8, y: 4.6, z: 6.2, rumo: 50, abertura: 84, alcance: 23, poste: true },
  { id: 4, nome: 'Garagem, fundo', x: 28.7, y: 4.2, z: 21.5, rumo: 226, abertura: 76, alcance: 21 },
  { id: 5, nome: 'Perímetro dos fundos', x: -29.3, y: 4.2, z: -21.3, rumo: 80, abertura: 56, alcance: 30 },
  { id: 6, nome: 'Perímetro lateral', x: 29.3, y: 4.2, z: -21.3, rumo: 352, abertura: 56, alcance: 30 },
  { id: 7, nome: 'Piscina', x: -17.6, y: 3.4, z: 0.5, rumo: 90, abertura: 78, alcance: 21 },
  { id: 8, nome: 'Playground', x: 13.6, y: 4.2, z: 4.6, rumo: 128, abertura: 72, alcance: 15, poste: true },
];

export const LAZER = {
  piscina: { x0: -9, x1: 3, z0: -2.6, z1: 2.6 },
  deck: { x0: -11.5, x1: 5.5, z0: -4.6, z1: 4.6 },
  playground: { x0: 17, x1: 26.5, z0: -4.5, z1: 3 },
} as const satisfies Record<string, Retangulo>;

/** Áreas calçadas dentro do lote (o resto é gramado). */
export const PISOS: readonly Retangulo[] = [
  { x0: 2, x1: 9, z0: 5.5, z1: 22 }, // rua interna, do portão de veículos
  { x0: 9, x1: 28.6, z0: 6.5, z1: 20.8 }, // estacionamento
  { x0: -12.5, x1: 2, z0: 13.6, z1: 22 }, // frente da portaria e do quadro técnico
  { x0: -2.6, x1: -0.6, z0: 4.6, z1: 13.6 }, // caminho de pedestres
  { x0: -27, x1: 19, z0: -7.4, z1: -5.2 }, // calçada dos blocos
  { x0: -0.9, x1: 0.9, z0: -5.2, z1: -4.6 },
];

/** Onde passam pessoas e carros: é aqui que um ponto cego importa. */
export const AREAS_DE_CIRCULACAO: readonly Retangulo[] = [...PISOS, LAZER.deck, LAZER.playground];

/** Vagas: linhas pintadas no estacionamento. */
export const VAGAS = { x0: 10.4, largura: 2.6, quantidade: 7, fileiras: [[7, 11.6], [15.8, 20.4]] as const } as const;

export const ARVORES: readonly (readonly [x: number, z: number, escala: number])[] = (() => {
  const lista: [number, number, number][] = [];
  for (let x = -27; x <= 27; x += 4.6) if (x < -12.5 || (x > -11 && x < 3.5) || x > 18.5) lista.push([x, -20.6, 1]);
  for (let z = -16; z <= 12; z += 4.4) lista.push([-28.6, z, z % 2 ? 0.9 : 1.1]);
  for (let z = -18; z <= 4; z += 4.4) lista.push([28.6, z, 1]);
  lista.push([-14, 7, 1.3], [-9, 9.5, 1], [-20, 9, 1.2], [-24, 13, 1], [-16, 12, 0.9], [6, 1.5, 1], [10, -2.5, 1.2], [14.5, -4.5, 0.9], [-14.5, -3, 0.8]);
  return lista;
})();

export const CARROS: readonly (readonly [x: number, z: number, cor: number])[] = [
  [13.2, 9.3, 0x2b4058], [18.4, 9.3, 0x5c6c7e], [21, 9.3, 0x1f2d3e], [26.2, 9.3, 0x7a4a2e],
  [15.8, 18, 0x3f5a48], [23.6, 18, 0x44546a], [10.6, 18, 0x6b7280],
];

export const POSTES_DE_LUZ: readonly Ponto2[] = [
  [5.5, 8], [5.5, 16], [18, 13.5], [26, 13.5], [-5, 10], [-5, -1], [-14, -6.3], [10, -6.3],
  [-24, 22.9], [-12, 22.9], [14, 22.9], [26, 22.9],
];

/* ------------------------------------------------ equipamentos das camadas */

/** Leitor facial, do lado da rua, junto ao portão de pedestres. */
export const LEITOR_FACIAL: Ponto2 = [-0.75, 22.45];
/** Onde o visitante espera (na calçada, diante do portão de pedestres). */
export const VISITANTE: Ponto2 = [-1.8, 23.5];
/** Rack (gravador, rede) e nobreak, na frente do quadro técnico. */
export const RACK: Ponto2 = [-5.3, 15];
export const NOBREAK: Ponto2 = [-7, 15];
/** Interfonia: da portaria até a entrada de cada bloco. */
export const INTERFONIA = {
  portaria: [-5.3, 3.4, 18.6] as Ponto3,
  blocos: [
    { bloco: 'Bloco A', ponto: [-19, 2.5, -8] as Ponto3, altura: 14 },
    { bloco: 'Bloco B', ponto: [11, 2.5, -8] as Ponto3, altura: 15 },
  ],
} as const;
/** Pontos de acesso Wi-Fi nas áreas comuns. */
export const PONTOS_WIFI: readonly Ponto2[] = [[-22.5, 0.5], [-3, 0], [21.5, -0.8]];

const CHAO = 0.12;
/** Caminho do cabo de rede de cada câmera até o rack (pelo chão, em ângulos retos). */
export const CABOS_REDE: readonly Ponto3[][] = [
  [[9.7, CHAO, 22.3], [9.7, CHAO, 21.4], [-2.2, CHAO, 21.4], [-2.2, CHAO, 14.3], [-5.3, CHAO, 14.3], [-5.3, CHAO, 14.6]],
  [[1.4, CHAO, 17.2], [1.4, CHAO, 14], [-5.3, CHAO, 14], [-5.3, CHAO, 14.6]],
  [[9.8, CHAO, 6.2], [1.6, CHAO, 6.2], [1.6, CHAO, 13.8], [-5.1, CHAO, 13.8], [-5.1, CHAO, 14.6]],
  [[28.7, CHAO, 21.5], [28.7, CHAO, 21], [10, CHAO, 21], [10, CHAO, 13.6], [1.8, CHAO, 13.6], [-4.9, CHAO, 13.6], [-4.9, CHAO, 14.6]],
  [[-29.3, CHAO, -21.3], [-29, CHAO, -6.3], [-4, CHAO, -6.3], [-1.6, CHAO, -4.9], [-1.6, CHAO, 13.4], [-5.5, CHAO, 13.4], [-5.5, CHAO, 14.6]],
  [[29.3, CHAO, -21.3], [29, CHAO, -6.3], [0, CHAO, -6.3], [-1.6, CHAO, -4.9]],
  [[-17.6, CHAO, 0.5], [-13, CHAO, 0.5], [-12, CHAO, -5], [-4, CHAO, -6.1]],
  [[13.6, CHAO, 4.6], [13.6, CHAO, -5.2], [2, CHAO, -6]],
];
/** Cabo de energia: do nobreak até a portaria, o leitor facial e o motor do portão. */
export const CABOS_ENERGIA: readonly Ponto3[][] = [
  [[-7, 0.14, 14.6], [-7, 0.14, 13.2], [-2, 0.14, 13.2], [-2, 0.14, 21.6], [-0.75, 0.14, 21.9]],
  [[-2, 0.14, 21.6], [5.5, 0.14, 21.6]],
];

/* ------------------------------------------------ utilidades */

export const dentro = (r: Retangulo, x: number, z: number): boolean => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
export const centro = (r: Retangulo): Ponto2 => [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2];
export const cameraPorId = (id: number): CameraMaquete | undefined => CAMERAS.find((c) => c.id === id);
export const rotuloCamera = (id: number): string => `CAM ${String(id).padStart(2, '0')}`;
