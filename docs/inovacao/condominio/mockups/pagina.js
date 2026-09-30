// Mockup: monta cada "capítulo" da página (?estado=geral|cameras|acesso|energia|projeto) e desenha a maquete.
import { criarMaquete, CAMERAS } from './maquete.js';
import { ICONES } from './assets/icones.js';

const params = new URLSearchParams(location.search);
const nome = params.get('estado') || 'geral';
document.body.dataset.estado = nome;
const celular = innerWidth <= 600;
const ic = (n) => ICONES[n] ?? '';
document.querySelectorAll('[data-ic]').forEach((el) => el.insertAdjacentHTML('afterbegin', ic(el.dataset.ic)));

const CAMADAS = [
  { id: 'cameras', nome: 'Câmeras', icone: 'cctv' },
  { id: 'acesso', nome: 'Acesso facial', icone: 'scan-face' },
  { id: 'interfonia', nome: 'Interfonia', icone: 'phone' },
  { id: 'rede', nome: 'Rede e Wi-Fi', icone: 'wifi' },
  { id: 'energia', nome: 'Nobreak', icone: 'battery-charging' },
  { id: 'alarme', nome: 'Alarme', icone: 'bell-ring' },
];

// Enquadramento de cada capítulo (computador e celular) e o que acende.
const ESTADOS = {
  geral: {
    vista: { alvo: [3, 5, 9], raio: 188, azimute: 36, elevacao: 33, deslocar: 0.12 },
    vistaCel: { alvo: [0, 3, 3], raio: 172, azimute: 36, elevacao: 38 },
    camadas: ['cameras', 'rede', 'energia', 'interfonia', 'acesso'],
    feeds: [1, 3, 5, 7],
    rotulos: 'zonas',
  },
  cameras: {
    vista: { alvo: [5, 0, 5], raio: 186, azimute: 24, elevacao: 56, deslocar: 0.15 },
    vistaCel: { alvo: [2, 0, 3], raio: 168, azimute: 20, elevacao: 60 },
    camadas: ['cameras'],
    pontosCegos: true,
    selecionada: 3,
    feeds: [3],
    rotulos: 'cameras',
  },
  acesso: {
    vista: { alvo: [-2, 3, 13], raio: 104, azimute: 16, elevacao: 31, deslocar: 0.15 },
    vistaCel: { alvo: [-2, 3, 14], raio: 120, azimute: 18, elevacao: 34 },
    camadas: ['acesso', 'interfonia', 'cameras'],
    realce: 'acesso',
    visitante: true,
    selecionada: 1,
    feeds: [1],
    rotulos: 'acesso',
  },
  energia: {
    vista: { alvo: [3, 3, 8], raio: 178, azimute: 40, elevacao: 35, deslocar: 0.15 },
    vistaCel: { alvo: [0, 3, 6], raio: 162, azimute: 40, elevacao: 38 },
    camadas: ['cameras', 'rede', 'energia', 'acesso'],
    noite: 1,
    nobreak: true,
    feeds: [3, 7],
    rotulos: 'energia',
  },
  projeto: {
    vista: { alvo: [3, 4, 7], raio: 186, azimute: 32, elevacao: 36, deslocar: 0.15 },
    vistaCel: { alvo: [0, 2, 2], raio: 205, azimute: 36, elevacao: 38 },
    camadas: ['cameras', 'acesso', 'interfonia', 'energia'],
    feeds: [],
    rotulos: 'zonas',
  },
};
const E = ESTADOS[nome];

/* chips das camadas */
document.getElementById('chips').innerHTML = CAMADAS.map((c) =>
  `<span class="chip" style="--cor: var(--c-${c.id})" aria-pressed="${E.camadas.includes(c.id)}">${ic(c.icone)}${c.nome}</span>`).join('');

/* lista de câmeras (alternativa acessível ao toque na maquete) */
document.getElementById('lista-cams').innerHTML = CAMERAS.map((c) =>
  `<button type="button" aria-pressed="${c.id === E.selecionada}"><b>${String(c.id).padStart(2, '0')}</b>${c.nome}</button>`).join('');

