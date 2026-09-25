import { describe, expect, it } from 'vitest';
import { buscarDuvidas, normalizar } from '../src/lib/busca';
import { duvidas } from '../src/lib/dados';

const primeira = (consulta: string) => {
  const r = buscarDuvidas(consulta, duvidas);
  return r.tipo === 'resultado' ? duvidas[r.abrir[0] ?? -1]?.pergunta ?? null : r.tipo;
};

describe('busca nas dúvidas', () => {
  it('ignora acentos e pontuação', () => {
    expect(normalizar('Câmeras à noite?')).toBe('cameras a noite ');
  });

  it.each([
    ['posso ver pelo celular?', 'Consigo ver as câmeras pelo celular?'],
    ['app', 'Consigo ver as câmeras pelo celular?'],
    ['multa', 'Posso cancelar?'],
    ['quero desistir do contrato', 'Posso cancelar?'],
    ['quebrou a câmera', 'A manutenção está incluída?'],
    ['quanto tempo grava?', 'Quantos dias ficam gravados?'],
    ['instala', 'A instalação está incluída?'],
    ['visão noturna', 'Posso adicionar câmeras premium?'],
    ['preciso comprar?', 'Preciso comprar os equipamentos?'],
  ])('"%s" → %s', (consulta, esperada) => {
    expect(primeira(consulta)).toBe(esperada);
  });

  it.each(['quanto custa', 'qual o valor', 'quanto fica o plano', 'preço'])('"%s" leva para os planos', (consulta) => {
    expect(buscarDuvidas(consulta, duvidas).tipo).toBe('preco');
  });

  it('consulta vazia ou só com palavras vazias mostra tudo', () => {
    expect(buscarDuvidas('   ', duvidas).tipo).toBe('vazia');
    expect(buscarDuvidas('como que eu', duvidas).tipo).toBe('vazia');
  });

  it('palavra comum ainda mostra resultados, e toda resposta aberta está visível', () => {
    for (const consulta of ['câmera', 'celular', 'plano', 'contrato']) {
      const r = buscarDuvidas(consulta, duvidas);
      expect(r.tipo, consulta).toBe('resultado');
      if (r.tipo !== 'resultado') continue;
      expect(r.mostrar.length, consulta).toBeGreaterThan(0);
      expect(r.abrir.every((i) => r.mostrar.includes(i)), consulta).toBe(true);
    }
  });

  it('sem relação com as dúvidas não mostra nada', () => {
    expect(buscarDuvidas('vocês vendem drone', duvidas)).toEqual({ tipo: 'resultado', mostrar: [], abrir: [] });
  });
});
