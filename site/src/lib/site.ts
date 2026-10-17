/** Navegação e mensagens gerais do site. */
import type { NomeIcone } from './icones';

export interface LinkSecao { href: string; rotulo: string }
export interface LinkSolucao extends LinkSecao { icone: NomeIcone; sub: string }

/** Páginas com maquete 3D, no menu "Soluções" (05/10/2026; antes só "Condomínio" no menu). */
export const solucoes: readonly LinkSolucao[] = [
  { href: '/casa/', rotulo: 'Casa', icone: 'house', sub: 'Do portão ao quintal' },
  { href: '/comercio/', rotulo: 'Comércio', icone: 'store', sub: 'Caixa, estoque e entrada' },
  { href: '/empresa/', rotulo: 'Empresa', icone: 'briefcase-business', sub: 'Segurança e rede juntas' },
  { href: '/condominio/', rotulo: 'Condomínio', icone: 'building-2', sub: 'Condomínio Evoluído' },
];

/** Itens do menu; "Soluções" abre as páginas acima. */
export const links: readonly (LinkSecao | { grupo: 'Soluções'; itens: readonly LinkSolucao[] })[] = [
  { href: '#inicio', rotulo: 'Início' },
  { href: '#planos', rotulo: 'Planos' },
  // Página própria desde 17/10/2026 (antes era a seção #monte da inicial).
  { href: '/monte-seu-sistema/', rotulo: 'Monte seu sistema' },
  { grupo: 'Soluções', itens: solucoes },
  { href: '#como-funciona', rotulo: 'Como funciona' },
  { href: '#duvidas', rotulo: 'Dúvidas' },
];

/** Itens simples do menu (sem o grupo), na ordem do menu. */
export const secoes: readonly LinkSecao[] = links.filter((l): l is LinkSecao => 'href' in l);

/**
 * Endereço de um item do menu visto de uma página.
 * Na inicial as seções ficam como âncora (#planos); nas outras páginas viram /#planos.
 * Páginas próprias (/condominio/, /monte-seu-sistema/) valem igual em qualquer lugar.
 */
export function hrefSecao(href: string, naInicial: boolean): string {
  if (!href.startsWith('#')) return href;
  return naInicial ? href : `/${href}`;
}

export const msgGeral = 'Olá! Vim pelo site e gostaria de falar com a SC sobre o meu ambiente.';
