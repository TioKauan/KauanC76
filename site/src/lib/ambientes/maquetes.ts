/**
 * Maquetes 3D de Casa, Comércio e Empresa, tiradas das plantas do configurador "Monte seu sistema"
 * (configurador-dados.ts): as câmeras são os pontos sugeridos, os cômodos são as zonas e o
 * gravador fica no mesmo lugar. Aqui entram só os detalhes do 3D (paredes, portas, janelas, móveis).
 * Imóveis ILUSTRATIVOS: não representam um cliente nem um projeto.
 *
 * As coordenadas abaixo estão nas unidades da planta (818 × 540, rua embaixo) e viram metros na
 * conversão; z cresce para a rua, como nas outras maquetes.
 */
import { plantas, nomeEm, type Planta, type TipoPlanta } from '../configurador-dados';
import { direcao, rumoDe } from '../maquete/cobertura';
import { dentro, type CameraMaquete, type Edificacao, type ElementoCamada, type Maquete, type Movel, type Parede, type Ponto2, type Ponto3, type Retangulo, type Superficie, type Vao, type Zona } from '../maquete/tipos';

export type AmbienteMaquete = 'casa' | 'comercio' | 'empresa';

/** Metros por unidade da planta em x e em z (o 3D estica a profundidade para caber carro e calçada). */
const ESCALA: Record<TipoPlanta, readonly [kx: number, kz: number]> = { casa: [0.035, 0.04], comercial: [0.04, 0.05] };
const CENTRO = [409, 242] as const;

export const tipoPlanta = (a: AmbienteMaquete): TipoPlanta => (a === 'casa' ? 'casa' : 'comercial');

/** Conversão da planta (unidades do desenho) para a maquete (metros). */
export function conversor(tipo: TipoPlanta) {
  const [kx, kz] = ESCALA[tipo];
  const X = (x: number) => +((x - CENTRO[0]) * kx).toFixed(3);
  const Z = (y: number) => +((y - CENTRO[1]) * kz).toFixed(3);
  const ret = (x0: number, y0: number, x1: number, y1: number): Retangulo => ({ x0: X(x0), x1: X(x1), z0: Z(y0), z1: Z(y1) });
  /** Parede de (a) até (b), com vãos dados pela coordenada da planta ao longo dela. */
  const parede = (a: readonly [number, number], b: readonly [number, number], externa: boolean, vaos: readonly (readonly [de: number, ate: number, tipo: Vao['tipo']])[] = []): Parede => {
    const horizontal = a[1] === b[1];
    const k = horizontal ? kx : kz;
    const inicio = horizontal ? a[0] : a[1];
    return {
      seg: [X(a[0]), Z(a[1]), X(b[0]), Z(b[1])],
      externa,
      vaos: vaos.map(([de, ate, tipo]) => ({ de: +(Math.abs(de - inicio) * k).toFixed(3), ate: +(Math.abs(ate - inicio) * k).toFixed(3), tipo })),
    };
  };
  /** Direção da planta (graus; 0 = direita, 90 = para a rua) → rumo da maquete. */
  const rumo = (angulo: number) => {
    const a = (angulo * Math.PI) / 180;
    return +rumoDe(Math.cos(a) * kx, Math.sin(a) * kz).toFixed(1);
  };
  return { X, Z, ret, parede, rumo, kx, kz };
}

/* ------------------------------------------------------------------ casa */

