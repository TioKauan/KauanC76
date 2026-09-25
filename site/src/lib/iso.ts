/**
 * Motor isométrico simples: gera o texto SVG das cenas da abertura (no build).
 * Coordenadas em "metros" (x para a direita-baixo, y para a esquerda-baixo, z para cima).
 */
import type { SistemaId } from './cenarios';

export type Ponto3D = [number, number, number];
export interface Cores { topo: string; esq: string; dir: string; borda: string; traco?: number }
type Camada = 'chao' | 'cones' | 'obra' | 'frente' | 'fios' | 'nos' | 'extra';
type Atributos = Record<string, string | number>;
export interface PontoTela { sistema: SistemaId; x: number; y: number }

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const f = (n: number) => n.toFixed(1);

export function criarCena({ id, escala, ox, oy, largura = 760, altura = 600 }: { id: string; escala: number; ox: number; oy: number; largura?: number; altura?: number }) {
  const camadas: Record<Camada, string[]> = { chao: [], cones: [], obra: [], frente: [], fios: [], nos: [], extra: [] };
  const p = (x: number, y: number, z = 0): [number, number] => [ox + (x - y) * C * escala, oy + (x + y) * S * escala - z * escala];
  const pts = (lista: Ponto3D[]) => lista.map((q) => p(...q).map(f).join(',')).join(' ');
  const attrs = (o: Atributos = {}) => Object.entries(o).map(([k, v]) => ` ${k}="${v}"`).join('');
  const poli = (lista: Ponto3D[], a: Atributos, camada: Camada = 'obra') => camadas[camada].push(`<polygon points="${pts(lista)}"${attrs(a)}/>`);
  const caminho = (lista: Ponto3D[]) => lista.map((q, i) => (i ? 'L' : 'M') + p(...q).map(f).join(' ')).join(' ');

  const cores = {
    parede: { topo: '#15283d', esq: '#0c1827', dir: '#10213a', borda: '#2b4a66' },
    telhado: { topo: '#1b344f', esq: '#10223a', dir: '#132a45', borda: '#35597a' },
    muro: { topo: '#1a2d42', esq: '#0f1d2d', dir: '#132438', borda: '#2e4c68' },
    chao: { topo: '#0a1728', esq: '#07111d', dir: '#081523', borda: '#1d3550' },
    tecnico: { topo: '#26303b', esq: '#161d25', dir: '#1c252f', borda: '#ff8a2b' },
    portao: { topo: '#1f3c56', esq: '#123049', dir: '#163753', borda: '#6de9f6' },
  } satisfies Record<string, Cores>;

  /** Caixa com as três faces visíveis. */
  const caixa = (x: number, y: number, z: number, w: number, d: number, h: number, c: Cores = cores.parede, camada: Camada = 'obra', extra: Atributos = {}) => {
    const t: Atributos = { fill: c.esq, stroke: c.borda, 'stroke-width': c.traco ?? 0.8, 'stroke-linejoin': 'round', ...extra };
    poli([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], t, camada);
    poli([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], { ...t, fill: c.dir }, camada);
    poli([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], { ...t, fill: c.topo }, camada);
  };
  const atributosJanela = (cor: string, op: number): Atributos => ({ class: 'janela', fill: cor, 'fill-opacity': op, stroke: '#ffd29a', 'stroke-width': 0.5, 'stroke-opacity': 0.5 });
  /** Janela iluminada na face frontal-esquerda (y constante). */
  const janelaY = (y: number, x0: number, z0: number, w: number, h: number, cor = '#ffb86b', op = 0.55) =>
    poli([[x0, y, z0], [x0 + w, y, z0], [x0 + w, y, z0 + h], [x0, y, z0 + h]], atributosJanela(cor, op));
  /** Janela na face frontal-direita (x constante). */
  const janelaX = (x: number, y0: number, z0: number, d: number, h: number, cor = '#ffb86b', op = 0.55) =>
    poli([[x, y0, z0], [x, y0 + d, z0], [x, y0 + d, z0 + h], [x, y0, z0 + h]], atributosJanela(cor, op));
  const plano = (lista: Ponto3D[], cor: string, op = 1, camada: Camada = 'chao') => poli(lista, { fill: cor, 'fill-opacity': op }, camada);
  const linha = (a: Ponto3D, b: Ponto3D, cor = '#2b4a66', larg = 0.7, camada: Camada = 'obra', op = 1) =>
    camadas[camada].push(`<path d="${caminho([a, b])}" stroke="${cor}" stroke-width="${larg}" stroke-opacity="${op}" fill="none"/>`);

  const arvore = (x: number, y: number, r = 0.9, h = 2.2, camada: Camada = 'obra', z = 0.3) => {
    caixa(x - 0.12, y - 0.12, z, 0.24, 0.24, h * 0.55, { topo: '#3a2a1c', esq: '#2a1d12', dir: '#33241a', borda: '#3a2a1c', traco: 0.3 }, camada);
    const [cx, cy] = p(x, y, z + h);
    camadas[camada].push(`<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r * escala * 0.95)}" ry="${f(r * escala * 0.85)}" fill="#0f3a33" stroke="#1d5a4c" stroke-width="0.8"/>`);
    camadas[camada].push(`<ellipse cx="${f(cx - r * 5)}" cy="${f(cy - r * 5)}" rx="${f(r * escala * 0.45)}" ry="${f(r * escala * 0.35)}" fill="#1c5a4b" fill-opacity="0.7"/>`);
  };

  const carro = (x: number, y: number, ao: 'x' | 'y' = 'y', cor: Cores = { topo: '#1d3b5c', esq: '#13283f', dir: '#17304b', borda: '#2f5677' }) => {
    const vidro: Cores = { topo: '#0b1826', esq: '#9fd8ff33', dir: '#9fd8ff26', borda: '#2f5677' };
    if (ao === 'y') {
      caixa(x, y, 0.3, 1.4, 2.6, 0.6, cor);
      caixa(x + 0.15, y + 0.6, 0.9, 1.1, 1.4, 0.45, vidro);
    } else {
      caixa(x, y, 0.3, 2.6, 1.4, 0.6, cor);
      caixa(x + 0.6, y + 0.15, 0.9, 1.4, 1.1, 0.45, vidro);
    }
  };

  /** Cone de visão de uma câmera no chão. */
  const cone = (x: number, y: number, angulo: number, abertura = 1, alcance = 5) => {
    const a1 = angulo - abertura / 2;
    const a2 = angulo + abertura / 2;
    const pa: Ponto3D = [x + Math.cos(a1) * alcance, y + Math.sin(a1) * alcance, 0.32];
    const pb: Ponto3D = [x + Math.cos(a2) * alcance, y + Math.sin(a2) * alcance, 0.32];
    poli([[x, y, 0.32], pa, pb], { class: 'cone', 'data-sistema': 'cameras', fill: `url(#${id}-cone)` }, 'cones');
  };

  /** Cabo entre sistemas, com pulso de luz animado. */
  let nFio = 0;
  const fio = (lista: Ponto3D[], sistema: SistemaId, { tracejado = false, cor = `url(#${id}-fio)` }: { tracejado?: boolean; cor?: string } = {}) => {
    const d = caminho(lista);
    const atraso = ((nFio++ * 0.37) % 2.4).toFixed(2);
    camadas.fios.push(
      `<g class="fio${tracejado ? ' fio-tracejado' : ''}" data-sistema="${sistema}">` +
        `<path class="fio-brilho" d="${d}" stroke="${cor}"/>` +
        `<path class="fio-linha" d="${d}" stroke="${cor}"/>` +
        (tracejado ? '' : `<path class="pulso" d="${d}" pathLength="100" style="animation-delay:-${atraso}s"/>`) +
        `</g>`,
    );
  };

  /** Ponto de um sistema; guarda a posição na tela para o rótulo. */
  const pontos: PontoTela[] = [];
  const no = (x: number, y: number, z: number, sistema: SistemaId, r = 6) => {
    const [cx, cy] = p(x, y, z);
    camadas.nos.push(
      `<g class="no" data-sistema="${sistema}"><circle class="no-halo" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 3.2)}"/>` +
        `<circle class="no-aura" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 1.8)}"/>` +
        `<circle class="no-nucleo" cx="${f(cx)}" cy="${f(cy)}" r="${r}"/></g>`,
    );
    pontos.push({ sistema, x: cx, y: cy });
  };

  /** Pessoa esperando (aparece na situação "Chegou visita"). */
  const visitante = (x: number, y: number, z = 0.3) => {
    const [cx, cy] = p(x, y, z);
    const k = escala / 23;
    camadas.extra.push(
      `<g class="visitante"><ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(9 * k)}" ry="${f(4 * k)}" fill="#000" fill-opacity=".35"/>` +
        `<rect x="${f(cx - 6 * k)}" y="${f(cy - 26 * k)}" width="${f(12 * k)}" height="${f(24 * k)}" rx="${f(5 * k)}" fill="#ffc233"/>` +
        `<circle cx="${f(cx)}" cy="${f(cy - 32 * k)}" r="${f(6 * k)}" fill="#ffd98a"/>` +
        `<circle class="visitante-onda" cx="${f(cx)}" cy="${f(cy - 16 * k)}" r="${f(22 * k)}" fill="none" stroke="#ffc233" stroke-width="1.5"/></g>`,
    );
  };

  const svg = (rotulo: string) => {
    const defs = `<defs>
      <linearGradient id="${id}-fio" gradientUnits="userSpaceOnUse" x1="${largura * 0.15}" y1="0" x2="${largura * 0.95}" y2="0">
        <stop offset="0" stop-color="#09a0f6"/><stop offset=".55" stop-color="#6de9f6"/><stop offset="1" stop-color="#ff6a00"/>
      </linearGradient>
      <radialGradient id="${id}-cone" cx="0" cy="0" r="1"><stop offset="0" stop-color="#6de9f6" stop-opacity=".42"/><stop offset="1" stop-color="#6de9f6" stop-opacity=".04"/></radialGradient>
    </defs>`;
    return `<svg class="cena-svg" viewBox="0 0 ${largura} ${altura}" role="img" aria-label="${rotulo}">${defs}` +
      `<g class="camada-chao">${camadas.chao.join('')}</g><g class="camada-cones">${camadas.cones.join('')}</g>` +
      `<g class="camada-obra">${camadas.obra.join('')}${camadas.frente.join('')}</g>` +
      `<g class="camada-fios">${camadas.fios.join('')}</g><g class="camada-extra">${camadas.extra.join('')}</g>` +
      `<g class="camada-nos">${camadas.nos.join('')}</g></svg>`;
  };

  return { caixa, janelaY, janelaX, plano, linha, arvore, carro, cone, fio, no, visitante, svg, pontos, cores, largura, altura };
}
