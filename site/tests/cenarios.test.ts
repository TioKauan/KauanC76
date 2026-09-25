import { describe, expect, it } from 'vitest';
import { ambientes, estadoCena, situacoes, type SistemaId } from '../src/lib/cenarios';
import { cenas } from '../src/lib/cenas';

const sistemas: SistemaId[] = ['rede', 'cameras', 'acesso', 'energia', 'internet'];

describe('simulação "E se…?"', () => {
  it.each(ambientes.map((a) => a.id))('%s: tudo funcionando no dia a dia', (id) => {
    const e = estadoCena(id, 'normal', false);
    expect(Object.values(e.estados).every((s) => s === 'ok')).toBe(true);
  });

  it('falta de energia sem nobreak desliga tudo', () => {
    const e = estadoCena('casa', 'energia', false);
    expect(e.estados).toEqual({ rede: 'off', cameras: 'off', acesso: 'off', energia: 'off', internet: 'off' });
    expect(e.condicao).toMatch(/não significa porta aberta/);
  });

  it('com nobreak, sistemas seguem na reserva e o celular depende da operadora', () => {
    const e = estadoCena('empresa', 'energia', true);
    expect(e.estados).toEqual({ rede: 'reserva', cameras: 'reserva', acesso: 'reserva', energia: 'reserva', internet: 'incerto' });
  });

  it('queda de internet só tira as imagens do celular', () => {
    const e = estadoCena('comercio', 'internet', false);
    expect(e.estados.internet).toBe('off');
    expect(sistemas.filter((s) => s !== 'internet').every((s) => e.estados[s] === 'ok')).toBe(true);
  });

  it('visita deixa o acesso aguardando autorização, com o texto do ambiente', () => {
    for (const a of ambientes) {
      const e = estadoCena(a.id, 'visita', false);
      expect(e.estados.acesso).toBe('pendente');
      expect(e.explicacao).toBe(a.visita);
    }
  });

  it('cada situação tem um título próprio', () => {
    const titulos = new Set(situacoes.map((s) => estadoCena('casa', s.id, false).titulo));
    expect(titulos.size).toBe(situacoes.length);
  });
});

describe('cenas ilustradas', () => {
  it.each(ambientes.map((a) => a.id))('%s: tem ponto e rótulo dentro do desenho para os 5 sistemas', (id) => {
    const cena = cenas[id]();
    expect(cena.svg).toMatch(/^<svg class="cena-svg"/);
    for (const s of sistemas) {
      const [dx, dy, indice] = cena.rotulos[s];
      const ponto = cena.pontos.filter((p) => p.sistema === s)[indice];
      expect(ponto, `${id}/${s}`).toBeDefined();
      const x = ((ponto!.x + dx) / 760) * 100;
      const y = ((ponto!.y + dy) / 600) * 100;
      expect(x, `${id}/${s} x`).toBeGreaterThan(5);
      expect(x, `${id}/${s} x`).toBeLessThan(95);
      expect(y, `${id}/${s} y`).toBeGreaterThan(0);
      expect(y, `${id}/${s} y`).toBeLessThan(100);
    }
  });
});
