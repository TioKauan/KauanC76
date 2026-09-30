/**
 * Maquete 3D do Condomínio Evoluído (Three.js). Carregada sob demanda por pagina.ts.
 * Os dados (prédios, câmeras, cabos) vêm de src/lib/condominio/; aqui só se desenha.
 *
 * - Um canvas só: a maquete, o fundo do monitor e as imagens das câmeras de segurança
 *   (cada câmera renderiza a cena numa textura, com efeito de câmera de segurança).
 * - Desenhos explicativos (campos de visão, cabos, arcos) ficam na camada 1: a câmera
 *   principal vê, as câmeras de segurança não (a imagem delas mostra só o "real").
 * - Desenha só quando precisa: pausa fora da tela e com a aba escondida; com "reduzir
 *   movimento", nada anima sozinho e os voos da câmera viram cortes.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  ARVORES, CABOS_ENERGIA, CABOS_REDE, CALCADA, CAMERAS, CARROS, INTERFONIA, LAZER, LEITOR_FACIAL, LOTE, NOBREAK, PISOS, PONTOS_WIFI,
  PORTAO_PEDESTRES, PORTAO_VEICULOS, POSTES_DE_LUZ, PREDIOS, RACK, RUA, TABULEIRO, VAGAS, VISITANTE, AREAS_DE_CIRCULACAO,
  rotuloCamera, type CameraMaquete, type Ponto3, type Predio, type Retangulo,
} from '../../lib/condominio/maquete';
import { campoDeVisao } from '../../lib/condominio/cobertura';
import { CAMADAS, type CamadaId, type Vista } from '../../lib/condominio/capitulos';
import { estadoCena } from '../../lib/cenarios';
import { paginaCondominio } from '../../lib/dados';
import { icone, type NomeIcone } from '../../lib/icones';
import type { EstadoMaquete, Maquete3D } from './estado';

const COR = {
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
} as const;
const corCamada = Object.fromEntries(CAMADAS.map((c) => [c.id, new THREE.Color(c.cor)])) as Record<CamadaId, THREE.Color>;
const EXPLICATIVO = 1;

/* ---------------------------------------------------------------- materiais */

const padrao = (cor: THREE.ColorRepresentation, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color: cor, roughness: 0.86, metalness: 0.04, ...extra });
const brilho = (cor: THREE.ColorRepresentation, forca = 2.4) => new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(forca) });

const VERTICE_MUNDO = /* glsl */ `
  varying vec3 vMundo;
  void main() { vec4 m = modelMatrix * vec4(position, 1.0); vMundo = m.xyz; gl_Position = projectionMatrix * viewMatrix * m; }`;
const VERTICE_UV = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const VERTICE_TELA = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

function materialCampo(cam: CameraMaquete) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { cor: { value: new THREE.Color(0x3fcfe8) }, origem: { value: new THREE.Vector2(cam.x, cam.z) }, alcance: { value: cam.alcance }, forca: { value: 0.24 } },
    vertexShader: VERTICE_MUNDO,
    fragmentShader: /* glsl */ `
      uniform vec3 cor; uniform vec2 origem; uniform float alcance; uniform float forca; varying vec3 vMundo;
      void main() {
        float d = distance(vMundo.xz, origem) / alcance;
        float a = forca * (0.18 + 0.82 * pow(1.0 - clamp(d, 0.0, 1.0), 1.4));
        float aneis = smoothstep(0.035, 0.0, abs(fract(d * 5.0) - 0.5) - 0.46) * 0.35;
        gl_FragColor = vec4(cor * (a + aneis * forca), 1.0);
      }`,
  });
}

function materialFeixe(cam: CameraMaquete) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { cor: { value: new THREE.Color(0x6de9f6) }, altura: { value: cam.y }, forca: { value: 0.07 } },
    vertexShader: VERTICE_MUNDO,
    fragmentShader: /* glsl */ `
      uniform vec3 cor; uniform float altura; uniform float forca; varying vec3 vMundo;
      void main() { float t = clamp(vMundo.y / altura, 0.0, 1.0); gl_FragColor = vec4(cor * forca * (0.15 + 0.85 * t), 1.0); }`,
  });
}

function materialFluxo(cor: THREE.Color, forca = 3, velocidade = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { cor: { value: cor.clone() }, tempo: { value: 0 }, forca: { value: forca }, vel: { value: velocidade }, liga: { value: 1 }, peso: { value: 1 } },
    vertexShader: VERTICE_UV,
    fragmentShader: /* glsl */ `
      uniform vec3 cor; uniform float tempo; uniform float forca; uniform float vel; uniform float liga; uniform float peso; varying vec2 vUv;
      void main() {
        float pulso = smoothstep(0.82, 1.0, fract(vUv.x * 7.0 - tempo * vel));
        vec3 base = cor * (0.55 + pulso * 1.6) * forca * liga * peso;
        gl_FragColor = vec4(base + vec3(0.02, 0.03, 0.05) * (1.0 - liga), 1.0);
      }`,
  });
}

/* ---------------------------------------------------------------- construção */

function caixa(l: number, a: number, p: number, mat: THREE.Material, x: number, y: number, z: number, sombra = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(l, a, p), mat);
  m.position.set(x, y, z);
  m.castShadow = sombra;
  m.receiveShadow = true;
  return m;
}

function plano(r: Retangulo, y: number, mat: THREE.Material) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r.x1 - r.x0, r.z1 - r.z0), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set((r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2);
  m.receiveShadow = true;
  return m;
}

function tubo(pontos: readonly Ponto3[], raio: number, mat: THREE.Material) {
  const curva = new THREE.CatmullRomCurve3(pontos.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'catmullrom', 0.02);
  return new THREE.Mesh(new THREE.TubeGeometry(curva, Math.max(24, pontos.length * 16), raio, 6, false), mat);
}

function explicativo(...objetos: THREE.Object3D[]): THREE.Object3D[] {
  for (const o of objetos) o.traverse((f) => f.layers.set(EXPLICATIVO));
  return objetos;
}

interface Janela { x: number; y: number; z: number; rot: number; alt: number; larg: number; predio: Predio['id'] }

