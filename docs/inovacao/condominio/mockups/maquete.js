/**
 * PROTÓTIPO da maquete 3D do Condomínio Evoluído (mockup, não é o site).
 *
 * Serve para gerar as imagens de "como ficaria" antes de construir a página.
 * No site, estes dados e contas vão para src/lib/condominio/ (TypeScript, sem DOM, com testes)
 * e o Three.js sai do próprio build (nada de CDN). Aqui ele vem do import map da página.
 *
 * Unidades em metros. Eixo Y para cima; a rua fica em z > 22 (frente do condomínio).
 * "rumo" das câmeras em graus: 0 = para a rua (+z), 90 = para a direita (+x), 180 = fundos.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* ---------------------------------------------------------------- dados */

export const COR = {
  fundo: 0x020710,
  tabuleiro: 0x0a1524,
  borda: 0x6de9f6,
  gramado: 0x0d231f,
  piso: 0x16263a,
  rua: 0x0a121c,
  calcada: 0x1a2a3d,
  predio: 0x1c3452,
  laje: 0x33506f,
  cobertura: 0x14243a,
  muro: 0x1c2f47,
  muroTopo: 0x34506e,
  vidroEscuro: 0x0a1523,
  janela: 0xffb070,
  janelaFria: 0xd4ecff,
  piscina: 0x0b9fc4,
  deck: 0x223851,
  areia: 0x3a3a33,
  arvores: [0x1b4a3c, 0x245c48, 0x173f33],
  tronco: 0x3b2f28,
  corpoCamera: 0xe8eef5,
  // uma cor por camada (a mesma dos botões da página)
  cameras: 0x6de9f6,
  acesso: 0x3be38a,
  interfonia: 0x8aa8ff,
  rede: 0x09a0f6,
  energia: 0xff6a00,
  alarme: 0xffc233,
};

export const LOTE = { x0: -30, x1: 30, z0: -22, z1: 22 };
const TABULEIRO = { x0: -36, x1: 36, z0: -27, z1: 31 };
const PORTAO_VEICULOS = { x0: 2, x1: 9 };
const PORTAO_PEDESTRES = { x0: -2.5, x1: -1.1 };

export const PREDIOS = [
  { id: 'bloco-a', nome: 'Bloco A', x0: -26, x1: -12, z0: -19, z1: -8, andares: 6, pe: 3 },
  { id: 'bloco-b', nome: 'Bloco B', x0: 4, x1: 18, z0: -19, z1: -8, andares: 6, pe: 3 },
  { id: 'salao', nome: 'Salão de festas', x0: -27, x1: -18, z0: -3, z1: 4, andares: 1, pe: 4.2 },
  { id: 'portaria', nome: 'Portaria', x0: -8, x1: -2.6, z0: 18.6, z1: 22.4, andares: 1, pe: 3.2 },
  { id: 'tecnico', nome: 'Quadro técnico', x0: -8, x1: -4.4, z0: 15.2, z1: 18.6, andares: 1, pe: 2.8 },
];

export const CAMERAS = [
  { id: 1, nome: 'Portões, lado da rua', x: 9.7, y: 3.0, z: 22.6, rumo: 276, abertura: 64, alcance: 17 },
  { id: 2, nome: 'Entrada de pedestres', x: 1.4, y: 3.2, z: 17.2, rumo: 330, abertura: 78, alcance: 9 },
  { id: 3, nome: 'Garagem', x: 9.8, y: 4.6, z: 6.2, rumo: 50, abertura: 84, alcance: 23 },
  { id: 4, nome: 'Garagem, fundo', x: 28.7, y: 4.2, z: 21.5, rumo: 226, abertura: 76, alcance: 21 },
  { id: 5, nome: 'Perímetro dos fundos', x: -29.3, y: 4.2, z: -21.3, rumo: 80, abertura: 56, alcance: 30 },
  { id: 6, nome: 'Perímetro lateral', x: 29.3, y: 4.2, z: -21.3, rumo: 352, abertura: 56, alcance: 30 },
  { id: 7, nome: 'Piscina', x: -17.6, y: 3.4, z: 0.5, rumo: 90, abertura: 78, alcance: 21 },
  { id: 8, nome: 'Playground', x: 13.6, y: 4.2, z: 4.6, rumo: 128, abertura: 72, alcance: 15 },
];

const LAZER = {
  piscina: { x0: -9, x1: 3, z0: -2.6, z1: 2.6 },
  deck: { x0: -11.5, x1: 5.5, z0: -4.6, z1: 4.6 },
  playground: { x0: 17, x1: 26.5, z0: -4.5, z1: 3 },
};

// Áreas calçadas (o resto do lote é gramado).
const PISOS = [
  { x0: 2, x1: 9, z0: 5.5, z1: 22 }, // rua interna, do portão de veículos
  { x0: 9, x1: 28.6, z0: 6.5, z1: 20.8 }, // estacionamento
  { x0: -12.5, x1: 2, z0: 14.5, z1: 22 }, // frente da portaria
  { x0: -2.6, x1: -0.6, z0: 4.6, z1: 14.5 }, // caminho de pedestres
  { x0: -27, x1: 19, z0: -7.4, z1: -5.2 }, // calçada dos blocos
  { x0: -0.9, x1: 0.9, z0: -5.2, z1: -4.6 },
];

const ARVORES = (() => {
  const lista = [];
  for (let x = -27; x <= 27; x += 4.6) if (x < -12.5 || (x > -11 && x < 3.5) || x > 18.5) lista.push([x, -20.6, 1]);
  for (let z = -16; z <= 14; z += 4.4) lista.push([-28.6, z, (z % 2 ? 0.9 : 1.1)]);
  for (let z = -18; z <= 4; z += 4.4) lista.push([28.6, z, 1]);
  lista.push([-14, 7, 1.3], [-9, 9.5, 1], [-20, 9, 1.2], [-24, 13, 1], [-16, 12.5, 0.9], [6, 1.5, 1], [10, -2.5, 1.2], [14.5, -4.5, 0.9], [-14.5, -3, 0.8]);
  return lista;
})();

const CARROS = [
  [13.2, 9.3, 0x2b4058], [18.4, 9.3, 0x5c6c7e], [21, 9.3, 0x1f2d3e], [26.2, 9.3, 0x7a4a2e],
  [15.8, 18, 0x3f5a48], [23.6, 18, 0x44546a], [10.6, 18, 0x6b7280],
];

