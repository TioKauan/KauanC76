/**
 * Roteiro por rolagem, comum às páginas com maquete 3D (condomínio, casa, comércio, empresa).
 * Liga os capítulos, as camadas, a lista de câmeras, os pontos cegos, o "E se…?" e o modo
 * explorar à maquete. A maquete (cena.ts) só é baixada se o aparelho aguentar; sem ela a
 * página continua completa, com a imagem pronta.
 */
import { exigir, todos } from '../dom';
import { reduzirMovimento } from '../movimento';
import { estadoCena, type AmbienteId, type SituacaoId, type SistemaId } from '../../lib/cenarios';
import type { Camada, Capitulo, Maquete } from '../../lib/maquete/tipos';
import { estadoDoCapitulo, type EstadoMaquete, type Maquete3D, type OpcoesMaquete } from './estado';

export interface OpcoesRoteiro {
  capitulos: readonly Capitulo[];
  camadas: readonly Camada[];
  maquete: Maquete;
  /** Para os textos do "E se…?" (os mesmos da página inicial). */
  ambiente: AmbienteId;
  textoNoturno: string;
  etiquetas?: OpcoesMaquete['etiquetas'];
  /** A página ajusta o estado ao entrar num capítulo (ex.: câmeras do plano escolhido). */
  aoEntrar?: (estado: EstadoMaquete) => void;
}

export interface Roteiro {
  estado: EstadoMaquete;
  /** Avisa a maquete e os botões de que o estado mudou. */
  avisar(voar?: boolean): void;
  escolherCamera(id: number): void;
}

