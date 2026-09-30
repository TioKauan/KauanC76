import { describe, expect, it } from 'vitest';
import { CAMERAS, LOTE, PREDIOS, TABULEIRO, PORTAO_PEDESTRES, PORTAO_VEICULOS, LEITOR_FACIAL, VISITANTE, RACK, NOBREAK, CABOS_REDE, AREAS_DE_CIRCULACAO, dentro, rotuloCamera } from '../src/lib/condominio/maquete';
import { campoDeVisao, cameraVe, quemVe, pontoCego, fracaoVista, direcao } from '../src/lib/condominio/cobertura';
import { CAMADAS, CAPITULOS, camadaPorSistema } from '../src/lib/condominio/capitulos';
import { mensagemProposta, numeroValido, LIMITES } from '../src/lib/condominio/proposta';
import { sistemasCondominio } from '../src/lib/configurador-dados';
import { paginaCondominio } from '../src/lib/dados';

const sobrepoe = (a: { x0: number; x1: number; z0: number; z1: number }, b: typeof a) => a.x0 < b.x1 && b.x0 < a.x1 && a.z0 < b.z1 && b.z0 < a.z1;

describe('maquete', () => {
  it('prédios cabem no lote e não se sobrepõem', () => {
    for (const p of PREDIOS) expect(p.x0 >= LOTE.x0 && p.x1 <= LOTE.x1 && p.z0 >= LOTE.z0).toBe(true);
    for (let i = 0; i < PREDIOS.length; i++) for (let j = i + 1; j < PREDIOS.length; j++) expect(sobrepoe(PREDIOS[i]!, PREDIOS[j]!)).toBe(false);
  });

  it('câmeras numeradas de 1 em diante, sem repetir, dentro da maquete e fora dos prédios', () => {
    expect(CAMERAS.map((c) => c.id)).toEqual(CAMERAS.map((_, i) => i + 1));
    for (const c of CAMERAS) {
      expect(dentro(TABULEIRO, c.x, c.z)).toBe(true);
      expect(PREDIOS.some((p) => dentro(p, c.x, c.z))).toBe(false);
      expect(c.abertura).toBeGreaterThan(20);
      expect(c.abertura).toBeLessThan(120);
    }
    expect(rotuloCamera(3)).toBe('CAM 03');
  });

  it('portões ficam na frente e não se cruzam; leitor facial e visitante do lado da rua', () => {
    expect(PORTAO_PEDESTRES.x1).toBeLessThan(PORTAO_VEICULOS.x0);
    expect(LEITOR_FACIAL[1]).toBeGreaterThan(LOTE.z1);
    expect(VISITANTE[1]).toBeGreaterThan(LOTE.z1);
    expect(VISITANTE[0]).toBeGreaterThanOrEqual(PORTAO_PEDESTRES.x0 - 1);
    expect(VISITANTE[0]).toBeLessThanOrEqual(PORTAO_PEDESTRES.x1 + 1);
  });

  it('rack e nobreak ficam fora das paredes (visíveis), e os cabos de rede terminam no rack ou num cabo tronco', () => {
    for (const [x, z] of [RACK, NOBREAK]) expect(PREDIOS.some((p) => dentro(p, x, z))).toBe(false);
    for (const cabo of CABOS_REDE) {
      const [ix, , iz] = cabo[0]!;
      expect(CAMERAS.some((c) => Math.hypot(c.x - ix, c.z - iz) < 0.6)).toBe(true);
    }
  });
});

describe('cobertura das câmeras', () => {
  it('rumo 0 aponta para a rua (+z) e 90 para a direita (+x)', () => {
    expect(direcao(0)[1]).toBeCloseTo(1);
    expect(direcao(90)[0]).toBeCloseTo(1);
  });

  it('campo de visão começa na abertura certa e não passa do alcance', () => {
    for (const c of CAMERAS) {
      const pontas = campoDeVisao(c, 36);
      expect(pontas).toHaveLength(37);
      for (const [x, z] of pontas) expect(Math.hypot(x - c.x, z - c.z)).toBeLessThanOrEqual(c.alcance + 1e-6);
    }
  });

  it('câmera da garagem vê o meio do estacionamento', () => {
    expect(quemVe(18, 12)).toContain(3);
  });

  it('câmera da rua vê o visitante no portão de pedestres', () => {
    expect(cameraVe(CAMERAS[0]!, VISITANTE[0], VISITANTE[1])).toBe(true);
  });

  it('prédio bloqueia a visão: atrás do Bloco A a câmera da piscina não vê', () => {
    const piscina = CAMERAS.find((c) => c.id === 7)!;
    expect(cameraVe(piscina, -10, 0)).toBe(true);
    expect(cameraVe(piscina, -19, -14)).toBe(false);
  });

  it('câmera não vê para trás nem além do alcance', () => {
    const garagem = CAMERAS.find((c) => c.id === 3)!;
    const [dx, dz] = direcao(garagem.rumo + 180);
    expect(cameraVe(garagem, garagem.x + dx * 5, garagem.z + dz * 5)).toBe(false);
    const [fx, fz] = direcao(garagem.rumo);
    expect(cameraVe(garagem, garagem.x + fx * (garagem.alcance + 2), garagem.z + fz * (garagem.alcance + 2))).toBe(false);
  });

  it('a maquete tem pontos cegos (é o que o capítulo mostra) e cobre boa parte da circulação', () => {
    expect(pontoCego(-10, -6.3)).toBe(true); // calçada em frente aos blocos
    expect(pontoCego(18, 12)).toBe(false); // estacionamento
    const f = fracaoVista();
    expect(f).toBeGreaterThan(0.35);
    expect(f).toBeLessThan(0.95);
  });

  it('mais câmeras nunca diminuem a parte vista', () => {
    expect(fracaoVista(CAMERAS.slice(0, 4), 1)).toBeLessThanOrEqual(fracaoVista(CAMERAS, 1));
  });

  it('pontos cegos só contam em áreas de circulação', () => {
    expect(AREAS_DE_CIRCULACAO.some((r) => dentro(r, -20, 15))).toBe(false);
    expect(pontoCego(-20, 15)).toBe(false); // gramado
  });
});

