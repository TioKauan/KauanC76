import { describe, expect, it } from 'vitest';
import { taxaSugerida } from '../src/lib/calculadoras/bitrate';
import { calcularArmazenamento } from '../src/lib/calculadoras/armazenamento';
import { calcularCabo, comprimentoMaximo, RHO_20C } from '../src/lib/calculadoras/cabo';
import { calcularEnergia } from '../src/lib/calculadoras/energia';
import { calcularBanda } from '../src/lib/calculadoras/banda';

// Todos os valores esperados abaixo foram calculados à mão (a conta está no comentário de cada caso).

describe('taxas de bits sugeridas', () => {
  it('2 MP em H.265 = 4 × 0,5 = 2 Mbps; 8 MP em H.265+ = 12 × 0,35 = 4,2 Mbps', () => {
    expect(taxaSugerida('2mp', 'h265')).toBe(2);
    expect(taxaSugerida('8mp', 'h265mais')).toBe(4.2);
  });
});

describe('armazenamento', () => {
  it('1 câmera a 4 Mbps por 24 h = 4 × 86400 ÷ 8 ÷ 1000 = 43,2 GB por dia', () => {
    const r = calcularArmazenamento({ cameras: 1, mbps: 4, dias: 1, horasPorDia: 24, margem: 0 });
    expect(r.gbPorCameraDia).toBeCloseTo(43.2, 6);
    expect(r.totalTB).toBeCloseTo(0.0432, 6);
  });

  it('16 câmeras × 30 dias × 43,2 GB = 20,736 TB; com 10 % de margem, 22,8096 TB (≈ 20,745 TiB)', () => {
    const r = calcularArmazenamento({ cameras: 16, mbps: 4, dias: 30, horasPorDia: 24, margem: 0.1 });
    expect(r.totalTB).toBeCloseTo(20.736, 6);
    expect(r.totalComMargemTB).toBeCloseTo(22.8096, 6);
    expect(r.totalComMargemTiB).toBeCloseTo(20.7452, 3);
    // 2 discos de 12 TB (24 TB) é o menor número de discos; 1 disco de 24 TB não existe.
    expect(r.sugestao).toEqual({ discos: 2, tamanhoTB: 12, capacidadeTB: 24 });
  });

  it('gravar só 12 h por dia reduz o total à metade', () => {
    const r = calcularArmazenamento({ cameras: 16, mbps: 4, dias: 30, horasPorDia: 12, margem: 0 });
    expect(r.totalTB).toBeCloseTo(10.368, 6);
  });

  it('sem sugestão quando passa de 16 discos de 20 TB', () => {
    const r = calcularArmazenamento({ cameras: 64, mbps: 12, dias: 90, horasPorDia: 24, margem: 0.1 });
    expect(r.sugestao).toBeNull();
  });
});

describe('queda de tensão e bitola', () => {
  const base = { tensao: 12, quedaMaximaPct: 5, rho: RHO_20C };

  it('12 V, 2 A, 50 m: S = 2·50·2 ÷ 56 ÷ 0,6 = 5,95 mm² → 6 mm², queda 0,595 V (4,96 %)', () => {
    const r = calcularCabo({ ...base, corrente: 2, comprimento: 50 });
    expect(r.secaoMinimaMm2).toBeCloseTo(5.952, 3);
    expect(r.escolhida?.mm2).toBe(6);
    expect(r.quedaV).toBeCloseTo(0.5952, 4);
    expect(r.quedaPct).toBeCloseTo(4.96, 2);
    expect(r.tensaoNoFim).toBeCloseTo(11.4048, 4);
  });

  it('12 V, 0,5 A, 20 m: S = 0,5952 mm² → 0,75 mm²', () => {
    const r = calcularCabo({ ...base, corrente: 0.5, comprimento: 20 });
    expect(r.escolhida?.mm2).toBe(0.75);
    expect(r.quedaV).toBeCloseTo(0.4762, 4);
    expect(r.limitadaPelaCorrente).toBe(false);
  });

  it('12 A em 1 m: a queda pediria 0,75 mm², mas o cabo de 0,75 só aguenta 11 A → sobe para 1 mm²', () => {
    const r = calcularCabo({ ...base, corrente: 12, comprimento: 1 });
    expect(r.escolhida?.mm2).toBe(1);
    expect(r.limitadaPelaCorrente).toBe(true);
  });

  it('distância máxima de 6 mm² a 2 A e 5 %: 0,6 × 6 ÷ (2 · 2 ÷ 56) = 50,4 m', () => {
    expect(comprimentoMaximo({ ...base, corrente: 2 }, 6)).toBeCloseTo(50.4, 6);
  });

  it('trecho enorme: nenhuma seção serve', () => {
    const r = calcularCabo({ ...base, corrente: 10, comprimento: 500 });
    expect(r.escolhida).toBeNull();
  });
});

