import { criarCena } from './iso.js';

/**
 * Cenas ilustradas de cada ambiente. Cada função devolve o SVG e a posição
 * dos pontos (rede, câmeras, acesso, energia, internet) para os rótulos.
 * "rotulos" = deslocamento do rótulo em relação ao ponto, em pixels do desenho.
 */

function casa() {
  const c = criarCena({ id: 'casa', escala: 23, ox: 380, oy: 104 });
  const { caixa, janelaY, janelaX, plano, linha, arvore, cone, fio, no, visitante, cores } = c;
  caixa(0, 0, 0, 20, 16, 0.3, cores.chao, 'chao');
  for (let i = 2; i < 20; i += 2) linha([i, 0, 0.3], [i, 16, 0.3], '#1a3350', 0.5, 'chao', 0.5);
  for (let j = 2; j < 16; j += 2) linha([0, j, 0.3], [20, j, 0.3], '#1a3350', 0.5, 'chao', 0.5);
  plano([[13, 10.2, 0.31], [18.2, 10.2, 0.31], [18.2, 15, 0.31], [13, 15, 0.31]], '#10223a', 0.9);
  plano([[9.3, 10, 0.31], [10.6, 10, 0.31], [10.6, 15, 0.31], [9.3, 15, 0.31]], '#13263c', 0.9);

  cone(12.1, 10.1, Math.PI / 2 + 0.35, 1.05, 5.4);
  cone(18.2, 10.1, Math.PI / 2 - 0.05, 0.9, 5.2);
  cone(2.5, 10.1, Math.PI / 2 + 0.55, 1.0, 5);

  arvore(1.3, 1.4, 1.0, 2.4);
  // poste de internet
  caixa(18.7, 0.5, 0.3, 0.2, 0.2, 4.4, { topo: '#2b4a66', esq: '#1a2c40', dir: '#203650', borda: '#35597a', traco: 0.4 });
  arvore(18.6, 2.6, 0.9, 2.2);

  caixa(2.5, 2.5, 0.3, 9.6, 7.6, 3.2);
  janelaY(10.1, 3.4, 1.0, 2.3, 1.6);
  janelaY(10.1, 7.0, 0.5, 4.0, 2.4, '#ffb86b', 0.62);
  c.caixa(6.0, 10.05, 0.3, 0.9, 0.05, 2.1, { topo: '#3a2414', esq: '#3a2414', dir: '#3a2414', borda: '#8a5a33', traco: 0.6 });
  janelaX(12.1, 3.4, 1.2, 2.6, 1.5, '#ffb86b', 0.4);
  caixa(3.2, 3.0, 3.5, 7.6, 6.3, 2.7, { topo: '#17304a', esq: '#0d1b2c', dir: '#12263d', borda: '#2b4a66' });
  janelaY(9.3, 4.0, 4.1, 5.6, 1.5, '#ffc47f', 0.5);
  janelaX(10.8, 3.8, 4.1, 4.4, 1.5, '#9fd8ff', 0.22);
  caixa(2.9, 2.7, 6.2, 8.2, 6.9, 0.28, cores.telhado);
  caixa(12.8, 4.0, 0.3, 5.4, 6.1, 2.6, { topo: '#14273c', esq: '#0b1726', dir: '#0f2036', borda: '#2b4a66' });
  caixa(13.5, 10.05, 0.3, 4, 0.05, 1.9, { topo: '#15283c', esq: '#15283c', dir: '#15283c', borda: '#35597a', traco: 0.6 });
  for (let z = 0.6; z < 2.2; z += 0.32) linha([13.5, 10.12, z], [17.5, 10.12, z], '#2b4a66', 0.6);
  caixa(12.6, 3.8, 2.9, 5.8, 6.5, 0.25, cores.telhado);
  caixa(18.35, 6.0, 0.3, 0.8, 1.0, 1.35, cores.tecnico);
  janelaX(19.15, 6.2, 0.8, 0.6, 0.45, '#ff8a2b', 0.85);
  arvore(1.3, 12.6, 1.0, 2.3);
  caixa(0, 15, 0.3, 9.2, 0.35, 1.3, cores.muro);
  caixa(9.2, 15.05, 0.3, 1.5, 0.25, 1.55, cores.portao);
  caixa(10.7, 15, 0.3, 2.2, 0.35, 1.3, cores.muro);
  caixa(12.95, 15.08, 0.3, 5.3, 0.2, 1.25, { topo: '#1b3047', esq: '#10213a', dir: '#132840', borda: '#35597a' });
  for (let x = 13.3; x < 18.2; x += 0.45) linha([x, 15.28, 0.35], [x, 15.28, 1.5], '#35597a', 0.7, 'obra', 0.8);
  caixa(18.25, 15, 0.3, 1.75, 0.35, 1.3, cores.muro);
  caixa(10.75, 14.8, 0.3, 0.25, 0.2, 1.6, { topo: '#223344', esq: '#0a1320', dir: '#0e1a2a', borda: '#6de9f6' });

  const hub = [7.2, 6.4, 3.4];
  fio([hub, [12.1, 6.4, 3.4], [12.1, 10.1, 3.1]], 'cameras');
  fio([hub, [2.5, 6.4, 3.4], [2.5, 10.1, 3.0]], 'cameras');
  fio([hub, [12.8, 6.4, 3.4], [18.2, 6.4, 3.4], [18.2, 10.1, 2.4]], 'cameras');
  fio([[12.1, 10.1, 3.1], [12.1, 12.6, 0.4], [10.9, 12.6, 0.4], [10.9, 14.9, 1.4]], 'acesso');
  fio([[18.75, 6.5, 1.65], [18.75, 6.4, 3.4], [12.8, 6.4, 3.4]], 'energia', { tracejado: true, cor: '#ff8a2b' });
  fio([hub, [7.2, 6.4, 6.5], [18.8, 0.6, 4.7]], 'internet');

  no(12.1, 10.1, 3.1, 'cameras');
  no(2.5, 10.1, 3.0, 'cameras');
  no(18.2, 10.1, 2.4, 'cameras');
  no(...hub, 'rede', 8);
  no(10.9, 14.9, 1.5, 'acesso');
  no(18.75, 6.5, 1.7, 'energia', 7);
  no(18.8, 0.6, 4.8, 'internet', 6);
  visitante(10.1, 16.3, 0);
  return {
    svg: c.svg('Casa ilustrada com câmeras, rede, controle de acesso e nobreak conectados'),
    pontos: c.pontos,
    rotulos: { rede: [-40, -118, 0], cameras: [-40, -80, 1], acesso: [120, 40, 0], energia: [-10, 70, 0], internet: [-120, -90, 0] },
  };
}