function maqueteCasa(): Maquete {
  const c = conversor('casa');
  const { X, Z, ret, parede } = c;
  const planta = plantas.casa;
  const LOTE = ret(24, 22, 794, 462);
  const TAB: Retangulo = { x0: -16, x1: 16, z0: -11.5, z1: 17.2 };
  const casa: Edificacao = {
    id: 'casa', nome: 'Casa', contorno: ret(150, 90, 580, 390), altura: 2.8, telhado: 'duas-aguas',
    paredes: [
      parede([150, 390], [580, 390], true, [[175, 245, 'janela'], [255, 300, 'porta'], [400, 460, 'janela']]),
      parede([150, 90], [580, 90], true, [[185, 265, 'janela'], [300, 335, 'porta'], [385, 445, 'janela'], [495, 555, 'janela']]),
      parede([150, 90], [150, 390], true, [[125, 195, 'janela'], [285, 355, 'janela']]),
      parede([580, 90], [580, 210], true, [[125, 185, 'janela']]),
      parede([580, 210], [580, 390], true, [[315, 350, 'porta']]),
      parede([150, 230], [360, 230], false, [[300, 345, 'porta']]),
      parede([360, 90], [360, 390], false, [[320, 365, 'porta']]),
      parede([360, 250], [580, 250], false, [[430, 462, 'porta'], [530, 560, 'porta']]),
      parede([470, 90], [470, 250], false),
      parede([420, 250], [420, 300], false),
      parede([360, 300], [420, 300], false, [[372, 404, 'porta']]),
    ],
  };
  const garagem: Edificacao = {
    id: 'garagem', nome: 'Garagem', contorno: ret(580, 210, 750, 390), altura: 2.6, telhado: 'duas-aguas',
    paredes: [
      parede([580, 390], [750, 390], true, [[592, 738, 'garagem']]),
      parede([750, 210], [750, 390], true),
      parede([580, 210], [750, 210], true, [[640, 700, 'janela']]),
    ],
  };
  const moveis: Movel[] = [
    { ...ret(180, 280, 300, 320), tipo: 'sofa', rumo: 180 },
    { ...ret(175, 96, 335, 122), tipo: 'bancada' },
    { ...ret(236, 156, 284, 204), tipo: 'mesa-redonda' },
    { ...ret(380, 100, 450, 200), tipo: 'cama' },
    { ...ret(490, 100, 560, 200), tipo: 'cama', cor: 0x3a3f63 },
    { ...ret(600, 240, 660, 360), tipo: 'carro', cor: 0x5c6c7e, rumo: 180 },
    { ...ret(670, 240, 730, 360), tipo: 'carro', cor: 0x7a4a2e, rumo: 180 },
  ];
  const edificacoes = [casa, garagem];
  const cameras = camerasDaPlanta('casa', planta, edificacoes, { alturaExt: 2.55, alturaInt: 2.45, alcanceExt: 11, alcanceInt: 6.5 });
  const dvr: Ponto2 = [X(planta.dvr[0]), Z(planta.dvr[1])];
  const zonasNomes = planta.zonas.filter((z) => !['Quarto', 'Banheiro'].includes(nomeEm(z.nome, 'casa')));
  return {
    tabuleiro: TAB,
    lote: LOTE,
    calcada: { x0: TAB.x0, x1: TAB.x1, z0: LOTE.z1, z1: 10.6 },
    rua: { x0: TAB.x0, x1: TAB.x1, z0: 10.6, z1: TAB.z1 },
    superficies: [
      { r: LOTE, tipo: 'gramado' },
      { r: ret(590, 390, 750, 462), tipo: 'piso' },
      { r: ret(255, 390, 300, 462), tipo: 'piso' },
      { r: ret(290, 52, 350, 90), tipo: 'piso' },
      { r: casa.contorno, tipo: 'interno' },
      { r: garagem.contorno, tipo: 'interno' },
    ],
    faixas: [],
    muros: [
      { seg: [LOTE.x0, LOTE.z0, LOTE.x1, LOTE.z0], altura: 1.9 },
      { seg: [LOTE.x0, LOTE.z0, LOTE.x0, LOTE.z1], altura: 1.9 },
      { seg: [LOTE.x1, LOTE.z0, LOTE.x1, LOTE.z1], altura: 1.9 },
      { seg: [LOTE.x0, LOTE.z1, X(250), LOTE.z1], altura: 1.9 },
      { seg: [X(300), LOTE.z1, X(590), LOTE.z1], altura: 1.9 },
      { seg: [X(750), LOTE.z1, LOTE.x1, LOTE.z1], altura: 1.9 },
    ],
    grades: [
      { x0: X(250), x1: X(300), z: LOTE.z1, altura: 1.9 },
      { x0: X(590), x1: X(750), z: LOTE.z1, altura: 1.9 },
    ],
    predios: [],
    edificacoes,
    moveis,
    enfeites: [],
    arvores: [[X(60), Z(50), 0.8], [X(130), Z(45), 0.7], [X(650), Z(55), 0.85], [X(735), Z(50), 0.75], [X(60), Z(140), 0.75], [X(95), Z(430), 0.7], [X(470), Z(428), 0.6], [X(775), Z(130), 0.6]],
    carros: [],
    postes: [[-9, 9.9], [9, 9.9]],
    pessoas: [
      { x: X(275), z: 9.7, cor: 0x9fc3e6, papel: 'visitante' },
      { x: X(250), z: Z(360), cor: 0xcfd8e3, papel: 'morador' },
      { x: X(450), z: Z(55), cor: 0xe0b27a, papel: 'morador' },
    ],
    cameras,
    areasDeCirculacao: zonasNomes.map((z) => ret(z.x, z.y, z.x + z.w, z.y + z.h)),
    camadas: {
      cabos: [{ tipo: 'rack', pos: dvr }, ...cabosDasCameras(cameras, dvr, 2.6)],
      energia: [{ tipo: 'nobreak', pos: [dvr[0] - 1.1, dvr[1] + 0.2] }, { tipo: 'cabo', pontos: [[dvr[0] - 1.1, 0.12, dvr[1] + 0.2], [dvr[0], 0.12, dvr[1] + 0.2], [dvr[0], 0.12, dvr[1]]], raio: 0.06, forca: 3.4, vel: 0.7 }],
      alarme: sensoresDoAlarme(edificacoes, [[X(260), 2.5, Z(370)], [X(170), 2.5, Z(110)]]),
      acesso: [{ tipo: 'leitor', pos: [X(242), LOTE.z1 + 0.25] }],
    },
    zonas: [
      { nome: 'Sala', pos: [X(255), 1.2, Z(330)], interna: true },
      { nome: 'Cozinha', pos: [X(255), 1.4, Z(150)], interna: true },
      { nome: 'Quartos', pos: [X(470), 1.4, Z(165)], interna: true },
      { nome: 'Garagem', pos: [X(665), 3.9, Z(300)] },
      { nome: 'Quintal', pos: [X(400), 1.2, Z(52)] },
    ],
    maos: [12.4, 15.4],
  };
}

