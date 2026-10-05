import { iniciarMoldura } from '../moldura';
import { iniciarBarra } from '../barra';
import { iniciarSol } from '../sol';
import { exigir, todos } from '../dom';
import { iniciarRoteiro } from '../maquete/roteiro';
import { MAQUETES, type AmbienteMaquete } from '../../lib/ambientes/maquetes';
import { camadasDe, capitulosDe } from '../../lib/ambientes/capitulos';
import { resumoPlano } from '../../lib/ambientes/plano';
import { avisoCabo } from '../../lib/configurador-logica';
import { mostrarPrecos, nomePlano, paginasAmbiente, rotuloTaxa, textoPreco, textoTaxaInstalacao } from '../../lib/dados';
import { rotuloCamera } from '../../lib/maquete/tipos';
import { mensagemQueroPlano } from '../../lib/sol';
import { etiquetasAmbiente } from './etiquetas';

/**
 * Páginas de Casa, Comércio e Empresa: o roteiro comum das maquetes e o "Escolha o plano",
 * que instala na maquete as câmeras do plano e mostra preço, instalação e cabo estimado.
 */
iniciarMoldura();
iniciarBarra();
iniciarSol();

const ambiente = exigir('[data-tour]').dataset.ambiente as AmbienteMaquete;
let plano = 4;

const roteiro = iniciarRoteiro({
  capitulos: capitulosDe(ambiente),
  camadas: camadasDe(ambiente),
  maquete: MAQUETES[ambiente],
  ambiente,
  textoNoturno: paginasAmbiente.noturna,
  etiquetas: etiquetasAmbiente(ambiente),
  aoEntrar: (e) => {
    if (e.capitulo.id !== 'plano') return;
    const r = resumoPlano(ambiente, plano);
    e.instaladas = r.cameras;
    e.monitor = r.cameras.slice(0, 4);
  },
});

/* ---------- Escolha o plano ---------- */
const cartao = exigir('[data-plano-cartao]');
const opcoes = todos<HTMLButtonElement>('[data-plano-opcao]');
const cta = exigir<HTMLAnchorElement>('[data-plano-cta]', cartao);
function escolherPlano(n: number): void {
  plano = n;
  const r = resumoPlano(ambiente, n);
  for (const o of opcoes) o.setAttribute('aria-pressed', String(Number(o.dataset.planoOpcao) === n));
  exigir('[data-plano-nome]', cartao).textContent = nomePlano(r.plano);
  exigir('[data-plano-uso]', cartao).textContent = r.plano.uso;
  exigir('[data-plano-preco]', cartao).textContent = textoPreco(r.plano);
  exigir('[data-plano-taxa]', cartao).textContent = `Instalação: ${textoTaxaInstalacao(r.plano)}${mostrarPrecos ? ` (${rotuloTaxa})` : ''}`;
  exigir('[data-plano-gravador]', cartao).textContent = r.plano.gravador;
  exigir('[data-plano-cameras]', cartao).replaceChildren(...r.cameras.map((id, i) => {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = rotuloCamera(id).replace('CAM ', '');
    li.append(b, r.nomes[i] ?? '');
    return li;
  }));
  const texto = exigir('[data-plano-cabo-texto]', cartao);
  texto.replaceChildren();
  const forte = document.createElement('b');
  forte.textContent = `≈ ${r.caboEstimado} m`;
  texto.append(forte, ` de ${r.plano.caboMetros} m inclusos`);
  const barra = exigir('[data-plano-cabo-barra]', cartao);
  barra.setAttribute('aria-valuemax', String(r.plano.caboMetros));
  barra.setAttribute('aria-valuenow', String(Math.min(r.caboEstimado, r.plano.caboMetros)));
  exigir('i', barra).style.width = `${Math.min(100, Math.round((r.caboEstimado / r.plano.caboMetros) * 100))}%`;
  exigir('[data-plano-cabo]', cartao).classList.toggle('excede', r.caboExcedente > 0);
  exigir('[data-plano-cabo-aviso]', cartao).textContent = avisoCabo(r.caboExcedente);
  cta.dataset.solPlano = String(n);
  cta.dataset.solMensagem = mensagemQueroPlano(n);
  exigir('[data-plano-cta-sr]', cta).textContent = ` (${nomePlano(r.plano)}, abre o chat da Sol)`;
  if (roteiro.estado.capitulo.id === 'plano') {
    roteiro.estado.instaladas = r.cameras;
    roteiro.estado.monitor = r.cameras.slice(0, 4);
    roteiro.estado.selecionada = null;
    roteiro.avisar();
  }
}
for (const o of opcoes) o.addEventListener('click', () => escolherPlano(Number(o.dataset.planoOpcao)));
todos('[data-so-js]').forEach((el) => { el.hidden = false; });
