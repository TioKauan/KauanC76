import { cabecalho, rodape, contatoFinal, barraFixa } from './moldura.js';
import { abertura } from './abertura.js';

const secoes = {
  cabecalho,
  abertura,
  planos: () => '',
  configurador: () => '',
  'como-funciona': () => '',
  contato: contatoFinal,
  rodape,
  'barra-fixa': barraFixa,
};

/** Troca cada marcador <!--@nome--> do index.html pela seção correspondente. */
export function montarPagina(html) {
  return html.replace(/<!--@([a-z-]+)-->/g, (marcador, nome) => {
    const secao = secoes[nome];
    if (!secao) throw new Error(`Seção desconhecida no index.html: ${nome}`);
    return secao();
  });
}
