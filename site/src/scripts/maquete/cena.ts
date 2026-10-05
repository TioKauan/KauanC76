/**
 * Motor das maquetes 3D (Three.js): desenha qualquer maquete descrita em src/lib/maquete/tipos.ts
 * (condomínio, casa, comércio, empresa). Carregado sob demanda pela página.
 *
 * - Um canvas só: a maquete, o fundo do monitor e as imagens das câmeras de segurança
 *   (cada câmera renderiza a cena numa textura, com efeito de câmera de segurança).
 * - Desenhos explicativos (campos de visão, cabos, arcos) ficam na camada 1: a câmera
 *   principal vê, as câmeras de segurança não (a imagem delas mostra só o "real").
 * - Tudo muda com transição: a câmera segue a rolagem com amortecimento, as camadas acendem
 *   e apagam, o campo de visão se abre a partir da câmera, o telhado sobe e mostra os cômodos,
 *   e as luzes apagam aos poucos quando falta energia.
 * - Desenha só quando precisa: pausa fora da tela e com a aba escondida; com "reduzir
 *   movimento", nada anima sozinho e toda mudança é um corte.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { rotuloCamera, type CameraMaquete, type Capitulo, type Edificacao, type ElementoCamada, type Movel, type Ponto3, type Predio, type Retangulo, type TipoSuperficie, type Vista } from '../../lib/maquete/tipos';
import { criarCobertura } from '../../lib/maquete/cobertura';
import { icone, type NomeIcone } from '../../lib/icones';
import type { EstadoMaquete, Maquete3D, OpcoesMaquete } from './estado';

const COR = {
  fundo: 0x020710,
  tabuleiro: 0x0a1524,
  borda: 0x6de9f6,
  gramado: 0x0d231f,
  piso: 0x16263a,
  interno: 0x1a2c42,
  rua: 0x0a121c,
  calcada: 0x1a2a3d,
  predio: 0x1c3452,
  laje: 0x33506f,
  cobertura: 0x14243a,
  parede: 0x1f3a5a,
  paredeInterna: 0x24425f,
  corte: 0x5f9bd0,
  telhado: 0x3a5576,
  muro: 0x1c2f47,
  muroTopo: 0x34506e,
  vidroEscuro: 0x0a1523,
  janela: 0xffb070,
  janelaFria: 0xd4ecff,
  vitrine: 0x9fd8ff,
  piscina: 0x0b9fc4,
  deck: 0x223851,
  areia: 0x3a3a33,
  arvores: [0x1b4a3c, 0x245c48, 0x173f33],
  tronco: 0x3b2f28,
  corpoCamera: 0xe8eef5,
} as const;
const EXPLICATIVO = 1;
const ALTURA_SUPERFICIE: Record<TipoSuperficie, number> = { gramado: 0.02, piso: 0.035, interno: 0.04, deck: 0.05, areia: 0.05, agua: 0.08 };

/* ---------------------------------------------------------------- materiais */

const padrao = (cor: THREE.ColorRepresentation, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color: cor, roughness: 0.86, metalness: 0.04, ...extra });
const brilho = (cor: THREE.ColorRepresentation, forca = 2.4) => new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(forca), transparent: true });

const VERTICE_MUNDO = /* glsl */ `
  varying vec3 vMundo;
  void main() { vec4 m = modelMatrix * vec4(position, 1.0); vMundo = m.xyz; gl_Position = projectionMatrix * viewMatrix * m; }`;
const VERTICE_UV = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const VERTICE_TELA = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

/** Campo de visão no chão: abre a partir da câmera (revela 0 → 1), com uma frente luminosa enquanto abre. */
function materialCampo(cam: CameraMaquete) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { cor: { value: new THREE.Color(0x3fcfe8) }, origem: { value: new THREE.Vector2(cam.x, cam.z) }, alcance: { value: cam.alcance }, forca: { value: 0.24 }, revela: { value: 1 } },
    vertexShader: VERTICE_MUNDO,
    fragmentShader: /* glsl */ `
      uniform vec3 cor; uniform vec2 origem; uniform float alcance; uniform float forca; uniform float revela; varying vec3 vMundo;
      void main() {
        float d = distance(vMundo.xz, origem) / alcance;
        if (d > revela) discard;
        float a = forca * (0.18 + 0.82 * pow(1.0 - clamp(d, 0.0, 1.0), 1.4));
        float aneis = smoothstep(0.035, 0.0, abs(fract(d * 5.0) - 0.5) - 0.46) * 0.35;
        float frente = smoothstep(0.08, 0.0, revela - d) * (1.0 - step(0.999, revela)) * 1.6;
        gl_FragColor = vec4(cor * (a + aneis * forca + frente * forca), 1.0);
      }`,
  });
}

function materialFeixe(cam: CameraMaquete) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { cor: { value: new THREE.Color(0x6de9f6) }, altura: { value: cam.y }, forca: { value: 0.07 }, origem: { value: new THREE.Vector2(cam.x, cam.z) }, alcance: { value: cam.alcance }, revela: { value: 1 } },
    vertexShader: VERTICE_MUNDO,
    fragmentShader: /* glsl */ `
      uniform vec3 cor; uniform float altura; uniform float forca; uniform vec2 origem; uniform float alcance; uniform float revela; varying vec3 vMundo;
      void main() {
        if (distance(vMundo.xz, origem) / alcance > revela) discard;
        float t = clamp(vMundo.y / altura, 0.0, 1.0); gl_FragColor = vec4(cor * forca * (0.15 + 0.85 * t), 1.0);
      }`,
  });
}

