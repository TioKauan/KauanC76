import { describe, expect, it } from 'vitest';
import { LOTE, plantas, ambientesConfig, nomeEm } from '../src/lib/configurador-dados';
import {
  anguloPara, caboDe, dentro, mensagemWhatsapp, nomeDaZona, resumir,
  type Camera, type EstadoConfigurador,
} from '../src/lib/configurador-logica';

const casa = plantas.casa;
const estado = (parcial: Partial<EstadoConfigurador> = {}): EstadoConfigurador => ({
  ambiente: 'casa', cameras: [], recursos: new Set(), condominio: new Set(), ...parcial,
});
let id = 1;
const deSugestoes = (ids: string[], planta = casa, ambiente: EstadoConfigurador['ambiente'] = 'casa'): Camera[] =>
  ids.map((sid) => {
    const s = planta.sugestoes.find((x) => x.id === sid)!;
    return { id: id++, x: s.x, y: s.y, angulo: s.angulo, nome: nomeEm(s.nome, ambiente), sugestao: s.id };
  });

describe('dados das plantas', () => {
  it.each(Object.entries(plantas))('%s: pontos sugeridos dentro do terreno e presets válidos', (_, p) => {
    for (const s of p.sugestoes) expect(dentro(LOTE, s.x, s.y), s.id).toBe(true);
    for (const [n, ids] of Object.entries(p.presets)) {
      expect(ids).toHaveLength(Number(n));
      for (const sid of ids) expect(p.sugestoes.some((s) => s.id === sid), sid).toBe(true);
    }
    expect(dentro(LOTE, ...p.dvr)).toBe(true);
  });

  it('todo ambiente com planta aponta para uma planta existente', () => {
    for (const a of ambientesConfig) if (a.planta) expect(plantas[a.planta]).toBeDefined();
    expect(ambientesConfig.find((a) => a.id === 'condominio')?.planta).toBeNull();
  });
});

describe('cabo estimado', () => {
  it('segue o caminho em L até o gravador, com folga', () => {
    // (250,392) → DVR (340,250): (90 + 142) × 0,035 + 3 = 11,12 → 11 m
    expect(caboDe(casa, { x: 250, y: 392 })).toBe(11);
    expect(caboDe(casa, { x: casa.dvr[0], y: casa.dvr[1] })).toBe(casa.folga);
  });

  it('preset de 4 câmeras da casa cabe no plano (sem excedente)', () => {
    const r = resumir(estado({ cameras: deSugestoes(casa.presets[4]!) }));
    expect(r.recomendacao.tipo).toBe('exato');
    expect(r.recomendacao.plano?.cameras).toBe(4);
    expect(r.caboEstimado).toBeLessThanOrEqual(80);
    expect(r.caboExcedente).toBe(0);
  });

  it('câmeras nos cantos do terreno passam do limite e o excedente aparece', () => {
    const cantos = [[40, 40], [780, 40], [40, 440], [780, 440]].map(([x, y]) => ({ id: id++, x: x!, y: y!, angulo: 0, nome: 'canto', sugestao: null }));
    const r = resumir(estado({ cameras: [...deSugestoes(casa.presets[4]!), ...cantos] }));
    expect(r.recomendacao.plano?.cameras).toBe(8);
    expect(r.caboExcedente).toBe(r.caboEstimado - 100);
    expect(r.caboExcedente).toBeGreaterThan(0);
  });
});

describe('recomendação', () => {
  it('condomínio sempre vira proposta, sem planta', () => {
    const r = resumir(estado({ ambiente: 'condominio' }));
    expect(r.recomendacao.tipo).toBe('proposta');
    expect(r.caboEstimado).toBe(0);
  });
});

describe('nomes e direção das câmeras', () => {
  it('nome vem da área da planta e repetições ganham número', () => {
    const primeira = nomeDaZona(casa, 'casa', [], 200, 300);
    expect(primeira).toBe('Sala');
    const cams: Camera[] = [{ id: 1, x: 200, y: 300, angulo: 0, nome: 'Sala', sugestao: null }];
    expect(nomeDaZona(casa, 'casa', cams, 220, 320)).toBe('Sala (2)');
    expect(nomeDaZona(plantas.comercial, 'comercio', [], 200, 250)).toBe('Salão de vendas');
    expect(nomeDaZona(plantas.comercial, 'empresa', [], 200, 250)).toBe('Recepção');
  });

  it('câmera dentro do imóvel olha para o centro dele', () => {
    // Centro da casa: (365, 240). Da cozinha (200,120) o ângulo aponta para baixo-direita.
    const a = anguloPara(casa, 200, 120);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(90);
  });

  it('câmera externa olha para fora do prédio mais próximo', () => {
    // Na rua, abaixo da casa: deve olhar para baixo (≈ 90°).
    const a = anguloPara(casa, 365, 470);
    expect(Math.abs(a - 90)).toBeLessThan(20);
  });
});

describe('mensagem do WhatsApp', () => {
  it('leva ambiente, pontos, plano, valor, cabo e recursos', () => {
    const msg = mensagemWhatsapp(estado({ cameras: deSugestoes(casa.presets[4]!), recursos: new Set(['nobreak', 'colorida']) }));
    expect(msg).toContain('Ambiente: Casa');
    expect(msg).toContain('Câmeras: 4 (entrada principal, garagem e portão, fundos / quintal, lateral esquerda)');
    expect(msg).toContain('Plano sugerido: Plano de 4 câmeras (R$ 99,90/mês)');
    expect(msg).toMatch(/Cabo estimado: ≈ \d+ m \(o plano inclui até 80 m\)/);
    expect(msg).toContain('Recursos de interesse: imagem colorida à noite, nobreak');
  });

  it('de 5 a 7 câmeras sugere o plano de 8 ou proposta', () => {
    const msg = mensagemWhatsapp(estado({ cameras: deSugestoes(['s1', 's2', 's3', 's4', 's5']) }));
    expect(msg).toContain('Plano de 8 câmeras (R$ 159,90/mês) ou proposta para 5 câmeras');
  });

  it('comércio e empresa usam os nomes certos na mesma planta', () => {
    const c = mensagemWhatsapp(estado({ ambiente: 'comercio', cameras: deSugestoes(['c2'], plantas.comercial, 'comercio') }));
    const e = mensagemWhatsapp(estado({ ambiente: 'empresa', cameras: deSugestoes(['c2'], plantas.comercial, 'empresa') }));
    expect(c).toContain('Câmeras: 1 (caixa)');
    expect(e).toContain('Câmeras: 1 (sala de reunião)');
  });

  it('condomínio pede proposta com os sistemas marcados', () => {
    const msg = mensagemWhatsapp(estado({ ambiente: 'condominio', condominio: new Set(['facial', 'interfonia']) }));
    expect(msg).toContain('Condomínio Evoluído');
    expect(msg).toContain('Sistemas de interesse: controle de acesso facial, interfonia.');
  });

  it('sem pontos marcados, pede ajuda para escolher', () => {
    expect(mensagemWhatsapp(estado())).toMatch(/gostaria de ajuda para escolher os pontos/);
  });
});
