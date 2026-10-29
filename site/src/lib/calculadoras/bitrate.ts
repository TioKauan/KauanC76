/**
 * Taxas de bits de referência para câmeras IP, em Mbps por câmera (25 fps, cena comum).
 * São ESTIMATIVAS de mercado: a taxa real depende da marca, da cena e da configuração da câmera.
 * Na calculadora o valor pode ser editado; a taxa exata está na página da câmera/NVR.
 */
export type Resolucao = '2mp' | '4mp' | '5mp' | '8mp';
export type Codec = 'h264' | 'h265' | 'h265mais';

export const RESOLUCOES: readonly { id: Resolucao; rotulo: string; h264: number }[] = [
  { id: '2mp', rotulo: '2 MP (Full HD)', h264: 4 },
  { id: '4mp', rotulo: '4 MP', h264: 6 },
  { id: '5mp', rotulo: '5 MP', h264: 8 },
  { id: '8mp', rotulo: '8 MP (4K)', h264: 12 },
];

/** Fator sobre o H.264: o H.265 gasta cerca da metade; o H.265+ (as marcas variam) cerca de um terço. */
export const CODECS: readonly { id: Codec; rotulo: string; fator: number }[] = [
  { id: 'h264', rotulo: 'H.264', fator: 1 },
  { id: 'h265', rotulo: 'H.265', fator: 0.5 },
  { id: 'h265mais', rotulo: 'H.265+ / Smart Codec', fator: 0.35 },
];

/** Mbps estimados por câmera para uma resolução e um codec. */
export function taxaSugerida(resolucao: Resolucao, codec: Codec): number {
  const r = RESOLUCOES.find((x) => x.id === resolucao);
  const c = CODECS.find((x) => x.id === codec);
  if (!r || !c) throw new Error('Resolução ou codec desconhecido');
  return Math.round(r.h264 * c.fator * 100) / 100;
}
