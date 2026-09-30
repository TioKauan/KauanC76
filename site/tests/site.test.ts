import { describe, expect, it } from 'vitest';
import { hrefSecao, links } from '../src/lib/site';

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

  it('o menu tem a página do condomínio', () => {
    expect(links.some((l) => l.href === '/condominio/')).toBe(true);
  });
});
