import { describe, expect, it } from 'vitest';
import { paginaCondominio, paginasAmbiente, servicosProposta, type TextosSolucao } from '../src/lib/dados';

const ambientes = ['casa', 'comercio', 'empresa'] as const;
const todas: [string, TextosSolucao][] = [
  ...ambientes.map((a): [string, TextosSolucao] => [a, paginasAmbiente[a]]),
  ['condominio', paginaCondominio],
];

/** Todo o texto de uma página, como a pessoa lê. */
const texto = (t: TextosSolucao) => [t.sobre, t.titulo, t.lead, t.descricao, t.curto, t.tituloBusca, ...t.destaques, ...t.blocos.flatMap((b) => [b.titulo, b.texto])].join(' ');

describe('textos das páginas de solução', () => {
  it.each(todas)('%s: tem título, texto de apoio, destaques e de 2 a 4 blocos', (_id, t) => {
    expect(t.titulo.length).toBeGreaterThan(10);
    expect(t.lead.length).toBeGreaterThan(10);
    expect(t.destaques.length).toBeGreaterThanOrEqual(3);
    expect(t.blocos.length).toBeGreaterThanOrEqual(2);
    expect(t.blocos.length).toBeLessThanOrEqual(4);
    // O título da aba e a descrição do Google continuam preenchidos.
    expect(t.tituloBusca.length).toBeGreaterThan(10);
    expect(t.descricao.length).toBeGreaterThan(60);
    expect(t.descricao.length).toBeLessThanOrEqual(200);
  });

  it.each(todas)('%s: nenhuma menção às maquetes retiradas', (_id, t) => {
    expect(texto(t)).not.toMatch(/maquete|3D|girar|gire|toque (em|numa)|pontos cegos|camadas|E se…|explorar/i);
  });

  it.each(todas)('%s: sem travessão e sem promessa de instalação grátis', (_id, t) => {
    expect(texto(t)).not.toMatch(/[—–]|instalação inclu|sem investimento/i);
  });

  it('o condomínio é proposta personalizada: sem preço, dias de gravação nem quantidade de câmeras', () => {
    const t = texto(paginaCondominio);
    expect(t).not.toMatch(/R\$|\d+\s*(dias|câmeras)|aproximadamente|mensalidade|24 meses|multa/i);
    expect(t).toMatch(/proposta personalizada/i);
    expect(paginaCondominio.mensagemProposta).toMatch(/proposta/i);
  });

  it('os destaques do condomínio são os itens do serviço "Condomínio Evoluído" que já existem em dados', () => {
    const itens = servicosProposta.find((s) => s.id === 'condominio')!.itens;
    expect([...paginaCondominio.destaques]).toEqual(itens);
  });

  it.each(ambientes)('%s: planos de 1 a 8 câmeras, gravação de aproximadamente 10 dias e imagens no celular', (a) => {
    const t = paginasAmbiente[a];
    const todo = texto(t);
    expect(t.destaques).toContain('Planos de 1 a 8 câmeras');
    expect(todo).toMatch(/aproximadamente 10 dias/);
    expect(todo).toMatch(/imagens no celular/);
    expect(todo).toMatch(/energia e de internet/);
    expect(todo).toMatch(/sob orçamento/);
  });

  it.each(ambientes)('%s: sem preço, condição contratual nem garantia', (a) => {
    expect(texto(paginasAmbiente[a])).not.toMatch(/R\$|24 meses|multa|IPCA|garantia/i);
  });
});
