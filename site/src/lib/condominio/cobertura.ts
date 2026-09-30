/**
 * O que cada câmera da maquete enxerga no chão, e o que fica de fora (pontos cegos).
 * Geometria 2D na planta: raios saem da câmera dentro da abertura da lente e param no
 * primeiro obstáculo (prédios e muro; as grades dos portões deixam ver).
 */
import { AREAS_DE_CIRCULACAO, CAMERAS, LOTE, PORTAO_PEDESTRES, PORTAO_VEICULOS, PREDIOS, TABULEIRO, dentro, type CameraMaquete, type Ponto2, type Retangulo } from './maquete';

type Segmento = readonly [ax: number, az: number, bx: number, bz: number];

const lados = (r: Retangulo): Segmento[] => [
  [r.x0, r.z0, r.x1, r.z0], [r.x1, r.z0, r.x1, r.z1], [r.x1, r.z1, r.x0, r.z1], [r.x0, r.z1, r.x0, r.z0],
];

/** Tudo o que bloqueia a visão na maquete. */
export const OBSTACULOS: readonly Segmento[] = [
  ...PREDIOS.flatMap(lados),
  // muro do lote: fundos e laterais inteiros; frente com as aberturas dos portões
  [LOTE.x0, LOTE.z0, LOTE.x1, LOTE.z0], [LOTE.x1, LOTE.z0, LOTE.x1, LOTE.z1], [LOTE.x0, LOTE.z1, LOTE.x0, LOTE.z0],
  [LOTE.x0, LOTE.z1, -8, LOTE.z1], [PORTAO_PEDESTRES.x1, LOTE.z1, PORTAO_VEICULOS.x0, LOTE.z1], [PORTAO_VEICULOS.x1, LOTE.z1, LOTE.x1, LOTE.z1],
  // fim da maquete
  ...lados(TABULEIRO),
];

/** Direção de um rumo (graus) na planta. */
export function direcao(rumo: number): Ponto2 {
  const a = (rumo * Math.PI) / 180;
  return [Math.sin(a), Math.cos(a)];
}

/** Distância até o primeiro obstáculo na direção (dx, dz), limitada a `maximo`. */
export function alcanceNaDirecao(x: number, z: number, dx: number, dz: number, maximo: number): number {
  let t = maximo;
  for (const [ax, az, bx, bz] of OBSTACULOS) {
    const ex = bx - ax;
    const ez = bz - az;
    const den = dx * ez - dz * ex;
    if (Math.abs(den) < 1e-9) continue;
    const u = ((ax - x) * ez - (az - z) * ex) / den; // distância ao longo do raio
    const v = ((ax - x) * dz - (az - z) * dx) / den; // posição ao longo do segmento
    if (u > 0.05 && v >= 0 && v <= 1 && u < t) t = u;
  }
  return t;
}

/** Polígono do campo de visão no chão: a câmera e as pontas dos raios, da esquerda para a direita. */
export function campoDeVisao(cam: CameraMaquete, raios = 72): Ponto2[] {
  const pontas: Ponto2[] = [];
  for (let i = 0; i <= raios; i++) {
    const [dx, dz] = direcao(cam.rumo - cam.abertura / 2 + (cam.abertura * i) / raios);
    const t = alcanceNaDirecao(cam.x, cam.z, dx, dz, cam.alcance);
    pontas.push([cam.x + dx * t, cam.z + dz * t]);
  }
  return pontas;
}

/** Diferença entre dois ângulos em graus, entre -180 e 180. */
const diferenca = (a: number, b: number) => ((a - b + 540) % 360) - 180;

/** A câmera vê o ponto (x, z) do chão? */
export function cameraVe(cam: CameraMaquete, x: number, z: number): boolean {
  const vx = x - cam.x;
  const vz = z - cam.z;
  const dist = Math.hypot(vx, vz);
  if (dist < 0.01) return true;
  if (dist > cam.alcance) return false;
  const rumoPonto = (Math.atan2(vx, vz) * 180) / Math.PI;
  if (Math.abs(diferenca(rumoPonto, cam.rumo)) > cam.abertura / 2) return false;
  return alcanceNaDirecao(cam.x, cam.z, vx / dist, vz / dist, dist + 1e-6) >= dist - 1e-6;
}

/** Câmeras que veem o ponto. */
export const quemVe = (x: number, z: number, cameras: readonly CameraMaquete[] = CAMERAS): number[] =>
  cameras.filter((c) => cameraVe(c, x, z)).map((c) => c.id);

/** Ponto de circulação sem nenhuma câmera olhando. */
export const pontoCego = (x: number, z: number, cameras: readonly CameraMaquete[] = CAMERAS): boolean =>
  AREAS_DE_CIRCULACAO.some((r) => dentro(r, x, z)) && !PREDIOS.some((p) => dentro(p, x, z)) && quemVe(x, z, cameras).length === 0;

/**
 * Parte das áreas de circulação vista por pelo menos uma câmera (0 a 1), amostrando uma grade.
 * Uso interno (testes e ajuste da maquete): a página não mostra esse número.
 */
export function fracaoVista(cameras: readonly CameraMaquete[] = CAMERAS, passo = 0.5): number {
  let total = 0;
  let vistos = 0;
  for (let x = LOTE.x0 + passo / 2; x < LOTE.x1; x += passo) {
    for (let z = LOTE.z0 + passo / 2; z < LOTE.z1; z += passo) {
      if (!AREAS_DE_CIRCULACAO.some((r) => dentro(r, x, z)) || PREDIOS.some((p) => dentro(p, x, z))) continue;
      total++;
      if (quemVe(x, z, cameras).length) vistos++;
    }
  }
  return total ? vistos / total : 0;
}
