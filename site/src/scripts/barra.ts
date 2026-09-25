import { planos, nomePlano, textoPreco, linkWhatsapp, mensagemPlano, formatarPreco, menorPreco, mostrarPrecos, textoTaxaInstalacao, type Plano } from '../lib/dados';
import type { ResumoBarra } from './configurador';
import { exigir, todos } from './dom';

/**
 * Barra fixa do celular: muda conforme a seção visível.
 * Abertura/dúvidas → contato · Planos → plano visível · Configurador → resumo do sistema.
 * Some na seção de contato (o botão grande já está lá), com o menu aberto e com o teclado na tela.
 */
export function iniciarBarra(): void {
  const barra = document.querySelector<HTMLElement>('.barra-fixa');
  if (!barra) return;
  const titulo = exigir('[data-barra-titulo]', barra);
  const sub = exigir('[data-barra-sub]', barra);
  const link = exigir<HTMLAnchorElement>('[data-barra-link]', barra);
  const acao = exigir('[data-barra-acao]', barra);

  const padrao: ResumoBarra = {
    titulo: 'Fale com a SC',
    sub: mostrarPrecos ? `A partir de R$ ${formatarPreco(menorPreco)}/mês` : 'Planos de locação de câmeras',
    link: link.href,
    acao: 'Conversar',
  };
  let planoVisivel: Plano = planos.find((p) => p.destaque) ?? planos[0]!;
  let resumoConfig: ResumoBarra = { titulo: 'Monte seu sistema', sub: 'Toque na planta para marcar', link: padrao.link, acao: 'Enviar' };
  let secao = 'inicio';

  const conteudo = (): ResumoBarra => {
    if (secao === 'planos' && !exigir('#aba-cameras').hidden) {
      return {
        titulo: `${nomePlano(planoVisivel).replace('Plano de ', '')} · ${textoPreco(planoVisivel)}`,
        sub: `Instalação: ${textoTaxaInstalacao(planoVisivel)}`,
        link: linkWhatsapp(mensagemPlano(planoVisivel)),
        acao: 'Quero este',
      };
    }
    return secao === 'monte' ? resumoConfig : padrao;
  };
  const pintar = () => {
    const c = conteudo();
    barra.dataset.modo = secao === 'monte' ? 'configurador' : secao === 'planos' ? 'plano' : 'contato';
    titulo.textContent = c.titulo;
    sub.textContent = c.sub;
    link.href = c.link;
    acao.textContent = c.acao;
  };

  // Seção dominante na tela
  const observador = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      secao = e.target.id;
      barra.toggleAttribute('data-escondida', secao === 'contato');
      pintar();
    }
  }, { rootMargin: '-50% 0px -50% 0px' });
  ['inicio', 'planos', 'monte', 'como-funciona', 'contato'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) observador.observe(el);
  });

  document.addEventListener('sc:plano-visivel', (e) => {
    planoVisivel = planos.find((p) => p.cameras === (e as CustomEvent<number>).detail) ?? planoVisivel;
    pintar();
  });
  document.addEventListener('sc:resumo-config', (e) => {
    resumoConfig = (e as CustomEvent<ResumoBarra>).detail;
    pintar();
  });
  todos('.guias [role="tab"]').forEach((g) => g.addEventListener('click', () => requestAnimationFrame(pintar)));

  // No configurador, tocar no texto leva ao resumo completo.
  exigir('.barra-texto', barra).addEventListener('click', () => {
    if (secao === 'monte') document.querySelector('.config-resumo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Teclado virtual aberto: esconde a barra para não cobrir o campo.
  document.addEventListener('focusin', (e) => {
    if ((e.target as Element).matches('input[type="search"], input[type="text"]')) barra.dataset.teclado = '';
  });
  document.addEventListener('focusout', () => delete barra.dataset.teclado);
  // Menu aberto: esconde a barra.
  const menu = exigir('#menu-celular');
  new MutationObserver(() => barra.toggleAttribute('data-menu', !menu.hidden)).observe(menu, { attributes: true, attributeFilter: ['hidden'] });

  pintar();
}