function comercio() {
  const c = criarCena({ id: 'comercio', escala: 23, ox: 360, oy: 110 });
  const { caixa, janelaY, janelaX, plano, linha, arvore, carro, cone, fio, no, visitante, cores } = c;
  caixa(0, 0, 0, 20, 16, 0.3, cores.chao, 'chao');
  plano([[0, 11, 0.31], [20, 11, 0.31], [20, 12.6, 0.31], [0, 12.6, 0.31]], '#14283f', 0.9);
  for (let x = 1; x < 20; x += 3) linha([x, 12.8, 0.31], [x, 15.7, 0.31], '#2d4d6a', 0.9, 'chao', 0.9);
  cone(2, 11.05, Math.PI / 2 + 0.25, 1.0, 5.4);
  cone(17, 11.05, Math.PI / 2 - 0.25, 1.0, 5.4);
  cone(19.6, 9.6, Math.PI / 2 - 0.9, 0.9, 4.5);

  caixa(0.9, 1.2, 0.3, 0.2, 0.2, 3.2, { topo: '#2b4a66', esq: '#1a2c40', dir: '#203650', borda: '#35597a', traco: 0.4 });
  caixa(0.6, 5.2, 0.3, 0.8, 1.0, 1.35, cores.tecnico);
  caixa(2, 3, 0.3, 15, 8, 3.6);
  janelaY(11, 2.5, 0.5, 5.3, 2.4, '#ffcf8f', 0.5);
  janelaY(11, 10.8, 0.5, 5.7, 2.4, '#ffcf8f', 0.5);
  janelaY(11, 8.3, 0.3, 2.1, 2.3, '#9fd8ff', 0.28);
  janelaX(17, 4, 1.2, 5.5, 1.3, '#ffb86b', 0.28);
  caixa(2.3, 11, 3.0, 14.4, 1.3, 0.22, { topo: '#8a4516', esq: '#6b3410', dir: '#5a2c0e', borda: '#ff8a2b', traco: 0.7 });
  caixa(1.9, 2.9, 3.9, 15.2, 8.2, 0.25, cores.telhado);
  caixa(5, 10.85, 4.15, 9, 0.2, 1.0, { topo: '#0c1e30', esq: '#07131f', dir: '#0a1828', borda: '#6de9f6', traco: 0.8 });
  linha([6, 10.85, 4.65], [13, 10.85, 4.65], '#6de9f6', 2.2, 'obra', 0.8);
  caixa(17, 4, 0.3, 2.6, 6, 2.9, { topo: '#14273c', esq: '#0b1726', dir: '#0f2036', borda: '#2b4a66' });
  caixa(19.6, 7.0, 0.3, 0.05, 1.5, 2.1, { topo: '#1f3c56', esq: '#1f3c56', dir: '#1c3650', borda: '#6de9f6', traco: 0.8 });
  caixa(16.8, 3.8, 3.2, 3.0, 6.4, 0.22, cores.telhado);
  carro(3.4, 13.1);
  carro(9.4, 13.1, 'y', { topo: '#3b2c2a', esq: '#2a1e1c', dir: '#322422', borda: '#5a4440' });
  arvore(18.6, 12.1, 0.9, 2.1);
  arvore(0.8, 12.1, 0.8, 2.0);

  const hub = [9.5, 7, 3.95];
  fio([hub, [2, 7, 3.95], [2, 11, 3.4]], 'cameras');
  fio([hub, [17, 7, 3.95], [17, 11, 3.4]], 'cameras');
  fio([hub, [18.2, 7, 3.95], [19.6, 7, 3.1], [19.6, 9.6, 2.8]], 'cameras');
  fio([[19.6, 9.6, 2.8], [19.6, 7.75, 2.2]], 'acesso');
  fio([[1.0, 5.7, 1.65], [1.0, 7, 3.95], hub], 'energia', { tracejado: true, cor: '#ff8a2b' });
  fio([hub, [9.5, 1.3, 3.95], [1.0, 1.3, 3.6]], 'internet');

  no(2, 11, 3.4, 'cameras');
  no(17, 11, 3.4, 'cameras');
  no(19.6, 9.6, 2.8, 'cameras');
  no(...hub, 'rede', 8);
  no(19.62, 7.75, 1.4, 'acesso');
  no(1.0, 5.7, 1.7, 'energia', 7);
  no(1.0, 1.3, 3.6, 'internet', 6);
  visitante(20.6, 7.9, 0);
  return {
    svg: c.svg('Loja ilustrada com câmeras na fachada, rede, acesso ao estoque e nobreak'),
    pontos: c.pontos,
    rotulos: { rede: [-30, -140, 0], cameras: [70, -80, 1], acesso: [40, 70, 0], energia: [-120, 60, 0], internet: [-120, 30, 0] },
  };
}