/* monitor */
const grade = document.getElementById('grade');
const hora = ['19:42:07', '19:42:07', '19:42:08', '19:42:07'];
grade.classList.toggle('uma', E.feeds.length === 1);
grade.innerHTML = E.feeds.map((id, i) => {
  const cam = CAMERAS.find((c) => c.id === id);
  return `<div class="feed${id === E.selecionada ? ' sel' : ''}" data-feed="${id}">
    <span class="rot">CAM ${String(id).padStart(2, '0')} · ${cam.nome}</span>${E.noite ? '<span class="ir">IR</span>' : ''}
    <span class="hora">30/09/2026 ${hora[i % 4]}</span><span class="rec">REC</span></div>`;
}).join('');
document.getElementById('monitor').hidden = E.feeds.length === 0;
document.getElementById('monitor-info').textContent = E.feeds.length > 1 ? `${E.feeds.length} de ${CAMERAS.length} câmeras · simulação` : 'Simulação';
document.getElementById('monitor-pe').textContent = E.noite
  ? 'À noite, a imagem padrão é em preto e branco. Imagem colorida à noite: sob orçamento.'
  : E.feeds.length === 1 ? 'A imagem sai da própria maquete, do ponto onde a câmera está.' : '';

/* maquete */
const m = criarMaquete(document.getElementById('maquete'), { dpr: Math.min(devicePixelRatio, 2) });
for (const c of Object.keys(m.estado.camadas)) m.estado.camadas[c] = E.camadas.includes(c);
Object.assign(m.estado, {
  realce: E.realce ?? null,
  pontosCegos: Boolean(E.pontosCegos),
  noite: E.noite ?? 0,
  nobreak: E.nobreak ?? true,
  visitante: Boolean(E.visitante),
  selecionada: E.selecionada ?? null,
  feeds: [...grade.querySelectorAll('[data-feed]')].map((el) => ({ id: Number(el.dataset.feed), el })),
  paineis: E.feeds.length ? [document.getElementById('monitor')] : [],
});
m.aplicar();
m.posicionar(celular ? { ...E.vistaCel, deslocar: 0 } : E.vista);

await document.fonts.ready;
m.renderizar(1.35);

/* rótulos sobre a maquete */
const camada = document.getElementById('rotulos');
const bloqueios = [document.getElementById('monitor'), ...document.querySelectorAll('.painel')]
  .filter((el) => el.offsetParent !== null || getComputedStyle(el).position === 'fixed')
  .map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0);
const por = (x, y, z, html, classe = 'zona', estilo = '') => {
  const p = m.naTela(x, y, z);
  if (bloqueios.some((r) => p.x > r.left - 40 && p.x < r.right + 40 && p.y > r.top - 10 && p.y < r.bottom + 30)) return;
  camada.insertAdjacentHTML('beforeend', `<div class="${classe}" style="left:${p.x}px;top:${p.y}px;${estilo}">${html}</div>`);
};
const etiqueta = (x, y, z, cor, icone, titulo, sub) => por(x, y, z, `${ic(icone)}<div><b>${titulo}</b><span>${sub}</span></div>`, 'etiqueta', `--cor:${cor}`);

if (E.rotulos === 'zonas' && !celular) {
  por(-19, 23.5, -13.5, 'Bloco A');
  por(11, 23.5, -13.5, 'Bloco B');
  por(-5.3, 4.2, 20.5, 'Portaria');
  por(19, 2.6, 10.5, 'Garagem');
  por(-3, 1, 0, 'Piscina');
  por(-22.5, 5.2, 0.5, 'Salão de festas');
  por(21.8, 4.4, -0.8, 'Playground');
}
if (E.rotulos === 'cameras') {
  for (const c of CAMERAS) por(c.x, c.y + 1.2, c.z, String(c.id).padStart(2, '0'), `cam${c.id === E.selecionada ? ' sel' : ''}`);
}
if (E.rotulos === 'acesso') {
  etiqueta(-3.2, 3.4, 24.6, '#ffb070', 'user-check', 'Visitante no portão', 'Aguardando autorização');
  etiqueta(-12, 11, 5, 'var(--c-interfonia)', 'phone', 'Interfonia', 'Portaria chamando o Bloco A');
  if (!celular) etiqueta(-0.75, 2.4, 22.45, 'var(--c-acesso)', 'scan-face', 'Leitor facial', 'Moradores cadastrados');
}
if (E.rotulos === 'energia') {
  etiqueta(-7, 3, 15.8, 'var(--c-energia)', 'battery-charging', 'Nobreak segurando', 'Quadro técnico');
  if (!celular) etiqueta(9.8, 6.2, 6.2, 'var(--c-cameras)', 'cctv', 'Câmeras gravando', 'Ligado no nobreak');
}
window.__pronto = true;