export function iniciarRoteiro(op: OpcoesRoteiro): Roteiro {
  const tour = exigir('[data-tour]');
  const palco = exigir('[data-palco]');
  const primeiro = op.capitulos[0]!;
  const estado: EstadoMaquete = estadoDoCapitulo(primeiro);
  estado.nobreak = true;
  op.aoEntrar?.(estado);
  let maquete: Maquete3D | null = null;

  const avisar = (voar = false) => {
    pintarControles();
    maquete?.atualizar(estado, voar);
  };

  /* ---------- camadas (botões do palco) ---------- */
  const botoesCamada = todos<HTMLButtonElement>('[data-camada]', palco);
  function pintarControles(): void {
    for (const b of botoesCamada) b.setAttribute('aria-pressed', String(estado.camadas.has(b.dataset.camada ?? '')));
    for (const b of todos<HTMLButtonElement>('[data-camera]')) b.setAttribute('aria-pressed', String(Number(b.dataset.camera) === estado.selecionada));
    document.querySelector<HTMLButtonElement>('[data-pontos-cegos]')?.setAttribute('aria-pressed', String(estado.pontosCegos));
  }
  for (const b of botoesCamada) {
    b.addEventListener('click', () => {
      const id = b.dataset.camada ?? '';
      const nova = new Set(estado.camadas);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      estado.camadas = nova;
      avisar();
    });
  }

  /* ---------- câmeras e pontos cegos ---------- */
  function escolherCamera(id: number): void {
    estado.selecionada = id;
    estado.monitor = [id];
    if (!estado.camadas.has('cameras')) estado.camadas = new Set([...estado.camadas, 'cameras']);
    if (estado.instaladas && !estado.instaladas.includes(id)) estado.instaladas = [...estado.instaladas, id];
    avisar();
  }
  for (const b of todos<HTMLButtonElement>('[data-camera]')) b.addEventListener('click', () => escolherCamera(Number(b.dataset.camera)));
  document.querySelector<HTMLButtonElement>('[data-pontos-cegos]')?.addEventListener('click', () => {
    estado.pontosCegos = !estado.pontosCegos;
    avisar();
  });

  /* ---------- "E se…?" ---------- */
  const ese = document.querySelector<HTMLElement>('[data-ese]');
  const opcoesEse = ese ? todos<HTMLButtonElement>('[data-ese-situacao]', ese) : [];
  const nobreakEse = ese?.querySelector<HTMLButtonElement>('[data-ese-nobreak]') ?? null;
  function pintarEse(): void {
    if (!ese) return;
    const e = estadoCena(op.ambiente, estado.situacao, estado.nobreak);
    ese.dataset.situacao = estado.situacao;
    for (const o of opcoesEse) o.setAttribute('aria-pressed', String(o.dataset.eseSituacao === estado.situacao));
    nobreakEse?.setAttribute('aria-pressed', String(estado.nobreak));
    exigir('[data-ese-titulo]', ese).textContent = e.titulo;
    exigir('[data-ese-explicacao]', ese).textContent = e.explicacao;
    exigir('[data-ese-condicao]', ese).textContent = e.condicao;
    for (const s of todos('[data-ese-sistema]', ese)) {
      const id = s.dataset.eseSistema as SistemaId;
      s.dataset.estado = e.estados[id];
      exigir('[data-ese-texto]', s).textContent = e.textos[id];
    }
  }
  for (const o of opcoesEse) {
    o.addEventListener('click', () => {
      estado.situacao = o.dataset.eseSituacao as SituacaoId;
      estado.nobreak = false; // como na página inicial: a pessoa liga o nobreak para ver o que muda
      estado.visitante = estado.situacao === 'visita';
      if (estado.capitulo.ese) {
        // Chegou visita: acende o acesso (o leitor no portão) junto com as câmeras.
        const camadas = new Set(estado.capitulo.camadas);
        if (estado.visitante && op.maquete.camadas.acesso) camadas.add('acesso');
        estado.camadas = camadas;
      }
      pintarEse();
      avisar();
    });
  }
  nobreakEse?.addEventListener('click', () => {
    estado.nobreak = !estado.nobreak;
    pintarEse();
    avisar();
  });

  /* ---------- Capítulos por rolagem ---------- */
  const elementos = op.capitulos.map((c) => exigir(`[data-capitulo="${c.id}"]`));
  const trilho = todos<HTMLAnchorElement>('[data-trilho-item]');
  function entrarNoCapitulo(c: Capitulo): void {
    if (estado.capitulo.id === c.id && maquete) return;
    const novo = estadoDoCapitulo(c, estado);
    if (c.ese && novo.visitante && op.maquete.camadas.acesso) novo.camadas = new Set([...novo.camadas, 'acesso']);
    Object.assign(estado, novo);
    op.aoEntrar?.(estado);
    palco.dataset.capitulo = c.id;
    elementos.forEach((el) => el.toggleAttribute('data-ativo', el.dataset.capitulo === c.id));
    for (const a of trilho) {
      if (a.dataset.trilhoItem === c.id) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    }
    avisar(true);
  }
  /** Onde a leitura está: a linha no meio da tela (no celular, abaixo da maquete). */
  const linha = () => innerHeight * (matchMedia('(max-width: 800px)').matches ? 0.6 : 0.475);
  let pedido = 0;
  function acompanharRolagem(): void {
    pedido = 0;
    if (estado.explorar) return;
    const l = linha();
    const topos = elementos.map((el) => el.getBoundingClientRect().top);
    let i = 0;
    for (let k = 0; k < topos.length; k++) if (topos[k]! <= l) i = k;
    const atual = op.capitulos[i]!;
    if (atual.id !== estado.capitulo.id) entrarNoCapitulo(atual);
    const proximo = op.capitulos[i + 1] ?? null;
    const t = proximo ? Math.min(1, Math.max(0, (l - topos[i]!) / (topos[i + 1]! - topos[i]!))) : 0;
    maquete?.rolar(atual, proximo, t);
  }
  const agendar = () => { if (!pedido) pedido = requestAnimationFrame(acompanharRolagem); };
  addEventListener('scroll', agendar, { passive: true });
  addEventListener('resize', agendar);

  /* ---------- Explorar a maquete ---------- */
  function explorar(ligar: boolean): void {
    estado.explorar = ligar;
    tour.toggleAttribute('data-explorar', ligar);
    exigir('[data-explorar-barra]', palco).hidden = !ligar;
    document.documentElement.style.overflow = ligar ? 'hidden' : '';
    avisar(true);
    if (ligar) exigir<HTMLButtonElement>('[data-explorar-sair]', palco).focus();
    else {
      document.querySelector<HTMLButtonElement>('[data-explorar]')?.focus();
      agendar();
    }
  }
  document.querySelector('[data-explorar]')?.addEventListener('click', () => explorar(true));
  exigir('[data-explorar-sair]', palco).addEventListener('click', () => explorar(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && estado.explorar) explorar(false); });

  /* ---------- A maquete 3D (só se o aparelho aguentar) ---------- */
  function podeTer3D(): boolean {
    const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conexao?.saveData || new URLSearchParams(location.search).has('sem3d')) return false;
    try {
      return Boolean(document.createElement('canvas').getContext('webgl2'));
    } catch {
      return false;
    }
  }

  async function carregar3D(): Promise<void> {
    const canvas = exigir<HTMLCanvasElement>('[data-maquete]', palco);
    try {
      const { criarMaquete } = await import('./cena');
      maquete = criarMaquete({ canvas, palco, movimento: !reduzirMovimento(), maquete: op.maquete, camadas: op.camadas, textoNoturno: op.textoNoturno, etiquetas: op.etiquetas });
      maquete.aoEscolherCamera((id) => {
        const capCameras = op.capitulos.find((c) => c.numeros);
        if (capCameras && !estado.capitulo.numeros && !estado.explorar) {
          document.getElementById(capCameras.id)?.scrollIntoView({ behavior: reduzirMovimento() ? 'auto' : 'smooth' });
        }
        escolherCamera(id);
      });
      canvas.hidden = false;
      document.documentElement.dataset['3d'] = '';
      todos('[data-so-3d]').forEach((el) => { el.hidden = false; });
      exigir('[data-monitor]', palco).hidden = false;
      maquete.atualizar(estado, false);
      acompanharRolagem();
      requestAnimationFrame(() => { palco.dataset.pronto = ''; });
    } catch (erro) {
      // Sem 3D a página continua completa: fica a imagem da maquete.
      console.warn('Maquete 3D indisponível:', erro);
      canvas.hidden = true;
    }
  }

  pintarEse();
  pintarControles();
  elementos[0]?.toggleAttribute('data-ativo', true);
  acompanharRolagem();
  if (podeTer3D()) void carregar3D();

  // Para as conferências do validador (e para depurar): estado atual, só leitura.
  (window as Window & { __maquete?: () => unknown }).__maquete = () => ({
    capitulo: estado.capitulo.id,
    camadas: [...estado.camadas],
    selecionada: estado.selecionada,
    monitor: [...estado.monitor],
    instaladas: estado.instaladas ? [...estado.instaladas] : null,
    pontosCegos: estado.pontosCegos,
    situacao: estado.situacao,
    nobreak: estado.nobreak,
    visitante: estado.visitante,
    explorar: estado.explorar,
    maquete: Boolean(maquete),
    camadasTotais: op.camadas.length,
  });

  return { estado, avisar, escolherCamera };
}