function condominio() {
  const c = criarCena({ id: 'condominio', escala: 19.5, ox: 385, oy: 150 });
  const { caixa, janelaY, janelaX, plano, linha, arvore, cone, fio, no, visitante, cores } = c;
  caixa(0, 0, 0, 22, 18, 0.3, cores.chao, 'chao');
  for (let i = 2; i < 22; i += 2) linha([i, 0, 0.3], [i, 18, 0.3], '#1a3350', 0.5, 'chao', 0.45);
  plano([[9.4, 8.6, 0.31], [13.4, 8.6, 0.31], [13.4, 11.2, 0.31], [9.4, 11.2, 0.31]], '#0e4a63', 0.9);
  plano([[9.8, 9.0, 0.32], [13.0, 9.0, 0.32], [13.0, 10.8, 0.32], [9.8, 10.8, 0.32]], '#1f7fa0', 0.55);
  plano([[16.6, 16.1, 0.31], [21.6, 16.1, 0.31], [21.6, 12.8, 0.31], [16.6, 12.8, 0.31]], '#10223a', 0.9);
  cone(8.5, 7.6, Math.PI / 4 + 0.2, 1.0, 5.2);
  cone(0.5, 16.6, -0.55, 0.9, 6);
  cone(17.3, 15.7, Math.PI / 2 - 0.2, 1.0, 4.6);

  caixa(21.2, 0.6, 0.3, 0.2, 0.2, 5, { topo: '#2b4a66', esq: '#1a2c40', dir: '#203650', borda: '#35597a', traco: 0.4 });
  caixa(12, 1.5, 0.3, 6.5, 5.5, 6.2, { topo: '#16293f', esq: '#0c1827', dir: '#10213a', borda: '#2b4a66' });
  for (let k = 0; k < 3; k++) {
    for (let x = 12.5; x < 18.2; x += 1.45) janelaY(7, x, 1.0 + k * 1.9, 0.9, 1.0, k === 1 && x > 14 ? '#ffc47f' : '#9fd8ff', k === 1 && x > 14 ? 0.55 : 0.2);
    for (let y = 2; y < 6.8; y += 1.45) janelaX(18.5, y, 1.0 + k * 1.9, 0.9, 1.0, '#ffb86b', (k + y) % 3 < 1 ? 0.55 : 0.15);
  }
  caixa(11.8, 1.3, 6.5, 6.9, 5.9, 0.25, cores.telhado);
  arvore(20, 9, 1.0, 2.4);
  caixa(2, 2, 0.3, 6.5, 5.5, 8.2);
  for (let k = 0; k < 4; k++) {
    for (let x = 2.5; x < 8.2; x += 1.45) janelaY(7.5, x, 1.0 + k * 1.85, 0.9, 1.0, (x + k) % 3 < 1.2 ? '#ffc47f' : '#9fd8ff', (x + k) % 3 < 1.2 ? 0.55 : 0.2);
    for (let y = 2.5; y < 7.2; y += 1.45) janelaX(8.5, y, 1.0 + k * 1.85, 0.9, 1.0, '#ffb86b', (k * 2 + y) % 3 < 1 ? 0.5 : 0.15);
  }
  caixa(1.8, 1.8, 8.5, 6.9, 5.9, 0.25, cores.telhado);
  arvore(1.5, 10.5, 1.0, 2.3);
  arvore(1.5, 13.6, 0.9, 2.1);
  arvore(7.8, 13.8, 0.9, 2.1);
  caixa(14, 12.9, 0.3, 3.3, 2.7, 2.5);
  janelaY(15.6, 14.3, 1.0, 2.7, 1.2, '#9fd8ff', 0.35);
  janelaX(17.3, 13.2, 1.0, 2.1, 1.2, '#ffcf8f', 0.45);
  caixa(13.7, 12.6, 2.8, 3.9, 3.3, 0.22, cores.telhado);
  caixa(17.6, 13.2, 0.3, 0.7, 0.9, 1.3, cores.tecnico);
  caixa(0, 16.8, 0.3, 11.9, 0.35, 1.5, cores.muro);
  caixa(11.9, 16.85, 0.3, 1.6, 0.25, 1.7, cores.portao);
  caixa(13.5, 16.8, 0.3, 3.8, 0.35, 1.5, cores.muro);
  caixa(17.4, 16.9, 0.3, 4.2, 0.2, 1.4, { topo: '#1b3047', esq: '#10213a', dir: '#132840', borda: '#35597a' });
  for (let x = 17.7; x < 21.5; x += 0.45) linha([x, 17.1, 0.35], [x, 17.1, 1.6], '#35597a', 0.7, 'obra', 0.8);
  caixa(21.6, 16.8, 0.3, 0.4, 0.35, 1.5, cores.muro);
  caixa(11.55, 16.55, 0.3, 0.25, 0.2, 1.7, { topo: '#223344', esq: '#0a1320', dir: '#0e1a2a', borda: '#6de9f6' });

  const hub = [15.6, 14.2, 2.85];
  fio([hub, [15.6, 7.6, 2.85], [8.5, 7.6, 3.0]], 'cameras');
  fio([hub, [15.6, 16.6, 2.4], [0.5, 16.6, 1.9]], 'cameras');
  fio([hub, [17.3, 14.2, 2.85], [17.3, 15.7, 2.4]], 'cameras');
  fio([hub, [11.65, 14.2, 2.85], [11.65, 16.6, 1.9]], 'acesso');
  fio([[17.95, 13.6, 1.65], [17.95, 14.2, 2.85], hub], 'energia', { tracejado: true, cor: '#ff8a2b' });
  fio([hub, [21.3, 14.2, 2.85], [21.3, 0.7, 5.4]], 'internet');

  no(8.5, 7.6, 3.0, 'cameras');
  no(0.5, 16.6, 1.9, 'cameras');
  no(17.3, 15.7, 2.4, 'cameras');
  no(...hub, 'rede', 8);
  no(11.65, 16.6, 1.9, 'acesso');
  no(17.95, 13.6, 1.7, 'energia', 7);
  no(21.3, 0.7, 5.4, 'internet', 6);
  visitante(12.7, 18.4, 0);
  return {
    svg: c.svg('Condomínio ilustrado com portaria, câmeras, controle de acesso e nobreak'),
    pontos: c.pontos,
    rotulos: { rede: [120, -60, 0], cameras: [-60, -80, 0], acesso: [-130, 40, 0], energia: [110, 50, 0], internet: [-130, -70, 0] },
  };
}

