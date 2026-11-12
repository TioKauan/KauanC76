import { describe, expect, it } from 'vitest';
import { contato, formatarPreco, linkWhatsapp, mensagemContratar, mensagemContratarPontos, planoParaCameras, planos } from '../src/lib/dados';
import { MAX_PONTOS, fachadas, naFoto, pontosMarcados, resultadoToque, rotuloAcessivel } from '../src/lib/toque-camera';

const lista = Object.values(fachadas);

describe('ferramenta "Toque onde quer câmera": pontos de cada fachada', () => {
  it.each(lista.map((f) => [f.id, f] as const))('%s: ids únicos, no máximo 8 pontos, rótulos curtos', (_id, f) => {
    const ids = f.pontos.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(f.pontos.length).toBeGreaterThan(0);
    expect(f.pontos.length).toBeLessThanOrEqual(MAX_PONTOS);
    expect(MAX_PONTOS).toBe(Math.max(...planos.map((p) => p.cameras)));
    for (const p of f.pontos) {
      expect(p.rotulo.length).toBeGreaterThan(2);
      expect(p.rotulo.length).toBeLessThanOrEqual(28);
      // O rótulo acessível contém o rótulo visível (WCAG 2.5.3).
      expect(rotuloAcessivel(p).toLowerCase()).toContain(p.rotulo.toLowerCase());
    }
    expect(f.alt.length).toBeGreaterThan(20);
  });

  it.each(lista.map((f) => [f.id, f] as const))('%s: posições sobre a foto entre 0 e 100, com pontos dentro e fora da foto', (_id, f) => {
    const naImagem = f.pontos.filter(naFoto);
    expect(naImagem.length).toBeGreaterThanOrEqual(3);
    expect(f.pontos.length - naImagem.length).toBeGreaterThanOrEqual(2);
    for (const p of naImagem) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(100);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(100);
    }
    // Ponto fora da foto não tem meia posição.
    for (const p of f.pontos.filter((x) => !naFoto(x))) {
      expect(p.x).toBeUndefined();
      expect(p.y).toBeUndefined();
    }
  });

  it('casa: os 8 pontos pedidos, na ordem; loja: porta, vitrine e calçada na foto', () => {
    expect(fachadas.casa.pontos.map((p) => p.rotulo)).toEqual([
      'Garagem', 'Porta da frente', 'Calçada e rua', 'Jardim da frente', 'Lateral esquerda', 'Lateral direita', 'Fundos e quintal', 'Dentro de casa',
    ]);
    expect(fachadas.comercio.pontos.filter(naFoto).map((p) => p.rotulo)).toEqual(['Porta de entrada', 'Vitrine', 'Calçada em frente']);
  });

  it('rótulo acessível diz o lugar, sem o estado (o estado fica só no aria-pressed)', () => {
    const garagem = fachadas.casa.pontos[0]!;
    expect(rotuloAcessivel(garagem)).toBe('Câmera na garagem');
    expect(rotuloAcessivel(garagem)).not.toMatch(/marcada/);
  });

  it('pontos marcados saem na ordem da lista e ids desconhecidos são ignorados', () => {
    expect(pontosMarcados(fachadas.casa, ['fundos', 'garagem', 'nao-existe']).map((p) => p.id)).toEqual(['garagem', 'fundos']);
  });
});

describe('ferramenta "Toque onde quer câmera": recomendação e mensagem', () => {
  it.each(lista.map((f) => [f.id, f] as const))('%s: de 0 ao total de pontos, a recomendação é a de planoParaCameras', (_id, f) => {
    for (let n = 0; n <= f.pontos.length; n++) {
      const ids = f.pontos.slice(0, n).map((p) => p.id);
      const r = resultadoToque(f, ids);
      expect(r.quantidade).toBe(n);
      expect(r.recomendacao).toEqual(planoParaCameras(n));
      if (r.recomendacao.plano) expect(r.linkWhatsapp).not.toBeNull();
      else expect(r.linkWhatsapp).toBeNull();
    }
  });

  it('0 a 8 câmeras: vazio, exato (1 a 4 e 8) e folga (5 a 7) com o plano de 8', () => {
    const casa = fachadas.casa;
    const tipos = Array.from({ length: 9 }, (_, n) => resultadoToque(casa, casa.pontos.slice(0, n).map((p) => p.id)).recomendacao);
    expect(tipos.map((t) => t.tipo)).toEqual(['vazio', 'exato', 'exato', 'exato', 'exato', 'folga', 'folga', 'folga', 'exato']);
    expect(tipos.slice(5).every((t) => t.plano?.cameras === 8)).toBe(true);
  });

  it('a mensagem do WhatsApp leva o plano, o valor e os pontos, e é a de mensagemContratar com os pontos', () => {
    const casa = fachadas.casa;
    const r = resultadoToque(casa, ['garagem', 'porta', 'fundos']);
    const plano = planos.find((p) => p.cameras === 3)!;
    const esperado = `Olá! Vim pelo site e quero contratar o Plano de 3 câmeras (R$ ${formatarPreco(plano.preco)}/mês). Pontos: Garagem, Porta da frente, Fundos e quintal. Como agendamos a instalação?`;
    expect(mensagemContratarPontos(plano, r.pontos)).toBe(esperado);
    expect(r.linkWhatsapp).toBe(linkWhatsapp(esperado));
    expect(r.linkWhatsapp).toContain(`https://wa.me/${contato.whatsapp}?text=`);
    const texto = new URL(r.linkWhatsapp!).searchParams.get('text')!;
    expect(texto).toContain('Plano de 3 câmeras');
    expect(texto).toContain(formatarPreco(plano.preco));
    expect(texto).toContain('Garagem, Porta da frente, Fundos e quintal');
    expect(texto).not.toMatch(/instalação inclu|sem investimento|[—–]/i);
  });

  it('um ponto: "Ponto:" no singular; sem pontos, a mensagem é a de mensagemContratar', () => {
    const plano = planos[0]!;
    expect(mensagemContratarPontos(plano, ['Garagem'])).toContain('. Ponto: Garagem. Como agendamos a instalação?');
    expect(mensagemContratarPontos(plano, [])).toBe(mensagemContratar(plano));
  });

  it('folga: o link usa o plano de 8 câmeras com todos os pontos marcados', () => {
    const casa = fachadas.casa;
    const ids = casa.pontos.slice(0, 6).map((p) => p.id);
    const texto = new URL(resultadoToque(casa, ids).linkWhatsapp!).searchParams.get('text')!;
    expect(texto).toContain('Plano de 8 câmeras');
    for (const p of casa.pontos.slice(0, 6)) expect(texto).toContain(p.rotulo);
  });
});
