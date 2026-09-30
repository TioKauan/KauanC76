import { iniciarMoldura } from '../moldura';
import { iniciarBarra } from '../barra';
import { iniciarSol } from '../sol';
import { exigir, todos } from '../dom';
import { reduzirMovimento } from '../movimento';
import { CAPITULOS, CAMADAS, camadaPorSistema, capituloPorId, type CamadaId, type Capitulo } from '../../lib/condominio/capitulos';
import { mensagemProposta } from '../../lib/condominio/proposta';
import { estadoCena, type SituacaoId, type SistemaId } from '../../lib/cenarios';
import type { EstadoMaquete, Maquete3D } from './estado';

/**
 * Página do condomínio: capítulos por rolagem, "E se…?", proposta e a maquete 3D.
 * Tudo funciona sem a maquete; ela só é baixada se o aparelho tiver WebGL 2
 * e a pessoa não estiver economizando dados.
 */
iniciarMoldura();
iniciarBarra();
iniciarSol();

const tour = exigir('[data-tour]');
const palco = exigir('[data-palco]');
const primeiro = CAPITULOS[0]!;

const estado: EstadoMaquete = {
  capitulo: primeiro,
  camadas: new Set(primeiro.camadas),
  selecionada: primeiro.selecionada ?? null,
  monitor: primeiro.monitor,
  pontosCegos: Boolean(primeiro.pontosCegos),
  visitante: Boolean(primeiro.visitante),
  situacao: 'energia',
  nobreak: true,
  explorar: false,
};
let maquete: Maquete3D | null = null;
const avisar = (voar = false) => {
  pintarControles();
  maquete?.atualizar(estado, voar);
};

/* ---------- camadas (botões do palco) ---------- */
const botoesCamada = todos<HTMLButtonElement>('[data-camada]', palco);
function pintarControles(): void {
  for (const b of botoesCamada) b.setAttribute('aria-pressed', String(estado.camadas.has(b.dataset.camada as CamadaId)));
  for (const b of todos<HTMLButtonElement>('[data-camera]')) b.setAttribute('aria-pressed', String(Number(b.dataset.camera) === estado.selecionada));
  const cegos = document.querySelector<HTMLButtonElement>('[data-pontos-cegos]');
  cegos?.setAttribute('aria-pressed', String(estado.pontosCegos));
}
for (const b of botoesCamada) {
  b.addEventListener('click', () => {
    const id = b.dataset.camada as CamadaId;
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
  avisar();
}
for (const b of todos<HTMLButtonElement>('[data-camera]')) b.addEventListener('click', () => escolherCamera(Number(b.dataset.camera)));
document.querySelector<HTMLButtonElement>('[data-pontos-cegos]')?.addEventListener('click', () => {
  estado.pontosCegos = !estado.pontosCegos;
  avisar();
});

/* ---------- "E se…?" (capítulo de energia) ---------- */
const ese = exigir('[data-ese]');
const opcoesEse = todos<HTMLButtonElement>('[data-ese-situacao]', ese);
const nobreakEse = exigir<HTMLButtonElement>('[data-ese-nobreak]', ese);
function pintarEse(): void {
  const e = estadoCena('condominio', estado.situacao, estado.nobreak);
  ese.dataset.situacao = estado.situacao;
  for (const o of opcoesEse) o.setAttribute('aria-pressed', String(o.dataset.eseSituacao === estado.situacao));
  nobreakEse.setAttribute('aria-pressed', String(estado.nobreak));
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
    pintarEse();
    avisar();
  });
}
nobreakEse.addEventListener('click', () => {
  estado.nobreak = !estado.nobreak;
  pintarEse();
  avisar();
});

/* ---------- Monte a proposta ---------- */
const proposta = exigir('[data-proposta]');
const marcas = todos<HTMLInputElement>('[data-proposta-sistema]', proposta);
const blocos = exigir<HTMLInputElement>('[data-proposta-blocos]', proposta);
const apartamentos = exigir<HTMLInputElement>('[data-proposta-apartamentos]', proposta);
const enviar = exigir<HTMLAnchorElement>('[data-proposta-enviar]', proposta);
const camadasDaProposta = (): Set<CamadaId> =>
  new Set(marcas.filter((m) => m.checked).map((m) => camadaPorSistema(m.value)?.id).filter((c): c is CamadaId => Boolean(c)));
