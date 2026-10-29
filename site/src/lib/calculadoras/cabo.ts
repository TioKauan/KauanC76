/**
 * Queda de tensão e bitola de cabo de cobre.
 * Fórmula (resistência do cobre, circuito de dois fios, ida e volta): ΔV = 2 · L · I · ρ ÷ S
 *   L = comprimento de ida, em metros; I = corrente, em A; S = seção, em mm²; ρ = resistividade, em Ω·mm²/m.
 * Vale para corrente contínua (12/24 V das câmeras) e para CA monofásica com carga resistiva (cos φ = 1).
 * A resistividade é a do cobre a 20 °C (1/56) ou a 70 °C (1/48, temperatura máxima do PVC).
 * O limite de queda (%) é escolha de quem projeta: a NBR 5410 trata de instalações de baixa tensão em
 * geral (4 % no circuito terminal, por exemplo); em equipamento de 12 V vale a tolerância do fabricante,
 * que costuma estar na folha de dados da câmera.
 */
export const RHO_20C = 1 / 56; // 0,017857 Ω·mm²/m
export const RHO_70C = 1 / 48; // 0,020833 Ω·mm²/m

export interface SecaoCabo {
  mm2: number;
  /** Equivalente aproximado em AWG, só para os cabos de CFTV vendidos assim. */
  awg?: string;
  /** Corrente máxima (A): cobre, PVC 70 °C, método B1, 2 condutores carregados (NBR 5410, tabela 36). */
  ampacidade: number;
}

export const SECOES: readonly SecaoCabo[] = [
  { mm2: 0.5, awg: '≈ AWG 20', ampacidade: 9 },
  { mm2: 0.75, awg: '≈ AWG 18', ampacidade: 11 },
  { mm2: 1, awg: '≈ AWG 17', ampacidade: 14 },
  { mm2: 1.5, awg: '≈ AWG 16', ampacidade: 17.5 },
  { mm2: 2.5, awg: '≈ AWG 14', ampacidade: 24 },
  { mm2: 4, ampacidade: 32 },
  { mm2: 6, ampacidade: 41 },
  { mm2: 10, ampacidade: 57 },
  { mm2: 16, ampacidade: 76 },
];

export interface EntradaCabo {
  /** Tensão da fonte, em V. */
  tensao: number;
  /** Corrente total do trecho, em A. */
  corrente: number;
  /** Comprimento de ida, em metros. */
  comprimento: number;
  /** Queda máxima aceita, em % da tensão da fonte. */
  quedaMaximaPct: number;
  rho: number;
}

export interface ResultadoCabo {
  /** Menor seção teórica (mm²) que respeita a queda. */
  secaoMinimaMm2: number;
  /** Menor seção comercial que respeita queda e corrente; null se nenhuma serve. */
  escolhida: SecaoCabo | null;
  quedaV: number;
  quedaPct: number;
  tensaoNoFim: number;
  /** A seção foi aumentada por causa da corrente máxima do cabo, não da queda. */
  limitadaPelaCorrente: boolean;
}

export function quedaDeTensao(e: Pick<EntradaCabo, 'corrente' | 'comprimento' | 'rho'>, mm2: number): number {
  return (2 * e.comprimento * e.corrente * e.rho) / mm2;
}

export function calcularCabo(e: EntradaCabo): ResultadoCabo {
  const quedaMaxV = (e.tensao * e.quedaMaximaPct) / 100;
  const secaoMinimaMm2 = (2 * e.comprimento * e.corrente * e.rho) / quedaMaxV;
  const porQueda = SECOES.find((s) => s.mm2 >= secaoMinimaMm2 - 1e-9) ?? null;
  const escolhida = SECOES.find((s) => s.mm2 >= secaoMinimaMm2 - 1e-9 && s.ampacidade >= e.corrente) ?? null;
  const base = escolhida ?? SECOES[SECOES.length - 1]!;
  const quedaV = quedaDeTensao(e, base.mm2);
  return {
    secaoMinimaMm2,
    escolhida,
    quedaV,
    quedaPct: (quedaV / e.tensao) * 100,
    tensaoNoFim: e.tensao - quedaV,
    limitadaPelaCorrente: Boolean(escolhida && porQueda && escolhida.mm2 > porQueda.mm2),
  };
}

/** Distância máxima (m) que uma seção atende, para a tabela de referência. */
export function comprimentoMaximo(e: Omit<EntradaCabo, 'comprimento'>, mm2: number): number {
  const quedaMaxV = (e.tensao * e.quedaMaximaPct) / 100;
  return (quedaMaxV * mm2) / (2 * e.corrente * e.rho);
}