/* ------------------------------------------------------------------ comércio e empresa */

function maqueteComercial(ambiente: 'comercio' | 'empresa'): Maquete {
  const c = conversor('comercial');
  const { X, Z, ret, parede } = c;
  const planta = plantas.comercial;
  const loja = ambiente === 'comercio';
  const LOTE = ret(24, 22, 794, 462);
  const TAB: Retangulo = { x0: -18, x1: 18, z0: -13.5, z1: 19.8 };
  const predio: Edificacao = {
    id: ambiente, nome: loja ? 'Loja' : 'Empresa', contorno: ret(110, 70, 650, 370), altura: 4.2, telhado: 'laje',
    letreiro: loja ? { x0: X(120), x1: X(440) } : { x0: X(150), x1: X(300) },
    paredes: [
      parede([110, 370], [650, 370], true, loja
        ? [[120, 172, 'vitrine'], [180, 240, 'porta'], [248, 300, 'vitrine'], [322, 440, 'vitrine'], [480, 620, 'janela']]
        : [[125, 170, 'janela'], [180, 240, 'porta'], [250, 300, 'janela'], [330, 430, 'janela'], [480, 620, 'janela']]),
      parede([110, 70], [650, 70], true, [[150, 210, 'janela'], [400, 440, 'porta'], [480, 540, 'janela']]),
      parede([110, 70], [110, 370], true, [[200, 260, 'janela'], [290, 350, 'janela']]),
      parede([650, 70], [650, 370], true, loja ? [[120, 200, 'garagem'], [280, 340, 'janela']] : [[120, 180, 'janela'], [280, 340, 'janela']]),
      parede([110, 170], [450, 170], false, [[250, 290, 'porta']]),
      parede([310, 170], [310, 370], false, loja ? [[200, 330, 'porta']] : [[300, 330, 'porta']]),
      parede([450, 70], [450, 370], false, [[120, 150, 'porta'], [300, 330, 'porta']]),
      parede([450, 250], [650, 250], false, [[480, 510, 'porta']]),
    ],
  };
  const moveis: Movel[] = loja
    ? [
        { ...ret(140, 200, 164, 340), tipo: 'gondola', rumo: 90 },
        { ...ret(200, 200, 224, 340), tipo: 'gondola', rumo: 90 },
        { ...ret(258, 200, 282, 340), tipo: 'gondola', rumo: 90 },
        { ...ret(330, 300, 430, 326), tipo: 'balcao', rumo: 180 },
        { ...ret(470, 90, 630, 112), tipo: 'prateleira' },
        { ...ret(470, 130, 630, 152), tipo: 'prateleira' },
        { ...ret(470, 170, 630, 192), tipo: 'prateleira' },
        { ...ret(130, 95, 210, 145), tipo: 'caixa' },
        { ...ret(230, 95, 310, 145), tipo: 'caixa' },
        { ...ret(330, 100, 400, 140), tipo: 'caixa' },
        { ...ret(480, 280, 550, 320), tipo: 'mesa' },
        { ...ret(700, 120, 770, 240), tipo: 'van', cor: 0xcfd8e3, rumo: 180 },
      ]
    : [
        { ...ret(150, 92, 230, 122), tipo: 'mesa' },
        { ...ret(270, 92, 350, 122), tipo: 'mesa' },
        { ...ret(150, 132, 230, 162), tipo: 'mesa', rumo: 180 },
        { ...ret(270, 132, 350, 162), tipo: 'mesa', rumo: 180 },
        { ...ret(150, 300, 260, 328), tipo: 'balcao', rumo: 180 },
        { ...ret(140, 196, 230, 226), tipo: 'sofa' },
        { ...ret(335, 225, 425, 315), tipo: 'mesa-redonda', cor: 0x5a4a3c },
        { ...ret(470, 90, 540, 125), tipo: 'mesa' },
        { ...ret(565, 90, 635, 125), tipo: 'mesa' },
        { ...ret(470, 175, 540, 210), tipo: 'mesa', rumo: 180 },
        { ...ret(565, 175, 635, 210), tipo: 'mesa', rumo: 180 },
        { ...ret(470, 290, 540, 330), tipo: 'mesa' },
        { ...ret(600, 262, 630, 292), tipo: 'servidor', rumo: 180 },
      ];
  const edificacoes = [predio];
  const cameras = camerasDaPlanta(ambiente, planta, edificacoes, { alturaExt: 3.5, alturaInt: 3.7, alcanceExt: 14, alcanceInt: 9 });
  const dvr: Ponto2 = [X(planta.dvr[0]), Z(planta.dvr[1])];
  const vagas = [150, 230, 310, 390, 470, 550, 630, 710];
  const teto = 3.95;
  const pontosWifi: Ponto2[] = (loja ? [[210, 270], [550, 160]] : [[280, 120], [210, 270], [550, 160]]).map(([x, y]) => [X(x!), Z(y!)] as Ponto2);
  const nome = (i: number) => nomeEm(planta.zonas[i]!.nome, ambiente);
  return {
    tabuleiro: TAB,
    lote: LOTE,
    calcada: { x0: TAB.x0, x1: TAB.x1, z0: LOTE.z1, z1: 12.8 },
    rua: { x0: TAB.x0, x1: TAB.x1, z0: 12.8, z1: TAB.z1 },
    superficies: [
      { r: LOTE, tipo: 'gramado' },
      { r: ret(24, 370, 794, 462), tipo: 'piso' },
      { r: ret(650, 70, 794, 370), tipo: 'piso' },
      { r: ret(110, 40, 650, 70), tipo: 'piso' },
      { r: predio.contorno, tipo: 'interno' },
    ],
    faixas: vagas.map((x) => ({ x0: X(x), x1: X(x) + 0.08, z0: Z(400), z1: Z(455) })),
    muros: [
      { seg: [LOTE.x0, LOTE.z0, LOTE.x1, LOTE.z0], altura: 2.2 },
      { seg: [LOTE.x0, LOTE.z0, LOTE.x0, Z(370)], altura: 2.2 },
      { seg: [LOTE.x1, LOTE.z0, LOTE.x1, Z(370)], altura: 2.2 },
    ],
    grades: [],
    predios: [],
    edificacoes,
    moveis,
    enfeites: [],
    arvores: [[X(50), Z(120), 0.85], [X(55), Z(250), 0.8], [X(60), Z(340), 0.75], [X(70), Z(45), 0.7], [X(760), Z(45), 0.7]],
    carros: (loja ? [190, 270, 590] : [190, 270, 430, 590]).map((x, i) => ({ x: X(x), z: Z(426), cor: [0x2b4058, 0x6b7280, 0x3f5a48, 0x7a4a2e][i]!, rumo: 180 })),
    postes: [[-11, 12.1], [5, 12.1]],
    pessoas: [
      loja ? { x: X(705), z: Z(275), cor: 0x9fc3e6, papel: 'visitante' } : { x: X(210), z: Z(400), cor: 0x9fc3e6, papel: 'visitante' },
      loja ? { x: X(240), z: Z(255), cor: 0xcfd8e3, papel: 'morador' } : { x: X(200), z: Z(345), cor: 0xcfd8e3, papel: 'morador' },
      loja ? { x: X(380), z: Z(345), cor: 0xe0b27a, papel: 'morador' } : { x: X(500), z: Z(150), cor: 0xe0b27a, papel: 'morador' },
    ],
    cameras,
    areasDeCirculacao: planta.zonas.map((z) => ret(z.x, z.y, z.x + z.w, z.y + z.h)),
    camadas: {
      cabos: [{ tipo: 'rack', pos: dvr }, ...cabosDasCameras(cameras, dvr, teto)],
      rede: [
        { tipo: 'rack', pos: dvr },
        ...pontosWifi.map((pos): ElementoCamada => ({ tipo: 'wifi', pos, altura: 3.9 })),
        ...pontosWifi.map(([x, z]): ElementoCamada => ({ tipo: 'cabo', pontos: [[x, 3.85, z], [x, teto, dvr[1]], [dvr[0], teto, dvr[1]], [dvr[0], 1.9, dvr[1]]], raio: 0.07, forca: 2.8, vel: 1.2 })),
      ],
      energia: [{ tipo: 'nobreak', pos: [dvr[0] - 1.2, dvr[1] + 0.2] }, { tipo: 'cabo', pontos: [[dvr[0] - 1.2, 0.12, dvr[1] + 0.2], [dvr[0], 0.12, dvr[1] + 0.2], [dvr[0], 0.12, dvr[1]]], raio: 0.06, forca: 3.4, vel: 0.7 }],
      alarme: sensoresDoAlarme(edificacoes, loja ? [[X(220), 3.8, Z(260)], [X(550), 3.8, Z(150)]] : [[X(280), 3.8, Z(120)], [X(550), 3.8, Z(150)]]),
      acesso: [loja ? { tipo: 'leitor', pos: [X(662), Z(215)], rumo: 90 } : { tipo: 'leitor', pos: [X(172), Z(381)] }],
    },
    zonas: [
      { nome: nome(1), pos: [X(210), 1.8, Z(270)], interna: true },
      { nome: nome(2), pos: [X(380), 1.8, Z(250)], interna: true },
      { nome: nome(3), pos: [X(550), 2.2, Z(150)], interna: true },
      { nome: nome(0), pos: [X(280), 1.8, Z(115)], interna: true },
      { nome: nome(4), pos: [X(550), 1.8, Z(300)], interna: true },
      { nome: 'Estacionamento', pos: [X(450), 1.6, Z(420)] },
      ...(loja ? [{ nome: 'Carga e descarga', pos: [X(722), 3, Z(260)] as Ponto3 } satisfies Zona] : []),
    ],
    maos: [14.6, 18],
  };
}

