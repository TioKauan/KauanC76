/**
 * Ferramenta "Toque onde quer câmera" (/casa/ e /comercio/): pontos de cada fachada e a conta, sem DOM.
 * Cada ponto marcado é uma câmera; o plano sai de `planoParaCameras` (dados.ts), sem regra nova.
 * As fotos são de banco (Pexels), só ilustrativas: ver src/assets/fotos/CREDITOS.md.
 */
import { linkWhatsapp, mensagemContratarPontos, planoParaCameras, type Recomendacao } from './dados';

export type IdFachada = 'casa' | 'comercio';

export interface PontoCamera {
  id: string;
  /** Rótulo visível, curto. */
  rotulo: string;
  /** Complemento do rótulo acessível: "Câmera {onde}". Contém o rótulo visível. */
  onde: string;
  /**
   * Posição sobre a foto, em % da largura (x) e da altura (y). Sem posição: ponto fora da foto
   * (botão logo abaixo dela).
   */
  x?: number;
  y?: number;
  /** De que lado do marcador fica o rótulo no computador (padrão: direita). */
  lado?: 'esquerda' | 'direita';
}

export interface FachadaToque {
  id: IdFachada;
  /** Texto alternativo da foto. */
  alt: string;
  pontos: readonly PontoCamera[];
}

/** Máximo de pontos por fachada: o maior plano fixo é o de 8 câmeras. */
export const MAX_PONTOS = 8;

export const fachadas: Record<IdFachada, FachadaToque> = {
  casa: {
    id: 'casa',
    alt: 'Fachada de uma casa com garagem para dois carros, porta de entrada com varanda e jardim na frente',
    pontos: [
      { id: 'garagem', rotulo: 'Garagem', onde: 'na garagem', x: 31, y: 66 },
      { id: 'porta', rotulo: 'Porta da frente', onde: 'na porta da frente', x: 61, y: 62 },
      { id: 'calcada', rotulo: 'Calçada e rua', onde: 'na calçada e rua', x: 22, y: 87 },
      { id: 'jardim', rotulo: 'Jardim da frente', onde: 'no jardim da frente', x: 80, y: 72, lado: 'esquerda' },
      { id: 'lateral-esquerda', rotulo: 'Lateral esquerda', onde: 'na lateral esquerda', x: 17, y: 50 },
      { id: 'lateral-direita', rotulo: 'Lateral direita', onde: 'na lateral direita', x: 86, y: 44, lado: 'esquerda' },
      { id: 'fundos', rotulo: 'Fundos e quintal', onde: 'nos fundos e quintal' },
      { id: 'dentro', rotulo: 'Dentro de casa', onde: 'dentro de casa' },
    ],
  },
  comercio: {
    id: 'comercio',
    alt: 'Fachada de uma pequena loja de rua com toldo listrado, porta de vidro e vitrine com prateleiras',
    pontos: [
      { id: 'porta', rotulo: 'Porta de entrada', onde: 'na porta de entrada', x: 50, y: 56 },
      { id: 'vitrine', rotulo: 'Vitrine', onde: 'na vitrine', x: 76, y: 44, lado: 'esquerda' },
      { id: 'calcada', rotulo: 'Calçada em frente', onde: 'na calçada em frente', x: 36, y: 82 },
      { id: 'caixa', rotulo: 'Caixa', onde: 'no caixa' },
      { id: 'salao', rotulo: 'Salão', onde: 'no salão' },
      { id: 'estoque', rotulo: 'Estoque', onde: 'no estoque' },
      { id: 'fundos', rotulo: 'Fundos ou carga e descarga', onde: 'nos fundos ou carga e descarga' },
    ],
  },
};

/** O ponto fica sobre a foto (tem posição)? */
export function naFoto(p: PontoCamera): p is PontoCamera & { x: number; y: number } {
  return typeof p.x === 'number' && typeof p.y === 'number';
}

/** Rótulo acessível fixo do botão do ponto (ex.: "Câmera na garagem"); o estado fica só no aria-pressed. */
export function rotuloAcessivel(p: PontoCamera): string {
  return `Câmera ${p.onde}`;
}

/** Pontos marcados, na ordem da lista da fachada (ids desconhecidos são ignorados). */
export function pontosMarcados(fachada: FachadaToque, ids: Iterable<string>): PontoCamera[] {
  const marcados = new Set(ids);
  return fachada.pontos.filter((p) => marcados.has(p.id));
}

export interface ResultadoToque {
  quantidade: number;
  recomendacao: Recomendacao;
  /** Rótulos dos pontos marcados, na ordem da lista. */
  pontos: string[];
  /** Link do "Quero este plano" (WhatsApp da equipe), quando há plano fixo indicado. */
  linkWhatsapp: string | null;
}

/** O que a ferramenta mostra para os pontos marcados. */
export function resultadoToque(fachada: FachadaToque, ids: Iterable<string>): ResultadoToque {
  const pontos = pontosMarcados(fachada, ids).map((p) => p.rotulo);
  const recomendacao = planoParaCameras(pontos.length);
  const link = recomendacao.plano ? linkWhatsapp(mensagemContratarPontos(recomendacao.plano, pontos)) : null;
  return { quantidade: pontos.length, recomendacao, pontos, linkWhatsapp: link };
}
