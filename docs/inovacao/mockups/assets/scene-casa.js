// Cena isométrica da casa, compartilhada entre os mockups.
function drawCasa(svg, opts) {
  const I = ISO.make(svg, opts);
  const { box, winY, winX, tree, cone, wire, node, poly, p } = I;

  // Terreno
  box(0, 0, 0, 20, 16, 0.3, { top: '#0a1728', left: '#07111d', right: '#081523', edge: '#1d3550' }, 'ground');
  // grade sutil
  for (let i = 2; i < 20; i += 2) I.el('path', { d: `M${p(i,0,0.3)} L${p(i,16,0.3)}`, stroke: '#1a3350', 'stroke-width': .5, opacity: .5 }, 'ground');
  for (let j = 2; j < 16; j += 2) I.el('path', { d: `M${p(0,j,0.3)} L${p(20,j,0.3)}`, stroke: '#1a3350', 'stroke-width': .5, opacity: .5 }, 'ground');
  poly([[13, 10.2, 0.31], [18.2, 10.2, 0.31], [18.2, 15, 0.31], [13, 15, 0.31]], { fill: '#10223a', opacity: .9 }, 'ground');
  poly([[9.3, 10, 0.31], [10.6, 10, 0.31], [10.6, 15, 0.31], [9.3, 15, 0.31]], { fill: '#13263c', opacity: .9 }, 'ground');

  // Cones de visão
  cone(12.1, 10.1, Math.PI / 2 + 0.35, 1.05, 5.4);
  cone(18.2, 10.1, Math.PI / 2 - 0.05, 0.9, 5.2);
  cone(2.5, 10.1, Math.PI / 2 + 0.55, 1.0, 5);

  tree(1.3, 1.4, 0.3, 1.0, 2.4);
  tree(19, 1.6, 0.3, 0.9, 2.2);

  // Casa – térreo
  box(2.5, 2.5, 0.3, 9.6, 7.6, 3.2, { top: '#15283d', left: '#0c1827', right: '#10213a', edge: '#2b4a66' });
  winY(10.1, 3.4, 1.0, 2.3, 1.6);
  winY(10.1, 7.0, 0.5, 4.0, 2.4, '#ffb86b', .62);
  poly([[6.0,10.1,0.3],[6.9,10.1,0.3],[6.9,10.1,2.4],[6.0,10.1,2.4]], { fill: '#3a2414', stroke: '#8a5a33', 'stroke-width': .6 });
  winX(12.1, 3.4, 1.2, 2.6, 1.5, '#ffb86b', .4);
  // Casa – superior
  box(3.2, 3.0, 3.5, 7.6, 6.3, 2.7, { top: '#17304a', left: '#0d1b2c', right: '#12263d', edge: '#2b4a66' });
  winY(9.3, 4.0, 4.1, 5.6, 1.5, '#ffc47f', .5);
  winX(10.8, 3.8, 4.1, 4.4, 1.5, '#9fd8ff', .22);
  box(2.9, 2.7, 6.2, 8.2, 6.9, 0.28, { top: '#1b344f', left: '#10223a', right: '#132a45', edge: '#35597a' });
  // Garagem
  box(12.8, 4.0, 0.3, 5.4, 6.1, 2.6, { top: '#14273c', left: '#0b1726', right: '#0f2036', edge: '#2b4a66' });
  poly([[13.5,10.1,0.3],[17.5,10.1,0.3],[17.5,10.1,2.2],[13.5,10.1,2.2]], { fill: '#15283c', stroke: '#35597a', 'stroke-width': .6 });
  for (let z = 0.6; z < 2.2; z += 0.32) I.el('path', { d: `M${p(13.5,10.1,z)} L${p(17.5,10.1,z)}`, stroke: '#2b4a66', 'stroke-width': .6 });
  box(12.6, 3.8, 2.9, 5.8, 6.5, 0.25, { top: '#1a324c', left: '#10223a', right: '#132a45', edge: '#35597a' });
  // Nobreak / quadro técnico
  box(18.35, 6.0, 0.3, 0.8, 1.0, 1.35, { top: '#26303b', left: '#161d25', right: '#1c252f', edge: '#ff8a2b' });
  poly([[18.5,7.0,0.8],[19.0,7.0,0.8],[19.0,7.0,1.3],[18.5,7.0,1.3]], { fill: '#ff8a2b', opacity: .8 });

  tree(1.3, 12.6, 0.3, 1.0, 2.3);

  // Muro e portões
  const wall = { top: '#1a2d42', left: '#0f1d2d', right: '#132438', edge: '#2e4c68' };
  box(0, 15, 0.3, 9.2, 0.35, 1.3, wall);
  box(9.2, 15.05, 0.3, 1.5, 0.25, 1.55, { top: '#1f3c56', left: '#123049', right: '#163753', edge: '#6de9f6', sw: 1 });
  box(10.7, 15, 0.3, 2.2, 0.35, 1.3, wall);
  box(12.95, 15.08, 0.3, 5.3, 0.2, 1.25, { top: '#1b3047', left: '#10213a', right: '#132840', edge: '#35597a' });
  for (let x = 13.3; x < 18.2; x += 0.45) I.el('path', { d: `M${p(x,15.28,0.35)} L${p(x,15.28,1.5)}`, stroke: '#35597a', 'stroke-width': .7, opacity: .8 });
  box(18.25, 15, 0.3, 1.75, 0.35, 1.3, wall);
  box(10.75, 14.8, 0.3, 0.25, 0.2, 1.6, { top: '#223', left: '#0a1320', right: '#0e1a2a', edge: '#6de9f6', sw: .8 });

  // Conexões (camada de "raio-x" sobre o imóvel)
  const hub = [7.2, 6.4, 3.4];
  wire([hub, [12.1, 6.4, 3.4], [12.1, 10.1, 3.1]]);
  wire([hub, [2.5, 6.4, 3.4], [2.5, 10.1, 3.0]]);
  wire([hub, [12.8, 6.4, 3.4], [18.2, 6.4, 3.4], [18.2, 10.1, 2.4]]);
  wire([[12.1, 10.1, 3.1], [12.1, 12.6, 0.4], [10.9, 12.6, 0.4], [10.9, 14.9, 1.4]], { width: 1.8 });
  wire([[18.75, 6.5, 1.65], [18.75, 6.4, 3.4], [12.8, 6.4, 3.4]], { color: '#ff8a2b', width: 1.6, dash: '5 5' });

  const cam1 = node(12.1, 10.1, 3.1);
  const camL = node(2.5, 10.1, 3.0);
  node(18.2, 10.1, 2.4);
  const net = node(...hub, '#6de9f6', 8);
  const acc = node(10.9, 14.9, 1.5);
  const pwr = node(18.75, 6.5, 1.7, '#ff8a2b', 7);

  return { I, net, cam1, camL, acc, pwr };
}