function construirPredio(p: Predio, janelas: Janela[]) {
  const g = new THREE.Group();
  const l = p.x1 - p.x0;
  const q = p.z1 - p.z0;
  const h = p.andares * p.pe;
  const cx = (p.x0 + p.x1) / 2;
  const cz = (p.z0 + p.z1) / 2;
  g.add(caixa(l, h, q, padrao(COR.predio), cx, h / 2, cz));
  const laje = padrao(COR.laje);
  for (let i = 1; i < p.andares; i++) g.add(caixa(l + 0.35, 0.22, q + 0.35, laje, cx, i * p.pe, cz));
  g.add(caixa(l + 0.2, 0.9, q + 0.2, laje, cx, h + 0.45, cz));
  g.add(caixa(l - 0.6, 0.12, q - 0.6, padrao(COR.cobertura), cx, h + 0.62, cz));
  if (p.andares > 2) {
    g.add(caixa(3.2, 2.2, 2.6, padrao(COR.predio), cx - l * 0.2, h + 1.6, cz));
    g.add(caixa(2.4, 1.6, 2.4, laje, cx + l * 0.22, h + 1.3, cz + 1));
  }
  const porLado = (lado: number) => Math.max(2, Math.floor(lado / 2.3));
  for (let andar = 0; andar < p.andares; andar++) {
    const y = andar * p.pe + p.pe * 0.55;
    const alt = p.andares > 1 ? 1.35 : Math.min(2.4, p.pe * 0.55);
    for (const face of ['n', 's', 'l', 'o'] as const) {
      const lado = face === 'n' || face === 's' ? l : q;
      const n = porLado(lado);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n - 0.5;
        const j: Janela = { x: cx, y, z: cz, rot: 0, alt, larg: p.andares > 1 ? 1.25 : 1.9, predio: p.id };
        if (face === 's') { j.x = cx + t * lado; j.z = p.z1 + 0.02; }
        if (face === 'n') { j.x = cx + t * lado; j.z = p.z0 - 0.02; j.rot = Math.PI; }
        if (face === 'l') { j.x = p.x1 + 0.02; j.z = cz + t * lado; j.rot = Math.PI / 2; }
        if (face === 'o') { j.x = p.x0 - 0.02; j.z = cz + t * lado; j.rot = -Math.PI / 2; }
        janelas.push(j);
      }
    }
  }
  return g;
}

function construirCamera(cam: CameraMaquete): THREE.Object3D[] {
  const cabeca = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.72), padrao(COR.corpoCamera, { roughness: 0.4 }));
  const lente = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16), padrao(0x0b1220, { roughness: 0.2 }));
  lente.rotation.x = Math.PI / 2;
  lente.position.z = 0.38;
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), brilho(0x6de9f6, 5));
  led.position.set(0.1, 0.1, 0.37);
  const braco = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.5), padrao(0x9fb0c2));
  braco.position.set(0, 0.12, -0.45);
  cabeca.add(corpo, lente, led, braco);
  cabeca.rotation.x = THREE.MathUtils.degToRad(18);
  cabeca.scale.setScalar(1.7);
  const g = new THREE.Group();
  g.add(cabeca);
  g.position.set(cam.x, cam.y, cam.z);
  g.rotation.y = THREE.MathUtils.degToRad(cam.rumo);
  const objetos: THREE.Object3D[] = [g];
  if (cam.poste) {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, cam.y, 8), padrao(0x7f93a8));
    poste.position.set(cam.x, cam.y / 2, cam.z);
    poste.castShadow = true;
    objetos.push(poste);
  }
  return objetos;
}

function pessoa(x: number, z: number, cor: number) {
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
}

/* ---------------------------------------------------------------- rótulos */

interface Rotulo { el: HTMLElement; ponto: THREE.Vector3 }

/* ================================================================ a maquete */