describe('camadas e capítulos', () => {
  it('seis camadas, uma para cada sistema do Condomínio Evoluído do configurador', () => {
    expect(CAMADAS).toHaveLength(6);
    expect(CAMADAS.map((c) => c.sistema).sort()).toEqual(sistemasCondominio.map((s) => s.id).sort());
    expect(camadaPorSistema('facial')?.id).toBe('acesso');
  });

  it('roteiro: abertura, os 6 sistemas em ordem e a proposta', () => {
    expect(CAPITULOS[0]!.id).toBe('abertura');
    expect(CAPITULOS.at(-1)!.id).toBe('proposta');
    expect(CAPITULOS.filter((c) => c.numero).map((c) => c.numero)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('cada capítulo acende câmeras que existem e o destaque é uma camada acesa', () => {
    for (const c of CAPITULOS) {
      for (const id of c.monitor) expect(CAMERAS.some((cam) => cam.id === id)).toBe(true);
      if (c.selecionada) expect(c.monitor).toContain(c.selecionada);
      if (c.realce) expect(c.camadas).toContain(c.realce);
      expect(c.vista.raio).toBeGreaterThan(40);
    }
  });

  it('cada sistema tem um capítulo com a sua camada em destaque (ou a das câmeras)', () => {
    for (const camada of CAMADAS) {
      const capitulo = CAPITULOS.find((c) => c.realce === camada.id || (camada.id === 'cameras' && c.id === 'cameras'));
      expect(capitulo, camada.id).toBeDefined();
    }
  });
});

describe('mensagem da proposta', () => {
  it('leva os sistemas marcados com o mesmo começo do configurador', () => {
    const m = mensagemProposta({ sistemas: ['cameras', 'facial'], blocos: 2, apartamentos: 56 });
    expect(m).toContain('Quero uma proposta de Condomínio Evoluído');
    expect(m).toContain('câmeras nas áreas comuns, controle de acesso facial');
    expect(m).toContain('2 blocos e 56 apartamentos');
  });

  it('sem sistemas, pede orientação; números fora do limite ficam de fora', () => {
    const m = mensagemProposta({ sistemas: [], blocos: 0, apartamentos: 99999 });
    expect(m).toContain('o que faz sentido');
    expect(m).not.toMatch(/bloco|apartamento/);
  });

  it('singular e plural, e só blocos quando só tem blocos', () => {
    expect(mensagemProposta({ sistemas: ['rede'], blocos: 1 })).toContain('O condomínio tem 1 bloco.');
    expect(numeroValido('12', LIMITES.blocos)).toBe(12);
    expect(numeroValido('1.5', LIMITES.blocos)).toBeNull();
    expect(numeroValido('', LIMITES.blocos)).toBeNull();
  });

  it('cabe no limite de mensagem da Sol mesmo com tudo marcado', () => {
    const m = mensagemProposta({ sistemas: sistemasCondominio.map((s) => s.id), blocos: 50, apartamentos: 3000 });
    expect(m.length).toBeLessThan(600);
  });
});

describe('textos da página do condomínio', () => {
  const tudo = JSON.stringify(paginaCondominio);
  it('não promete preço, dias de gravação, instalação grátis nem quantidade de câmeras', () => {
    expect(tudo).not.toMatch(/R\$|\d+ dias|instalação inclusa|sem investimento|grátis|\d+ câmeras/i);
  });
  it('não tem WhatsApp (fica só em "Fale com a SC")', () => {
    expect(tudo).not.toMatch(/wa\.me|whatsapp/i);
  });
  it('lembra que a maquete é ilustrativa e que colorida à noite é sob orçamento', () => {
    expect(paginaCondominio.nota).toMatch(/ilustrativa/);
    expect(paginaCondominio.noturna).toMatch(/sob orçamento/);
  });
});
