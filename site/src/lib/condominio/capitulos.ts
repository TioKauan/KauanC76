/**
 * Roteiro da página do condomínio: as camadas da maquete e o que cada capítulo mostra.
 * Os textos ficam em dados.ts (paginaCondominio); aqui só o enquadramento e o que acende.
 */
import { sistemasCondominio } from '../configurador-dados';
import type { NomeIcone } from '../icones';
import type { Ponto3 } from './maquete';

export type CamadaId = 'cameras' | 'acesso' | 'interfonia' | 'rede' | 'energia' | 'alarme';

export interface Camada {
  id: CamadaId;
  /** Id do sistema em `sistemasCondominio` (o mesmo do configurador e da mensagem). */
  sistema: string;
  /** Nome curto no botão da camada. */
  curto: string;
  /** Nome completo (o do configurador). */
  nome: string;
  icone: NomeIcone;
  /** Cor da camada na maquete e nos botões (tokens do site). */
  cor: string;
}

const curto: Record<CamadaId, [sistema: string, rotulo: string, cor: string]> = {
  cameras: ['cameras', 'Câmeras', '#6de9f6'],
  acesso: ['facial', 'Acesso facial', '#3be38a'],
  interfonia: ['interfonia', 'Interfonia', '#8aa8ff'],
  rede: ['rede', 'Rede e Wi-Fi', '#09a0f6'],
  energia: ['nobreak', 'Nobreak', '#ff6a00'],
  alarme: ['alarme', 'Alarme', '#ffc233'],
};

export const CAMADAS: readonly Camada[] = (Object.keys(curto) as CamadaId[]).map((id) => {
  const [sistema, rotulo, cor] = curto[id];
  const s = sistemasCondominio.find((x) => x.id === sistema);
  if (!s) throw new Error(`Sistema ${sistema} não existe em sistemasCondominio`);
  return { id, sistema, curto: rotulo, nome: s.nome, icone: s.icone, cor };
});

export const camadaPorSistema = (sistema: string): Camada | undefined => CAMADAS.find((c) => c.sistema === sistema);

/** Enquadramento da câmera principal: gira em volta do alvo. */
export interface Vista {
  alvo: Ponto3;
  raio: number;
  /** Graus a partir da frente (rua), girando para a direita. */
  azimute: number;
  /** Graus acima do chão. */
  elevacao: number;
  /** Fração da largura: empurra a maquete para a direita (deixa a coluna de texto livre). */
  deslocar?: number;
}

export type CapituloId = 'abertura' | 'cameras' | 'acesso' | 'interfonia' | 'rede' | 'energia' | 'alarme' | 'proposta';

export interface Capitulo {
  id: CapituloId;
  /** Número no roteiro (1 a 6) quando é um dos sistemas. */
  numero?: number;
  vista: Vista;
  vistaCelular: Vista;
  camadas: readonly CamadaId[];
  /** Camada em destaque; as outras ficam mais fracas. */
  realce?: CamadaId;
  pontosCegos?: boolean;
  visitante?: boolean;
  /** Câmera em destaque (no monitor e na maquete). */
  selecionada?: number;
  /** Câmeras no monitor (vazio = sem monitor). */
  monitor: readonly number[];
}

export const CAPITULOS: readonly Capitulo[] = [
  {
    id: 'abertura',
    vista: { alvo: [3, 5, 9], raio: 188, azimute: 36, elevacao: 33, deslocar: 0.12 },
    vistaCelular: { alvo: [0, 3, 3], raio: 172, azimute: 36, elevacao: 38 },
    camadas: ['cameras', 'rede', 'energia', 'interfonia', 'acesso'],
    monitor: [1, 3, 5, 7],
  },
  {
    id: 'cameras',
    numero: 1,
    vista: { alvo: [5, 0, 5], raio: 186, azimute: 24, elevacao: 56, deslocar: 0.15 },
    vistaCelular: { alvo: [2, 0, 3], raio: 168, azimute: 20, elevacao: 60 },
    camadas: ['cameras'],
    pontosCegos: true,
    selecionada: 3,
    monitor: [3],
  },
  {
    id: 'acesso',
    numero: 2,
    vista: { alvo: [-2, 3, 13], raio: 104, azimute: 16, elevacao: 31, deslocar: 0.15 },
    vistaCelular: { alvo: [-2, 3, 14], raio: 120, azimute: 18, elevacao: 34 },
    camadas: ['acesso', 'cameras'],
    realce: 'acesso',
    visitante: true,
    selecionada: 1,
    monitor: [1],
  },
  {
    id: 'interfonia',
    numero: 3,
    vista: { alvo: [-4, 7, 4], raio: 150, azimute: 22, elevacao: 30, deslocar: 0.14 },
    vistaCelular: { alvo: [-4, 6, 5], raio: 165, azimute: 24, elevacao: 34 },
    camadas: ['interfonia', 'acesso'],
    realce: 'interfonia',
    visitante: true,
    selecionada: 1,
    monitor: [1],
  },
  {
    id: 'rede',
    numero: 4,
    vista: { alvo: [2, 1, 4], raio: 178, azimute: 44, elevacao: 48, deslocar: 0.14 },
    vistaCelular: { alvo: [0, 1, 3], raio: 175, azimute: 40, elevacao: 52 },
    camadas: ['rede', 'cameras'],
    realce: 'rede',
    monitor: [1, 3, 5, 7],
  },
  {
    id: 'energia',
    numero: 5,
    vista: { alvo: [3, 3, 8], raio: 178, azimute: 40, elevacao: 35, deslocar: 0.15 },
    vistaCelular: { alvo: [0, 3, 6], raio: 162, azimute: 40, elevacao: 38 },
    camadas: ['cameras', 'rede', 'energia', 'acesso'],
    realce: 'energia',
    monitor: [3, 7],
  },
  {
    id: 'alarme',
    numero: 6,
    vista: { alvo: [0, 2, 0], raio: 185, azimute: 30, elevacao: 48, deslocar: 0.14 },
    vistaCelular: { alvo: [0, 2, 1], raio: 180, azimute: 30, elevacao: 52 },
    camadas: ['alarme', 'cameras'],
    realce: 'alarme',
    monitor: [5, 6],
  },
  {
    id: 'proposta',
    vista: { alvo: [3, 4, 7], raio: 186, azimute: 32, elevacao: 36, deslocar: 0.15 },
    vistaCelular: { alvo: [0, 3, 3], raio: 180, azimute: 36, elevacao: 38 },
    camadas: ['cameras', 'acesso', 'interfonia', 'energia'],
    monitor: [],
  },
];

export const capituloPorId = (id: string): Capitulo | undefined => CAPITULOS.find((c) => c.id === id);