export function criarMaquete({ canvas, palco, movimento }: { canvas: HTMLCanvasElement; palco: HTMLElement; movimento: boolean }): Maquete3D {
  const celular = () => matchMedia('(max-width: 800px)').matches;
  const renderizador = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderizador.outputColorSpace = THREE.SRGBColorSpace;
  renderizador.toneMapping = THREE.ACESFilmicToneMapping;
  renderizador.toneMappingExposure = 1.05;
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = THREE.PCFShadowMap;
  let qualidadeBaixa = false;

  const cena = new THREE.Scene();
  cena.background = new THREE.Color(COR.fundo);
  cena.fog = new THREE.Fog(COR.fundo, 150, 290);

  const luzCeu = new THREE.HemisphereLight(0x3a5f8f, 0x020710, 1.15);
  const lua = new THREE.DirectionalLight(0xa9c8ff, 1.5);
  lua.position.set(-45, 70, 35);
  lua.castShadow = true;
  lua.shadow.mapSize.set(celular() ? 1024 : 2048, celular() ? 1024 : 2048);
  Object.assign(lua.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 10, far: 200 });
  lua.shadow.bias = -0.0004;
  lua.shadow.radius = 4;
  const preenchimento = new THREE.DirectionalLight(0x9fd6ff, 0.35);
  preenchimento.position.set(40, 20, 60);
  cena.add(luzCeu, lua, preenchimento);

  const raiz = new THREE.Group();
  cena.add(raiz);

  /* ---------- tabuleiro, rua, lote ---------- */
  const tab = caixa(TABULEIRO.x1 - TABULEIRO.x0, 1.4, TABULEIRO.z1 - TABULEIRO.z0, padrao(COR.tabuleiro), 0, -0.7, (TABULEIRO.z0 + TABULEIRO.z1) / 2, false);
  raiz.add(tab);
  raiz.add(new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(TABULEIRO.x0, 0.01, TABULEIRO.z0), new THREE.Vector3(TABULEIRO.x1, 0.01, TABULEIRO.z0),
      new THREE.Vector3(TABULEIRO.x1, 0.01, TABULEIRO.z1), new THREE.Vector3(TABULEIRO.x0, 0.01, TABULEIRO.z1),
    ]),
    new THREE.LineBasicMaterial({ color: new THREE.Color(COR.borda).multiplyScalar(0.9) }),
  ));
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexShader: VERTICE_UV,
    fragmentShader: `varying vec2 vUv; void main(){ float d = distance(vUv, vec2(0.5)); gl_FragColor = vec4(vec3(0.03,0.12,0.24), smoothstep(0.5, 0.0, d) * 0.9); }`,
  }));
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -3;
  raiz.add(halo);
  raiz.add(plano(RUA, 0.01, padrao(COR.rua)), plano(CALCADA, 0.03, padrao(COR.calcada)));
  for (let x = TABULEIRO.x0 + 2; x < TABULEIRO.x1 - 2; x += 5) raiz.add(plano({ x0: x, x1: x + 2.4, z0: 27.5, z1: 27.75 }, 0.02, padrao(0x3a4f66)));
  raiz.add(plano(LOTE, 0.02, padrao(COR.gramado)));
  const matPiso = padrao(COR.piso);
  for (const p of PISOS) raiz.add(plano(p, 0.035, matPiso));
  const matVaga = padrao(0x6f8aa6);
  for (let i = 0; i < VAGAS.quantidade; i++) {
    const x = VAGAS.x0 + i * VAGAS.largura;
    for (const [z0, z1] of VAGAS.fileiras) raiz.add(plano({ x0: x, x1: x + 0.08, z0, z1 }, 0.045, matVaga));
  }

  /* ---------- muro e portões ---------- */
  const matMuro = padrao(COR.muro);
  const matTopo = padrao(COR.muroTopo);
  const muro = (x0: number, z0: number, x1: number, z1: number) => {
    const l = Math.hypot(x1 - x0, z1 - z0);
    const rot = -Math.atan2(z1 - z0, x1 - x0);
    const m = caixa(l, 1.8, 0.28, matMuro, (x0 + x1) / 2, 0.9, (z0 + z1) / 2);
    const t = caixa(l, 0.1, 0.4, matTopo, (x0 + x1) / 2, 1.85, (z0 + z1) / 2);
    m.rotation.y = t.rotation.y = rot;
    raiz.add(m, t);
  };
  muro(LOTE.x0, LOTE.z0, LOTE.x1, LOTE.z0);
  muro(LOTE.x0, LOTE.z0, LOTE.x0, LOTE.z1);
  muro(LOTE.x1, LOTE.z0, LOTE.x1, LOTE.z1);
  muro(LOTE.x0, LOTE.z1, -8, LOTE.z1);
  muro(PORTAO_PEDESTRES.x1, LOTE.z1, PORTAO_VEICULOS.x0, LOTE.z1);
  muro(PORTAO_VEICULOS.x1, LOTE.z1, LOTE.x1, LOTE.z1);
  const grade = (x0: number, x1: number, altura: number) => {
    const n = Math.round((x1 - x0) / 0.32);
    const matGrade = padrao(0x5d7a96, { roughness: 0.5 });
    const barras = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, altura, 0.06), matGrade, n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) barras.setMatrixAt(i, m.makeTranslation(x0 + 0.16 + i * 0.32, altura / 2, LOTE.z1));
    barras.castShadow = true;
    raiz.add(barras, caixa(x1 - x0, 0.1, 0.12, matGrade, (x0 + x1) / 2, altura, LOTE.z1));
  };
  grade(PORTAO_VEICULOS.x0, PORTAO_VEICULOS.x1, 1.9);
  grade(PORTAO_PEDESTRES.x0, PORTAO_PEDESTRES.x1, 2.1);

  /* ---------- prédios e janelas ---------- */
  const janelas: Janela[] = [];
  const sombraContato = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexShader: VERTICE_UV,
    fragmentShader: `varying vec2 vUv; void main(){ vec2 d = abs(vUv - 0.5) * 2.0; float a = 1.0 - smoothstep(0.7, 1.0, max(d.x, d.y)); gl_FragColor = vec4(0.0, 0.0, 0.0, a * 0.55); }`,
  });
  for (const p of PREDIOS) {
    raiz.add(construirPredio(p, janelas));
    const s = new THREE.Mesh(new THREE.PlaneGeometry(p.x1 - p.x0 + 3, p.z1 - p.z0 + 3), sombraContato);
    s.rotation.x = -Math.PI / 2;
    s.position.set((p.x0 + p.x1) / 2, 0.05, (p.z0 + p.z1) / 2);
    raiz.add(s);
  }
  const malhaJanelas = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), janelas.length);
  const coresJanela: { acesa: THREE.Color; apagada: THREE.Color }[] = [];
  {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const eixo = new THREE.Vector3(0, 1, 0);
    let semente = 7;
    const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
    janelas.forEach((j, i) => {
      q.setFromAxisAngle(eixo, j.rot);
      m.compose(new THREE.Vector3(j.x, j.y, j.z), q, new THREE.Vector3(j.larg, j.alt, 1));
      malhaJanelas.setMatrixAt(i, m);
      const r = aleatorio();
      const acesa = j.predio === 'portaria' || j.predio === 'tecnico' || j.predio === 'salao' ? r < 0.9 : r < 0.46;
      const forca = 0.75 + aleatorio() * 1.25;
      const cor = acesa ? new THREE.Color(r < 0.1 ? COR.janelaFria : COR.janela).multiplyScalar(forca) : new THREE.Color(COR.vidroEscuro);
      coresJanela.push({ acesa: cor, apagada: new THREE.Color(COR.vidroEscuro) });
      malhaJanelas.setColorAt(i, cor);
    });
  }
  raiz.add(malhaJanelas);

  /* ---------- lazer ---------- */
  raiz.add(plano(LAZER.deck, 0.05, padrao(COR.deck)));
  const matAgua = new THREE.MeshBasicMaterial({ color: new THREE.Color(COR.piscina).multiplyScalar(1.5) });
  raiz.add(plano(LAZER.piscina, 0.08, matAgua), plano(LAZER.playground, 0.05, padrao(COR.areia)));
  {
    const pg = LAZER.playground;
    const cx = (pg.x0 + pg.x1) / 2;
    const cz = (pg.z0 + pg.z1) / 2;
    const telhado = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.2, 4), padrao(0xa3542a));
    telhado.position.set(cx - 2, 3, cz);
    telhado.rotation.y = Math.PI / 4;
    const escorregador = caixa(0.9, 0.12, 3.6, padrao(0x3d7fa0), cx - 2, 1.2, cz + 2.4);
    escorregador.rotation.x = -0.55;
    const metal = padrao(0x7f93a8);
    raiz.add(caixa(2, 2.4, 2, padrao(0x2f4f6b), cx - 2, 1.2, cz), telhado, escorregador, caixa(3.2, 0.12, 0.12, metal, cx + 2.5, 2.4, cz - 1));
    for (const dx of [-1.5, 1.5]) raiz.add(caixa(0.1, 2.4, 0.1, metal, cx + 2.5 + dx, 1.2, cz - 1));
  }
  for (const [x, z] of [[-10.3, -3.6], [4.3, 3.7], [4.3, -3.7]] as const) {
    const guarda = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.5, 8), padrao(0xd0a070));
    guarda.position.set(x, 2.3, z);
    raiz.add(caixa(0.07, 2.2, 0.07, padrao(0x9fb0c2), x, 1.1, z), guarda);
  }

  /* ---------- árvores, carros, postes ---------- */
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
  const vidroCarro = padrao(0x0c1522, { roughness: 0.2, metalness: 0.5 });
  for (const [x, z, cor] of CARROS) raiz.add(caixa(1.8, 0.7, 4.1, padrao(cor, { roughness: 0.45, metalness: 0.3 }), x, 0.55, z), caixa(1.55, 0.55, 2.1, vidroCarro, x, 1.15, z - 0.2));
  const lampadas: THREE.Mesh[] = [];
  const matPoste = padrao(0x6f8399);
  const matLampada = brilho(0xffd49a, 3.2);
  for (const [x, z] of POSTES_DE_LUZ) {
    raiz.add(caixa(0.12, 4.6, 0.12, matPoste, x, 2.3, z));
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), matLampada);
    l.position.set(x, 4.7, z);
    raiz.add(l);
    lampadas.push(l);
  }
  const visitante = pessoa(VISITANTE[0], VISITANTE[1], 0x9fc3e6);
  const moradores = [pessoa(-6, 3.4, 0xcfd8e3), pessoa(0.8, -3.6, 0xe0b27a), pessoa(20, -1, 0xd98c6a)];
  raiz.add(visitante, ...moradores);

  /* ---------- camadas ---------- */
  const camadas = Object.fromEntries(CAMADAS.map((c) => [c.id, new THREE.Group()])) as Record<CamadaId, THREE.Group>;
  Object.values(camadas).forEach((g) => raiz.add(g));
  const fluxos: { mat: THREE.ShaderMaterial; camada: CamadaId }[] = [];
  const fluxo = (camada: CamadaId, forca: number, vel: number) => {
    const mat = materialFluxo(corCamada[camada], forca, vel);
    fluxos.push({ mat, camada });
    return mat;
  };

  // Câmeras: corpo, campo de visão no chão, feixe e um alvo invisível para o toque
  const campos: { cam: CameraMaquete; campo: THREE.ShaderMaterial; feixe: THREE.ShaderMaterial; contorno: THREE.LineBasicMaterial }[] = [];
  const alvosToque: THREE.Mesh[] = [];
  const matInvisivel = new THREE.MeshBasicMaterial({ visible: false });
  for (const cam of CAMERAS) {
    camadas.cameras.add(...construirCamera(cam));
    const pts = campoDeVisao(cam);
    const y = 0.06 + cam.id * 0.004;
    const idx: number[] = [];
    for (let i = 1; i < pts.length; i++) idx.push(0, i, i + 1);
    const chao = new THREE.BufferGeometry();
    chao.setAttribute('position', new THREE.Float32BufferAttribute([cam.x, y, cam.z, ...pts.flatMap(([x, z]) => [x, y, z])], 3));
    chao.setIndex(idx);
    const tenda = new THREE.BufferGeometry();
    tenda.setAttribute('position', new THREE.Float32BufferAttribute([cam.x, cam.y, cam.z, ...pts.flatMap(([x, z]) => [x, 0.06, z])], 3));
    tenda.setIndex(idx);
    const campo = materialCampo(cam);
    const feixe = materialFeixe(cam);
    const contorno = new THREE.LineBasicMaterial({ color: new THREE.Color(0x6de9f6).multiplyScalar(0.6), transparent: true, opacity: 0.55 });
    const linha = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(cam.x, cam.y, cam.z), ...pts.map(([x, z]) => new THREE.Vector3(x, 0.08, z)), new THREE.Vector3(cam.x, cam.y, cam.z),
    ]), contorno);
    const toque = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 6), matInvisivel);
    toque.position.set(cam.x, cam.y, cam.z);
    toque.userData.camera = cam.id;
    alvosToque.push(toque);
    camadas.cameras.add(...explicativo(new THREE.Mesh(chao, campo), new THREE.Mesh(tenda, feixe), linha, toque));
    campos.push({ cam, campo, feixe, contorno });
  }

  // Pontos cegos: áreas de circulação que nenhuma câmera vê (listras)
  const cegos = (() => {
    const W = 1200;
    const H = Math.round((W * (LOTE.z1 - LOTE.z0)) / (LOTE.x1 - LOTE.x0));
    const tela = document.createElement('canvas');
    tela.width = W;
    tela.height = H;
    const c = tela.getContext('2d');
    if (!c) throw new Error('Canvas 2D indisponível');
    const px = (x: number) => ((x - LOTE.x0) / (LOTE.x1 - LOTE.x0)) * W;
    const pz = (z: number) => ((z - LOTE.z0) / (LOTE.z1 - LOTE.z0)) * H;
    c.save();
    c.beginPath();
    for (const r of AREAS_DE_CIRCULACAO) c.rect(px(r.x0), pz(r.z0), px(r.x1) - px(r.x0), pz(r.z1) - pz(r.z0));
    c.clip();
    c.fillStyle = 'rgba(255,106,0,0.14)';
    c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,138,43,0.7)';
    c.lineWidth = 2.5;
    for (let d = -H; d < W; d += 18) { c.beginPath(); c.moveTo(d, H); c.lineTo(d + H, 0); c.stroke(); }
    c.restore();
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = '#000';
    for (const cam of CAMERAS) {
      c.beginPath();
      c.moveTo(px(cam.x), pz(cam.z));
      for (const [x, z] of campoDeVisao(cam)) c.lineTo(px(x), pz(z));
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

  // Acesso facial: leitor no portão de pedestres, contorno dos portões, anel do visitante
  const leitor = new THREE.Group();
  leitor.add(caixa(0.36, 1.5, 0.3, padrao(0x2a3d52), 0, 0.75, 0));
  const telaLeitor = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.34), brilho(corCamada.acesso, 3));
  telaLeitor.position.set(0, 1.25, 0.16);
  leitor.add(telaLeitor);
  leitor.position.set(LEITOR_FACIAL[0], 0, LEITOR_FACIAL[1]);
  camadas.acesso.add(leitor);
  const matContornoPortao = new THREE.LineBasicMaterial({ color: corCamada.acesso.clone().multiplyScalar(2.2) });
  const contornoPortao = (x0: number, x1: number, alt: number) =>
    new THREE.Line(new THREE.BufferGeometry().setFromPoints([[x0, 0.1], [x0, alt], [x1, alt], [x1, 0.1]].map(([x, y]) => new THREE.Vector3(x, y, LOTE.z1 + 0.05))), matContornoPortao);
  camadas.acesso.add(...explicativo(contornoPortao(PORTAO_PEDESTRES.x0, PORTAO_PEDESTRES.x1, 2.2), contornoPortao(PORTAO_VEICULOS.x0, PORTAO_VEICULOS.x1, 2)));
  const anelVisitante = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.42, 48), brilho(corCamada.acesso, 2.6));
  anelVisitante.rotation.x = -Math.PI / 2;
  anelVisitante.position.set(VISITANTE[0], 0.07, VISITANTE[1]);
  raiz.add(...explicativo(anelVisitante));

  // Interfonia: arcos da portaria até cada bloco
  for (const b of INTERFONIA.blocos) {
    const [dx, dy, dz] = INTERFONIA.portaria;
    const [px, py, pz] = b.ponto;
    const curva = new THREE.QuadraticBezierCurve3(new THREE.Vector3(dx, dy, dz), new THREE.Vector3((dx + px) / 2, b.altura, (dz + pz) / 2), new THREE.Vector3(px, py, pz));
    camadas.interfonia.add(...explicativo(new THREE.Mesh(new THREE.TubeGeometry(curva, 64, 0.07, 6, false), fluxo('interfonia', 2.6, 0.8))));
  }
  const matPontoInterfonia = brilho(corCamada.interfonia, 3.5);
  for (const [x, y, z] of [INTERFONIA.portaria, ...INTERFONIA.blocos.map((b) => b.ponto)]) {
    const ponto = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), matPontoInterfonia);
    ponto.position.set(x, y, z);
    camadas.interfonia.add(...explicativo(ponto));
  }

  // Rede: cabos até o rack; Wi-Fi nas áreas comuns
  camadas.rede.add(...explicativo(...CABOS_REDE.map((r) => tubo(r, 0.07, fluxo('rede', 2.8, 1.2)))));
  const matAp = brilho(0x9ff3ff, 2.6);
  for (const [x, z] of PONTOS_WIFI) {
    const ap = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 20), matAp);
    ap.position.set(x, 3.2, z);
    camadas.rede.add(ap, caixa(0.08, 3.2, 0.08, padrao(0x7f93a8), x, 1.6, z));
    for (let k = 1; k <= 3; k++) {
      const anel = new THREE.Mesh(new THREE.TorusGeometry(1.4 * k, 0.035, 6, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7fe8ff).multiplyScalar(2.2 / k), transparent: true, opacity: 0.9 / k }));
      anel.rotation.x = Math.PI / 2;
      anel.position.set(x, 3.2 - k * 0.25, z);
      camadas.rede.add(...explicativo(anel));
    }
  }

  // Energia: rack e nobreak na frente do quadro técnico, cabo laranja até a portaria e os portões
  const matNobreak = brilho(corCamada.energia, 1.4);
  const nobreak = caixa(0.9, 1.2, 0.7, matNobreak, NOBREAK[0], 0.6, NOBREAK[1]);
  camadas.energia.add(nobreak, caixa(0.8, 1.9, 0.7, padrao(0x1d2b3b), RACK[0], 0.95, RACK[1]), caixa(0.5, 0.04, 0.02, brilho(corCamada.rede, 4), RACK[0], 1.4, RACK[1] - 0.36));
  camadas.energia.add(...explicativo(...CABOS_ENERGIA.map((r) => tubo(r, 0.08, fluxo('energia', 3.4, 0.7)))));
  const auraNobreak = new THREE.PointLight(corCamada.energia, 25, 12, 2);
  auraNobreak.position.set(NOBREAK[0], 2, NOBREAK[1] - 0.8);
  camadas.energia.add(auraNobreak);

  // Alarme: sensores no alto do muro e zona tracejada no perímetro
  const perimetro = [[LOTE.x0, LOTE.z0], [LOTE.x1, LOTE.z0], [LOTE.x1, LOTE.z1], [LOTE.x0, LOTE.z1]] as const;
  const matSensor = brilho(corCamada.alarme, 4.2);
  const tracos: THREE.Vector3[] = [];
  perimetro.forEach(([ax, az], k) => {
    const [bx, bz] = perimetro[(k + 1) % 4]!;
    const l = Math.hypot(bx - ax, bz - az);
    for (let d = 5; d < l - 2; d += 10) {
      const x = ax + ((bx - ax) * d) / l;
      const z = az + ((bz - az) * d) / l;
      if (k === 2 && x > -9 && x < 10) continue;
      const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.46), matSensor);
      s.position.set(x, 2.35, z);
      camadas.alarme.add(...explicativo(s));
    }
    for (let d = 0; d < l; d += 2.2) {
      const t0 = d / l;
      const t1 = Math.min(l, d + 1.2) / l;
      tracos.push(new THREE.Vector3(ax + (bx - ax) * t0, 2.05, az + (bz - az) * t0), new THREE.Vector3(ax + (bx - ax) * t1, 2.05, az + (bz - az) * t1));
    }
  });
  camadas.alarme.add(...explicativo(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tracos), new THREE.LineBasicMaterial({ color: corCamada.alarme.clone().multiplyScalar(2.4) }))));

  /* ---------- câmera principal, pós-processamento, explorar ---------- */
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 600);
  camera.layers.enable(EXPLICATIVO);
  const composicao = new EffectComposer(renderizador);
  composicao.addPass(new RenderPass(cena, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.35, 0.92);
  composicao.addPass(bloom);
  composicao.addPass(new OutputPass());

  const controles = new OrbitControls(camera, canvas);
  controles.enabled = false;
  controles.enableDamping = movimento;
  controles.minDistance = 40;
  controles.maxDistance = 260;
  controles.maxPolarAngle = THREE.MathUtils.degToRad(80);
  controles.enablePan = false;
  controles.addEventListener('change', () => pedirQuadro());
  controles.addEventListener('start', () => canvas.style.setProperty('cursor', 'grabbing'));
  controles.addEventListener('end', () => canvas.style.removeProperty('cursor'));

  const vista = { alvo: new THREE.Vector3(3, 5, 9), raio: 188, azimute: 36, elevacao: 33, deslocar: 0.12 };
  let voo: { de: typeof vista; para: typeof vista; inicio: number; duracao: number } | null = null;
  const copiar = (v: typeof vista) => ({ ...v, alvo: v.alvo.clone() });
  const deVista = (v: Vista) => ({ alvo: new THREE.Vector3(...v.alvo), raio: v.raio, azimute: v.azimute, elevacao: v.elevacao, deslocar: v.deslocar ?? 0 });
  function posicionar(v: typeof vista) {
    const az = THREE.MathUtils.degToRad(v.azimute);
    const el = THREE.MathUtils.degToRad(v.elevacao);
    camera.position.set(v.alvo.x + v.raio * Math.cos(el) * Math.sin(az), v.alvo.y + v.raio * Math.sin(el), v.alvo.z + v.raio * Math.cos(el) * Math.cos(az));
    camera.lookAt(v.alvo);
  }

  /* ---------- câmeras de segurança (imagem em textura) ---------- */
  const cftv = new Map(CAMERAS.map((cam) => {
    const c = new THREE.PerspectiveCamera(58, 16 / 9, 0.2, 180);
    const a = THREE.MathUtils.degToRad(cam.rumo);
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    c.position.set(cam.x + dx * 0.9, cam.y + 0.15, cam.z + dz * 0.9);
    c.lookAt(cam.x + dx * 12, 0.2, cam.z + dz * 12);
    return [cam.id, { camera: c, alvo: null as THREE.WebGLRenderTarget | null }];
  }));
  const quadCftv = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { mapa: { value: null }, tempo: { value: 0 }, ir: { value: 0 }, semSinal: { value: 0 } },
    depthTest: false, depthWrite: false, vertexShader: VERTICE_TELA,
    fragmentShader: /* glsl */ `
      uniform sampler2D mapa; uniform float tempo; uniform float ir; uniform float semSinal; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      void main(){
        vec2 c = vUv - 0.5; float r2 = dot(c, c);
        vec2 uv = 0.5 + c * (1.0 - 0.07 * r2);
        vec3 cor = aces(texture2D(mapa, uv).rgb * mix(2.3, 4.2, ir));
        float lum = dot(cor, vec3(0.299, 0.587, 0.114));
        cor = mix(mix(vec3(lum), cor, 0.8), vec3(pow(lum, 0.8) * 1.5) * vec3(0.9, 1.0, 0.94), ir);
        float r = hash(floor(vUv * vec2(480.0, 270.0)) + tempo) - 0.5;
        cor += r * (0.04 + 0.07 * ir);
        cor *= 0.95 + 0.05 * sin(vUv.y * 900.0);
        cor *= mix(0.5, 1.0, smoothstep(0.8, 0.2, length(c)));
        if (semSinal > 0.5) cor = vec3(0.04, 0.06, 0.09) + r * 0.22;
        gl_FragColor = vec4(pow(max(cor, 0.0), vec3(1.0 / 2.2)), 1.0);
      }`,
  }));
  quadCftv.frustumCulled = false;
  const cenaCftv = new THREE.Scene();
  cenaCftv.add(quadCftv);
  const quadPainel = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false, vertexShader: VERTICE_TELA,
    uniforms: { tamanho: { value: new THREE.Vector2(1, 1) }, raio: { value: 18 }, cor: { value: new THREE.Vector4(0.02, 0.047, 0.086, 0.94) } },
    fragmentShader: /* glsl */ `
      uniform vec2 tamanho; uniform float raio; uniform vec4 cor; varying vec2 vUv;
      void main(){
        vec2 p = (vUv - 0.5) * tamanho; vec2 q = abs(p) - tamanho * 0.5 + raio;
        float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - raio;
        gl_FragColor = vec4(pow(cor.rgb, vec3(1.0 / 2.2)), cor.a * (1.0 - smoothstep(-1.0, 0.5, d)));
      }`,
  }));
  quadPainel.frustumCulled = false;
  const cenaPainel = new THREE.Scene();
  cenaPainel.add(quadPainel);
  const cameraTela = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /* ---------- monitor e rótulos (HTML) ---------- */
  const monitor = palco.querySelector<HTMLElement>('[data-monitor]')!;
  const gradeMonitor = palco.querySelector<HTMLElement>('[data-monitor-grade]')!;
  const infoMonitor = palco.querySelector<HTMLElement>('[data-monitor-info]')!;
  const peMonitor = palco.querySelector<HTMLElement>('[data-monitor-pe]')!;
  const camadaRotulos = palco.querySelector<HTMLElement>('[data-rotulos]')!;
  let feeds: { id: number; el: HTMLElement }[] = [];
  let rotulos: Rotulo[] = [];
  const escolher: ((id: number) => void)[] = [];
  const hora = () => new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '');
  const relogio = window.setInterval(() => { for (const el of gradeMonitor.querySelectorAll('[data-hora]')) el.textContent = hora(); }, 1000);

  function montarMonitor(e: EstadoMaquete, ir: boolean) {
    const ids = e.monitor;
    const chave = `${e.capitulo.id}|${ids.join(',')}|${e.selecionada}|${ir}|${celular()}`;
    if (gradeMonitor.dataset.chave === chave) return;
    gradeMonitor.dataset.chave = chave;
    gradeMonitor.toggleAttribute('data-uma', ids.length === 1);
    gradeMonitor.replaceChildren(...ids.map((id) => {
      const cam = CAMERAS.find((c) => c.id === id)!;
      const el = document.createElement('div');
      el.className = 'feed';
      el.toggleAttribute('data-selecionada', id === e.selecionada && ids.length > 1);
      el.innerHTML = `<span class="feed-nome">${rotuloCamera(id)} · ${cam.nome}</span>${ir ? '<span class="feed-ir">IR</span>' : ''}<span class="feed-hora" data-hora>${hora()}</span><span class="feed-rec">REC</span>`;
      return el;
    }));
    feeds = [...gradeMonitor.children].map((el, i) => ({ id: ids[i]!, el: el as HTMLElement }));
    // Sem câmeras no capítulo, o painel fica só com as camadas (no celular, some).
    monitor.querySelector<HTMLElement>('[data-monitor-cameras]')!.hidden = ids.length === 0;
    monitor.hidden = ids.length === 0 && (celular() || e.capitulo.id === 'proposta');
    infoMonitor.textContent = ids.length > 1 ? `${ids.length} de ${CAMERAS.length} câmeras · simulação` : 'Simulação';
    peMonitor.textContent = ir ? paginaCondominio.noturna : ids.length === 1 ? 'A imagem sai da própria maquete, do ponto onde a câmera está.' : '';
  }

  const etiqueta = (x: number, y: number, z: number, cor: string, nomeIcone: NomeIcone, titulo: string, sub: string): Rotulo => {
    const el = document.createElement('div');
    el.className = 'etiqueta';
    el.style.setProperty('--cor', cor);
    el.innerHTML = `${icone(nomeIcone, { tamanho: 18 })}<div><b></b><span></span></div>`;
    el.querySelector('b')!.textContent = titulo;
    el.querySelector('span')!.textContent = sub;
    return { el, ponto: new THREE.Vector3(x, y, z)};
  };
  const zona = (x: number, y: number, z: number, texto: string): Rotulo => {
    const el = document.createElement('div');
    el.className = 'rotulo-zona';
    el.textContent = texto;
    return { el, ponto: new THREE.Vector3(x, y, z)};
  };

  function montarRotulos(e: EstadoMaquete, noite: boolean) {
    const cap = e.capitulo.id;
    const chave = `${cap}|${e.situacao}|${e.nobreak}|${e.selecionada}|${e.explorar}|${[...e.camadas].join()}`;
    if (camadaRotulos.dataset.chave === chave) return;
    camadaRotulos.dataset.chave = chave;
    const lista: Rotulo[] = [];
    const cor = (id: CamadaId) => CAMADAS.find((c) => c.id === id)!.cor;
    if ((cap === 'abertura' || cap === 'proposta' || e.explorar) && !celular()) {
      for (const p of PREDIOS) if (p.id !== 'tecnico') lista.push(zona((p.x0 + p.x1) / 2, p.andares * p.pe + (p.andares > 1 ? 2.6 : 1), (p.z0 + p.z1) / 2, p.nome));
      lista.push(zona(19, 2.6, 10.5, 'Garagem'), zona(-3, 1, 0, 'Piscina'), zona(21.8, 4.4, -0.8, 'Playground'));
    }
    if ((cap === 'cameras' || e.explorar) && e.camadas.has('cameras')) {
      for (const c of CAMERAS) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'rotulo-camera';
        el.textContent = rotuloCamera(c.id).replace('CAM ', '');
        el.setAttribute('aria-label', `${rotuloCamera(c.id)}, ${c.nome}`);
        el.setAttribute('aria-pressed', String(c.id === e.selecionada));
        el.tabIndex = -1; // pelo teclado, a lista de câmeras do capítulo faz o mesmo
        el.addEventListener('click', () => escolher.forEach((f) => f(c.id)));
        lista.push({ el, ponto: new THREE.Vector3(c.x, c.y + 1.3, c.z)});
      }
    }
    const visita = estadoCena('condominio', 'visita', false);
    if (cap === 'acesso' || (cap === 'energia' && e.situacao === 'visita')) {
      lista.push(etiqueta(VISITANTE[0] - 1.4, 3.4, VISITANTE[1] + 1.1, '#ffb070', 'user-check', 'Visitante no portão', visita.textos.acesso));
    }
    if (cap === 'interfonia') lista.push(etiqueta(-12, 11, 5, cor('interfonia'), 'phone', 'Interfonia', `Portaria chamando o ${INTERFONIA.blocos[0]!.bloco}`));
    if (cap === 'rede') {
      lista.push(etiqueta(RACK[0], 3, RACK[1], cor('rede'), 'router', 'Quadro técnico', 'Gravador e rede'));
      if (!celular()) lista.push(etiqueta(PONTOS_WIFI[0]![0], 5.4, PONTOS_WIFI[0]![1], '#9ff3ff', 'wifi', 'Wi-Fi', 'Áreas comuns'));
    }
    if (cap === 'energia') {
      const s = estadoCena('condominio', e.situacao, e.nobreak);
      if (e.situacao === 'energia') lista.push(etiqueta(NOBREAK[0], 3, NOBREAK[1], cor('energia'), 'battery-charging', s.textos.energia, 'Quadro técnico'));
      const fundo = CAMERAS.find((c) => c.id === 6)!;
      if (noite && e.nobreak && !celular()) lista.push(etiqueta(fundo.x - 3, fundo.y + 2, fundo.z + 2, cor('cameras'), 'cctv', 'Câmeras gravando', s.textos.cameras));
      if (e.situacao === 'internet') lista.push(etiqueta(RACK[0], 3, RACK[1], cor('rede'), 'wifi-off', s.textos.internet, 'Gravação continua'));
    }
    if (cap === 'alarme') lista.push(etiqueta(LOTE.x0 + 6, 4.5, LOTE.z0, cor('alarme'), 'bell-ring', 'Alarme', 'Avisos no aplicativo'));
    camadaRotulos.replaceChildren(...lista.map((r) => r.el));
    rotulos = lista;
  }

  function posicionarRotulos() {
    const caixaPalco = palco.getBoundingClientRect();
    const bloqueios = [monitor, palco.closest('[data-tour]')?.querySelector('[data-capitulo="' + estadoAtual?.capitulo.id + '"] .capitulo-caixa')]
      .filter((el): el is HTMLElement => Boolean(el) && !(el as HTMLElement).hidden && !celular() && !estadoAtual?.explorar)
      .map((el) => el.getBoundingClientRect());
    const v = new THREE.Vector3();
    for (const r of rotulos) {
      v.copy(r.ponto).project(camera);
      const x = ((v.x + 1) / 2) * caixaPalco.width;
      const y = ((1 - v.y) / 2) * caixaPalco.height;
      const fora = v.z > 1 || x < 0 || x > caixaPalco.width || y < 0 || y > caixaPalco.height;
      const px = caixaPalco.left + x;
      const py = caixaPalco.top + y;
      const escondido = fora || bloqueios.some((b) => px > b.left - 30 && px < b.right + 30 && py > b.top - 10 && py < b.bottom + 30);
      r.el.style.visibility = escondido ? 'hidden' : '';
      r.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    }
  }

  /* ---------- aplicar o estado ---------- */
  let estadoAtual: EstadoMaquete | null = null;
  let noiteAtual = false;
  function aplicar(e: EstadoMaquete) {
    const semEnergia = e.capitulo.id === 'energia' && e.situacao === 'energia';
    noiteAtual = semEnergia;
    const noNobreak = semEnergia && e.nobreak;
    for (const c of CAMADAS) camadas[c.id].visible = e.camadas.has(c.id);
    const realce = e.capitulo.realce;
    const peso = (id: CamadaId) => (realce && realce !== id && !e.explorar ? 0.35 : 1);
    for (const f of fluxos) {
      f.mat.uniforms.peso!.value = peso(f.camada);
      f.mat.uniforms.liga!.value = !semEnergia || noNobreak ? 1 : 0.04;
    }
    for (const c of campos) {
      const sel = e.selecionada === c.cam.id;
      const outra = e.selecionada !== null && !sel;
      c.campo.uniforms.forca!.value = (sel ? 0.5 : 0.24) * peso('cameras') * (outra ? 0.6 : 1) * (!semEnergia || noNobreak ? 1 : 0.15);
      c.feixe.uniforms.forca!.value = (sel ? 0.34 : 0.07) * peso('cameras') * (outra ? 0.5 : 1);
      (c.campo.uniforms.cor!.value as THREE.Color).set(sel ? 0x9ff4ff : 0x3fcfe8);
    }
    cegos.visible = e.pontosCegos && e.camadas.has('cameras');
    coresJanela.forEach((c, i) => malhaJanelas.setColorAt(i, semEnergia ? c.apagada : c.acesa));
    if (malhaJanelas.instanceColor) malhaJanelas.instanceColor.needsUpdate = true;
    lampadas.forEach((l) => { l.visible = !semEnergia; });
    matAgua.color.set(semEnergia ? 0x06202c : new THREE.Color(COR.piscina).multiplyScalar(1.5));
    luzCeu.intensity = semEnergia ? 0.55 : 1.15;
    lua.intensity = semEnergia ? 0.9 : 1.5;
    preenchimento.intensity = semEnergia ? 0 : 0.35;
    matNobreak.color.copy(corCamada.energia).multiplyScalar(semEnergia ? (e.nobreak ? 2.6 : 0.08) : 1.4);
    auraNobreak.intensity = semEnergia ? (e.nobreak ? 60 : 0) : 25;
    visitante.visible = anelVisitante.visible = e.visitante;
    moradores.forEach((m) => { m.visible = !semEnergia; });
    montarMonitor(e, semEnergia);
    montarRotulos(e, semEnergia);
  }

  /* ---------- tamanho e qualidade ---------- */
  function ajustarTamanho() {
    const w = palco.clientWidth;
    const h = palco.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, qualidadeBaixa ? 1 : celular() ? 1.5 : 2);
    renderizador.setPixelRatio(dpr);
    renderizador.setSize(w, h, false);
    composicao.setPixelRatio(dpr);
    composicao.setSize(w, h);
    camera.aspect = w / h;
    pedirQuadro();
  }
  const observadorTamanho = new ResizeObserver(ajustarTamanho);
  observadorTamanho.observe(palco);

  /* ---------- desenhar ---------- */
  let visivel = true;
  let quadroPedido = false;
  let quadroId = 0;
  let ultimoFeed = 0;
  let quadros = 0;
  let somaTempo = 0;
  const relogioInicio = performance.now();
  let espera = 0;
  /** Próximo quadro. Com `calmo`, espera ~33 ms: os pulsos nos cabos andam a 30 quadros/s, e não a 60. */
  function pedirQuadro(calmo = false) {
    if (quadroPedido || !visivel || document.hidden) return;
    quadroPedido = true;
    if (calmo) espera = window.setTimeout(() => { quadroId = requestAnimationFrame(desenhar); }, 33);
    else quadroId = requestAnimationFrame(desenhar);
  }
  const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

  function desenhar(agora: number) {
    quadroPedido = false;
    const t0 = performance.now();
    // voo da câmera
    let animando = false;
    if (voo) {
      const p = Math.min(1, (agora - voo.inicio) / voo.duracao);
      const k = suave(p);
      vista.alvo.lerpVectors(voo.de.alvo, voo.para.alvo, k);
      vista.raio = THREE.MathUtils.lerp(voo.de.raio, voo.para.raio, k);
      const dAz = ((voo.para.azimute - voo.de.azimute + 540) % 360) - 180;
      vista.azimute = voo.de.azimute + dAz * k;
      vista.elevacao = THREE.MathUtils.lerp(voo.de.elevacao, voo.para.elevacao, k);
      vista.deslocar = THREE.MathUtils.lerp(voo.de.deslocar, voo.para.deslocar, k);
      if (p >= 1) voo = null;
      animando = true;
    }
    if (controles.enabled) {
      if (controles.update()) animando = true;
    } else {
      posicionar(vista);
    }
    const w = palco.clientWidth;
    const h = palco.clientHeight;
    const deslocar = controles.enabled || celular() ? 0 : vista.deslocar;
    if (deslocar) camera.setViewOffset(w, h, -deslocar * w, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();

    const tempo = movimento ? (agora - relogioInicio) / 1000 : 1.3;
    for (const f of fluxos) f.mat.uniforms.tempo!.value = tempo;
    renderizador.autoClear = true;
    renderizador.setRenderTarget(null);
    if (qualidadeBaixa) renderizador.render(cena, camera);
    else composicao.render();

    // monitor: fundo e imagens das câmeras (no máximo ~12 por segundo enquanto anima)
    const atualizarFeeds = !movimento || agora - ultimoFeed > 80;
    if (!monitor.hidden) desenharMonitor(atualizarFeeds, tempo);
    if (atualizarFeeds) ultimoFeed = agora;
    posicionarRotulos();

    quadros++;
    canvas.dataset.quadros = String(quadros);
    if (quadros > 5 && quadros <= 65) somaTempo += performance.now() - t0;
    if (quadros === 65 && somaTempo / 60 > 45 && !qualidadeBaixa) {
      // Aparelho sofrendo: sem brilho, sem sombra e menos pixels.
      qualidadeBaixa = true;
      renderizador.shadowMap.enabled = false;
      lua.castShadow = false;
      ajustarTamanho();
    }
    if (animando) pedirQuadro();
    else if (movimento && visivel) pedirQuadro(true);
  }

  function desenharMonitor(novasImagens: boolean, tempo: number) {
    const caixaCanvas = canvas.getBoundingClientRect();
    renderizador.autoClear = false;
    const tm = renderizador.toneMapping;
    renderizador.toneMapping = THREE.NoToneMapping;
    const retangulo = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - caixaCanvas.left, y: caixaCanvas.bottom - r.bottom, w: r.width, h: r.height, el };
    };
    const m = retangulo(monitor);
    renderizador.setViewport(m.x, m.y, m.w, m.h);
    (quadPainel.material as THREE.ShaderMaterial).uniforms.tamanho!.value.set(m.w, m.h);
    (quadPainel.material as THREE.ShaderMaterial).uniforms.raio!.value = parseFloat(getComputedStyle(monitor).borderTopLeftRadius) || 0;
    renderizador.render(cenaPainel, cameraTela);
    const material = quadCftv.material as THREE.ShaderMaterial;
    for (const f of feeds) {
      if (f.el.offsetParent === null) continue;
      const cf = cftv.get(f.id);
      if (!cf) continue;
      if (!cf.alvo || novasImagens) {
        cf.alvo ??= new THREE.WebGLRenderTarget(qualidadeBaixa ? 480 : 640, qualidadeBaixa ? 270 : 360, { type: THREE.HalfFloatType, samples: qualidadeBaixa ? 0 : 4 });
        renderizador.toneMapping = tm;
        renderizador.setRenderTarget(cf.alvo);
        renderizador.clear();
        renderizador.render(cena, cf.camera);
        renderizador.setRenderTarget(null);
        renderizador.toneMapping = THREE.NoToneMapping;
      }
      const r = retangulo(f.el);
      renderizador.setViewport(r.x, r.y, r.w, r.h);
      renderizador.setScissor(r.x, r.y, r.w, r.h);
      renderizador.setScissorTest(true);
      material.uniforms.mapa!.value = cf.alvo.texture;
      material.uniforms.ir!.value = noiteAtual ? 1 : 0;
      material.uniforms.semSinal!.value = noiteAtual && estadoAtual && !estadoAtual.nobreak ? 1 : 0;
      material.uniforms.tempo!.value = Math.floor(tempo * 12) + f.id;
      renderizador.render(cenaCftv, cameraTela);
      renderizador.setScissorTest(false);
    }
    renderizador.toneMapping = tm;
    renderizador.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    renderizador.autoClear = true;
  }

  /* ---------- toque nas câmeras ---------- */
  const raio = new THREE.Raycaster();
  raio.layers.enable(EXPLICATIVO);
  let inicioToque: { x: number; y: number } | null = null;
  canvas.addEventListener('pointerdown', (ev) => { inicioToque = { x: ev.clientX, y: ev.clientY }; });
  canvas.addEventListener('pointerup', (ev) => {
    if (!inicioToque || Math.hypot(ev.clientX - inicioToque.x, ev.clientY - inicioToque.y) > 6) return;
    inicioToque = null;
    if (!camadas.cameras.visible) return;
    const r = canvas.getBoundingClientRect();
    raio.setFromCamera(new THREE.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1), camera);
    const achado = raio.intersectObjects(alvosToque, false)[0];
    if (achado) escolher.forEach((f) => f(achado.object.userData.camera as number));
  });

  /* ---------- pausar fora da tela ---------- */
  const observadorVisivel = new IntersectionObserver(([e]) => {
    visivel = Boolean(e?.isIntersecting);
    if (visivel) pedirQuadro();
  });
  observadorVisivel.observe(palco);
  const aoMudarAba = () => { if (!document.hidden) pedirQuadro(); };
  document.addEventListener('visibilitychange', aoMudarAba);

  // Para o validador: desenha e lê alguns pixels do centro (o canvas não guarda o quadro).
  (window as Window & { __maquetePixels?: () => number[] }).__maquetePixels = () => {
    desenhar(performance.now());
    const gl = renderizador.getContext();
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    const px = new Uint8Array(4);
    const cores: number[] = [];
    for (let i = 0; i < 16; i++) {
      gl.readPixels(Math.floor(w * (0.35 + 0.04 * i)), Math.floor(h * (0.3 + 0.025 * i)), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      cores.push(px[0]! + px[1]! * 256 + px[2]! * 65536);
    }
    return cores;
  };

  // Para o script que gera a imagem pronta da maquete (scripts/gerar-imagem-condominio.mjs).
  (window as Window & { __maqueteImagem?: (tipo: string, qualidade: number) => string }).__maqueteImagem = (tipo, qualidade) => {
    monitor.hidden = true;
    desenhar(performance.now());
    return canvas.toDataURL(tipo, qualidade);
  };

  return {
    atualizar(e, voar) {
      estadoAtual = e;
      aplicar(e);
      const destino = deVista(celular() ? e.capitulo.vistaCelular : e.capitulo.vista);
      if (e.explorar !== controles.enabled) {
        if (e.explorar) {
          controles.target.copy(vista.alvo);
          controles.enabled = true;
          voo = null;
        } else {
          // volta do modo explorar: parte de onde a pessoa deixou a câmera
          controles.enabled = false;
          const rel = camera.position.clone().sub(controles.target);
          const esf = new THREE.Spherical().setFromVector3(rel);
          Object.assign(vista, { alvo: controles.target.clone(), raio: esf.radius, azimute: THREE.MathUtils.radToDeg(esf.theta), elevacao: 90 - THREE.MathUtils.radToDeg(esf.phi), deslocar: 0 });
          voar = true;
        }
        ajustarTamanho();
      }
      if (!controles.enabled) {
        if (voar && movimento) voo = { de: copiar(vista), para: destino, inicio: performance.now(), duracao: 1400 };
        else { Object.assign(vista, destino); voo = null; }
      }
      pedirQuadro();
    },
    aoEscolherCamera(fn) { escolher.push(fn); },
    destruir() {
      cancelAnimationFrame(quadroId);
      window.clearTimeout(espera);
      window.clearInterval(relogio);
      observadorTamanho.disconnect();
      observadorVisivel.disconnect();
      document.removeEventListener('visibilitychange', aoMudarAba);
      controles.dispose();
      renderizador.dispose();
    },
  };
}
