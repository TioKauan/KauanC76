import { planos, nomePlano, textoPreco, linkWhatsapp, mensagemPlano, condicoes, formatarPreco, menorPreco, mostrarPrecos } from '../dados.js';

/**
 * Barra fixa do celular: muda conforme a seção visível.
 * Abertura/dúvidas → contato · Planos → plano visível · Configurador → resumo do sistema.
 * Some na seção de contato (o botão grande já está lá) e quando um campo de texto está em uso.
 */
export function iniciarBarra() {
  const barra = document.querySelector('.barra-fixa');
  if (!barra) return;
  const titulo = barra.querySelector('[data-barra-titulo]');
  const sub = barra.querySelector('[data-barra-sub]');
  const link = barra.querySelector('[data-barra-link]');
  const acao = barra.querySelector('[data-barra-acao]');

  const padrao = {
    titulo: 'Fale com a SC',
    sub: mostrarPrecos ? `A partir de R$ ${formatarPreco(menorPreco)}/mês` : 'Planos de locação de câmeras',
    link: link.href,
    acao: 'Conversar',
  };
  let planoVisivel = planos.find((p) => p.destaque) || planos[0];
  let resumoConfig = { titulo: 'Monte seu sistema', sub: 'Toque na planta para marcar', link: padrao.link, acao: 'Enviar' };
  let secao = 'inicio';

  const conteudo = () => {
    if (secao === 'planos' && !document.getElementById('aba-cameras').hidden) {
      return { titulo: `${nomePlano(planoVisivel).replace('Plano de ', '')} · ${textoPreco(planoVisivel)}`, sub: condicoes[0].titulo, link: linkWhatsapp(mensagemPlano(planoVisivel)), acao: 'Quero este' };
    }
    if (secao === 'monte') return resumoConfig;
    return padrao;
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
  const secoes = ['inicio', 'planos', 'monte', 'como-funciona', 'contato'].map((id) => document.getElementById(id)).filter(Boolean);
  const observador = new IntersectionObserver((entradas) => {
    for (const e of entradas) if (e.isIntersecting) { secao = e.target.id; barra.toggleAttribute('data-escondida', secao === 'contato'); pintar(); }
  }, { rootMargin: '-50% 0px -50% 0px' });
  secoes.forEach((s) => observador.observe(s));

  document.addEventListener('sc:plano-visivel', (e) => { planoVisivel = planos.find((p) => p.cameras === e.detail) || planoVisivel; pintar(); });
  document.addEventListener('sc:resumo-config', (e) => { resumoConfig = e.detail; pintar(); });
  document.querySelectorAll('.guias [role="tab"]').forEach((g) => g.addEventListener('click', () => requestAnimationFrame(pintar)));

  // No configurador, tocar no texto leva ao resumo completo.
  barra.querySelector('.barra-texto').addEventListener('click', () => {
    if (secao === 'monte') document.querySelector('.config-resumo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Teclado virtual aberto: esconde a barra para não cobrir o campo.
  document.addEventListener('focusin', (e) => { if (e.target.matches('input[type="search"], input[type="text"]')) barra.dataset.teclado = ''; });
  document.addEventListener('focusout', () => delete barra.dataset.teclado);
  // Menu aberto: esconde a barra.
  const menu = document.getElementById('menu-celular');
  new MutationObserver(() => barra.toggleAttribute('data-menu', !menu.hidden)).observe(menu, { attributes: true, attributeFilter: ['hidden'] });

  pintar();
}
