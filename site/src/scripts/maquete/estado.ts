import type { Camada, Capitulo, Maquete, Ponto3 } from '../../lib/maquete/tipos';
import type { SituacaoId } from '../../lib/cenarios';
import type { NomeIcone } from '../../lib/icones';

/** O que a maquete precisa mostrar agora. A página muda; a cena 3D (cena.ts) só desenha. */
export interface EstadoMaquete {
  capitulo: Capitulo;
  camadas: ReadonlySet<string>;
  /** Câmera em destaque (ou null). */
  selecionada: number | null;
  /** Câmeras no monitor. */
  monitor: readonly number[];
  /** Câmeras instaladas (null = todas as da maquete). */
  instaladas: readonly number[] | null;
  pontosCegos: boolean;
  visitante: boolean;
  /** "E se…?" (só nos capítulos com `ese`). */
  situacao: SituacaoId;
  nobreak: boolean;
  explorar: boolean;
}

/** Etiqueta presa a um ponto da maquete (texto explicativo do capítulo). */
export interface Etiqueta { pos: Ponto3; cor: string; icone: NomeIcone; titulo: string; sub: string }

export interface OpcoesMaquete {
  canvas: HTMLCanvasElement;
  palco: HTMLElement;
  movimento: boolean;
  maquete: Maquete;
  camadas: readonly Camada[];
  /** Embaixo do monitor quando as câmeras estão no infravermelho. */
  textoNoturno: string;
  /** Etiquetas da página para o estado atual. */
  etiquetas?: (e: EstadoMaquete, ctx: { celular: boolean; noite: boolean }) => Etiqueta[];
}

/** Controle da cena 3D, carregado sob demanda. */
export interface Maquete3D {
  atualizar(estado: EstadoMaquete, voar: boolean): void;
  /** Rolagem entre dois capítulos: t de 0 (no primeiro) a 1 (chegando no próximo). */
  rolar(de: Capitulo, para: Capitulo | null, t: number): void;
  /** Toque numa câmera dentro da maquete. */
  aoEscolherCamera(fn: (id: number) => void): void;
  destruir(): void;
}

/** O estado inicial de um capítulo. */
export function estadoDoCapitulo(c: Capitulo, anterior?: EstadoMaquete): EstadoMaquete {
  return {
    capitulo: c,
    camadas: new Set(c.camadas),
    selecionada: c.selecionada ?? null,
    monitor: c.monitor,
    instaladas: c.instaladas ?? null,
    pontosCegos: Boolean(c.pontosCegos),
    visitante: c.ese ? (anterior?.situacao ?? 'energia') === 'visita' : Boolean(c.visitante),
    situacao: anterior?.situacao ?? 'energia',
    nobreak: anterior?.nobreak ?? true,
    explorar: anterior?.explorar ?? false,
  };
}
