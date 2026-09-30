import type { CamadaId, Capitulo } from '../../lib/condominio/capitulos';
import type { SituacaoId } from '../../lib/cenarios';

/** O que a maquete precisa mostrar agora. A página muda; a cena 3D (cena.ts) só desenha. */
export interface EstadoMaquete {
  capitulo: Capitulo;
  camadas: ReadonlySet<CamadaId>;
  /** Câmera em destaque (ou null). */
  selecionada: number | null;
  /** Câmeras no monitor. */
  monitor: readonly number[];
  pontosCegos: boolean;
  visitante: boolean;
  /** "E se…?" (só no capítulo de energia). */
  situacao: SituacaoId;
  nobreak: boolean;
  explorar: boolean;
}

/** Controle da cena 3D, carregado sob demanda. */
export interface Maquete3D {
  atualizar(estado: EstadoMaquete, voar: boolean): void;
  /** Toque numa câmera dentro da maquete. */
  aoEscolherCamera(fn: (id: number) => void): void;
  destruir(): void;
}