/* ------------------------------------------------------------------ peças comuns */

/** Câmeras da maquete = pontos sugeridos da planta, na mesma ordem (CAM 01 é o primeiro ponto). */
function camerasDaPlanta(ambiente: AmbienteMaquete, planta: Planta, edificacoes: readonly Edificacao[], op: { alturaExt: number; alturaInt: number; alcanceExt: number; alcanceInt: number }): CameraMaquete[] {
  const c = conversor(tipoPlanta(ambiente));
  return planta.sugestoes.map((s, i) => {
    let x = c.X(s.x);
    let z = c.Z(s.y);
    const rumo = c.rumo(s.angulo);
    const interna = edificacoes.some((e) => dentro(e.contorno, x, z));
    if (interna) {
      // Afasta das paredes para a câmera ficar dentro do cômodo.
      const [dx, dz] = direcao(rumo);
      x += dx * 0.35;
      z += dz * 0.35;
    } else {
      // Câmera de parede: um pouco para fora da parede (a parede não pode tapar a própria câmera).
      const [dx, dz] = direcao(rumo);
      const folga = (e: Edificacao) => dentro({ x0: e.contorno.x0 - 0.3, x1: e.contorno.x1 + 0.3, z0: e.contorno.z0 - 0.3, z1: e.contorno.z1 + 0.3 }, x, z);
      for (let k = 0; k < 20 && edificacoes.some(folga); k++) { x += dx * 0.05; z += dz * 0.05; }
    }
    return {
      id: i + 1,
      nome: nomeEm(s.nome, ambiente),
      x: +x.toFixed(2),
      y: interna ? op.alturaInt : op.alturaExt,
      z: +z.toFixed(2),
      rumo,
      abertura: interna ? 92 : 82,
      alcance: interna ? op.alcanceInt : op.alcanceExt,
      interna,
    };
  });
}

