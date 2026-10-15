import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dadosEstruturados, jsonParaScript, separarCidade } from '../src/lib/buscadores';
import { contato, duvidas, empresa, perfis } from '../src/lib/dados';
import { chave } from '../src/lib/indexnow.json';

const [negocio, site, faq] = dadosEstruturados()['@graph'];

describe('dados estruturados para o Google', () => {
  it('a empresa tem os mesmos dados do rodapé (CNPJ, cidade, e-mail)', () => {
    expect(negocio).toMatchObject({
      '@type': 'LocalBusiness',
      name: empresa.nome,
      taxID: empresa.cnpj,
      email: contato.email,
      address: { addressLocality: 'Francisco Beltrão', addressRegion: 'PR', addressCountry: 'BR' },
      telephone: '+5546991331306',
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

  it('liga a empresa ao Instagram oficial (sameAs)', () => {
    expect(negocio!.sameAs).toEqual([perfis.instagram]);
    expect(perfis.instagram).toBe('https://www.instagram.com/scsolucoes.oficial/');
  });

  it('as dúvidas do Google são exatamente as da tela (mesmo texto, mesma ordem)', () => {
    expect(faq).toMatchObject({ '@type': 'FAQPage' });
    const itens = (faq as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }).mainEntity;
    expect(itens.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(duvidas.map((d) => [d.pergunta, d.resposta]));
  });

  it('leva o telefone da equipe e as cidades atendidas, sem link de WhatsApp', () => {
    expect(negocio!.telephone).toBe(`+${contato.whatsapp}`);
    expect(negocio!.areaServed).toEqual(empresa.cidadesAtendidas.map((nome) => ({ '@type': 'City', name: `${nome}, PR` })));
    expect(empresa.cidadesAtendidas).toEqual(['Francisco Beltrão', 'Dois Vizinhos', 'Realeza', 'Campo Erê']);
    expect(JSON.stringify(dadosEstruturados())).not.toMatch(/wa\.me|contactPoint/);
  });

  it('nada de condição contratual ou instalação grátis', () => {
    expect(JSON.stringify(dadosEstruturados())).not.toMatch(/prazo mínimo|multa|instalação inclu|sem investimento|R\$/i);
  });
});

describe('IndexNow (aviso ao Bing)', () => {
  it('o arquivo da chave existe em public/ e tem só a chave', () => {
    expect(chave).toMatch(/^[0-9a-f]{32}$/);
    expect(readFileSync(new URL(`../public/${chave}.txt`, import.meta.url), 'utf8')).toBe(chave);
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