function materialFluxo(cor: THREE.Color, forca = 3, velocidade = 1) {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { cor: { value: cor.clone() }, tempo: { value: 0 }, forca: { value: forca }, vel: { value: velocidade }, liga: { value: 1 }, peso: { value: 1 }, nivel: { value: 1 } },
    vertexShader: VERTICE_UV,
    fragmentShader: /* glsl */ `
      uniform vec3 cor; uniform float tempo; uniform float forca; uniform float vel; uniform float liga; uniform float peso; uniform float nivel; varying vec2 vUv;
      void main() {
        float pulso = smoothstep(0.82, 1.0, fract(vUv.x * 7.0 - tempo * vel));
        vec3 base = cor * (0.55 + pulso * 1.6) * forca * liga * peso;
        gl_FragColor = vec4(base + vec3(0.02, 0.03, 0.05) * (1.0 - liga), nivel);
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

function explicativo<T extends THREE.Object3D>(...objetos: T[]): T[] {
  for (const o of objetos) o.traverse((f) => f.layers.set(EXPLICATIVO));
  return objetos;
}

/** Gerador de números repetível (as janelas acesas não mudam de uma visita para outra). */
function sorteio(semente: number) {
  let s = semente;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

interface Janela { x: number; y: number; z: number; rot: number; alt: number; larg: number; acesas: number }

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
        const j: Janela = { x: cx, y, z: cz, rot: 0, alt, larg: p.andares > 1 ? 1.25 : 1.9, acesas: p.acesas ?? 0.46 };
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

/** Vidros de uma edificação: acendem e apagam com a energia. */
interface Vidro { mat: THREE.MeshBasicMaterial; acesa: THREE.Color }

/** Imóvel em corte: paredes com portas, janelas e vitrines, o corte das paredes em destaque e o telhado à parte. */
function construirEdificacao(e: Edificacao, vidros: Vidro[]) {
  const corpo = new THREE.Group();
  const H = e.altura;
  const matParede = padrao(COR.parede);
  const matInterna = padrao(COR.paredeInterna);
  const matCorte = new THREE.MeshBasicMaterial({ color: new THREE.Color(COR.corte).multiplyScalar(1.15) });
  const matPortao = padrao(0x3d5670, { roughness: 0.55, metalness: 0.3 });
  const matVidroJanela = new THREE.MeshBasicMaterial({ color: new THREE.Color(COR.janela).multiplyScalar(1.05) });
  const matVitrine = new THREE.MeshBasicMaterial({ color: new THREE.Color(COR.vitrine).multiplyScalar(0.75), transparent: true, opacity: 0.55, depthWrite: false });
  vidros.push({ mat: matVidroJanela, acesa: matVidroJanela.color.clone() }, { mat: matVitrine, acesa: matVitrine.color.clone() });
  for (const p of e.paredes) {
    const [ax, az, bx, bz] = p.seg;
    const L = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / L;
    const uz = (bz - az) / L;
    const rot = -Math.atan2(uz, ux);
    const t = p.externa ? 0.22 : 0.12;
    const mat = p.externa ? matParede : matInterna;
    const peca = (de: number, ate: number, y0: number, y1: number, m: THREE.Material, prof = t, corte = true) => {
      const len = ate - de;
      if (len <= 0.01 || y1 - y0 <= 0.01) return;
      const meio = (de + ate) / 2;
      const b = caixa(len, y1 - y0, prof, m, ax + ux * meio, (y0 + y1) / 2, az + uz * meio);
      b.rotation.y = rot;
      corpo.add(b);
      if (corte && y1 >= H - 0.01) {
        const c = caixa(len, 0.05, prof + 0.02, matCorte, ax + ux * meio, H + 0.025, az + uz * meio, false);
        c.rotation.y = rot;
        corpo.add(c);
      }
    };
    const vaos = [...(p.vaos ?? [])].sort((a, b) => a.de - b.de);
    let inicio = 0;
    for (const v of vaos) {
      peca(inicio, v.de, 0, H, mat);
      if (v.tipo === 'porta') peca(v.de, v.ate, 2.1, H, mat);
      if (v.tipo === 'janela') {
        peca(v.de, v.ate, 0, 1, mat);
        peca(v.de, v.ate, 2.1, H, mat);
        peca(v.de, v.ate, 1, 2.1, matVidroJanela, 0.04, false);
      }
      if (v.tipo === 'vitrine') {
        peca(v.de, v.ate, 0, 0.15, mat);
        peca(v.de, v.ate, Math.min(H - 0.3, 2.8), H, mat);
        peca(v.de, v.ate, 0.15, Math.min(H - 0.3, 2.8), matVitrine, 0.05, false);
      }
      if (v.tipo === 'garagem') {
        peca(v.de, v.ate, 2.3, H, mat);
        peca(v.de, v.ate, 0, 2.3, matPortao, 0.1, false);
      }
      inicio = Math.max(inicio, v.ate);
    }
    peca(inicio, L, 0, H, mat);
  }
  if (e.letreiro) {
    const l = e.letreiro;
    corpo.add(caixa(l.x1 - l.x0, 0.42, 0.1, brilho(0x6de9f6, 1.6), (l.x0 + l.x1) / 2, H - 0.45, e.contorno.z1 + 0.17, false));
  }

  // Telhado (sobe e some quando o capítulo mostra os cômodos)
  const telhado = new THREE.Group();
  const r = e.contorno;
  const w = r.x1 - r.x0;
  const d = r.z1 - r.z0;
  const matTelhado = padrao(COR.telhado, { flatShading: true, transparent: true, roughness: 0.7 });
  if (e.telhado === 'duas-aguas') {
    const beiral = 0.45;
    const aoLongoDeX = w >= d;
    const vao = (aoLongoDeX ? d : w) + beiral * 2;
    const comprimento = (aoLongoDeX ? w : d) + beiral * 2;
    const sobe = vao * 0.24;
    const forma = new THREE.Shape([new THREE.Vector2(-vao / 2, 0), new THREE.Vector2(vao / 2, 0), new THREE.Vector2(0, sobe)]);
    const geo = new THREE.ExtrudeGeometry(forma, { depth: comprimento, bevelEnabled: false });
    geo.translate(0, 0, -comprimento / 2);
    const m = new THREE.Mesh(geo, matTelhado);
    if (aoLongoDeX) m.rotation.y = Math.PI / 2;
    m.position.set(r.x0 + w / 2, H + 0.06, r.z0 + d / 2);
    m.castShadow = true;
    // Arestas claras: o telhado se destaca do fundo escuro, como numa maquete de arquitetura.
    const arestas = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), new THREE.LineBasicMaterial({ color: new THREE.Color(COR.corte).multiplyScalar(0.9), transparent: true }));
    arestas.rotation.copy(m.rotation);
    arestas.position.copy(m.position);
    telhado.add(m, arestas);
  } else {
    const matLaje = padrao(COR.laje, { transparent: true });
    telhado.add(caixa(w + 0.3, 0.3, d + 0.3, matLaje, r.x0 + w / 2, H + 0.15, r.z0 + d / 2));
    telhado.add(caixa(w + 0.3, 0.55, 0.16, matLaje, r.x0 + w / 2, H + 0.55, r.z0 - 0.07));
    telhado.add(caixa(w + 0.3, 0.55, 0.16, matLaje, r.x0 + w / 2, H + 0.55, r.z1 + 0.07));
    telhado.add(caixa(0.16, 0.55, d + 0.3, matLaje, r.x0 - 0.07, H + 0.55, r.z0 + d / 2));
    telhado.add(caixa(0.16, 0.55, d + 0.3, matLaje, r.x1 + 0.07, H + 0.55, r.z0 + d / 2));
    const matAr = padrao(0x6f8399, { transparent: true });
    telhado.add(caixa(1.4, 0.8, 1, matAr, r.x0 + w * 0.3, H + 0.7, r.z0 + d * 0.3), caixa(1.4, 0.8, 1, matAr, r.x0 + w * 0.62, H + 0.7, r.z0 + d * 0.35));
  }
  telhado.userData.materiais = [...new Set(telhado.children.map((c) => (c as THREE.Mesh).material as THREE.Material))];

  // Luz de dentro (sem sombra): ilumina os cômodos e acende as janelas
  const luz = new THREE.PointLight(0xffc48a, 1, Math.max(w, d) * 1.3, 1.1);
  luz.position.set(r.x0 + w / 2, H + 0.6, r.z0 + d / 2);
  luz.userData.base = Math.max(w, d) * 9;
  luz.intensity = luz.userData.base as number;
  corpo.add(luz);
  return { corpo, telhado, luz };
}

function construirMovel(m: Movel): THREE.Object3D {
  const g = new THREE.Group();
  const w = m.x1 - m.x0;
  const d = m.z1 - m.z0;
  // Medidas no sistema do móvel: largura ao longo de x, profundidade ao longo de z (a frente aponta para +z).
  const gira = m.rumo !== undefined && Math.round(((m.rumo % 180) + 180) % 180) === 90;
  const L = gira ? d : w;
  const P = gira ? w : d;
  const cor = m.cor;
  const local = (l: number, a: number, p: number, mat: THREE.Material, x: number, y: number, z: number) => g.add(caixa(l, a, p, mat, x, y, z));
  switch (m.tipo) {
    case 'cama':
      local(L, 0.45, P, padrao(cor ?? 0x2a4563), 0, 0.225, 0);
      local(L - 0.1, 0.12, P - 0.15, padrao(0xb9c7d6, { roughness: 0.95 }), 0, 0.5, 0.05);
      local(L - 0.1, 0.13, P * 0.55, padrao(0x3d7fa0), 0, 0.52, P * 0.2);
      local(L * 0.8, 0.12, 0.38, padrao(0xe6edf4), 0, 0.6, -P / 2 + 0.3);
      local(L, 0.95, 0.08, padrao(0x1d3048), 0, 0.475, -P / 2 + 0.04);
      break;
    case 'sofa':
      local(L, 0.42, P, padrao(cor ?? 0x355a7c), 0, 0.21, 0);
      local(L, 0.48, 0.22, padrao(cor ?? 0x355a7c), 0, 0.6, -P / 2 + 0.11);
      local(0.18, 0.62, P, padrao(0x2c4a68), -L / 2 + 0.09, 0.31, 0);
      local(0.18, 0.62, P, padrao(0x2c4a68), L / 2 - 0.09, 0.31, 0);
      break;
    case 'mesa':
      local(L, 0.05, P, padrao(cor ?? 0x6c5a48, { roughness: 0.6 }), 0, 0.74, 0);
      local(L - 0.12, 0.7, 0.06, padrao(0x2a3d52), 0, 0.36, -P / 2 + 0.08);
      local(0.55, 0.34, 0.04, brilho(0x8fd9e8, 0.9), 0, 0.98, -P / 2 + 0.2);
      break;
    case 'mesa-redonda': {
      const raio = Math.min(L, P) / 2;
      const tampo = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, 0.05, 28), padrao(cor ?? 0x6c5a48, { roughness: 0.6 }));
      tampo.position.y = 0.74;
      const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.18, 0.72, 10), padrao(0x2a3d52));
      pe.position.y = 0.36;
      tampo.castShadow = pe.castShadow = true;
      g.add(tampo, pe);
      break;
    }
    case 'bancada':
      local(L, 0.88, P, padrao(cor ?? 0x2f4f6b), 0, 0.44, 0);
      local(L + 0.04, 0.05, P + 0.04, padrao(0x9fb0c2, { roughness: 0.4 }), 0, 0.9, 0);
      break;
    case 'balcao':
      local(L, 1, P, padrao(cor ?? 0x2a4058), 0, 0.5, 0);
      local(L + 0.06, 0.06, P + 0.06, padrao(0x9fb0c2, { roughness: 0.4 }), 0, 1.03, 0);
      local(0.42, 0.3, 0.04, brilho(0x8fd9e8, 0.9), -L * 0.25, 1.24, -P / 2 + 0.15);
      break;
    case 'gondola':
    case 'prateleira': {
      const alto = m.tipo === 'gondola' ? 1.5 : 2;
      local(L, alto, P, padrao(cor ?? 0x2a3d52), 0, alto / 2, 0);
      const niveis = m.tipo === 'gondola' ? 3 : 4;
      const produtos = [0xff8a2b, 0x6de9f6, 0x3be38a, 0xffc233, 0x8aa8ff, 0xe06c75, 0xcfd8e3];
      const s = sorteio(Math.round((m.x0 + 50) * 97 + (m.z0 + 50) * 13));
      for (let n = 0; n < niveis; n++) {
        const y = 0.25 + (n * (alto - 0.4)) / niveis + 0.12;
        for (const lado of m.tipo === 'gondola' ? [-1, 1] : [1]) {
          const cores = new THREE.MeshStandardMaterial({ color: produtos[Math.floor(s() * produtos.length)]!, roughness: 0.6 });
          local(L - 0.15, 0.22, 0.06, cores, 0, y, lado * (P / 2 + 0.03));
        }
      }
      break;
    }
    case 'caixa': {
      const matCaixa = padrao(cor ?? 0x6b4f35, { roughness: 0.95 });
      local(L, 0.8, P, matCaixa, 0, 0.4, 0);
      local(L * 0.55, 0.55, P * 0.6, matCaixa, -L * 0.15, 1.08, 0.05);
      break;
    }
    case 'servidor':
      local(L, 2, P, padrao(0x1d2b3b), 0, 1, 0);
      for (let i = 0; i < 6; i++) local(L * 0.7, 0.03, 0.02, brilho(i % 2 ? 0x3be38a : 0x6de9f6, 3), 0, 0.4 + i * 0.25, P / 2 + 0.01);
      break;
    case 'carro':
    case 'van': {
      const van = m.tipo === 'van';
      local(L, van ? 1.7 : 0.7, P, padrao(cor ?? 0x44546a, { roughness: 0.45, metalness: 0.3 }), 0, van ? 1.05 : 0.55, 0);
      local(L * 0.86, van ? 0.6 : 0.55, P * (van ? 0.22 : 0.51), padrao(0x0c1522, { roughness: 0.2, metalness: 0.5 }), 0, van ? 1.55 : 1.15, van ? P * 0.36 : -0.2);
      break;
    }
  }
  // Girado 90° ou 270°, a largura do móvel fica ao longo de z (por isso L e P trocados acima).
  g.position.set((m.x0 + m.x1) / 2, 0.04, (m.z0 + m.z1) / 2);
  g.rotation.y = THREE.MathUtils.degToRad(m.rumo ?? 0);
  return g;
}

function construirCamera(cam: CameraMaquete, escala: number): THREE.Object3D {
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
  cabeca.scale.setScalar(1.7 * escala);
  const suporte = new THREE.Group();
  suporte.add(cabeca);
  suporte.rotation.y = THREE.MathUtils.degToRad(cam.rumo);
  const g = new THREE.Group();
  if (cam.poste) {
    // Preso no chão: a câmera "brota" do pé do poste.
    g.position.set(cam.x, 0, cam.z);
    suporte.position.y = cam.y;
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, cam.y, 8), padrao(0x7f93a8));
    poste.position.y = cam.y / 2;
    poste.castShadow = true;
    g.add(poste);
  } else {
    g.position.set(cam.x, cam.y, cam.z);
  }
  g.add(suporte);
  return g;
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

function carroQueAnda(cor: number) {
  const g = new THREE.Group();
  g.add(caixa(1.8, 0.7, 4.1, padrao(cor, { roughness: 0.45, metalness: 0.3 }), 0, 0.55, 0), caixa(1.55, 0.55, 2.1, padrao(0x0c1522, { roughness: 0.2, metalness: 0.5 }), 0, 1.15, -0.2));
  const farol = brilho(0xfff2d6, 3.2);
  const lanterna = brilho(0xff3b3b, 2.6);
  g.add(caixa(0.36, 0.14, 0.05, farol, -0.62, 0.62, 2.06, false), caixa(0.36, 0.14, 0.05, farol, 0.62, 0.62, 2.06, false));
  g.add(caixa(0.3, 0.12, 0.05, lanterna, -0.66, 0.66, -2.06, false), caixa(0.3, 0.12, 0.05, lanterna, 0.66, 0.66, -2.06, false));
  return g;
}

/* ---------------------------------------------------------------- utilidades de animação */

const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const saida = (t: number) => 1 - (1 - t) ** 3;
const volta = (t: number) => { const c = 1.6; return t <= 0 ? 0 : t >= 1 ? 1 : 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
const degrau = (a: number, b: number, t: number) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
/** Aproxima `atual` de `alvo` a uma velocidade (1/segundo). */
const aproximar = (atual: number, alvo: number, vel: number, dt: number) => (Math.abs(alvo - atual) < 0.002 ? alvo : atual + Math.sign(alvo - atual) * Math.min(Math.abs(alvo - atual), vel * dt));

interface Rotulo { el: HTMLElement; ponto: THREE.Vector3 }
type VistaViva = { alvo: THREE.Vector3; raio: number; azimute: number; elevacao: number; deslocar: number };

/* ================================================================ a maquete */

export function criarMaquete({ canvas, palco, movimento, maquete: M, camadas: CAMADAS, textoNoturno, etiquetas }: OpcoesMaquete): Maquete3D {
  const celular = () => matchMedia('(max-width: 800px)').matches;
  const T = M.tabuleiro;
  const tamanho = Math.max(T.x1 - T.x0, T.z1 - T.z0);
  /** Escala do mundo em relação ao condomínio (o primeiro, com 72 m). */
  const s = tamanho / 72;
  const escalaObjetos = Math.max(0.6, Math.min(1, s * 1.4));
  const cobertura = criarCobertura(M);
  const corCamada = (id: string) => new THREE.Color(CAMADAS.find((c) => c.id === id)?.cor ?? '#6de9f6');

  const renderizador = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  renderizador.outputColorSpace = THREE.SRGBColorSpace;
  renderizador.toneMapping = THREE.ACESFilmicToneMapping;
  renderizador.toneMappingExposure = 1.05;
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = THREE.PCFShadowMap;
  let qualidadeBaixa = false;

  const cena = new THREE.Scene();
  cena.background = new THREE.Color(COR.fundo);
  cena.fog = new THREE.Fog(COR.fundo, 150 * Math.max(s, 0.5), 290 * Math.max(s, 0.5));

  const luzCeu = new THREE.HemisphereLight(0x3a5f8f, 0x020710, 1.15);
  const lua = new THREE.DirectionalLight(0xa9c8ff, 1.5);
  lua.position.set(-45 * s, 70 * s, 35 * s);
  lua.target.position.set((T.x0 + T.x1) / 2, 0, (T.z0 + T.z1) / 2);
  lua.castShadow = true;
  lua.shadow.mapSize.set(celular() ? 1024 : 2048, celular() ? 1024 : 2048);
  const meia = tamanho * 0.67;
  Object.assign(lua.shadow.camera, { left: -meia, right: meia, top: meia, bottom: -meia, near: 10 * s, far: 200 * s });
  lua.shadow.bias = -0.0004;
  lua.shadow.radius = 4;
  const preenchimento = new THREE.DirectionalLight(0x9fd6ff, 0.35);
  preenchimento.position.set(40 * s, 20 * s, 60 * s);
  cena.add(luzCeu, lua, lua.target, preenchimento);

  const raiz = new THREE.Group();
  cena.add(raiz);

  /* ---------- tabuleiro, rua, lote ---------- */
  raiz.add(caixa(T.x1 - T.x0, 1.4, T.z1 - T.z0, padrao(COR.tabuleiro), (T.x0 + T.x1) / 2, -0.7, (T.z0 + T.z1) / 2, false));
  raiz.add(new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(T.x0, 0.01, T.z0), new THREE.Vector3(T.x1, 0.01, T.z0),
      new THREE.Vector3(T.x1, 0.01, T.z1), new THREE.Vector3(T.x0, 0.01, T.z1),
    ]),
    new THREE.LineBasicMaterial({ color: new THREE.Color(COR.borda).multiplyScalar(0.9) }),
  ));
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(tamanho * 3.6, tamanho * 3.6), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexShader: VERTICE_UV,
    fragmentShader: `varying vec2 vUv; void main(){ float d = distance(vUv, vec2(0.5)); gl_FragColor = vec4(vec3(0.03,0.12,0.24), smoothstep(0.5, 0.0, d) * 0.9); }`,
  }));
  halo.rotation.x = -Math.PI / 2;
  halo.position.set((T.x0 + T.x1) / 2, -3, (T.z0 + T.z1) / 2);
  raiz.add(halo);
  raiz.add(plano(M.rua, 0.01, padrao(COR.rua)), plano(M.calcada, 0.03, padrao(COR.calcada)));
  const meioRua = (M.rua.z0 + M.rua.z1) / 2;
  for (let x = T.x0 + 2; x < T.x1 - 2; x += 5) raiz.add(plano({ x0: x, x1: x + 2.4, z0: meioRua - 0.12, z1: meioRua + 0.13 }, 0.02, padrao(0x3a4f66)));

  const corSuperficie: Record<TipoSuperficie, number> = { gramado: COR.gramado, piso: COR.piso, interno: COR.interno, deck: COR.deck, areia: COR.areia, agua: COR.piscina };
  const materiaisAgua: THREE.MeshBasicMaterial[] = [];
  for (const sup of M.superficies) {
    if (sup.tipo === 'agua') {
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(COR.piscina).multiplyScalar(1.5) });
      materiaisAgua.push(mat);
      raiz.add(plano(sup.r, ALTURA_SUPERFICIE.agua, mat));
    } else {
      raiz.add(plano(sup.r, ALTURA_SUPERFICIE[sup.tipo], padrao(corSuperficie[sup.tipo])));
    }
  }
  const matFaixa = padrao(0x6f8aa6);
  for (const f of M.faixas) raiz.add(plano(f, 0.045, matFaixa));

  /* ---------- muros e portões ---------- */
  const matMuro = padrao(COR.muro);
  const matTopo = padrao(COR.muroTopo);
  for (const mu of M.muros) {
    const [x0, z0, x1, z1] = mu.seg;
    const l = Math.hypot(x1 - x0, z1 - z0);
    const rot = -Math.atan2(z1 - z0, x1 - x0);
    const m = caixa(l, mu.altura, 0.28, matMuro, (x0 + x1) / 2, mu.altura / 2, (z0 + z1) / 2);
    const t = caixa(l, 0.1, 0.4, matTopo, (x0 + x1) / 2, mu.altura + 0.05, (z0 + z1) / 2);
    m.rotation.y = t.rotation.y = rot;
    raiz.add(m, t);
  }
  for (const gr of M.grades) {
    const n = Math.max(2, Math.round((gr.x1 - gr.x0) / 0.32));
    const matGrade = padrao(0x5d7a96, { roughness: 0.5 });
    const barras = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, gr.altura, 0.06), matGrade, n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) barras.setMatrixAt(i, m.makeTranslation(gr.x0 + 0.16 + i * ((gr.x1 - gr.x0 - 0.32) / Math.max(1, n - 1)), gr.altura / 2, gr.z));
    barras.castShadow = true;
    raiz.add(barras, caixa(gr.x1 - gr.x0, 0.1, 0.12, matGrade, (gr.x0 + gr.x1) / 2, gr.altura, gr.z));
  }

  /* ---------- prédios, imóveis em corte e janelas ---------- */
  const janelas: Janela[] = [];
  const sombraContato = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexShader: VERTICE_UV,
    fragmentShader: `varying vec2 vUv; void main(){ vec2 d = abs(vUv - 0.5) * 2.0; float a = 1.0 - smoothstep(0.7, 1.0, max(d.x, d.y)); gl_FragColor = vec4(0.0, 0.0, 0.0, a * 0.55); }`,
  });
  for (const p of M.predios) {
    raiz.add(construirPredio(p, janelas));
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(p.x1 - p.x0 + 3, p.z1 - p.z0 + 3), sombraContato);
    sc.rotation.x = -Math.PI / 2;
    sc.position.set((p.x0 + p.x1) / 2, 0.05, (p.z0 + p.z1) / 2);
    raiz.add(sc);
  }
  const malhaJanelas = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), Math.max(1, janelas.length));
  malhaJanelas.visible = janelas.length > 0;
  const coresJanela: { acesa: THREE.Color; apagada: THREE.Color }[] = [];
  {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const eixo = new THREE.Vector3(0, 1, 0);
    const aleatorio = sorteio(7);
    janelas.forEach((j, i) => {
      q.setFromAxisAngle(eixo, j.rot);
      m.compose(new THREE.Vector3(j.x, j.y, j.z), q, new THREE.Vector3(j.larg, j.alt, 1));
      malhaJanelas.setMatrixAt(i, m);
      const r = aleatorio();
      const acesa = r < j.acesas;
      const forca = 0.75 + aleatorio() * 1.25;
      const cor = acesa ? new THREE.Color(r < 0.1 ? COR.janelaFria : COR.janela).multiplyScalar(forca) : new THREE.Color(COR.vidroEscuro);
      coresJanela.push({ acesa: cor, apagada: new THREE.Color(COR.vidroEscuro) });
      malhaJanelas.setColorAt(i, cor);
    });
  }
  raiz.add(malhaJanelas);

  const vidros: Vidro[] = [];
  const telhados: { grupo: THREE.Group; altura: number }[] = [];
  const luzesInternas: THREE.PointLight[] = [];
  for (const e of M.edificacoes) {
    const { corpo, telhado, luz } = construirEdificacao(e, vidros);
    raiz.add(corpo, telhado);
    telhados.push({ grupo: telhado, altura: e.altura });
    luzesInternas.push(luz);
  }
  for (const m of M.moveis) raiz.add(construirMovel(m));

  /* ---------- enfeites ---------- */
  for (const en of M.enfeites) {
    if (en.tipo === 'playground') {
      const pg = en.r;
      const cx = (pg.x0 + pg.x1) / 2;
      const cz = (pg.z0 + pg.z1) / 2;
      const telhadinho = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.2, 4), padrao(0xa3542a));
      telhadinho.position.set(cx - 2, 3, cz);
      telhadinho.rotation.y = Math.PI / 4;
      const escorregador = caixa(0.9, 0.12, 3.6, padrao(0x3d7fa0), cx - 2, 1.2, cz + 2.4);
      escorregador.rotation.x = -0.55;
      const metal = padrao(0x7f93a8);
      raiz.add(caixa(2, 2.4, 2, padrao(0x2f4f6b), cx - 2, 1.2, cz), telhadinho, escorregador, caixa(3.2, 0.12, 0.12, metal, cx + 2.5, 2.4, cz - 1));
      for (const dx of [-1.5, 1.5]) raiz.add(caixa(0.1, 2.4, 0.1, metal, cx + 2.5 + dx, 1.2, cz - 1));
    } else {
      const guarda = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.5, 8), padrao(0xd0a070));
      guarda.position.set(en.x, 2.3, en.z);
      raiz.add(caixa(0.07, 2.2, 0.07, padrao(0x9fb0c2), en.x, 1.1, en.z), guarda);
    }
  }

  /* ---------- árvores, carros, postes, pessoas ---------- */
  if (M.arvores.length) {
    const troncos = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 1.6, 6), padrao(COR.tronco), M.arvores.length);
    const copas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), padrao(0xffffff, { flatShading: true }), M.arvores.length);
    const m = new THREE.Matrix4();
    M.arvores.forEach(([x, z, e], i) => {
      troncos.setMatrixAt(i, m.compose(new THREE.Vector3(x, 0.8 * e, z), new THREE.Quaternion(), new THREE.Vector3(e, e, e)));
      m.compose(new THREE.Vector3(x, (1.6 + 1.2) * e, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3 * i, 0.7 * i, 0)), new THREE.Vector3(1.35 * e, 1.55 * e, 1.35 * e));
      copas.setMatrixAt(i, m);
      copas.setColorAt(i, new THREE.Color(COR.arvores[i % 3]!));
    });
    troncos.castShadow = copas.castShadow = true;
    raiz.add(troncos, copas);
  }
  const vidroCarro = padrao(0x0c1522, { roughness: 0.2, metalness: 0.5 });
  for (const c of M.carros) {
    const g = new THREE.Group();
    g.add(caixa(1.8, 0.7, 4.1, padrao(c.cor, { roughness: 0.45, metalness: 0.3 }), 0, 0.55, 0), caixa(1.55, 0.55, 2.1, vidroCarro, 0, 1.15, -0.2));
    g.position.set(c.x, 0, c.z);
    g.rotation.y = THREE.MathUtils.degToRad(c.rumo ?? 0);
    raiz.add(g);
  }
  const lampadas: THREE.Mesh[] = [];
  const matPoste = padrao(0x6f8399);
  const matLampada = brilho(0xffd49a, 3.2);
  for (const [x, z] of M.postes) {
    raiz.add(caixa(0.12, 4.6, 0.12, matPoste, x, 2.3, z));
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), matLampada);
    l.position.set(x, 4.7, z);
    raiz.add(l);
    lampadas.push(l);
  }
  const visitantes: THREE.Object3D[] = [];
  const moradores: THREE.Object3D[] = [];
  for (const p of M.pessoas) {
    const g = pessoa(p.x, p.z, p.cor);
    raiz.add(g);
    (p.papel === 'visitante' ? visitantes : moradores).push(g);
  }

  // Vida na rua: carros passando nas duas mãos e uma pessoa caminhando na calçada (sem "reduzir movimento").
  const transito: { obj: THREE.Object3D; vel: number; z: number }[] = [];
  let pedestre: THREE.Object3D | null = null;
  if (movimento && M.maos) {
    const [ida, volta] = M.maos;
    const a = carroQueAnda(0x7a8ea6);
    a.rotation.y = Math.PI / 2;
    const b = carroQueAnda(0x8a3d2e);
    b.rotation.y = -Math.PI / 2;
    raiz.add(a, b);
    transito.push({ obj: a, vel: 5.2, z: volta }, { obj: b, vel: -4.1, z: ida });
    pedestre = pessoa(T.x0 + 4, (M.calcada.z0 + M.calcada.z1) / 2, 0xb7c9dc);
    raiz.add(pedestre);
  }

  /* ---------- camadas ---------- */
  interface CamadaViva { grupo: THREE.Group; nivel: number; alvo: number; fluxos: THREE.ShaderMaterial[]; pops: THREE.Object3D[]; fades: { mat: THREE.Material & { opacity: number }; base: number }[] }
  const vivas = new Map<string, CamadaViva>();
  const camadaViva = (id: string) => {
    let c = vivas.get(id);
    if (!c) {
      c = { grupo: new THREE.Group(), nivel: 0, alvo: 0, fluxos: [], pops: [], fades: [] };
      c.grupo.visible = false;
      raiz.add(c.grupo);
      vivas.set(id, c);
    }
    return c;
  };
  for (const c of CAMADAS) camadaViva(c.id);
  const fluxosPorCamera = new Map<number, THREE.ShaderMaterial[]>();
  const nobreaks: { mat: THREE.MeshBasicMaterial; aura: THREE.PointLight }[] = [];
  const fade = (cv: CamadaViva, mat: THREE.Material & { opacity: number }) => {
    mat.transparent = true;
    cv.fades.push({ mat, base: mat.opacity });
    return mat;
  };
  const pop = (cv: CamadaViva, obj: THREE.Object3D) => {
    obj.userData.escala = obj.scale.x;
    cv.pops.push(obj);
    cv.grupo.add(obj);
    return obj;
  };

  for (const [id, elementos] of Object.entries(M.camadas)) {
    const cv = camadaViva(id);
    const cor = corCamada(id);
    for (const el of elementos as readonly ElementoCamada[]) {
      switch (el.tipo) {
        case 'cabo': {
          const mat = materialFluxo(cor, el.forca ?? 2.8, el.vel ?? 1.2);
          cv.fluxos.push(mat);
          if (el.camera !== undefined) fluxosPorCamera.set(el.camera, [...(fluxosPorCamera.get(el.camera) ?? []), mat]);
          cv.grupo.add(...explicativo(tubo(el.pontos, el.raio ?? 0.07, mat)));
          break;
        }
        case 'arco': {
          const [dx, dy, dz] = el.de;
          const [px, py, pz] = el.para;
          const curva = new THREE.QuadraticBezierCurve3(new THREE.Vector3(dx, dy, dz), new THREE.Vector3((dx + px) / 2, el.altura, (dz + pz) / 2), new THREE.Vector3(px, py, pz));
          const mat = materialFluxo(cor, 2.6, 0.8);
          cv.fluxos.push(mat);
          cv.grupo.add(...explicativo(new THREE.Mesh(new THREE.TubeGeometry(curva, 64, 0.07, 6, false), mat)));
          break;
        }
        case 'ponto': {
          const ponto = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), brilho(cor, 3.5));
          ponto.position.set(...el.pos);
          pop(cv, explicativo(ponto)[0]!);
          break;
        }
        case 'sensor': {
          const sensor = new THREE.Mesh(new THREE.OctahedronGeometry(0.46 * escalaObjetos), brilho(cor, 4.2));
          sensor.position.set(...el.pos);
          pop(cv, explicativo(sensor)[0]!);
          break;
        }
        case 'wifi': {
          const [x, z] = el.pos;
          const ap = new THREE.Group();
          ap.position.set(x, 0, z);
          const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 20), brilho(0x9ff3ff, 2.6));
          disco.position.y = el.altura;
          ap.add(disco);
          if (!M.edificacoes.length) ap.add(caixa(0.08, el.altura, 0.08, padrao(0x7f93a8), 0, el.altura / 2, 0));
          pop(cv, ap);
          for (let k = 1; k <= 3; k++) {
            const anel = new THREE.Mesh(new THREE.TorusGeometry(1.4 * k * escalaObjetos, 0.035, 6, 64), fade(cv, new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7fe8ff).multiplyScalar(2.2 / k), transparent: true, opacity: 0.9 / k })));
            anel.rotation.x = Math.PI / 2;
            anel.position.set(x, el.altura - k * 0.25, z);
            cv.grupo.add(...explicativo(anel));
          }
          break;
        }
        case 'rack': {
          const [x, z] = el.pos;
          const g = new THREE.Group();
          g.position.set(x, 0, z);
          g.add(caixa(0.8, 1.9, 0.7, padrao(0x1d2b3b), 0, 0.95, 0), caixa(0.5, 0.04, 0.02, brilho(corCamada(vivas.has('rede') ? 'rede' : 'cameras'), 4), 0, 1.4, -0.36));
          pop(cv, g);
          break;
        }
        case 'nobreak': {
          const [x, z] = el.pos;
          const mat = brilho(cor, 1.4);
          mat.transparent = false;
          const g = new THREE.Group();
          g.position.set(x, 0, z);
          g.add(caixa(0.9, 1.2, 0.7, mat, 0, 0.6, 0));
          pop(cv, g);
          const aura = new THREE.PointLight(cor, 25 * escalaObjetos, 12 * escalaObjetos, 2);
          aura.position.set(x, 2, z - 0.8);
          cv.grupo.add(aura);
          nobreaks.push({ mat, aura });
          break;
        }
        case 'leitor': {
          const [x, z] = el.pos;
          const g = new THREE.Group();
          g.add(caixa(0.36, 1.5, 0.3, padrao(0x2a3d52), 0, 0.75, 0));
          const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.34), brilho(cor, 3));
          tela.position.set(0, 1.25, 0.16);
          g.add(tela);
          g.position.set(x, 0, z);
          g.rotation.y = THREE.MathUtils.degToRad(el.rumo ?? 0);
          pop(cv, g);
          break;
        }
        case 'contorno':
          cv.grupo.add(...explicativo(new THREE.Line(new THREE.BufferGeometry().setFromPoints(el.pontos.map(([x, y, z]) => new THREE.Vector3(x, y, z))), fade(cv, new THREE.LineBasicMaterial({ color: cor.clone().multiplyScalar(2.2) })))));
          break;
        case 'tracejado':
          cv.grupo.add(...explicativo(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(el.pontos.map(([x, y, z]) => new THREE.Vector3(x, y, z))), fade(cv, new THREE.LineBasicMaterial({ color: cor.clone().multiplyScalar(2.4) })))));
          break;
      }
    }
  }
  const anelVisitante = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.42, 48), brilho(corCamada(vivas.has('acesso') ? 'acesso' : 'cameras'), 2.6));
  anelVisitante.rotation.x = -Math.PI / 2;
  const primeiroVisitante = M.pessoas.find((p) => p.papel === 'visitante');
  if (primeiroVisitante) anelVisitante.position.set(primeiroVisitante.x, 0.07, primeiroVisitante.z);
  raiz.add(...explicativo(anelVisitante));

  // Câmeras: corpo, campo de visão no chão, feixe e um alvo invisível para o toque
  interface CameraViva { cam: CameraMaquete; corpo: THREE.Object3D; campo: THREE.ShaderMaterial; feixe: THREE.ShaderMaterial; contorno: THREE.LineBasicMaterial; toque: THREE.Mesh; nivel: number; alvo: number; atraso: number; grupo: THREE.Group }
  const cameras: CameraViva[] = [];
  const grupoCameras = camadaViva('cameras');
  const matInvisivel = new THREE.MeshBasicMaterial({ visible: false });
  for (const cam of M.cameras) {
    const grupo = new THREE.Group();
    const corpo = construirCamera(cam, escalaObjetos);
    const pts = cobertura.campoDeVisao(cam);
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
    const toque = new THREE.Mesh(new THREE.SphereGeometry(1.8 * escalaObjetos, 8, 6), matInvisivel);
    toque.position.set(cam.x, cam.y, cam.z);
    toque.userData.camera = cam.id;
    grupo.add(corpo, ...explicativo<THREE.Object3D>(new THREE.Mesh(chao, campo), new THREE.Mesh(tenda, feixe), linha, toque));
    grupoCameras.grupo.add(grupo);
    cameras.push({ cam, corpo, campo, feixe, contorno, toque, nivel: 0, alvo: 1, atraso: 0, grupo });
  }
  // Anel que pulsa no chão, embaixo da câmera escolhida
  const pulso = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9ff4ff).multiplyScalar(2), transparent: true, depthWrite: false }));
  pulso.rotation.x = -Math.PI / 2;
  pulso.visible = false;
  raiz.add(...explicativo(pulso));

  // Pontos cegos: áreas de circulação que nenhuma câmera instalada vê (listras). Redesenhados quando as câmeras mudam.
  const L = M.lote;
  const cegosTela = document.createElement('canvas');
  cegosTela.width = 1200;
  cegosTela.height = Math.round((1200 * (L.z1 - L.z0)) / (L.x1 - L.x0));
  const cegosTex = new THREE.CanvasTexture(cegosTela);
  cegosTex.colorSpace = THREE.SRGBColorSpace;
  cegosTex.anisotropy = 8;
  const cegosMat = new THREE.MeshBasicMaterial({ map: cegosTex, transparent: true, depthWrite: false, opacity: 0 });
  const cegos = plano(L, 0.1, cegosMat);
  cegos.receiveShadow = false;
  cegos.visible = false;
  raiz.add(...explicativo(cegos));
  let cegosChave = '';
  function desenharCegos(ids: readonly number[]) {
    const W = cegosTela.width;
    const H = cegosTela.height;
    const c = cegosTela.getContext('2d');
    if (!c) return;
    const px = (x: number) => ((x - L.x0) / (L.x1 - L.x0)) * W;
    const pz = (z: number) => ((z - L.z0) / (L.z1 - L.z0)) * H;
    c.clearRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over';
    c.save();
    c.beginPath();
    for (const r of M.areasDeCirculacao) c.rect(px(r.x0), pz(r.z0), px(r.x1) - px(r.x0), pz(r.z1) - pz(r.z0));
    c.clip();
    c.fillStyle = 'rgba(255,106,0,0.14)';
    c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,138,43,0.7)';
    c.lineWidth = 2.5;
    for (let d = -H; d < W; d += 18) { c.beginPath(); c.moveTo(d, H); c.lineTo(d + H, 0); c.stroke(); }
    c.restore();
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = '#000';
    for (const cam of M.cameras) {
      if (!ids.includes(cam.id)) continue;
      c.beginPath();
      c.moveTo(px(cam.x), pz(cam.z));
      for (const [x, z] of cobertura.campoDeVisao(cam)) c.lineTo(px(x), pz(z));
      c.closePath();
      c.fill();
    }
    for (const p of M.predios) c.fillRect(px(p.x0) - 2, pz(p.z0) - 2, px(p.x1) - px(p.x0) + 4, pz(p.z1) - pz(p.z0) + 4);
    c.globalCompositeOperation = 'source-over';
    cegosTex.needsUpdate = true;
  }
  let cegosNivel = 0;
  let cegosAlvo = 0;
  let cegosPendente: readonly number[] | null = null;

  /* ---------- câmera principal, pós-processamento, explorar ---------- */
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 600 * Math.max(s, 0.5));
  camera.layers.enable(EXPLICATIVO);
  const composicao = new EffectComposer(renderizador);
  composicao.addPass(new RenderPass(cena, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.35, 0.92);
  composicao.addPass(bloom);
  composicao.addPass(new OutputPass());

  const controles = new OrbitControls(camera, canvas);
  controles.enabled = false;
  controles.enableDamping = movimento;
  controles.minDistance = 40 * Math.max(s, 0.45);
  controles.maxDistance = 260 * Math.max(s, 0.45);
  controles.maxPolarAngle = THREE.MathUtils.degToRad(80);
  controles.enablePan = false;
  controles.addEventListener('change', () => pedirQuadro());
  controles.addEventListener('start', () => canvas.style.setProperty('cursor', 'grabbing'));
  controles.addEventListener('end', () => canvas.style.removeProperty('cursor'));

  const deVista = (v: Vista): VistaViva => ({ alvo: new THREE.Vector3(...v.alvo), raio: v.raio, azimute: v.azimute, elevacao: v.elevacao, deslocar: v.deslocar ?? 0 });
  const vistaDe = (c: Capitulo) => (celular() ? c.vistaCelular : c.vista);
  /** Onde a câmera está agora e para onde vai (ela persegue o alvo com amortecimento). */
  const vista: VistaViva = { alvo: new THREE.Vector3(), raio: 100, azimute: 0, elevacao: 30, deslocar: 0 };
  const alvoVista: VistaViva = { alvo: new THREE.Vector3(), raio: 100, azimute: 0, elevacao: 30, deslocar: 0 };
  let voo: { de: VistaViva; para: VistaViva; inicio: number; duracao: number } | null = null;
  let primeiraVista = true;
  const copiar = (v: VistaViva): VistaViva => ({ ...v, alvo: v.alvo.clone() });
  const difAz = (a: number, b: number) => ((b - a + 540) % 360) - 180;
  function misturar(a: VistaViva, b: VistaViva, k: number, saidaV: VistaViva) {
    saidaV.alvo.lerpVectors(a.alvo, b.alvo, k);
    saidaV.raio = THREE.MathUtils.lerp(a.raio, b.raio, k);
    saidaV.azimute = a.azimute + difAz(a.azimute, b.azimute) * k;
    saidaV.elevacao = THREE.MathUtils.lerp(a.elevacao, b.elevacao, k);
    saidaV.deslocar = THREE.MathUtils.lerp(a.deslocar, b.deslocar, k);
  }
  function posicionar(v: VistaViva, deriva: number) {
    const az = THREE.MathUtils.degToRad(v.azimute + Math.sin(deriva * 0.13) * 2.4);
    const el = THREE.MathUtils.degToRad(v.elevacao + Math.sin(deriva * 0.09) * 0.9);
    camera.position.set(v.alvo.x + v.raio * Math.cos(el) * Math.sin(az), v.alvo.y + v.raio * Math.sin(el), v.alvo.z + v.raio * Math.cos(el) * Math.cos(az));
    camera.lookAt(v.alvo);
  }

  /* ---------- câmeras de segurança (imagem em textura) ---------- */
  const cftv = new Map(M.cameras.map((cam) => {
    const c = new THREE.PerspectiveCamera(58, 16 / 9, 0.2, 180);
    const a = THREE.MathUtils.degToRad(cam.rumo);
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    // Câmera de dentro olha mais para baixo (o cômodo é pequeno).
    const longe = cam.interna ? cam.alcance * 0.7 : 12;
    const frente = cam.interna ? 0.7 : 0.9;
    c.position.set(cam.x + dx * frente, cam.y + 0.15, cam.z + dz * frente);
    c.lookAt(cam.x + dx * longe, 0.2, cam.z + dz * longe);
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
  const instaladasDe = (e: EstadoMaquete) => e.instaladas ?? M.cameras.map((c) => c.id);

  function montarMonitor(e: EstadoMaquete, ir: boolean) {
    const ids = e.monitor;
    const chave = `${e.capitulo.id}|${ids.join(',')}|${e.selecionada}|${ir}|${celular()}`;
    if (gradeMonitor.dataset.chave === chave) return;
    gradeMonitor.dataset.chave = chave;
    gradeMonitor.toggleAttribute('data-uma', ids.length === 1);
    gradeMonitor.replaceChildren(...ids.map((id) => {
      const cam = M.cameras.find((c) => c.id === id)!;
      const el = document.createElement('div');
      el.className = 'feed';
      el.toggleAttribute('data-selecionada', id === e.selecionada && ids.length > 1);
      el.innerHTML = `<span class="feed-nome"></span>${ir ? '<span class="feed-ir">IR</span>' : ''}<span class="feed-hora" data-hora>${hora()}</span><span class="feed-rec">REC</span>`;
      el.querySelector('.feed-nome')!.textContent = `${rotuloCamera(id)} · ${cam.nome}`;
      return el;
    }));
    feeds = [...gradeMonitor.children].map((el, i) => ({ id: ids[i]!, el: el as HTMLElement }));
    // Sem câmeras no capítulo, o painel fica só com as camadas (no celular, some).
    monitor.querySelector<HTMLElement>('[data-monitor-cameras]')!.hidden = ids.length === 0;
    monitor.hidden = ids.length === 0 && (celular() || Boolean(e.capitulo.semPainel));
    const total = instaladasDe(e).length;
    infoMonitor.textContent = ids.length > 1 ? `${ids.length} de ${total} câmeras · simulação` : 'Simulação';
    peMonitor.textContent = ir ? textoNoturno : ids.length === 1 ? 'A imagem sai da própria maquete, do ponto onde a câmera está.' : '';
  }

  const etiqueta = (pos: Ponto3, cor: string, nomeIcone: NomeIcone, titulo: string, sub: string): Rotulo => {
    const el = document.createElement('div');
    el.className = 'etiqueta';
    el.style.setProperty('--cor', cor);
    el.innerHTML = `${icone(nomeIcone, { tamanho: 18 })}<div><b></b><span></span></div>`;
    el.querySelector('b')!.textContent = titulo;
    el.querySelector('span')!.textContent = sub;
    return { el, ponto: new THREE.Vector3(...pos) };
  };
  const zona = (pos: Ponto3, texto: string): Rotulo => {
    const el = document.createElement('div');
    el.className = 'rotulo-zona';
    el.textContent = texto;
    return { el, ponto: new THREE.Vector3(...pos) };
  };

  function montarRotulos(e: EstadoMaquete, noite: boolean) {
    const instaladas = instaladasDe(e);
    const telhadoAberto = e.capitulo.telhado === false;
    const chave = `${e.capitulo.id}|${e.situacao}|${e.nobreak}|${e.selecionada}|${e.explorar}|${[...e.camadas].join()}|${instaladas.join()}|${e.visitante}`;
    if (camadaRotulos.dataset.chave === chave) return;
    camadaRotulos.dataset.chave = chave;
    const lista: Rotulo[] = [];
    if ((e.capitulo.zonas || e.explorar) && !celular()) {
      for (const z of M.zonas) if (!z.interna || telhadoAberto) lista.push(zona(z.pos, z.nome));
    }
    if ((e.capitulo.numeros || e.explorar) && e.camadas.has('cameras')) {
      for (const c of M.cameras) {
        if (!instaladas.includes(c.id)) continue;
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'rotulo-camera';
        el.textContent = rotuloCamera(c.id).replace('CAM ', '');
        el.setAttribute('aria-label', `${rotuloCamera(c.id)}, ${c.nome}`);
        el.setAttribute('aria-pressed', String(c.id === e.selecionada));
        el.tabIndex = -1; // pelo teclado, a lista de câmeras do capítulo faz o mesmo
        el.addEventListener('click', () => escolher.forEach((f) => f(c.id)));
        lista.push({ el, ponto: new THREE.Vector3(c.x, c.y + 1.3 * escalaObjetos, c.z) });
      }
    }
    for (const et of etiquetas?.(e, { celular: celular(), noite }) ?? []) lista.push(etiqueta(et.pos, et.cor, et.icone, et.titulo, et.sub));
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

  /* ---------- aplicar o estado (os alvos; a animação leva até eles) ---------- */
  let estadoAtual: EstadoMaquete | null = null;
  let noiteAtual = false;
  /** 1 = luzes acesas; 0 = sem energia. */
  let luz = 1;
  let luzAlvo = 1;
  let telhado = 1;
  let telhadoAlvo = 1;
  let realcePeso: Record<string, number> = {};
  function aplicar(e: EstadoMaquete) {
    const semEnergia = Boolean(e.capitulo.ese) && e.situacao === 'energia';
    noiteAtual = semEnergia;
    luzAlvo = semEnergia ? 0 : 1;
    telhadoAlvo = e.capitulo.telhado === false ? 0 : 1;
    const realce = e.capitulo.realce;
    realcePeso = Object.fromEntries([...vivas.keys()].map((id) => [id, realce && realce !== id && !e.explorar ? 0.35 : 1]));
    for (const [id, cv] of vivas) cv.alvo = e.camadas.has(id) ? 1 : 0;
    const instaladas = instaladasDe(e);
    let ordem = 0;
    for (const c of cameras) {
      const alvo = instaladas.includes(c.cam.id) ? 1 : 0;
      if (alvo !== c.alvo) {
        c.atraso = alvo ? performance.now() + ordem * 110 : performance.now();
        if (alvo) ordem++;
      }
      c.alvo = alvo;
      const sel = e.selecionada === c.cam.id;
      const outra = e.selecionada !== null && !sel;
      (c.campo.uniforms.cor!.value as THREE.Color).set(sel ? 0x9ff4ff : 0x3fcfe8);
      c.campo.userData.forca = (sel ? 0.5 : 0.24) * (outra ? 0.6 : 1);
      c.feixe.userData.forca = (sel ? 0.34 : 0.07) * (outra ? 0.5 : 1);
    }
    const chave = instaladas.join();
    if (e.pontosCegos && e.camadas.has('cameras')) {
      if (chave !== cegosChave) {
        cegosPendente = instaladas;
        cegosAlvo = 0; // apaga, redesenha e acende de novo
      } else {
        cegosAlvo = 1;
      }
    } else {
      cegosAlvo = 0;
    }
    const sel = M.cameras.find((c) => c.id === e.selecionada);
    pulso.visible = Boolean(sel) && e.camadas.has('cameras');
    if (sel) pulso.position.set(sel.x, 0.09, sel.z);
    for (const v of visitantes) v.visible = e.visitante;
    anelVisitante.visible = e.visitante && Boolean(primeiroVisitante);
    montarMonitor(e, semEnergia);
    montarRotulos(e, semEnergia);
    if (!movimento) pularAnimacoes();
  }

  /** Coloca tudo direto no estado final (sem "reduzir movimento" não acontece; com ele, sempre). */
  function pularAnimacoes() {
    for (const cv of vivas.values()) cv.nivel = cv.alvo;
    for (const c of cameras) c.nivel = c.alvo;
    if (cegosPendente) { desenharCegos(cegosPendente); cegosChave = cegosPendente.join(); cegosPendente = null; cegosAlvo = estadoAtual?.pontosCegos && estadoAtual.camadas.has('cameras') ? 1 : 0; }
    cegosNivel = cegosAlvo;
    luz = luzAlvo;
    telhado = telhadoAlvo;
    voo = null;
    Object.assign(vista, copiar(alvoVista));
    aplicarNiveis(0);
  }

  /** Aplica os níveis animados à cena. Devolve true se algo ainda está mudando. */
  function aplicarNiveis(dt: number): boolean {
    let mudando = false;
    const agora = performance.now();
    for (const [id, cv] of vivas) {
      const antes = cv.nivel;
      cv.nivel = aproximar(cv.nivel, cv.alvo, 2.4, dt);
      if (cv.nivel !== antes) mudando = true;
      cv.grupo.visible = cv.nivel > 0.002;
      const peso = realcePeso[id] ?? 1;
      for (const f of cv.fluxos) {
        f.uniforms.nivel!.value = saida(cv.nivel);
        f.uniforms.peso!.value = peso;
      }
      const k = volta(cv.nivel);
      for (const p of cv.pops) p.scale.setScalar(Math.max(0.0001, (p.userData.escala as number) * k));
      for (const f of cv.fades) f.mat.opacity = f.base * cv.nivel;
    }
    const nivelCameras = vivas.get('cameras')?.nivel ?? 0;
    const pesoCameras = realcePeso.cameras ?? 1;
    const ligado = 1 - (1 - luz) * (estadoAtual?.nobreak ? 0 : 1);
    for (const c of cameras) {
      if (agora >= c.atraso) {
        const antes = c.nivel;
        c.nivel = aproximar(c.nivel, c.alvo, 1.6, dt);
        if (c.nivel !== antes) mudando = true;
      } else {
        mudando = true;
      }
      const n = c.nivel;
      c.grupo.visible = n > 0.002;
      c.corpo.scale.setScalar(Math.max(0.0001, volta(Math.min(1, n * 1.6))));
      const revela = saida(Math.max(0, (n - 0.15) / 0.85));
      c.campo.uniforms.revela!.value = revela;
      c.feixe.uniforms.revela!.value = revela;
      c.campo.uniforms.forca!.value = (c.campo.userData.forca as number ?? 0.24) * pesoCameras * nivelCameras * (0.15 + 0.85 * ligado);
      c.feixe.uniforms.forca!.value = (c.feixe.userData.forca as number ?? 0.07) * pesoCameras * nivelCameras;
      c.contorno.opacity = 0.55 * revela * nivelCameras;
      for (const f of fluxosPorCamera.get(c.cam.id) ?? []) f.uniforms.nivel!.value = Math.min(f.uniforms.nivel!.value as number, revela);
    }
    // pontos cegos: apaga, redesenha com as câmeras novas e acende
    const cegosAntes = cegosNivel;
    cegosNivel = aproximar(cegosNivel, cegosAlvo, cegosAlvo ? 1.8 : 4, dt);
    if (cegosNivel === 0 && cegosPendente) {
      desenharCegos(cegosPendente);
      cegosChave = cegosPendente.join();
      cegosPendente = null;
      cegosAlvo = estadoAtual?.pontosCegos && estadoAtual.camadas.has('cameras') ? 1 : 0;
    }
    if (cegosNivel !== cegosAntes || cegosPendente) mudando = true;
    cegosMat.opacity = cegosNivel;
    cegos.visible = cegosNivel > 0.002;
    // energia: luzes apagam aos poucos (e voltam)
    const luzAntes = luz;
    luz = aproximar(luz, luzAlvo, 1.5, dt);
    if (luz !== luzAntes) mudando = true;
    const cor = new THREE.Color();
    coresJanela.forEach((c, i) => malhaJanelas.setColorAt(i, cor.lerpColors(c.apagada, c.acesa, luz)));
    if (malhaJanelas.instanceColor) malhaJanelas.instanceColor.needsUpdate = true;
    for (const v of vidros) v.mat.color.lerpColors(new THREE.Color(COR.vidroEscuro), v.acesa, luz);
    for (const l of luzesInternas) l.intensity = (l.userData.base as number) * luz;
    lampadas.forEach((l) => { l.visible = luz > 0.05; l.scale.setScalar(Math.max(0.0001, luz)); });
    for (const m of materiaisAgua) m.color.lerpColors(new THREE.Color(0x06202c), new THREE.Color(COR.piscina).multiplyScalar(1.5), luz);
    luzCeu.intensity = 0.55 + 0.6 * luz;
    lua.intensity = 0.9 + 0.6 * luz;
    preenchimento.intensity = 0.35 * luz;
    const comNobreak = Boolean(estadoAtual?.nobreak);
    for (const nb of nobreaks) {
      nb.mat.color.copy(corCamada('energia')).multiplyScalar(luz < 1 ? THREE.MathUtils.lerp(comNobreak ? 2.6 : 0.08, 1.4, luz) : 1.4);
      nb.aura.intensity = 25 * escalaObjetos * (luz < 1 ? THREE.MathUtils.lerp(comNobreak ? 2.4 : 0, 1, luz) : 1);
    }
    for (const cv of vivas.values()) for (const f of cv.fluxos) f.uniforms.liga!.value = 0.04 + 0.96 * ligado;
    moradores.forEach((m) => { m.visible = luz > 0.5; });
    // telhado: sobe e some (ou desce e aparece)
    const telhadoAntes = telhado;
    telhado = aproximar(telhado, telhadoAlvo, 1.3, dt);
    if (telhado !== telhadoAntes) mudando = true;
    const k = suave(telhado);
    for (const t of telhados) {
      t.grupo.visible = telhado > 0.002;
      t.grupo.position.y = (1 - k) * 4.5;
      for (const mat of t.grupo.userData.materiais as THREE.Material[]) mat.opacity = k;
    }
    return mudando;
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
  let ultimoQuadro = 0;
  let quadros = 0;
  let somaTempo = 0;
  const relogioInicio = performance.now();
  let espera = 0;
  /** Próximo quadro. Com `calmo`, espera ~33 ms: a maquete parada respira a 30 quadros/s, e não a 60. */
  function pedirQuadro(calmo = false) {
    if (quadroPedido || !visivel || document.hidden) return;
    quadroPedido = true;
    if (calmo) espera = window.setTimeout(() => { quadroId = requestAnimationFrame(desenhar); }, 33);
    else quadroId = requestAnimationFrame(desenhar);
  }

  function desenhar(agora: number) {
    quadroPedido = false;
    const t0 = performance.now();
    const dt = ultimoQuadro ? Math.min(0.1, (agora - ultimoQuadro) / 1000) : 0;
    ultimoQuadro = agora;
    const tempo = movimento ? (agora - relogioInicio) / 1000 : 1.3;
    let animando = false;
    if (movimento) animando = aplicarNiveis(dt) || animando;
    // câmera: voo (volta do explorar) ou perseguição amortecida do alvo da rolagem
    if (voo) {
      const p = Math.min(1, (agora - voo.inicio) / voo.duracao);
      misturar(voo.de, voo.para, suave(p), vista);
      if (p >= 1) voo = null;
      animando = true;
    } else if (!controles.enabled && movimento) {
      const k = 1 - Math.exp(-dt * 3.6);
      const antes = vista.raio + vista.azimute + vista.elevacao + vista.alvo.x + vista.alvo.y + vista.alvo.z + vista.deslocar;
      misturar(vista, alvoVista, k, vista);
      const depois = vista.raio + vista.azimute + vista.elevacao + vista.alvo.x + vista.alvo.y + vista.alvo.z + vista.deslocar;
      if (Math.abs(depois - antes) > 1e-3) animando = true;
    }
    if (controles.enabled) {
      if (controles.update()) animando = true;
    } else {
      posicionar(vista, movimento ? tempo : 0);
    }
    const w = palco.clientWidth;
    const h = palco.clientHeight;
    const deslocar = controles.enabled || celular() ? 0 : vista.deslocar;
    if (deslocar) camera.setViewOffset(w, h, -deslocar * w, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();

    for (const cv of vivas.values()) for (const f of cv.fluxos) f.uniforms.tempo!.value = tempo;
    // vida na rua
    for (const t of transito) {
      const largura = T.x1 - T.x0 + 12;
      const x = ((((tempo * t.vel) % largura) + largura) % largura) + T.x0 - 6;
      t.obj.position.set(x, 0, t.z);
    }
    if (pedestre) {
      const largura = T.x1 - T.x0 - 8;
      const ida = (tempo * 0.9) % (largura * 2);
      const x = T.x0 + 4 + (ida < largura ? ida : largura * 2 - ida);
      pedestre.position.x = x;
      pedestre.position.y = Math.abs(Math.sin(tempo * 5.5)) * 0.05;
      pedestre.rotation.y = ida < largura ? Math.PI / 2 : -Math.PI / 2;
    }
    if (pulso.visible) {
      const f = movimento ? (tempo * 0.8) % 1 : 0.6;
      pulso.scale.setScalar((0.6 + f * 2.4) * escalaObjetos);
      (pulso.material as THREE.MeshBasicMaterial).opacity = (1 - f) * 0.9;
    }

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
    if (!grupoCameras.grupo.visible) return;
    const r = canvas.getBoundingClientRect();
    raio.setFromCamera(new THREE.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1), camera);
    const alvos = cameras.filter((c) => c.alvo === 1).map((c) => c.toque);
    const achado = raio.intersectObjects(alvos, false)[0];
    if (achado) escolher.forEach((f) => f(achado.object.userData.camera as number));
  });

  /* ---------- pausar fora da tela ---------- */
  const observadorVisivel = new IntersectionObserver(([e]) => {
    visivel = Boolean(e?.isIntersecting);
    if (visivel) { ultimoQuadro = 0; pedirQuadro(); }
  });
  observadorVisivel.observe(palco);
  const aoMudarAba = () => { if (!document.hidden) { ultimoQuadro = 0; pedirQuadro(); } };
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

  // Para o script que gera a imagem pronta da maquete (scripts/gerar-imagens-maquete.mjs).
  (window as Window & { __maqueteImagem?: (tipo: string, qualidade: number) => string }).__maqueteImagem = (tipo, qualidade) => {
    pularAnimacoes();
    monitor.hidden = true;
    desenhar(performance.now());
    return canvas.toDataURL(tipo, qualidade);
  };

  return {
    atualizar(e, voar) {
      estadoAtual = e;
      aplicar(e);
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
          Object.assign(alvoVista, deVista(vistaDe(e.capitulo)));
          if (movimento) voo = { de: copiar(vista), para: copiar(alvoVista), inicio: performance.now(), duracao: 1400 };
        }
        ajustarTamanho();
      }
      if (!controles.enabled) {
        Object.assign(alvoVista, deVista(vistaDe(e.capitulo)));
        if (primeiraVista) {
          primeiraVista = false;
          // Entrada: a maquete se aproxima e as câmeras acendem uma a uma.
          Object.assign(vista, copiar(alvoVista));
          if (movimento) {
            vista.raio *= 1.14;
            vista.azimute -= 9;
            vista.elevacao += 4;
            cameras.forEach((c, i) => { c.nivel = 0; c.atraso = performance.now() + 350 + i * 120; });
          }
        } else if (!voar || !movimento) {
          Object.assign(vista, copiar(alvoVista));
          voo = null;
        }
      }
      if (!movimento) pularAnimacoes();
      ultimoQuadro = 0;
      pedirQuadro();
    },
    rolar(de, para, t) {
      if (controles.enabled || voo) return;
      const a = deVista(vistaDe(de));
      if (!para) Object.assign(alvoVista, a);
      else misturar(a, deVista(vistaDe(para)), suave(degrau(0.4, 1, t)), alvoVista);
      if (!movimento) Object.assign(vista, copiar(alvoVista));
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
