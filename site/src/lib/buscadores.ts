/**
 * Dados estruturados (schema.org, JSON-LD) para o Google e outros buscadores.
 *
 * É um bloco invisível na página inicial que diz, em linguagem de máquina, quem é a empresa:
 * nome, cidade, CNPJ, e-mail, região atendida e logo. Ajuda o Google a mostrar a SC nas buscas
 * locais ("câmera de segurança Francisco Beltrão") e a usar "SC Soluções" como nome do site.
 *
 * Tudo vem de dados.ts: mudou o rodapé, muda aqui junto. Sem telefone nem WhatsApp: o WhatsApp da
 * equipe fica só na seção "Fale com a SC" (decisão do Kauan, 28/09/2026), e o Google mostraria
 * um botão "Ligar" no resultado da busca.
 */
import { contato, empresa, servicosProposta } from './dados';

/** "Francisco Beltrão - PR" (com espaços que não quebram) → cidade e estado separados. */
export function separarCidade(cidade: string): { municipio: string; uf: string } {
  const [municipio = '', uf = ''] = cidade.replace(/\s+/g, ' ').split(' - ').map((s) => s.trim());
  return { municipio, uf };
}

/** "a, b, c e d" */
function listar(itens: string[]): string {
  return itens.length < 2 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`;
}

export function dadosEstruturados() {
  const site = empresa.site.replace(/\/$/, '');
  const { municipio, uf } = separarCidade(empresa.cidade);
  const servicos = listar(servicosProposta.map((s) => s.nome.toLowerCase()));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${site}/#empresa`,
        name: empresa.nome,
        alternateName: `${empresa.nome} em ${empresa.descricao}`,
        description: `Planos de locação de câmeras de segurança e projetos de ${servicos} em ${empresa.regiao}.`,
        url: `${site}/`,
        logo: `${site}/marca/sc-logo.webp`,
        image: `${site}/marca/og-imagem.png`,
        email: contato.email,
        taxID: empresa.cnpj,
        address: { '@type': 'PostalAddress', addressLocality: municipio, addressRegion: uf, addressCountry: 'BR' },
        areaServed: empresa.regiao,
      },
      {
        '@type': 'WebSite',
        '@id': `${site}/#site`,
        url: `${site}/`,
        name: empresa.nome,
        alternateName: `${empresa.nome} em ${empresa.descricao}`,
        inLanguage: 'pt-BR',
        publisher: { '@id': `${site}/#empresa` },
      },
    ],
  };
}

/** JSON pronto para ir dentro de <script>: "<" vira <, então nenhum texto fecha a tag antes da hora. */
export function jsonParaScript(dados: unknown): string {
  return JSON.stringify(dados).replace(/</g, '\\u003c');
}
