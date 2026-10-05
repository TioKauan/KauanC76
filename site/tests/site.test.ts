import { describe, expect, it } from 'vitest';
import { hrefSecao, links, secoes, solucoes } from '../src/lib/site';

describe('links do menu entre páginas', () => {
  it('na inicial, as seções ficam como âncora', () => {
    expect(hrefSecao('#planos', true)).toBe('#planos');
  });

  it('nas outras páginas, as seções apontam para a inicial', () => {
    expect(hrefSecao('#planos', false)).toBe('/#planos');
  });

  it('páginas próprias valem igual em qualquer página', () => {
    expect(hrefSecao('/condominio/', true)).toBe('/condominio/');
    expect(hrefSecao('/condominio/', false)).toBe('/condominio/');
  });

  it('o menu "Soluções" leva às quatro páginas com maquete', () => {
    expect(solucoes.map((s) => s.href)).toEqual(['/casa/', '/comercio/', '/empresa/', '/condominio/']);
    expect(links.some((l) => 'grupo' in l && l.itens === solucoes)).toBe(true);
    expect(secoes.every((s) => s.href.startsWith('#'))).toBe(true);
  });
});