/* ------------------------------------------------ cobertura (2D, planta) */

function segmentosObstaculo() {
  const seg = [];
  const ret = (r) => {
    seg.push([r.x0, r.z0, r.x1, r.z0], [r.x1, r.z0, r.x1, r.z1], [r.x1, r.z1, r.x0, r.z1], [r.x0, r.z1, r.x0, r.z0]);
  };
  PREDIOS.forEach(ret);
  // Muro do lote, com as aberturas dos portões (a grade deixa ver).
  seg.push([LOTE.x0, LOTE.z0, LOTE.x1, LOTE.z0], [LOTE.x1, LOTE.z0, LOTE.x1, LOTE.z1], [LOTE.x0, LOTE.z1, LOTE.x0, LOTE.z0]);
  seg.push([LOTE.x0, LOTE.z1, -8, LOTE.z1], [PORTAO_PEDESTRES.x1, LOTE.z1, PORTAO_VEICULOS.x0, LOTE.z1], [PORTAO_VEICULOS.x1, LOTE.z1, LOTE.x1, LOTE.z1]);
  // Fim do tabuleiro (a rua acaba aqui).
  seg.push([TABULEIRO.x0, TABULEIRO.z1, TABULEIRO.x1, TABULEIRO.z1], [TABULEIRO.x0, TABULEIRO.z0, TABULEIRO.x0, TABULEIRO.z1], [TABULEIRO.x1, TABULEIRO.z0, TABULEIRO.x1, TABULEIRO.z1]);
  return seg;
}

/** Polígono do que a câmera enxerga no chão: raios dentro da abertura, parando no primeiro obstáculo. */
export function campoDeVisao(cam, raios = 72) {
  const seg = segmentosObstaculo();
  const pontos = [];
  for (let i = 0; i <= raios; i++) {
    const ang = THREE.MathUtils.degToRad(cam.rumo - cam.abertura / 2 + (cam.abertura * i) / raios);
    const dx = Math.sin(ang);
    const dz = Math.cos(ang);
    let t = cam.alcance;
    for (const [ax, az, bx, bz] of seg) {
      const ex = bx - ax;
      const ez = bz - az;
      const den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-9) continue;
      const u = ((ax - cam.x) * ez - (az - cam.z) * ex) / den;
      const v = ((ax - cam.x) * dz - (az - cam.z) * dx) / den;
      if (u > 0.05 && v >= 0 && v <= 1 && u < t) t = u;
    }
    pontos.push([cam.x + dx * t, cam.z + dz * t]);
  }
  return pontos;
}

/* ------------------------------------------------------------- materiais */

const padrao = (cor, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.86, metalness: 0.04, ...extra });
const brilho = (cor, forca = 2.4) => new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(forca) });

const VERTICE_CHAO = /* glsl */ `
  varying vec2 vXZ;
  void main() {
    vec4 m = modelMatrix * vec4(position, 1.0);
    vXZ = m.xz;
    gl_Position = projectionMatrix * viewMatrix * m;
  }`;

function materialCampo(cam, cor) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { cor: { value: new THREE.Color(cor) }, origem: { value: new THREE.Vector2(cam.x, cam.z) }, alcance: { value: cam.alcance }, forca: { value: 0.3 } },
    vertexShader: VERTICE_CHAO,
    fragmentShader: /* glsl */ `
      uniform vec3 cor; uniform vec2 origem; uniform float alcance; uniform float forca;
      varying vec2 vXZ;
      void main() {
        float d = distance(vXZ, origem) / alcance;
        float a = forca * (0.18 + 0.82 * pow(1.0 - clamp(d, 0.0, 1.0), 1.4));
        float aneis = smoothstep(0.035, 0.0, abs(fract(d * 5.0) - 0.5) - 0.46) * 0.35;
        gl_FragColor = vec4(cor * (a + aneis * forca), 1.0);
      }`,
  });
}

function materialFeixe(cam, cor) {
  // "Tenda" de luz da lente até o chão: some perto do chão para parecer volume.
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { cor: { value: new THREE.Color(cor) }, altura: { value: cam.y }, forca: { value: 0.22 } },
    vertexShader: /* glsl */ `
      varying float vY;
      void main() { vec4 m = modelMatrix * vec4(position, 1.0); vY = m.y; gl_Position = projectionMatrix * viewMatrix * m; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 cor; uniform float altura; uniform float forca; varying float vY;
      void main() { float t = clamp(vY / altura, 0.0, 1.0); gl_FragColor = vec4(cor * forca * (0.15 + 0.85 * t), 1.0); }`,
  });
}

