/**
 * Mensagem do pedido de proposta do condomínio (vai para a Sol).
 * Mesmo começo do configurador ("Quero uma proposta de Condomínio Evoluído"), para a equipe
 * reconhecer o pedido venha de onde vier.
 */
import { sistemasCondominio } from '../configurador-dados';

export interface PedidoCondominio {
  /** Ids de `sistemasCondominio`. */
  sistemas: readonly string[];
  blocos?: number | null;
  apartamentos?: number | null;
}

export const LIMITES = { blocos: [1, 50], apartamentos: [1, 3000] } as const;

/** Número inteiro dentro do limite, ou null (campo vazio ou inválido fica fora da mensagem). */
export function numeroValido(valor: unknown, [min, max]: readonly [number, number]): number | null {
  const n = typeof valor === 'string' ? Number(valor.trim()) : valor;
  return typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max ? n : null;
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export function mensagemProposta({ sistemas, blocos, apartamentos }: PedidoCondominio): string {
  const escolhidos = sistemasCondominio.filter((s) => sistemas.includes(s.id)).map((s) => s.nome.toLowerCase());
  const b = numeroValido(blocos, LIMITES.blocos);
  const a = numeroValido(apartamentos, LIMITES.apartamentos);
  const tamanho = [b && plural(b, 'bloco', 'blocos'), a && plural(a, 'apartamento', 'apartamentos')].filter(Boolean).join(' e ');
  return [
    'Olá! Quero uma proposta de Condomínio Evoluído.',
    escolhidos.length ? `Sistemas de interesse: ${escolhidos.join(', ')}.` : 'Gostaria de entender o que faz sentido para o condomínio.',
    tamanho ? `O condomínio tem ${tamanho}.` : '',
    'Podemos conversar?',
  ].filter(Boolean).join('\n');
}
