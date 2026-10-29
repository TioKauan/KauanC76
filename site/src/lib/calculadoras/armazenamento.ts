/**
 * Armazenamento de HD para gravação de câmeras.
 * GB por câmera por dia = Mbps × segundos gravados ÷ 8 ÷ 1000 (GB decimal, como o HD é vendido:
 * 1 TB = 1000 GB). O Windows e o NVR mostram em TiB (1024), por isso um HD "de 4 TB" aparece como
 * cerca de 3,64 TiB; aqui o cálculo fica em TB decimal, igual à etiqueta do disco.
 */
export interface EntradaArmazenamento {
  cameras: number;
  /** Mbps de cada câmera (ver bitrate.ts; editável). */
  mbps: number;
  dias: number;
  /** Horas gravadas por dia (24 = contínuo). */
  horasPorDia: number;
  /** Margem de segurança sobre o total (0,1 = 10 %). */
  margem: number;
}

export interface ResultadoArmazenamento {
  gbPorCameraDia: number;
  totalTB: number;
  totalComMargemTB: number;
  /** Menor número de discos de um mesmo tamanho comercial que atende; null se passar de 16 baias. */
  sugestao: { discos: number; tamanhoTB: number; capacidadeTB: number } | null;
  /** O mesmo total em TiB, o número que o Windows e o NVR costumam mostrar. */
  totalComMargemTiB: number;
}

export const DISCOS_TB = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20] as const;
const TIB_EM_TB = 1.099511627776; // 1 TiB = 1,0995 TB

export function calcularArmazenamento(e: EntradaArmazenamento): ResultadoArmazenamento {
  const gbPorCameraDia = (e.mbps * e.horasPorDia * 3600) / 8 / 1000;
  const totalTB = (e.cameras * e.dias * gbPorCameraDia) / 1000;
  const totalComMargemTB = totalTB * (1 + e.margem);
  // Menos discos primeiro; no empate, o disco menor (sobra menos). Limite de 16 baias.
  let sugestao: ResultadoArmazenamento['sugestao'] = null;
  for (const tamanhoTB of DISCOS_TB) {
    const discos = Math.ceil(totalComMargemTB / tamanhoTB - 1e-9);
    if (discos < 1 || discos > 16) continue;
    if (!sugestao || discos < sugestao.discos) sugestao = { discos, tamanhoTB, capacidadeTB: discos * tamanhoTB };
  }
  return { gbPorCameraDia, totalTB, totalComMargemTB, sugestao, totalComMargemTiB: totalComMargemTB / TIB_EM_TB };
}