function materialFluxo(cor, forca = 3.2, velocidade = 1) {
  // Tubo com pulsos correndo (dados na rede, energia no cabo).
  return new THREE.ShaderMaterial({
    uniforms: { cor: { value: new THREE.Color(cor) }, tempo: { value: 0 }, forca: { value: forca }, vel: { value: velocidade }, liga: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 cor; uniform float tempo; uniform float forca; uniform float vel; uniform float liga; varying vec2 vUv;
      void main() {
        float pulso = smoothstep(0.82, 1.0, fract(vUv.x * 7.0 - tempo * vel));
        vec3 base = cor * (0.55 + pulso * 1.6) * forca * liga;
        gl_FragColor = vec4(base + vec3(0.02, 0.03, 0.05) * (1.0 - liga), 1.0);
      }`,
  });
}

/* ------------------------------------------------------------ construção */

const EXPLICATIVO = 1; // camada dos desenhos explicativos: só a câmera principal enxerga
function explicativo(...objetos) {
  for (const o of objetos) o.traverse((filho) => filho.layers.set(EXPLICATIVO));
  return objetos;
}

function caixa(l, a, p, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(l, a, p), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function plano(r, y, mat) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r.x1 - r.x0, r.z1 - r.z0), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set((r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2);
  m.receiveShadow = true;
  return m;
}

function tubo(pontos, raio, mat) {
  const curva = new THREE.CatmullRomCurve3(pontos.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'catmullrom', 0.02);
  return new THREE.Mesh(new THREE.TubeGeometry(curva, Math.max(24, pontos.length * 16), raio, 6, false), mat);
}

function construirPredio(p, grupoJanelas) {
  const g = new THREE.Group();
  const l = p.x1 - p.x0;
  const q = p.z1 - p.z0;
  const h = p.andares * p.pe;
  const cx = (p.x0 + p.x1) / 2;
  const cz = (p.z0 + p.z1) / 2;
  g.add(caixa(l, h, q, padrao(COR.predio), cx, h / 2, cz));
  // lajes aparentes a cada andar e platibanda
  for (let i = 1; i < p.andares; i++) g.add(caixa(l + 0.35, 0.22, q + 0.35, padrao(COR.laje), cx, i * p.pe, cz));
  g.add(caixa(l + 0.2, 0.9, q + 0.2, padrao(COR.laje), cx, h + 0.45, cz));
  g.add(caixa(l - 0.6, 0.12, q - 0.6, padrao(COR.cobertura), cx, h + 0.62, cz));
  if (p.andares > 2) {
    g.add(caixa(3.2, 2.2, 2.6, padrao(COR.predio), cx - l * 0.2, h + 1.6, cz)); // casa de máquinas
    g.add(caixa(2.4, 1.6, 2.4, padrao(COR.laje), cx + l * 0.22, h + 1.3, cz + 1)); // caixa d'água
  }
  // janelas (nas quatro faces)
  const porAndar = (lado) => Math.max(2, Math.floor(lado / 2.3));
  for (let andar = 0; andar < p.andares; andar++) {
    const y = andar * p.pe + p.pe * 0.55;
    const alt = p.andares > 1 ? 1.35 : Math.min(2.4, p.pe * 0.55);
    for (const face of ['n', 's', 'l', 'o']) {
      const lado = face === 'n' || face === 's' ? l : q;
      const n = porAndar(lado);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n - 0.5;
        let x = cx;
        let z = cz;
        let rot = 0;
        if (face === 's') { x = cx + t * lado; z = p.z1 + 0.02; }
        if (face === 'n') { x = cx + t * lado; z = p.z0 - 0.02; rot = Math.PI; }
        if (face === 'l') { x = p.x1 + 0.02; z = cz + t * lado; rot = Math.PI / 2; }
        if (face === 'o') { x = p.x0 - 0.02; z = cz + t * lado; rot = -Math.PI / 2; }
        grupoJanelas.push({ x, y, z, rot, alt, larg: p.andares > 1 ? 1.25 : 1.9, predio: p.id });
      }
    }
  }
  return g;
}

function construirCamera(cam) {
  const g = new THREE.Group();
  const escala = 1.7; // maior que o real, para ser visto na maquete
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.72), padrao(COR.corpoCamera, { roughness: 0.4 }));
  const lente = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16), padrao(0x0b1220, { roughness: 0.2 }));
  lente.rotation.x = Math.PI / 2;
  lente.position.z = 0.38;
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), brilho(COR.cameras, 5));
  led.position.set(0.1, 0.1, 0.37);
  const braco = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.5), padrao(0x9fb0c2));
  braco.position.set(0, 0.12, -0.45);
  const cabeca = new THREE.Group();
  cabeca.add(corpo, lente, led, braco);
  cabeca.rotation.x = THREE.MathUtils.degToRad(18);
  cabeca.scale.setScalar(escala);
  g.add(cabeca);
  g.position.set(cam.x, cam.y, cam.z);
  g.rotation.y = THREE.MathUtils.degToRad(cam.rumo);
  // poste quando a câmera não está presa em parede
  if (cam.id === 3 || cam.id === 8 || cam.id === 2) {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, cam.y, 8), padrao(0x7f93a8));
    poste.position.set(cam.x, cam.y / 2, cam.z);
    poste.castShadow = true;
    return [g, poste];
  }
  return [g];
}

/* ----------------------------------------------------------------- cena */

export function criarMaquete(canvas, { dpr = 1 } = {}) {
  const renderizador = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderizador.setPixelRatio(dpr);
  renderizador.outputColorSpace = THREE.SRGBColorSpace;
  renderizador.toneMapping = THREE.ACESFilmicToneMapping;
  renderizador.toneMappingExposure = 1.05;
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = THREE.PCFSoftShadowMap;

  const cena = new THREE.Scene();
  cena.background = new THREE.Color(COR.fundo);
  cena.fog = new THREE.Fog(COR.fundo, 150, 290);

  const luzCeu = new THREE.HemisphereLight(0x3a5f8f, 0x020710, 1.15);
  const lua = new THREE.DirectionalLight(0xa9c8ff, 1.5);
  lua.position.set(-45, 70, 35);
  lua.castShadow = true;
  lua.shadow.mapSize.set(2048, 2048);
  Object.assign(lua.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 10, far: 200 });
  lua.shadow.bias = -0.0004;
  lua.shadow.radius = 4;
  const preenchimento = new THREE.DirectionalLight(0x9fd6ff, 0.35);
  preenchimento.position.set(40, 20, 60);
  cena.add(luzCeu, lua, preenchimento);

  const raiz = new THREE.Group();
  cena.add(raiz);

  /* tabuleiro, rua, lote */
  const tab = caixa(TABULEIRO.x1 - TABULEIRO.x0, 1.4, TABULEIRO.z1 - TABULEIRO.z0, padrao(COR.tabuleiro), 0, -0.7, (TABULEIRO.z0 + TABULEIRO.z1) / 2);
  tab.castShadow = false;
  raiz.add(tab);
  const bordaGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(TABULEIRO.x0, 0.01, TABULEIRO.z0), new THREE.Vector3(TABULEIRO.x1, 0.01, TABULEIRO.z0),
    new THREE.Vector3(TABULEIRO.x1, 0.01, TABULEIRO.z1), new THREE.Vector3(TABULEIRO.x0, 0.01, TABULEIRO.z1),
  ]);
  raiz.add(new THREE.LineLoop(bordaGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(COR.borda).multiplyScalar(0.9) })));
  // halo embaixo do tabuleiro
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec2 vUv; void main(){ float d = distance(vUv, vec2(0.5)); gl_FragColor = vec4(vec3(0.03,0.12,0.24), smoothstep(0.5, 0.0, d) * 0.9); }`,
  }));
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -3;
  raiz.add(halo);

  raiz.add(plano({ x0: TABULEIRO.x0, x1: TABULEIRO.x1, z0: 24.2, z1: TABULEIRO.z1 }, 0.01, padrao(COR.rua)));
  raiz.add(plano({ x0: TABULEIRO.x0, x1: TABULEIRO.x1, z0: LOTE.z1, z1: 24.2 }, 0.03, padrao(COR.calcada)));
  for (let x = TABULEIRO.x0 + 2; x < TABULEIRO.x1 - 2; x += 5) raiz.add(plano({ x0: x, x1: x + 2.4, z0: 27.5, z1: 27.75 }, 0.02, padrao(0x3a4f66)));
  raiz.add(plano(LOTE, 0.02, padrao(COR.gramado)));
  for (const p of PISOS) raiz.add(plano(p, 0.035, padrao(COR.piso)));
  // vagas
  for (let i = 0; i < 7; i++) {
    const x = 10.4 + i * 2.6;
    raiz.add(plano({ x0: x, x1: x + 0.08, z0: 7, z1: 11.6 }, 0.045, padrao(0x6f8aa6)));
    raiz.add(plano({ x0: x, x1: x + 0.08, z0: 15.8, z1: 20.4 }, 0.045, padrao(0x6f8aa6)));
  }

  /* muro e portões */
  const matMuro = padrao(COR.muro);
  const matTopo = padrao(COR.muroTopo);
  const muro = (x0, z0, x1, z1) => {
    const l = Math.hypot(x1 - x0, z1 - z0);
    const m = caixa(l, 1.8, 0.28, matMuro, (x0 + x1) / 2, 0.9, (z0 + z1) / 2);
    m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    const t = caixa(l, 0.1, 0.4, matTopo, (x0 + x1) / 2, 1.85, (z0 + z1) / 2);
    t.rotation.y = m.rotation.y;
    raiz.add(m, t);
  };
  muro(LOTE.x0, LOTE.z0, LOTE.x1, LOTE.z0);
  muro(LOTE.x0, LOTE.z0, LOTE.x0, LOTE.z1);
  muro(LOTE.x1, LOTE.z0, LOTE.x1, LOTE.z1);
  muro(LOTE.x0, LOTE.z1, -8, LOTE.z1);
  muro(PORTAO_PEDESTRES.x1, LOTE.z1, PORTAO_VEICULOS.x0, LOTE.z1);
  muro(PORTAO_VEICULOS.x1, LOTE.z1, LOTE.x1, LOTE.z1);
  const grade = (x0, x1, altura) => {
    const n = Math.round((x1 - x0) / 0.32);
    const barras = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, altura, 0.06), padrao(0x5d7a96, { roughness: 0.5 }), n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) barras.setMatrixAt(i, m.makeTranslation(x0 + 0.16 + i * 0.32, altura / 2, LOTE.z1));
    barras.castShadow = true;
    raiz.add(barras, caixa(x1 - x0, 0.1, 0.12, padrao(0x5d7a96), (x0 + x1) / 2, altura, LOTE.z1));
  };
  grade(PORTAO_VEICULOS.x0, PORTAO_VEICULOS.x1, 1.9);
  grade(PORTAO_PEDESTRES.x0, PORTAO_PEDESTRES.x1, 2.1);

  /* prédios, janelas, sombra de contato */
  const janelas = [];
  for (const p of PREDIOS) {
    raiz.add(construirPredio(p, janelas));
    const sombra = new THREE.Mesh(new THREE.PlaneGeometry(p.x1 - p.x0 + 3, p.z1 - p.z0 + 3), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec2 vUv; void main(){ vec2 d = abs(vUv - 0.5) * 2.0; float a = (1.0 - smoothstep(0.7, 1.0, max(d.x, d.y))); gl_FragColor = vec4(0.0, 0.0, 0.0, a * 0.55); }`,
    }));
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.set((p.x0 + p.x1) / 2, 0.05, (p.z0 + p.z1) / 2);
    raiz.add(sombra);
  }
  const geoJanela = new THREE.PlaneGeometry(1, 1);
  const matJanela = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const malhaJanelas = new THREE.InstancedMesh(geoJanela, matJanela, janelas.length);
  const acesas = [];
  {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    let semente = 7;
    const aleatorio = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
    janelas.forEach((j, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), j.rot);
      s.set(j.larg, j.alt, 1);
      m.compose(new THREE.Vector3(j.x, j.y, j.z), q, s);
      malhaJanelas.setMatrixAt(i, m);
      const r = aleatorio();
      const acesa = j.predio === 'portaria' || j.predio === 'tecnico' || j.predio === 'salao' ? r < 0.9 : r < 0.46;
      const fria = r < 0.1;
      const forca = 0.75 + aleatorio() * 1.25;
      const cor = acesa ? new THREE.Color(fria ? COR.janelaFria : COR.janela).multiplyScalar(forca) : new THREE.Color(COR.vidroEscuro);
      acesas.push({ cor, apagada: new THREE.Color(COR.vidroEscuro) });
      malhaJanelas.setColorAt(i, cor);
    });
  }
  raiz.add(malhaJanelas);

  /* lazer */
  raiz.add(plano(LAZER.deck, 0.05, padrao(COR.deck)));
  const agua = plano(LAZER.piscina, 0.08, new THREE.MeshBasicMaterial({ color: new THREE.Color(COR.piscina).multiplyScalar(1.5) }));
  raiz.add(agua);
  raiz.add(plano(LAZER.playground, 0.05, padrao(COR.areia)));
  {
    const pg = LAZER.playground;
    const cx = (pg.x0 + pg.x1) / 2;
    const cz = (pg.z0 + pg.z1) / 2;
    const torre = caixa(2, 2.4, 2, padrao(0x2f4f6b), cx - 2, 1.2, cz);
    const telhado = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.2, 4), padrao(0xa3542a));
    telhado.position.set(cx - 2, 3, cz);
    telhado.rotation.y = Math.PI / 4;
    const escorregador = caixa(0.9, 0.12, 3.6, padrao(0x3d7fa0), cx - 2, 1.2, cz + 2.4);
    escorregador.rotation.x = -0.55;
    const balanco = caixa(3.2, 0.12, 0.12, padrao(0x7f93a8), cx + 2.5, 2.4, cz - 1);
    raiz.add(torre, telhado, escorregador, balanco);
    for (const dx of [-1.5, 1.5]) raiz.add(caixa(0.1, 2.4, 0.1, padrao(0x7f93a8), cx + 2.5 + dx, 1.2, cz - 1));
  }
  // guarda-sóis e espreguiçadeiras no deck
  for (const [x, z] of [[-10.3, -3.6], [4.3, 3.7], [4.3, -3.7]]) {
    const haste = caixa(0.07, 2.2, 0.07, padrao(0x9fb0c2), x, 1.1, z);
    const guarda = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.5, 8), padrao(0xd0a070));
    guarda.position.set(x, 2.3, z);
    raiz.add(haste, guarda);
  }

  /* árvores */
  {
    const troncos = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 1.6, 6), padrao(COR.tronco), ARVORES.length);
    const copas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), padrao(0xffffff, { flatShading: true }), ARVORES.length);
    const m = new THREE.Matrix4();
    ARVORES.forEach(([x, z, s], i) => {
      troncos.setMatrixAt(i, m.makeTranslation(x, 0.8, z));
      m.compose(new THREE.Vector3(x, 1.6 + 1.2 * s, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3 * i, 0.7 * i, 0)), new THREE.Vector3(1.35 * s, 1.55 * s, 1.35 * s));
      copas.setMatrixAt(i, m);
      copas.setColorAt(i, new THREE.Color(COR.arvores[i % 3]));
    });
    troncos.castShadow = copas.castShadow = true;
    raiz.add(troncos, copas);
  }

  /* carros */
  for (const [x, z, cor] of CARROS) {
    raiz.add(caixa(1.8, 0.7, 4.1, padrao(cor, { roughness: 0.45, metalness: 0.3 }), x, 0.55, z));
    raiz.add(caixa(1.55, 0.55, 2.1, padrao(0x0c1522, { roughness: 0.2, metalness: 0.5 }), x, 1.15, z - 0.2));
  }

  /* postes de luz */
  const lampadas = [];
  for (const [x, z] of [[5.5, 8], [5.5, 16], [18, 13.5], [26, 13.5], [-5, 10], [-5, -1], [-14, -6.3], [10, -6.3], [-24, 22.9], [-12, 22.9], [14, 22.9], [26, 22.9]]) {
    raiz.add(caixa(0.12, 4.6, 0.12, padrao(0x6f8399), x, 2.3, z));
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), brilho(0xffd49a, 3.2));
    l.position.set(x, 4.7, z);
    raiz.add(l);
    lampadas.push(l);
  }

  /* pessoas (aparecem conforme o estado) */
  const pessoa = (x, z, cor = 0xd6e2ef) => {
    const g = new THREE.Group();
    const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.9, 4, 10), padrao(cor, { roughness: 0.6 }));
    corpo.position.y = 0.75;
    const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), padrao(0xe9d2bd, { roughness: 0.7 }));
    cabeca.position.y = 1.55;
    corpo.castShadow = cabeca.castShadow = true;
    g.add(corpo, cabeca);
    g.position.set(x, 0, z);
    g.scale.setScalar(1.15);
    return g;
  };
  const visitante = pessoa(-1.8, 23.5, 0x9fc3e6);
  const moradores = [pessoa(-6, 3.4, 0xcfd8e3), pessoa(0.8, -3.6, 0xe0b27a), pessoa(20, -1, 0xd98c6a)];
  raiz.add(visitante, ...moradores);

  /* ----------------------------------------------- camadas do projeto */
  const camadas = { cameras: new THREE.Group(), acesso: new THREE.Group(), interfonia: new THREE.Group(), rede: new THREE.Group(), energia: new THREE.Group(), alarme: new THREE.Group() };
  Object.values(camadas).forEach((g) => raiz.add(g));
  const materiaisFluxo = [];
  const fluxo = (cor, forca, vel) => { const m = materialFluxo(cor, forca, vel); materiaisFluxo.push(m); return m; };

  // Câmeras: corpo, campo de visão no chão, feixe de luz
  const campos = [];
  for (const cam of CAMERAS) {
    construirCamera(cam).forEach((o) => camadas.cameras.add(o));
    const pts = campoDeVisao(cam);
    const forma = new THREE.BufferGeometry();
    const pos = [cam.x, 0.06 + cam.id * 0.004, cam.z];
    const idx = [];
    pts.forEach(([x, z]) => pos.push(x, 0.06 + cam.id * 0.004, z));
    for (let i = 1; i < pts.length; i++) idx.push(0, i, i + 1);
    forma.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    forma.setIndex(idx);
    const matCampo = materialCampo(cam, COR.cameras);
    const campo = new THREE.Mesh(forma, matCampo);
    const tenda = new THREE.BufferGeometry();
    const tpos = [cam.x, cam.y, cam.z];
    pts.forEach(([x, z]) => tpos.push(x, 0.06, z));
    tenda.setAttribute('position', new THREE.Float32BufferAttribute(tpos, 3));
    tenda.setIndex(idx);
    const matFeixe = materialFeixe(cam, COR.cameras);
    const feixe = new THREE.Mesh(tenda, matFeixe);
    const contorno = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(cam.x, cam.y, cam.z), ...pts.map(([x, z]) => new THREE.Vector3(x, 0.08, z)), new THREE.Vector3(cam.x, cam.y, cam.z)]),
      new THREE.LineBasicMaterial({ color: new THREE.Color(COR.cameras).multiplyScalar(0.6), transparent: true, opacity: 0.55 }));
    camadas.cameras.add(...explicativo(campo, feixe, contorno));
    campos.push({ cam, pts, matCampo, matFeixe, contorno });
  }

  // Pontos cegos: áreas de circulação (calçadas, garagem, lazer) que nenhuma câmera vê (listrado).
  const cegos = (() => {
    const W = 1200;
    const H = Math.round((W * (LOTE.z1 - LOTE.z0)) / (LOTE.x1 - LOTE.x0));
    const tela = document.createElement('canvas');
    tela.width = W;
    tela.height = H;
    const c = tela.getContext('2d');
    const px = (x) => ((x - LOTE.x0) / (LOTE.x1 - LOTE.x0)) * W;
    const pz = (z) => ((z - LOTE.z0) / (LOTE.z1 - LOTE.z0)) * H;
    // 1) listras só nas áreas de circulação
    c.save();
    c.beginPath();
    for (const r of [...PISOS, LAZER.deck, LAZER.playground]) c.rect(px(r.x0), pz(r.z0), px(r.x1) - px(r.x0), pz(r.z1) - pz(r.z0));
    c.clip();
    c.fillStyle = 'rgba(255,106,0,0.14)';
    c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,138,43,0.7)';
    c.lineWidth = 2.5;
    for (let d = -H; d < W; d += 18) { c.beginPath(); c.moveTo(d, H); c.lineTo(d + H, 0); c.stroke(); }
    c.restore();
    // 2) tira o que alguma câmera vê
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = '#000';
    for (const { pts, cam } of campos) {
      c.beginPath();
      c.moveTo(px(cam.x), pz(cam.z));
      pts.forEach(([x, z]) => c.lineTo(px(x), pz(z)));
      c.closePath();
      c.fill();
    }
    for (const p of PREDIOS) c.fillRect(px(p.x0) - 2, pz(p.z0) - 2, px(p.x1) - px(p.x0) + 4, pz(p.z1) - pz(p.z0) + 4);
    const tex = new THREE.CanvasTexture(tela);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const m = plano(LOTE, 0.1, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.receiveShadow = false;
    m.visible = false;
    raiz.add(...explicativo(m));
    return m;
  })();

  // Acesso facial: leitor no portão de pedestres + portões destacados
  const leitor = new THREE.Group();
  leitor.add(caixa(0.36, 1.5, 0.3, padrao(0x2a3d52), 0, 0.75, 0));
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.34), brilho(COR.acesso, 3));
  tela.position.set(0, 1.25, 0.16);
  leitor.add(tela);
  leitor.position.set(-0.75, 0, 22.45);
  camadas.acesso.add(leitor);
  const contornoPortao = (x0, x1, alt) => {
    const pts = [[x0, 0.1], [x0, alt], [x1, alt], [x1, 0.1]].map(([x, y]) => new THREE.Vector3(x, y, LOTE.z1 + 0.05));
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(COR.acesso).multiplyScalar(2.2) }));
  };
  camadas.acesso.add(...explicativo(contornoPortao(PORTAO_PEDESTRES.x0, PORTAO_PEDESTRES.x1, 2.2), contornoPortao(PORTAO_VEICULOS.x0, PORTAO_VEICULOS.x1, 2)));
  const halos = [];
  for (const [x, z, r] of [[-1.8, 23.5, 1.3]]) {
    const anel = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.12, 48), brilho(COR.acesso, 2.6));
    anel.rotation.x = -Math.PI / 2;
    anel.position.set(x, 0.07, z);
    camadas.acesso.add(...explicativo(anel));
    halos.push(anel);
  }

  // Interfonia: arcos da portaria até a entrada de cada bloco
  const arco = (de, para, alt) => {
    const meio = new THREE.Vector3((de[0] + para[0]) / 2, alt, (de[2] + para[2]) / 2);
    const curva = new THREE.QuadraticBezierCurve3(new THREE.Vector3(...de), meio, new THREE.Vector3(...para));
    return new THREE.Mesh(new THREE.TubeGeometry(curva, 64, 0.07, 6, false), fluxo(COR.interfonia, 2.6, 0.8));
  };
  camadas.interfonia.add(...explicativo(arco([-5.3, 3.4, 18.6], [-19, 2.5, -8], 14), arco([-5.3, 3.4, 18.6], [11, 2.5, -8], 15)));
  for (const [x, z] of [[-19, -7.6], [11, -7.6], [-5.3, 18.3]]) {
    const ponto = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), brilho(COR.interfonia, 3.5));
    ponto.position.set(x, 2.5, z);
    camadas.interfonia.add(...explicativo(ponto));
  }

  // Rede: cabos no chão de cada câmera até o quadro técnico; Wi-Fi nas áreas comuns
  const rack = [-6.2, 0.12, 15.1];
  const rotas = [
    [[9.7, 0.12, 22.3], [9.7, 0.12, 21.4], [-2.2, 0.12, 21.4], [-2.2, 0.12, 15.1], rack],
    [[1.4, 0.12, 17.2], [1.4, 0.12, 14.6], [-4.4, 0.12, 14.6], rack],
    [[9.8, 0.12, 6.2], [1.6, 0.12, 6.2], [1.6, 0.12, 14.2], [-4.4, 0.12, 14.2], rack],
    [[28.7, 0.12, 21.5], [28.7, 0.12, 21], [10, 0.12, 21], [10, 0.12, 14], [1.8, 0.12, 14], rack],
    [[-29.3, 0.12, -21.3], [-29, 0.12, -6.3], [-4, 0.12, -6.3], [-1.6, 0.12, -4.9], [-1.6, 0.12, 14.4], rack],
    [[29.3, 0.12, -21.3], [29, 0.12, -6.3], [0, 0.12, -6.3], [-1.6, 0.12, -4.9]],
    [[-17.6, 0.12, 0.5], [-13, 0.12, 0.5], [-12, 0.12, -5], [-4, 0.12, -6.1]],
    [[13.6, 0.12, 4.6], [13.6, 0.12, -5.2], [2, 0.12, -6]],
  ];
  const cabos = rotas.map((r) => tubo(r, 0.07, fluxo(COR.rede, 2.8, 1.2)));
  camadas.rede.add(...explicativo(...cabos));
  const wifi = [];
  for (const [x, z] of [[-22.5, 0.5], [-3, 0], [21.5, -0.8]]) {
    const ap = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 20), brilho(0x9ff3ff, 2.6));
    ap.position.set(x, 3.2, z);
    camadas.rede.add(ap, caixa(0.08, 3.2, 0.08, padrao(0x7f93a8), x, 1.6, z));
    for (let k = 1; k <= 3; k++) {
      const anel = new THREE.Mesh(new THREE.TorusGeometry(1.4 * k, 0.035, 6, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7fe8ff).multiplyScalar(2.2 / k), transparent: true, opacity: 0.9 / k }));
      anel.rotation.x = Math.PI / 2;
      anel.position.set(x, 3.2 - k * 0.25, z);
      camadas.rede.add(...explicativo(anel));
      wifi.push(anel);
    }
  }

  // Energia: nobreak e rack no quadro técnico, cabo laranja até portaria, portões e leitor
  const nobreak = caixa(0.9, 1.2, 0.7, brilho(COR.energia, 1.6), -7.2, 0.6, 15.8);
  const rackCaixa = caixa(0.8, 1.9, 0.7, padrao(0x1d2b3b), -5.4, 0.95, 15.8);
  const ledsRack = caixa(0.5, 0.04, 0.02, brilho(COR.rede, 4), -5.4, 1.4, 15.44);
  camadas.energia.add(nobreak, rackCaixa, ledsRack);
  const caboEnergia = [
    tubo([[-7.2, 0.14, 15.2], [-7.2, 0.14, 14.3], [-2, 0.14, 14.3], [-2, 0.14, 21.6], [-0.75, 0.14, 21.9]], 0.08, fluxo(COR.energia, 3.4, 0.7)),
    tubo([[-2, 0.14, 21.6], [5.5, 0.14, 21.6]], 0.08, fluxo(COR.energia, 3.4, 0.7)),
  ];
  camadas.energia.add(...explicativo(...caboEnergia));
  const auraNobreak = new THREE.PointLight(COR.energia, 30, 12, 2);
  auraNobreak.position.set(-7.2, 2, 14.8);
  camadas.energia.add(auraNobreak);

  // Alarme: sensores no alto do muro e zona tracejada ao longo do perímetro
  const sensores = [];
  const perimetro = [[LOTE.x0, LOTE.z0], [LOTE.x1, LOTE.z0], [LOTE.x1, LOTE.z1], [LOTE.x0, LOTE.z1]];
  for (let k = 0; k < 4; k++) {
    const [ax, az] = perimetro[k];
    const [bx, bz] = perimetro[(k + 1) % 4];
    const l = Math.hypot(bx - ax, bz - az);
    for (let d = 5; d < l - 2; d += 10) {
      const x = ax + ((bx - ax) * d) / l;
      const z = az + ((bz - az) * d) / l;
      if (k === 2 && x > -9 && x < 10) continue; // frente: portaria e portões
      const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.32), brilho(COR.alarme, 3));
      s.position.set(x, 2.35, z);
      camadas.alarme.add(...explicativo(s));
      sensores.push(s);
    }
  }
  const zona = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(
    perimetro.flatMap(([ax, az], k) => {
      const [bx, bz] = perimetro[(k + 1) % 4];
      const l = Math.hypot(bx - ax, bz - az);
      const out = [];
      for (let d = 0; d < l; d += 2.2) {
        const t0 = d / l;
        const t1 = Math.min(l, d + 1.2) / l;
        out.push(new THREE.Vector3(ax + (bx - ax) * t0, 2.05, az + (bz - az) * t0), new THREE.Vector3(ax + (bx - ax) * t1, 2.05, az + (bz - az) * t1));
      }
      return out;
    }),
  ), new THREE.LineBasicMaterial({ color: new THREE.Color(COR.alarme).multiplyScalar(1.6) }));
  camadas.alarme.add(...explicativo(zona));

  /* ------------------------------------------------ câmera principal */
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 600);
  camera.layers.enable(EXPLICATIVO);
  const alvo = new THREE.Vector3();
  let deslocamento = 0; // fração da largura: desloca a maquete para a direita da tela

  const composicao = new EffectComposer(renderizador);
  composicao.addPass(new RenderPass(cena, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.55, 0.35, 0.92);
  composicao.addPass(bloom);
  composicao.addPass(new OutputPass());

  /* ------------------------------------------------ visão das câmeras */
  const alvoTextura = () => new THREE.WebGLRenderTarget(640, 360, { type: THREE.HalfFloatType, samples: 4 });
  const cftv = CAMERAS.map((cam) => {
    const c = new THREE.PerspectiveCamera(58, 16 / 9, 0.2, 180);
    const ang = THREE.MathUtils.degToRad(cam.rumo);
    const dx = Math.sin(ang);
    const dz = Math.cos(ang);
    c.position.set(cam.x + dx * 0.9, cam.y + 0.15, cam.z + dz * 0.9);
    c.lookAt(cam.x + dx * 12, 0.2, cam.z + dz * 12);
    return { cam, camera: c, alvo: null };
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { mapa: { value: null }, tempo: { value: 0 }, ir: { value: 0 }, semSinal: { value: 0 } },
    depthTest: false,
    depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D mapa; uniform float tempo; uniform float ir; uniform float semSinal; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      void main(){
        vec2 c = vUv - 0.5; float r2 = dot(c, c);
        vec2 uv = 0.5 + c * (1.0 - 0.07 * r2);
        vec3 cor = aces(texture2D(mapa, uv).rgb * mix(2.3, 4.2, ir));
        float lum = dot(cor, vec3(0.299, 0.587, 0.114));
        vec3 dia = mix(vec3(lum), cor, 0.8);
        vec3 noite = vec3(pow(lum, 0.8) * 1.5) * vec3(0.9, 1.0, 0.94);
        cor = mix(dia, noite, ir);
        float r = hash(floor(vUv * vec2(480.0, 270.0)) + tempo) - 0.5;
        cor += r * (0.045 + 0.07 * ir);
        cor *= 0.95 + 0.05 * sin(vUv.y * 900.0);
        cor *= mix(0.5, 1.0, smoothstep(0.8, 0.2, length(c)));
        if (semSinal > 0.5) cor = vec3(0.04, 0.06, 0.09) + r * 0.22;
        gl_FragColor = vec4(pow(max(cor, 0.0), vec3(1.0 / 2.2)), 1.0);
      }`,
  }));
  quad.frustumCulled = false;
  const cenaQuad = new THREE.Scene();
  cenaQuad.add(quad);
  const quadPainel = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: { tamanho: { value: new THREE.Vector2(1, 1) }, raio: { value: 18 }, cor: { value: new THREE.Vector4(0.02, 0.047, 0.086, 0.94) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec2 tamanho; uniform float raio; uniform vec4 cor; varying vec2 vUv;
      void main(){
        vec2 p = (vUv - 0.5) * tamanho; vec2 q = abs(p) - tamanho * 0.5 + raio;
        float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - raio;
        float a = cor.a * (1.0 - smoothstep(-1.0, 0.5, d));
        gl_FragColor = vec4(pow(cor.rgb, vec3(1.0 / 2.2)), a);
      }`,
  }));
  quadPainel.frustumCulled = false;
  const cenaPainel = new THREE.Scene();
  cenaPainel.add(quadPainel);
  const cameraQuad = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /* ------------------------------------------------------------ estado */
  const estado = {
    camadas: { cameras: true, acesso: false, interfonia: false, rede: false, energia: false, alarme: false },
    realce: null, // camada em destaque (as outras ficam mais fracas)
    pontosCegos: false,
    noite: 0, // 0 = entardecer, 1 = sem energia (tudo apagado)
    nobreak: true,
    visitante: false,
    selecionada: null,
    feeds: [], // [{ id, el }]
    paineis: [], // elementos do HTML cujo fundo é pintado no canvas (para as imagens aparecerem por cima)
    ir: false,
  };

  function aplicar() {
    for (const [nome, g] of Object.entries(camadas)) g.visible = estado.camadas[nome];
    const fraco = (nome) => (estado.realce && estado.realce !== nome ? 0.35 : 1);
    for (const c of campos) {
      const sel = estado.selecionada === c.cam.id;
      c.matCampo.uniforms.forca.value = (sel ? 0.5 : 0.24) * fraco('cameras') * (estado.selecionada && !sel ? 0.6 : 1);
      c.matFeixe.uniforms.forca.value = (sel ? 0.34 : 0.07) * fraco('cameras') * (estado.selecionada && !sel ? 0.5 : 1);
      c.matCampo.uniforms.cor.value.set(sel ? 0x9ff4ff : 0x3fcfe8);
    }
    cegos.visible = estado.pontosCegos;
    const semEnergia = estado.noite > 0.5;
    const ligadoNoNobreak = semEnergia && estado.nobreak;
    // janelas, postes e piscina apagam sem energia
    acesas.forEach((a, i) => malhaJanelas.setColorAt(i, semEnergia ? a.apagada : a.cor));
    malhaJanelas.instanceColor.needsUpdate = true;
    lampadas.forEach((l) => { l.visible = !semEnergia; });
    agua.material.color.set(semEnergia ? 0x06202c : new THREE.Color(COR.piscina).multiplyScalar(1.5));
    luzCeu.intensity = semEnergia ? 0.55 : 1.15;
    lua.intensity = semEnergia ? 0.9 : 1.5;
    preenchimento.intensity = semEnergia ? 0 : 0.35;
    // sistemas: no nobreak seguem acesos; sem nobreak apagam
    const liga = !semEnergia || ligadoNoNobreak ? 1 : 0.04;
    materiaisFluxo.forEach((m) => { m.uniforms.liga.value = liga; });
    nobreak.material.color.set(new THREE.Color(COR.energia).multiplyScalar(semEnergia ? (estado.nobreak ? 2.6 : 0.08) : 1.4));
    auraNobreak.intensity = semEnergia ? (estado.nobreak ? 60 : 0) : 25;
    visitante.visible = estado.visitante;
    halos.forEach((h) => { h.visible = estado.visitante; });
    moradores.forEach((m) => { m.visible = !semEnergia; });
    estado.ir = semEnergia;
  }

  function posicionar({ alvo: a, raio, azimute, elevacao, deslocar = 0, fov = 28 }) {
    alvo.set(...a);
    const az = THREE.MathUtils.degToRad(azimute);
    const el = THREE.MathUtils.degToRad(elevacao);
    camera.position.set(alvo.x + raio * Math.cos(el) * Math.sin(az), alvo.y + raio * Math.sin(el), alvo.z + raio * Math.cos(el) * Math.cos(az));
    camera.fov = fov;
    camera.lookAt(alvo);
    deslocamento = deslocar;
  }

  function tamanho() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderizador.setSize(w, h, false);
    composicao.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    if (deslocamento) camera.setViewOffset(w, h, -deslocamento * w, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }

  function renderizar(tempo = 1.3) {
    tamanho();
    materiaisFluxo.forEach((m) => { m.uniforms.tempo.value = tempo; });
    renderizador.autoClear = true;
    composicao.render();
    // visões das câmeras, desenhadas nos retângulos do "monitor" da página
    const caixaCanvas = canvas.getBoundingClientRect();
    renderizador.autoClear = false;
    const tm = renderizador.toneMapping;
    renderizador.toneMapping = THREE.NoToneMapping;
    for (const el of estado.paineis) {
      const r = el.getBoundingClientRect();
      const x = r.left - caixaCanvas.left;
      const y = caixaCanvas.bottom - r.bottom;
      renderizador.setViewport(x, y, r.width, r.height);
      quadPainel.material.uniforms.tamanho.value.set(r.width, r.height);
      quadPainel.material.uniforms.raio.value = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      renderizador.render(cenaPainel, cameraQuad);
    }
    renderizador.toneMapping = tm;
    for (const f of estado.feeds) {
      const alvoCftv = cftv.find((c) => c.cam.id === f.id);
      if (!alvoCftv) continue;
      alvoCftv.alvo ??= alvoTextura();
      renderizador.setRenderTarget(alvoCftv.alvo);
      renderizador.clear();
      renderizador.render(cena, alvoCftv.camera);
      renderizador.setRenderTarget(null);
      const r = f.el.getBoundingClientRect();
      const x = r.left - caixaCanvas.left;
      const y = caixaCanvas.bottom - r.bottom;
      renderizador.setViewport(x, y, r.width, r.height);
      renderizador.setScissor(x, y, r.width, r.height);
      renderizador.setScissorTest(true);
      quad.material.uniforms.mapa.value = alvoCftv.alvo.texture;
      quad.material.uniforms.ir.value = estado.ir ? 1 : 0;
      quad.material.uniforms.semSinal.value = estado.noite > 0.5 && !estado.nobreak ? 1 : 0;
      quad.material.uniforms.tempo.value = tempo * 10 + f.id;
      const tm = renderizador.toneMapping;
      renderizador.toneMapping = THREE.NoToneMapping;
      renderizador.render(cenaQuad, cameraQuad);
      renderizador.toneMapping = tm;
      renderizador.setScissorTest(false);
    }
    renderizador.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    renderizador.autoClear = true;
  }

  /** Posição na tela (px) de um ponto da maquete. */
  function naTela(x, y, z) {
    const v = new THREE.Vector3(x, y, z).project(camera);
    const r = canvas.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height, visivel: v.z < 1 };
  }

  return { estado, aplicar, posicionar, renderizar, naTela, PREDIOS, CAMERAS };
}
