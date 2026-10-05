import { describe, expect, it } from 'vitest';
import { dadosEstruturados, jsonParaScript, separarCidade } from '../src/lib/buscadores';
import { contato, empresa } from '../src/lib/dados';

const [negocio, site] = dadosEstruturados()['@graph'];

describe('dados estruturados para o Google', () => {
  it('a empresa tem os mesmos dados do rodapé (CNPJ, cidade, e-mail)', () => {
    expect(negocio).toMatchObject({
      '@type': 'LocalBusiness',
      name: empresa.nome,
      taxID: empresa.cnpj,
      email: contato.email,
      address: { addressLocality: 'Francisco Beltrão', addressRegion: 'PR', addressCountry: 'BR' },
      areaServed: empresa.regiao,
    });
  });

  it('a descrição cita os serviços de proposta, sem preço', () => {
    expect(negocio!.description).toBe(
      'Planos de locação de câmeras de segurança e projetos de redes, alarme, condomínio e nobreak em Francisco Beltrão e região.',
    );
  });

  it('logo e imagem são os arquivos oficiais da marca', () => {
    expect(negocio!.logo).toBe('https://somoscella.online/marca/sc-logo.webp');
    expect(negocio!.image).toBe('https://somoscella.online/marca/og-imagem.png');
  });

  it('o site se chama "SC Soluções" e aponta para a empresa', () => {
    expect(site).toMatchObject({ '@type': 'WebSite', name: 'SC Soluções', url: 'https://somoscella.online/', publisher: { '@id': negocio!['@id'] } });
  });

  it('sem telefone nem WhatsApp (o WhatsApp da equipe fica só em "Fale com a SC")', () => {
    const json = JSON.stringify(dadosEstruturados());
    expect(json).not.toMatch(/telephone|wa\.me|contactPoint/);
    expect(json).not.toContain(contato.whatsapp);
    expect(json).not.toContain(contato.whatsappExibicao);
  });

  it('nada de condição contratual ou instalação grátis', () => {
    expect(JSON.stringify(dadosEstruturados())).not.toMatch(/prazo mínimo|multa|instalação inclu|sem investimento|R\$/i);
  });
});

describe('separarCidade', () => {
  it('aceita espaços que não quebram', () => {
    expect(separarCidade('Francisco Beltrão - PR')).toEqual({ municipio: 'Francisco Beltrão', uf: 'PR' });
    expect(separarCidade(empresa.cidade)).toEqual({ municipio: 'Francisco Beltrão', uf: 'PR' });
  });
});

describe('jsonParaScript', () => {
  it('nenhum texto fecha o <script> antes da hora', () => {
    const saida = jsonParaScript({ x: '</script><script>alert(1)</script>' });
    expect(saida).not.toContain('<');
    expect(JSON.parse(saida)).toEqual({ x: '</script><script>alert(1)</script>' });
  });
});
