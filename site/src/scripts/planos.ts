import { exigir, todos } from './dom';
import type { PedidoConfigurar } from './configurador';
import type { AmbienteConfigId } from '../lib/configurador-dados';

/** Abas de solução, carrossel do celular e atalhos para o configurador. */
export function iniciarPlanos(): void {
  const guias = todos<HTMLButtonElement>('.guias [role="tab"]');
  if (!guias.length) return;

  const selecionar = (guia: HTMLButtonElement, focar = false) => {
    guias.forEach((g) => {
      const ativa = g === guia;
      g.setAttribute('aria-selected', String(ativa));
      g.tabIndex = ativa ? 0 : -1;
      exigir(`#${g.getAttribute('aria-controls')}`).hidden = !ativa;
    });
    if (focar) guia.focus();
  };
  guias.forEach((g, i) => {
    g.addEventListener('click', () => selecionar(g));
    g.addEventListener('keydown', (e) => {
      const destino = { ArrowRight: guias[(i + 1) % guias.length], ArrowLeft: guias[(i - 1 + guias.length) % guias.length], Home: guias[0], End: guias.at(-1) }[e.key];
      if (destino) {
        e.preventDefault();
        selecionar(destino, true);
      }
    });
  });
  document.addEventListener('sc:abrir-aba', (e) => {
    const guia = document.getElementById(`guia-${(e as CustomEvent<string>).detail}`);
    if (guia instanceof HTMLButtonElement) selecionar(guia);
  });

  // Carrossel: o plano "visível" é o mais perto do centro; pontos e barra fixa acompanham.
  const trilho = exigir('.planos-trilho');
  const cartoes = todos('.plano', trilho);
  const pontos = todos<HTMLButtonElement>('[data-ir-plano]');
  const centralizar = (alvo: HTMLElement, comportamento: ScrollBehavior = 'smooth') => {
    const esquerda = alvo.getBoundingClientRect().left - trilho.getBoundingClientRect().left + trilho.scrollLeft;
    trilho.scrollTo({ left: esquerda - (trilho.clientWidth - alvo.clientWidth) / 2, behavior: comportamento });
  };
  const marcar = (n: number) => pontos.forEach((p) => p.setAttribute('aria-current', String(p.dataset.irPlano === String(n))));
  let atual = 0;
  let quadro = 0;
  const conferirCentro = () => {
    quadro = 0;
    if (trilho.scrollWidth <= trilho.clientWidth) return;
    const caixa = trilho.getBoundingClientRect();
    const meio = caixa.left + caixa.width / 2;
    const distancia = (c: HTMLElement) => { const r = c.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - meio); };
    const perto = cartoes.reduce<HTMLElement | null>((a, c) => (!a || distancia(c) < distancia(a) ? c : a), null);
    const n = Number(perto?.dataset.plano);
    if (!n || n === atual) return;
    atual = n;
    marcar(n);
    document.dispatchEvent(new CustomEvent<number>('sc:plano-visivel', { detail: n }));
  };
  const agendar = () => { if (!quadro) quadro = requestAnimationFrame(conferirCentro); };
  trilho.addEventListener('scroll', agendar, { passive: true });
  addEventListener('resize', agendar);
  marcar(4);
  pontos.forEach((p) => p.addEventListener('click', () => centralizar(exigir(`#plano-${p.dataset.irPlano}`))));
  // No celular, começa mostrando o plano em destaque.
  if (trilho.scrollWidth > trilho.clientWidth) {
    const destaque = trilho.querySelector<HTMLElement>('.plano-destaque');
    if (destaque) centralizar(destaque, 'instant');
    conferirCentro();
  }

  // "Ver no configurador" leva a quantidade de câmeras (ou o condomínio) para a Tela 3.
  const configurar = (pedido: PedidoConfigurar) => document.dispatchEvent(new CustomEvent<PedidoConfigurar>('sc:configurar', { detail: pedido }));
  todos<HTMLAnchorElement>('[data-configurar]').forEach((link) => link.addEventListener('click', () => configurar({ cameras: Number(link.dataset.configurar) })));
  todos<HTMLAnchorElement>('[data-configurar-ambiente]').forEach((link) =>
    link.addEventListener('click', () => configurar({ ambiente: link.dataset.configurarAmbiente as AmbienteConfigId })),
  );
}