function empresa() {
  const c = criarCena({ id: 'empresa', escala: 21, ox: 350, oy: 125 });
  const { caixa, janelaY, janelaX, plano, linha, arvore, carro, cone, fio, no, visitante, cores } = c;
  caixa(0, 0, 0, 22, 17, 0.3, cores.chao, 'chao');
  plano([[15, 1.5, 0.31], [21.6, 1.5, 0.31], [21.6, 16.6, 0.31], [15, 16.6, 0.31]], '#0d1d2f', 0.95);
  for (let y = 2; y < 16; y += 2.4) linha([15.2, y, 0.31], [18.4, y, 0.31], '#2d4d6a', 0.9, 'chao', 0.9);
  plano([[2, 10.3, 0.31], [13, 10.3, 0.31], [13, 12.2, 0.31], [2, 12.2, 0.31]], '#14283f', 0.9);
  cone(2, 10.1, Math.PI / 2 + 0.4, 1.0, 5);
  cone(13, 10.1, Math.PI / 2 - 0.25, 1.0, 5);
  cone(19.2, 14, Math.PI + 0.9, 1.0, 5.2);

  caixa(21.2, 0.6, 0.3, 0.2, 0.2, 5, { topo: '#2b4a66', esq: '#1a2c40', dir: '#203650', borda: '#35597a', traco: 0.4 });
  carro(15.6, 2.5, 'x');
  carro(15.6, 7.3, 'x', { topo: '#3b2c2a', esq: '#2a1e1c', dir: '#322422', borda: '#5a4440' });
  carro(15.6, 9.7, 'x');
  caixa(13.2, 3.2, 0.3, 1.1, 1.6, 1.8, cores.tecnico);
  caixa(2, 2.5, 0.3, 11, 7.5, 8.7, { topo: '#15283d', esq: '#0b1726', dir: '#0f2036', borda: '#2b4a66' });
  for (let k = 0; k < 3; k++) {
    const z = 0.9 + k * 2.8;
    janelaY(10, 2.4, z, 10.2, 1.8, '#9fd8ff', 0.18);
    janelaX(13, 2.9, z, 6.7, 1.8, '#9fd8ff', 0.16);
    janelaY(10, 3.0 + k * 2.6, z + 0.2, 2.4, 1.4, '#ffc47f', 0.5);
    janelaX(13, 4.5 + k, z + 0.2, 2.2, 1.4, '#ffc47f', 0.4);
    linha([2, 10, z + 2.2], [13, 10, z + 2.2], '#2b4a66', 1.2);
    linha([13, 2.5, z + 2.2], [13, 10, z + 2.2], '#2b4a66', 1.2);
  }
  caixa(1.8, 2.3, 9.0, 11.4, 7.9, 0.28, cores.telhado);
  caixa(5.8, 10, 3.0, 4, 1.8, 0.22, cores.telhado);
  caixa(6.0, 11.5, 0.3, 0.2, 0.2, 2.7, cores.muro);
  caixa(9.5, 11.5, 0.3, 0.2, 0.2, 2.7, cores.muro);
  caixa(6.9, 11.0, 0.3, 0.3, 0.9, 1.0, cores.portao);
  caixa(8.5, 11.0, 0.3, 0.3, 0.9, 1.0, cores.portao);
  caixa(19.1, 13.9, 0.3, 0.2, 0.2, 3.1, { topo: '#2b4a66', esq: '#1a2c40', dir: '#203650', borda: '#35597a', traco: 0.4 });
  arvore(0.9, 12.8, 0.9, 2.2);
  arvore(12.6, 14.2, 0.9, 2.2);
  arvore(4.5, 15, 0.8, 2.0);

  const hub = [7.8, 10, 4.3];
  fio([hub, [2, 10, 4.3], [2, 10.1, 3.0]], 'cameras');
  fio([hub, [13, 10, 4.3], [13, 10.1, 3.0]], 'cameras');
  fio([hub, [13, 10, 4.3], [19.2, 13.3, 3.4], [19.2, 14, 3.3]], 'cameras');
  fio([hub, [7.8, 10.6, 3.0], [7.8, 11.5, 1.4]], 'acesso');
  fio([[13.75, 4.0, 2.15], [13.75, 10, 4.3], hub], 'energia', { tracejado: true, cor: '#ff8a2b' });
  fio([hub, [7.8, 6.2, 9.3], [21.3, 0.7, 5.4]], 'internet');

  no(2, 10.1, 3.0, 'cameras');
  no(13, 10.1, 3.0, 'cameras');
  no(19.2, 14, 3.4, 'cameras');
  no(...hub, 'rede', 8);
  no(7.8, 11.5, 1.4, 'acesso');
  no(13.75, 4.0, 2.2, 'energia', 7);
  no(21.3, 0.7, 5.4, 'internet', 6);
  visitante(7.8, 13.1, 0.3);
  return {
    svg: c.svg('Prédio comercial ilustrado com câmeras, rede, catracas de acesso e nobreak'),
    pontos: c.pontos,
    rotulos: { rede: [-150, -70, 0], cameras: [90, -110, 1], acesso: [-150, 50, 0], energia: [90, 60, 0], internet: [-110, -80, 0] },
  };
}

export const cenas = { casa, comercio, condominio, empresa };
