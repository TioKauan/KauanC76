/**
 * Fonte e bateria (bateria selada de chumbo-ácido de 12 V).
 * Fonte: potência total ÷ tensão = corrente; soma uma folga (a fonte não deve trabalhar no limite).
 * Bateria: Ah = corrente × horas ÷ (profundidade de descarga × eficiência).
 *   Profundidade de descarga: a selada dura mais se descarregar só até 50 %.
 *   Eficiência: perdas do conversor e envelhecimento da bateria (0,85 é um valor prudente).
 */
export interface Carga { quantidade: number; watts: number }

export const FONTES_A = [1, 2, 3, 5, 10, 12.5, 15, 20, 30] as const;
export const BATERIAS_AH = [4.5, 7, 9, 12, 18, 26, 40, 45, 65, 100] as const;

export interface EntradaEnergia {
  cargas: readonly Carga[];
  tensao: number;
  /** 0,2 = 20 % de folga na fonte. */
  folga: number;
  horasAutonomia: number;
  /** 0,5 = descarrega até 50 %. */
  profundidadeDescarga: number;
  eficiencia: number;
}

export interface ResultadoEnergia {
  watts: number;
  correnteA: number;
  correnteComFolgaA: number;
  /** Menor fonte comercial (A) que atende, ou null se passar de 30 A. */
  fonteA: number | null;
  baterias: { ah: number; paralelo: number; capacidadeAh: number } | null;
  ahNecessarios: number;
}

export function calcularEnergia(e: EntradaEnergia): ResultadoEnergia {
  const watts = e.cargas.reduce((s, c) => s + c.quantidade * c.watts, 0);
  const correnteA = watts / e.tensao;
  const correnteComFolgaA = correnteA * (1 + e.folga);
  const fonteA = FONTES_A.find((a) => a >= correnteComFolgaA - 1e-9) ?? null;
  const ahNecessarios = (correnteA * e.horasAutonomia) / (e.profundidadeDescarga * e.eficiencia);
  // Uma bateria só, se houver tamanho comercial; senão a maior, em paralelo.
  let baterias: ResultadoEnergia['baterias'] = null;
  if (e.horasAutonomia > 0 && watts > 0) {
    const unica = BATERIAS_AH.find((a) => a >= ahNecessarios - 1e-9);
    if (unica) baterias = { ah: unica, paralelo: 1, capacidadeAh: unica };
    else {
      const maior = BATERIAS_AH[BATERIAS_AH.length - 1]!;
      const paralelo = Math.ceil(ahNecessarios / maior - 1e-9);
      baterias = { ah: maior, paralelo, capacidadeAh: maior * paralelo };
    }
  }
  return { watts, correnteA, correnteComFolgaA, fonteA, baterias, ahNecessarios };
}
