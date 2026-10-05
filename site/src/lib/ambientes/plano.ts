/**
 * "Escolha o plano" nas páginas de ambiente: as câmeras de cada plano são os pontos que o
 * configurador marca quando a pessoa vem de um plano (presets), e o cabo estimado usa a mesma conta.
 */
import { planos, type Plano } from '../dados';
import { plantas, nomeEm } from '../configurador-dados';
import { resumir, type Camera } from '../configurador-logica';
import { tipoPlanta, type AmbienteMaquete } from './maquetes';

/** Planos que dá para escolher (os do documento: 1, 2, 3, 4 e 8 câmeras). */
export const opcoesDePlano = planos.map((p) => p.cameras);

/** Números das câmeras da maquete (CAM 01 = primeiro ponto sugerido) que o plano instala. */
export function camerasDoPlano(a: AmbienteMaquete, cameras: number): number[] {
  const planta = plantas[tipoPlanta(a)];
  const ids = planta.presets[cameras] ?? [];
  return ids.map((id) => planta.sugestoes.findIndex((s) => s.id === id) + 1).filter((n) => n > 0);
}

export interface ResumoPlano {
  plano: Plano;
  cameras: number[];
  nomes: string[];
  caboEstimado: number;
  caboExcedente: number;
}

export function resumoPlano(a: AmbienteMaquete, cameras: number): ResumoPlano {
  const plano = planos.find((p) => p.cameras === cameras);
  if (!plano) throw new Error(`Não há plano de ${cameras} câmeras`);
  const planta = plantas[tipoPlanta(a)];
  const numeros = camerasDoPlano(a, cameras);
  const pontos: Camera[] = numeros.map((n, i) => {
    const s = planta.sugestoes[n - 1]!;
    return { id: i + 1, x: s.x, y: s.y, angulo: s.angulo, nome: nomeEm(s.nome, a), sugestao: s.id };
  });
  const r = resumir({ ambiente: a, cameras: pontos, recursos: new Set(), condominio: new Set() });
  return { plano, cameras: numeros, nomes: pontos.map((p) => p.nome), caboEstimado: r.caboEstimado, caboExcedente: r.caboExcedente };
}
