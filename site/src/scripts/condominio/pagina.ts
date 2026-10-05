import { iniciarMoldura } from '../moldura';
import { iniciarBarra } from '../barra';
import { iniciarSol } from '../sol';
import { exigir, todos } from '../dom';
import { iniciarRoteiro } from '../maquete/roteiro';
import { CAPITULOS, CAMADAS, camadaPorSistema, type CamadaId } from '../../lib/condominio/capitulos';
import { MAQUETE_CONDOMINIO } from '../../lib/condominio/maquete';
import { mensagemProposta } from '../../lib/condominio/proposta';
import { paginaCondominio } from '../../lib/dados';
import { etiquetasCondominio } from './etiquetas';

/**
 * Página do condomínio: o roteiro comum das maquetes (capítulos, "E se…?", explorar, maquete 3D)
 * e o formulário "Monte a proposta". Tudo funciona sem a maquete; ela só é baixada se o aparelho
 * tiver WebGL 2 e a pessoa não estiver economizando dados.
 */
iniciarMoldura();
iniciarBarra();
iniciarSol();

/* ---------- Monte a proposta ---------- */
const proposta = exigir('[data-proposta]');
const marcas = todos<HTMLInputElement>('[data-proposta-sistema]', proposta);
const blocos = exigir<HTMLInputElement>('[data-proposta-blocos]', proposta);
const apartamentos = exigir<HTMLInputElement>('[data-proposta-apartamentos]', proposta);
const enviar = exigir<HTMLAnchorElement>('[data-proposta-enviar]', proposta);
const camadasDaProposta = (): Set<CamadaId> =>
  new Set(marcas.filter((m) => m.checked).map((m) => camadaPorSistema(m.value)?.id).filter((c): c is CamadaId => Boolean(c)));

const roteiro = iniciarRoteiro({
  capitulos: CAPITULOS,
  camadas: CAMADAS,
  maquete: MAQUETE_CONDOMINIO,
  ambiente: 'condominio',
  textoNoturno: paginaCondominio.noturna,
  etiquetas: etiquetasCondominio,
  aoEntrar: (e) => { if (e.capitulo.id === 'proposta') e.camadas = camadasDaProposta(); },
});

function pintarProposta(): void {
  const msg = mensagemProposta({ sistemas: marcas.filter((m) => m.checked).map((m) => m.value), blocos: blocos.value, apartamentos: apartamentos.value });
  exigir('[data-proposta-mensagem]', proposta).textContent = msg;
  enviar.dataset.solMensagem = msg; // a Sol lê na hora do toque
  if (roteiro.estado.capitulo.id === 'proposta') {
    roteiro.estado.camadas = camadasDaProposta();
    roteiro.avisar();
  }
}
for (const m of marcas) m.addEventListener('change', pintarProposta);
blocos.addEventListener('input', pintarProposta);
apartamentos.addEventListener('input', pintarProposta);
proposta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && (e.target as HTMLInputElement).type === 'number') e.preventDefault(); });
pintarProposta();
