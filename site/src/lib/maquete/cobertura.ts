/**
 * O que cada câmera de uma maquete enxerga no chão, e o que fica de fora (pontos cegos).
 * Geometria 2D na planta: raios saem da câmera dentro da abertura da lente e param no primeiro
 * obstáculo (prédios, paredes e muros). Portas abertas e grades de portão deixam ver.
 */
import { dentro, type CameraMaquete, type Maquete, type Parede, type Ponto2, type Retangulo, type Segmento } from './tipos';

const lados = (r: Retangulo): Segmento[] => [
  [r.x0, r.z0, r.x1, r.z0], [r.x1, r.z0, r.x1, r.z1], [r.x1, r.z1, r.x0, r.z1], [r.x0, r.z1, r.x0, r.z0],
];

/** Trechos de uma parede que bloqueiam a visão (tudo menos as portas). */
export function trechosQueBloqueiam(p: Parede): Segmento[] {
  const [ax, az, bx, bz] = p.seg;
  const comprimento = Math.hypot(bx - ax, bz - az);
  const portas = (p.vaos ?? []).filter((v) => v.tipo === 'porta').sort((a, b) => a.de - b.de);
  const ponto = (d: number) => [ax + ((bx - ax) * d) / comprimento, az + ((bz - az) * d) / comprimento] as const;
  const trechos: Segmento[] = [];
  let inicio = 0;
  for (const v of portas) {
    if (v.de > inicio) trechos.push([...ponto(inicio), ...ponto(v.de)]);
    inicio = Math.max(inicio, v.ate);
  }
  if (inicio < comprimento) trechos.push([...ponto(inicio), ...ponto(comprimento)]);
  return trechos;
}

/** Tudo o que bloqueia a visão na maquete. */
export function obstaculosDe(m: Maquete): Segmento[] {
  return [
    ...m.predios.flatMap(lados),
    ...m.edificacoes.flatMap((e) => e.paredes.flatMap(trechosQueBloqueiam)),
    ...m.muros.map((mu) => mu.seg),
    ...lados(m.tabuleiro),
  ];
}

/** Direção de um rumo (graus) na planta. */
export function direcao(rumo: number): Ponto2 {
  const a = (rumo * Math.PI) / 180;
  return [Math.sin(a), Math.cos(a)];
}

/** Rumo (graus, 0 a 360) de uma direção na planta. */
export function rumoDe(dx: number, dz: number): number {
  return ((Math.atan2(dx, dz) * 180) / Math.PI + 360) % 360;
}

/** Diferença entre dois ângulos em graus, entre -180 e 180. */
const diferenca = (a: number, b: number) => ((a - b + 540) % 360) - 180;

export interface Cobertura {
  obstaculos: readonly Segmento[];
  /** Distância até o primeiro obstáculo na direção (dx, dz), limitada a `maximo`. */
  alcanceNaDirecao(x: number, z: number, dx: number, dz: number, maximo: number): number;
  /** Polígono do campo de visão no chão: as pontas dos raios, da esquerda para a direita. */
  campoDeVisao(cam: CameraMaquete, raios?: number): Ponto2[];
  /** A câmera vê o ponto (x, z) do chão? */
  cameraVe(cam: CameraMaquete, x: number, z: number): boolean;
  /** Câmeras que veem o ponto. */
  quemVe(x: number, z: number, cameras?: readonly CameraMaquete[]): number[];
  /** Ponto de circulação sem nenhuma câmera olhando. */
  pontoCego(x: number, z: number, cameras?: readonly CameraMaquete[]): boolean;
  /**
   * Parte das áreas de circulação vista por pelo menos uma câmera (0 a 1), amostrando uma grade.
   * Uso interno (testes e ajuste da maquete): as páginas não mostram esse número.
   */
  fracaoVista(cameras?: readonly CameraMaquete[], passo?: number): number;
}

export function criarCobertura(m: Maquete): Cobertura {
  const obstaculos = obstaculosDe(m);
  const circula = (x: number, z: number) => m.areasDeCirculacao.some((r) => dentro(r, x, z)) && !m.predios.some((p) => dentro(p, x, z));

  function alcanceNaDirecao(x: number, z: number, dx: number, dz: number, maximo: number): number {
    let t = maximo;
    for (const [ax, az, bx, bz] of obstaculos) {
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

  function campoDeVisao(cam: CameraMaquete, raios = 72): Ponto2[] {
    const pontas: Ponto2[] = [];
    for (let i = 0; i <= raios; i++) {
      const [dx, dz] = direcao(cam.rumo - cam.abertura / 2 + (cam.abertura * i) / raios);
      const t = alcanceNaDirecao(cam.x, cam.z, dx, dz, cam.alcance);
      pontas.push([cam.x + dx * t, cam.z + dz * t]);
    }
    return pontas;
  }

  function cameraVe(cam: CameraMaquete, x: number, z: number): boolean {
    const vx = x - cam.x;
    const vz = z - cam.z;
    const dist = Math.hypot(vx, vz);
    if (dist < 0.01) return true;
    if (dist > cam.alcance) return false;
    if (Math.abs(diferenca(rumoDe(vx, vz), cam.rumo)) > cam.abertura / 2) return false;
    return alcanceNaDirecao(cam.x, cam.z, vx / dist, vz / dist, dist + 1e-6) >= dist - 1e-6;
  }

  const quemVe = (x: number, z: number, cameras: readonly CameraMaquete[] = m.cameras) => cameras.filter((c) => cameraVe(c, x, z)).map((c) => c.id);
  const pontoCego = (x: number, z: number, cameras: readonly CameraMaquete[] = m.cameras) => circula(x, z) && quemVe(x, z, cameras).length === 0;

  function fracaoVista(cameras: readonly CameraMaquete[] = m.cameras, passo = 0.5): number {
    let total = 0;
    let vistos = 0;
    for (let x = m.lote.x0 + passo / 2; x < m.lote.x1; x += passo) {
      for (let z = m.lote.z0 + passo / 2; z < m.lote.z1; z += passo) {
        if (!circula(x, z)) continue;
        total++;
        if (quemVe(x, z, cameras).length) vistos++;
      }
    }
    return total ? vistos / total : 0;
  }

  return { obstaculos, alcanceNaDirecao, campoDeVisao, cameraVe, quemVe, pontoCego, fracaoVista };
}
