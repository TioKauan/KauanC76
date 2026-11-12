/**
 * Tela da ferramenta "Toque onde quer câmera" (src/components/ToqueCamera.astro).
 * A conta fica em src/lib/toque-camera.ts; aqui só se liga a regra aos botões e ao resultado.
 */
import { formatarPreco, mostrarPrecos, nomePlano, rotuloTaxa, textoTaxaInstalacao, toqueCamera } from '../lib/dados';
import { MAX_PONTOS, fachadas, resultadoToque, type IdFachada } from '../lib/toque-camera';

function iniciar(raiz: HTMLElement): void {
  const fachada = fachadas[raiz.dataset.toque as IdFachada];
  if (!fachada) return;
  const pegar = <T extends HTMLElement = HTMLElement>(nome: string) => raiz.querySelector<T>(`[data-toque-${nome}]`);
  const resultado = pegar('resultado');
  const qtd = pegar('qtd');
  const convite = pegar('convite');
  const blocoPlano = pegar('plano');
  const nome = pegar('nome');
  const preco = pegar('preco');
  const mes = pegar('mes');
  const taxa = pegar('taxa');
  const cabo = pegar('cabo');
  const aviso = pegar('aviso');
  const blocoProposta = pegar('proposta');
  const caixaWhats = pegar('caixa-whats');
  const cta = pegar<HTMLAnchorElement>('cta');
  const ctaSr = pegar('cta-sr');
  const caixaSol = pegar('caixa-sol');
  const sol = pegar<HTMLAnchorElement>('sol');
  if (!resultado || !qtd || !convite || !blocoPlano || !nome || !preco || !mes || !taxa || !cabo || !aviso || !blocoProposta || !caixaWhats || !cta || !ctaSr || !caixaSol || !sol) return;

  const botoes = [...raiz.querySelectorAll<HTMLButtonElement>('button[data-ponto]')];
  const pontoDe = new Map(fachada.pontos.map((p) => [p.id, p]));
  const marcados = new Set<string>();

  const atualizar = () => {
    for (const b of botoes) {
      const p = pontoDe.get(b.dataset.ponto ?? '');
      if (!p) continue;
      const marcado = marcados.has(p.id);
      b.setAttribute('aria-pressed', String(marcado));
      raiz.querySelector(`[data-legenda="${p.id}"]`)?.toggleAttribute('data-marcado', marcado);
    }

    const r = resultadoToque(fachada, marcados);
    const { recomendacao: rec } = r;
    qtd.textContent = `${r.quantidade} ${r.quantidade === 1 ? 'câmera marcada' : 'câmeras marcadas'}`;
    convite.hidden = r.quantidade > 0;

    const plano = rec.plano;
    blocoPlano.hidden = !plano;
    caixaWhats.hidden = !plano || !r.linkWhatsapp;
    if (plano && r.linkWhatsapp) {
      nome.textContent = nomePlano(plano);
      preco.textContent = mostrarPrecos ? `R$ ${formatarPreco(plano.preco)}` : 'Sob consulta';
      mes.hidden = !mostrarPrecos;
      taxa.textContent = `Instalação: ${textoTaxaInstalacao(plano)}${mostrarPrecos ? ` (${rotuloTaxa})` : ''}`;
      cabo.textContent = `O cabo incluso vai até ${plano.caboMetros} m`;
      aviso.hidden = rec.tipo !== 'folga';
      aviso.textContent = rec.tipo === 'folga' ? toqueCamera.avisoFolga(r.quantidade) : '';
      cta.href = r.linkWhatsapp;
      ctaSr.textContent = ` (${nomePlano(plano)}, abre o WhatsApp da equipe)`;
    } else {
      cta.removeAttribute('href');
    }

    const proposta = rec.tipo === 'proposta';
    blocoProposta.hidden = !proposta;
    caixaSol.hidden = !proposta;
    sol.dataset.solMensagem = proposta ? toqueCamera.mensagemProposta(r.pontos) : toqueCamera.proposta;
  };

  for (const b of botoes) {
    b.disabled = false;
    b.addEventListener('click', () => {
      const id = b.dataset.ponto ?? '';
      if (marcados.has(id)) marcados.delete(id);
      else if (marcados.size < MAX_PONTOS) marcados.add(id);
      atualizar();
    });
  }
  const semJs = pegar('semjs');
  if (semJs) semJs.hidden = true;
  resultado.hidden = false;
  raiz.toggleAttribute('data-ativo', true);
  atualizar();
}

export function iniciarToqueCamera(): void {
  for (const raiz of document.querySelectorAll<HTMLElement>('[data-toque]')) iniciar(raiz);
}
