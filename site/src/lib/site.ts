/** Navegação e mensagens gerais do site. */
export const links = [
  { href: '#inicio', rotulo: 'Início' },
  { href: '#planos', rotulo: 'Planos' },
  { href: '#monte', rotulo: 'Monte seu sistema' },
  { href: '/condominio/', rotulo: 'Condomínio' },
  { href: '#como-funciona', rotulo: 'Como funciona' },
  { href: '#duvidas', rotulo: 'Dúvidas' },
] as const;

/**
 * Endereço de um item do menu visto de uma página.
 * Na inicial as seções ficam como âncora (#planos); nas outras páginas viram /#planos.
 * Páginas próprias (/condominio/) valem igual em qualquer lugar.
 */
export function hrefSecao(href: string, naInicial: boolean): string {
  if (!href.startsWith('#')) return href;
  return naInicial ? href : `/${href}`;
}

export const msgGeral = 'Olá! Vim pelo site e gostaria de falar com a SC sobre o meu ambiente.';
