import { describe, expect, it } from 'vitest';
import { MAQUETES, type AmbienteMaquete } from '../src/lib/ambientes/maquetes';
import { capitulosDe, camadasDe } from '../src/lib/ambientes/capitulos';
import { camerasDoPlano, opcoesDePlano, resumoPlano } from '../src/lib/ambientes/plano';
import { criarCobertura } from '../src/lib/maquete/cobertura';
import { dentro } from '../src/lib/maquete/tipos';
import { plantas, nomeEm } from '../src/lib/configurador-dados';
import { paginasAmbiente } from '../src/lib/dados';

const AMBIENTES: AmbienteMaquete[] = ['casa', 'comercio', 'empresa'];

describe.each(AMBIENTES)('maquete: %s', (a) => {
  const m = MAQUETES[a];
  const cob = criarCobertura(m);
  const planta = plantas[a === 'casa' ? 'casa' : 'comercial'];

  it('as câmeras são os pontos sugeridos do configurador, na mesma ordem e com o mesmo nome', () => {
    expect(m.cameras.map((c) => c.id)).toEqual(planta.sugestoes.map((_, i) => i + 1));
    expect(m.cameras.map((c) => c.nome)).toEqual(planta.sugestoes.map((s) => nomeEm(s.nome, a)));
  });

  it('câmera de dentro fica dentro do imóvel; câmera de fora fica fora das paredes', () => {
    for (const c of m.cameras) {
      expect(dentro(m.tabuleiro, c.x, c.z)).toBe(true);
      const noImovel = m.edificacoes.some((e) => dentro(e.contorno, c.x, c.z));
      expect(noImovel, c.nome).toBe(Boolean(c.interna));
      if (!c.interna) {
        // a própria parede não tapa a câmera: ela vê o chão logo à frente
        const [dx, dz] = [Math.sin((c.rumo * Math.PI) / 180), Math.cos((c.rumo * Math.PI) / 180)];
        expect(cob.cameraVe(c, c.x + dx * 1.5, c.z + dz * 1.5), c.nome).toBe(true);
      }
    }
  });

  it('cada cabo de câmera começa na câmera e termina no gravador', () => {
    const cabos = m.camadas.cabos!.filter((e) => e.tipo === 'cabo');
    expect(cabos).toHaveLength(m.cameras.length);
    const rack = m.camadas.cabos!.find((e) => e.tipo === 'rack')!;
    for (const cabo of cabos) {
      if (cabo.tipo !== 'cabo' || rack.tipo !== 'rack') continue;
      const cam = m.cameras.find((c) => c.id === cabo.camera)!;
      expect(cabo.pontos[0]).toEqual([cam.x, cam.y, cam.z]);
      const fim = cabo.pontos.at(-1)!;
      expect([fim[0], fim[2]]).toEqual([...rack.pos]);
    }
  });

  it('mais câmeras nunca diminuem a parte vista, e o plano de 8 vê mais que o de 1', () => {
    const fracoes = opcoesDePlano.map((n) => cob.fracaoVista(m.cameras.filter((c) => camerasDoPlano(a, n).includes(c.id)), 0.6));
    for (let i = 1; i < fracoes.length; i++) expect(fracoes[i]!).toBeGreaterThanOrEqual(fracoes[i - 1]!);
    expect(fracoes.at(-1)!).toBeGreaterThan(fracoes[0]! + 0.2);
  });

  it('cada plano instala exatamente o número de câmeras dele', () => {
    for (const n of opcoesDePlano) expect(camerasDoPlano(a, n)).toHaveLength(n);
  });

  it('roteiro: câmeras do monitor estão instaladas e o destaque é uma camada acesa', () => {
    const caps = capitulosDe(a);
    expect(caps[0]!.id).toBe('abertura');
    for (const c of caps) {
      for (const id of c.monitor) expect(c.instaladas ?? m.cameras.map((x) => x.id)).toContain(id);
      if (c.realce) expect(c.camadas).toContain(c.realce);
      for (const k of c.camadas) expect(camadasDe(a).map((x) => x.id)).toContain(k);
    }
    expect(caps.some((c) => c.id === 'rede')).toBe(a !== 'casa');
  });
});

describe('paredes bloqueiam a visão', () => {
  it('a câmera da sala não vê dentro do quarto', () => {
    const m = MAQUETES.casa;
    const sala = m.cameras.find((c) => c.nome === 'Sala')!;
    const cob = criarCobertura(m);
    expect(cob.cameraVe(sala, sala.x + 1.5, sala.z + 1.5)).toBe(true);
    expect(cob.cameraVe(sala, 0, -3)).toBe(false); // quarto, atrás da parede
  });
});

describe('plano escolhido', () => {
  it('o plano de 4 câmeras da casa tem o mesmo cabo estimado do configurador e cabe no incluso', () => {
    const r = resumoPlano('casa', 4);
    expect(r.plano.cameras).toBe(4);
    expect(r.nomes).toEqual(['Entrada principal', 'Garagem e portão', 'Fundos / quintal', 'Lateral esquerda']);
    expect(r.caboEstimado).toBeGreaterThan(30);
    expect(r.caboExcedente).toBe(0);
  });

  it('comércio e empresa usam os nomes de cada um', () => {
    expect(resumoPlano('comercio', 2).nomes).toEqual(['Fachada e entrada', 'Caixa']);
    expect(resumoPlano('empresa', 2).nomes).toEqual(['Entrada principal', 'Sala de reunião']);
  });
});

describe('textos das páginas de ambiente', () => {
  const tudo = JSON.stringify(paginasAmbiente);
  it('sem condição contratual, instalação grátis nem WhatsApp', () => {
    expect(tudo).not.toMatch(/instalação inclu|sem investimento|grátis|multa|24 meses|prazo mínimo|reajuste|wa\.me|whatsapp/i);
  });
  it('gravação "aproximadamente 10 dias" e celular dependendo de energia e internet', () => {
    expect(tudo).toContain('aproximadamente 10 dias');
    expect(paginasAmbiente.celular).toMatch(/energia e de internet/);
  });
  it('empresa lembra da proposta personalizada', () => {
    expect(paginasAmbiente.empresa.plano.extra).toMatch(/proposta personalizada/);
  });
});
