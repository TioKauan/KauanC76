/** Pequenos atalhos de DOM com tipos: falham cedo e com mensagem clara se a marcação mudar. */
export function exigir<T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document): T {
  const el = raiz.querySelector<T>(seletor);
  if (!el) throw new Error(`Elemento não encontrado: ${seletor}`);
  return el;
}

export function todos<T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document): T[] {
  return [...raiz.querySelectorAll<T>(seletor)];
}