function pintarProposta(): void {
  const msg = mensagemProposta({ sistemas: marcas.filter((m) => m.checked).map((m) => m.value), blocos: blocos.value, apartamentos: apartamentos.value });
  exigir('[data-proposta-mensagem]', proposta).textContent = msg;
  enviar.dataset.solMensagem = msg; // a Sol lê na hora do toque
  if (estado.capitulo.id === 'proposta') {
    estado.camadas = camadasDaProposta();
    avisar();
  }
}
for (const m of marcas) m.addEventListener('change', pintarProposta);
blocos.addEventListener('input', pintarProposta);
apartamentos.addEventListener('input', pintarProposta);
proposta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && (e.target as HTMLInputElement).type === 'number') e.preventDefault(); });

/* ---------- Capítulos por rolagem ---------- */
function entrarNoCapitulo(c: Capitulo): void {
  if (estado.capitulo.id === c.id && maquete) return;
  estado.capitulo = c;
  estado.camadas = c.id === 'proposta' ? camadasDaProposta() : new Set(c.camadas);
  estado.selecionada = c.selecionada ?? null;
  estado.monitor = c.monitor;
  estado.pontosCegos = Boolean(c.pontosCegos);
  estado.visitante = c.id === 'energia' ? estado.situacao === 'visita' : Boolean(c.visitante);
  palco.dataset.capitulo = c.id;
  avisar(true);
}
const observador = new IntersectionObserver((entradas) => {
  for (const e of entradas) {
    if (!e.isIntersecting) continue;
    const c = capituloPorId((e.target as HTMLElement).dataset.capitulo ?? '');
    if (c) entrarNoCapitulo(c);
  }
}, { rootMargin: matchMedia('(max-width: 800px)').matches ? '-60% 0px -35% 0px' : '-45% 0px -50% 0px' });
todos('[data-capitulo]').forEach((el) => observador.observe(el));

/* ---------- Explorar a maquete ---------- */
function explorar(ligar: boolean): void {
  estado.explorar = ligar;
  tour.toggleAttribute('data-explorar', ligar);
  exigir('[data-explorar-barra]', palco).hidden = !ligar;
  document.documentElement.style.overflow = ligar ? 'hidden' : '';
  avisar(true);
  if (ligar) exigir<HTMLButtonElement>('[data-explorar-sair]', palco).focus();
  else document.querySelector<HTMLButtonElement>('[data-explorar]')?.focus();
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
    maquete = criarMaquete({ canvas, palco, movimento: !reduzirMovimento() });
    maquete.aoEscolherCamera((id) => {
      if (estado.capitulo.id !== 'cameras' && !estado.explorar) {
        document.getElementById('cameras')?.scrollIntoView({ behavior: reduzirMovimento() ? 'auto' : 'smooth' });
      }
      escolherCamera(id);
    });
    canvas.hidden = false;
    document.documentElement.dataset['3d'] = '';
    todos('[data-so-3d]').forEach((el) => { el.hidden = false; });
    exigir('[data-monitor]', palco).hidden = false;
    maquete.atualizar(estado, false);
    requestAnimationFrame(() => { palco.dataset.pronto = ''; });
  } catch (erro) {
    // Sem 3D a página continua completa: fica a imagem da maquete.
    console.warn('Maquete 3D indisponível:', erro);
    canvas.hidden = true;
  }
}

pintarEse();
pintarProposta();
pintarControles();
if (podeTer3D()) void carregar3D();

// Para as conferências do validador (e para depurar): estado atual, só leitura.
(window as Window & { __condominio?: () => unknown }).__condominio = () => ({
  capitulo: estado.capitulo.id,
  camadas: [...estado.camadas],
  selecionada: estado.selecionada,
  monitor: [...estado.monitor],
  pontosCegos: estado.pontosCegos,
  situacao: estado.situacao,
  nobreak: estado.nobreak,
  visitante: estado.visitante,
  explorar: estado.explorar,
  maquete: Boolean(maquete),
  camadasTotais: CAMADAS.length,
});