describe('fonte e bateria', () => {
  const base = { tensao: 12, folga: 0.2, horasAutonomia: 4, profundidadeDescarga: 0.5, eficiencia: 0.85 };
  // 8 câmeras de 5 W + 1 gravador de 30 W = 70 W → 70 ÷ 12 = 5,8333 A → com 20 %: 7,0 A.
  const cargas = [
    { quantidade: 8, watts: 5 },
    { quantidade: 1, watts: 30 },
  ];

  it('70 W a 12 V = 5,833 A; com folga de 20 % = 7 A → fonte de 10 A', () => {
    const r = calcularEnergia({ ...base, cargas });
    expect(r.watts).toBe(70);
    expect(r.correnteA).toBeCloseTo(5.8333, 4);
    expect(r.correnteComFolgaA).toBeCloseTo(7, 6);
    expect(r.fonteA).toBe(10);
  });

  it('4 h de autonomia: 5,8333 × 4 ÷ (0,5 × 0,85) = 54,9 Ah → bateria de 65 Ah', () => {
    const r = calcularEnergia({ ...base, cargas });
    expect(r.ahNecessarios).toBeCloseTo(54.902, 3);
    expect(r.baterias).toEqual({ ah: 65, paralelo: 1, capacidadeAh: 65 });
  });

  it('autonomia que passa de 100 Ah usa baterias em paralelo', () => {
    const r = calcularEnergia({ ...base, cargas, horasAutonomia: 10 });
    // 5,8333 × 10 ÷ 0,425 = 137,3 Ah → 2 × 100 Ah
    expect(r.baterias).toEqual({ ah: 100, paralelo: 2, capacidadeAh: 200 });
  });

  it('sem autonomia pedida, não sugere bateria', () => {
    expect(calcularEnergia({ ...base, cargas, horasAutonomia: 0 }).baterias).toBeNull();
  });
});

describe('banda de rede', () => {
  it('16 câmeras × 4 Mbps = 64; com 20 % = 76,8 > 70 (70 % de 100) → enlace de 1 Gbps', () => {
    const r = calcularBanda({ cameras: 16, mbps: 4, folga: 0.2, acessosRemotos: 3, mbpsSecundario: 0.5 });
    expect(r.gravacaoMbps).toBe(64);
    expect(r.gravacaoComFolgaMbps).toBeCloseTo(76.8, 6);
    expect(r.enlaceMbps).toBe(1000);
    expect(r.uploadRemotoMbps).toBeCloseTo(1.8, 6);
    expect(r.portaDeCameraOk).toBe(true);
  });

  it('8 câmeras × 4 Mbps = 32; com 20 % = 38,4 → cabe em 100 Mbps', () => {
    const r = calcularBanda({ cameras: 8, mbps: 4, folga: 0.2, acessosRemotos: 0, mbpsSecundario: 0.5 });
    expect(r.enlaceMbps).toBe(100);
  });

  it('câmera de 70 Mbps não cabe numa porta de 100 Mbps com folga', () => {
    const r = calcularBanda({ cameras: 1, mbps: 70, folga: 0.2, acessosRemotos: 0, mbpsSecundario: 0.5 });
    expect(r.portaDeCameraOk).toBe(false);
  });
});