/** Cabo de cada câmera até o gravador, pelo teto, em "L" (como no configurador). */
function cabosDasCameras(cameras: readonly CameraMaquete[], dvr: Ponto2, teto: number): ElementoCamada[] {
  return cameras.map((cam) => ({
    tipo: 'cabo', camera: cam.id, raio: 0.05, forca: 2.6, vel: 1.1,
    pontos: [[cam.x, cam.y, cam.z], [cam.x, teto, cam.z], [cam.x, teto, dvr[1]], [dvr[0], teto, dvr[1]], [dvr[0], 1.9, dvr[1]]],
  }));
}

/** Alarme: um sensor em cada porta, janela, vitrine e portão das paredes de fora, mais os de presença dentro. */
function sensoresDoAlarme(edificacoes: readonly Edificacao[], presenca: readonly Ponto3[]): ElementoCamada[] {
  const sensores: ElementoCamada[] = [];
  for (const e of edificacoes) {
    const [cx, cz] = [(e.contorno.x0 + e.contorno.x1) / 2, (e.contorno.z0 + e.contorno.z1) / 2];
    for (const p of e.paredes) {
      if (!p.externa) continue;
      const [ax, az, bx, bz] = p.seg;
      const L = Math.hypot(bx - ax, bz - az);
      for (const v of p.vaos ?? []) {
        const d = (v.de + v.ate) / 2;
        const x = ax + ((bx - ax) * d) / L;
        const z = az + ((bz - az) * d) / L;
        // para fora: do centro do imóvel para a parede
        const fx = Math.abs(bx - ax) > Math.abs(bz - az) ? 0 : Math.sign(x - cx);
        const fz = Math.abs(bx - ax) > Math.abs(bz - az) ? Math.sign(z - cz) : 0;
        sensores.push({ tipo: 'sensor', pos: [x + fx * 0.3, Math.min(e.altura - 0.3, v.tipo === 'garagem' ? 2.55 : 2.35), z + fz * 0.3] });
      }
    }
  }
  return [...sensores, ...presenca.map((pos): ElementoCamada => ({ tipo: 'sensor', pos }))];
}

export const MAQUETES: Readonly<Record<AmbienteMaquete, Maquete>> = {
  casa: maqueteCasa(),
  comercio: maqueteComercial('comercio'),
  empresa: maqueteComercial('empresa'),
};

/** Superfícies por tipo, para testes. */
export const superficiesDe = (m: Maquete, tipo: Superficie['tipo']) => m.superficies.filter((s) => s.tipo === tipo).map((s) => s.r);
