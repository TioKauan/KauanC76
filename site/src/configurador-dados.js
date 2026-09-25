/**
 * Plantas de exemplo do configurador "Monte seu sistema".
 * Coordenadas em unidades do desenho (818 × 540). As metragens de cabo são
 * estimativas ilustrativas, confirmadas na visita técnica.
 */

export const ambientesConfig = [
  { id: 'casa', nome: 'Casa', icone: 'house', planta: 'casa' },
  { id: 'comercio', nome: 'Comércio', icone: 'store', planta: 'comercial' },
  { id: 'empresa', nome: 'Empresa', icone: 'briefcase-business', planta: 'comercial' },
  { id: 'condominio', nome: 'Condomínio', icone: 'building-2', planta: null },
];

export const LOTE = { x: 24, y: 22, w: 770, h: 440 };
export const MAX_CAMERAS = 16;

export const plantas = {
  casa: {
    dvr: [340, 250],
    metrosPorUnidade: 0.035,
    folga: 3,
    edificios: [
      { x: 150, y: 90, w: 430, h: 300 },
      { x: 580, y: 210, w: 170, h: 180 },
    ],
    zonas: [
      { nome: 'Cozinha', x: 150, y: 90, w: 210, h: 140 },
      { nome: 'Sala', x: 150, y: 230, w: 210, h: 160 },
      { nome: 'Quarto', x: 360, y: 90, w: 220, h: 160 },
      { nome: 'Banheiro', x: 360, y: 250, w: 110, h: 50 },
      { nome: 'Corredor', x: 360, y: 250, w: 220, h: 140 },
      { nome: 'Garagem', x: 580, y: 210, w: 170, h: 180 },
      { nome: 'Fundos / quintal', x: 24, y: 22, w: 770, h: 68 },
      { nome: 'Lateral esquerda', x: 24, y: 90, w: 126, h: 372 },
      { nome: 'Lateral direita', x: 580, y: 90, w: 214, h: 120 },
      { nome: 'Lateral direita', x: 750, y: 210, w: 44, h: 252 },
      { nome: 'Frente', x: 150, y: 390, w: 600, h: 72 },
    ],
    sugestoes: [
      { id: 's1', nome: 'Entrada principal', x: 250, y: 392, angulo: 90 },
      { id: 's2', nome: 'Garagem e portão', x: 752, y: 392, angulo: 125 },
      { id: 's3', nome: 'Fundos / quintal', x: 578, y: 88, angulo: -125 },
      { id: 's4', nome: 'Lateral esquerda', x: 148, y: 300, angulo: 160 },
      { id: 's5', nome: 'Lateral direita', x: 766, y: 214, angulo: -80 },
      { id: 's6', nome: 'Sala', x: 160, y: 240, angulo: 45 },
      { id: 's7', nome: 'Cozinha', x: 160, y: 100, angulo: 45 },
      { id: 's8', nome: 'Frente da casa', x: 578, y: 392, angulo: 70 },
    ],
    // Pontos marcados quando a pessoa vem de um plano ("Ver no configurador").
    presets: { 1: ['s1'], 2: ['s1', 's3'], 3: ['s1', 's3', 's2'], 4: ['s1', 's2', 's3', 's4'], 8: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'] },
  },
  comercial: {
    dvr: [600, 300],
    metrosPorUnidade: 0.04,
    folga: 3,
    edificios: [{ x: 110, y: 70, w: 540, h: 300 }],
    zonas: [
      { nome: { comercio: 'Depósito', empresa: 'Área de trabalho' }, x: 110, y: 70, w: 340, h: 100 },
      { nome: { comercio: 'Salão de vendas', empresa: 'Recepção' }, x: 110, y: 170, w: 200, h: 200 },
      { nome: { comercio: 'Caixa', empresa: 'Sala de reunião' }, x: 310, y: 170, w: 140, h: 200 },
      { nome: { comercio: 'Estoque', empresa: 'Escritórios' }, x: 450, y: 70, w: 200, h: 180 },
      { nome: { comercio: 'Escritório', empresa: 'Sala técnica' }, x: 450, y: 250, w: 200, h: 120 },
      { nome: 'Fundos', x: 24, y: 22, w: 770, h: 48 },
      { nome: 'Lateral esquerda', x: 24, y: 70, w: 86, h: 392 },
      { nome: { comercio: 'Carga e descarga', empresa: 'Lateral direita' }, x: 650, y: 70, w: 144, h: 300 },
      { nome: 'Estacionamento', x: 110, y: 370, w: 684, h: 92 },
    ],
    sugestoes: [
      { id: 'c1', nome: { comercio: 'Fachada e entrada', empresa: 'Entrada principal' }, x: 210, y: 372, angulo: 90 },
      { id: 'c2', nome: { comercio: 'Caixa', empresa: 'Sala de reunião' }, x: 444, y: 176, angulo: 135 },
      { id: 'c3', nome: { comercio: 'Salão de vendas', empresa: 'Recepção' }, x: 116, y: 176, angulo: 45 },
      { id: 'c4', nome: { comercio: 'Estoque', empresa: 'Escritórios' }, x: 644, y: 76, angulo: 135 },
      { id: 'c5', nome: 'Estacionamento', x: 652, y: 372, angulo: 115 },
      { id: 'c6', nome: 'Fundos', x: 108, y: 68, angulo: -40 },
      { id: 'c7', nome: { comercio: 'Carga e descarga', empresa: 'Lateral direita' }, x: 652, y: 150, angulo: -20 },
      { id: 'c8', nome: { comercio: 'Depósito', empresa: 'Área de trabalho' }, x: 116, y: 76, angulo: 30 },
    ],
    presets: { 1: ['c1'], 2: ['c1', 'c2'], 3: ['c1', 'c2', 'c4'], 4: ['c1', 'c2', 'c4', 'c5'], 8: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'] },
  },
};

export const sistemasCondominio = [
  { id: 'cameras', nome: 'Câmeras nas áreas comuns', icone: 'cctv' },
  { id: 'facial', nome: 'Controle de acesso facial', icone: 'scan-face' },
  { id: 'interfonia', nome: 'Interfonia', icone: 'phone' },
  { id: 'rede', nome: 'Rede e Wi-Fi', icone: 'wifi' },
  { id: 'nobreak', nome: 'Nobreak e quadro técnico', icone: 'battery-charging' },
  { id: 'alarme', nome: 'Alarme integrado', icone: 'bell-ring' },
];

/** Nome de um valor que pode variar por ambiente ({ comercio, empresa }). */
export const nomeEm = (valor, ambiente) => (typeof valor === 'string' ? valor : valor[ambiente] || Object.values(valor)[0]);
