/** Abas de solução, pontos do carrossel e atalhos para o configurador. */
export function iniciarPlanos() {
  const guias = [...document.querySelectorAll('.guias [role="tab"]')];
  if (!guias.length) return;

  const selecionar = (guia, focar = false) => {
    guias.forEach((g) => {
      const ativa = g === guia;
      g.setAttribute('aria-selected', String(ativa));
      g.tabIndex = ativa ? 0 : -1;
      document.getElementById(g.getAttribute('aria-controls')).hidden = !ativa;
    });
    if (focar) guia.focus();
  };
  guias.forEach((g, i) => {
    g.addEventListener('click', () => selecionar(g));
    g.addEventListener('keydown', (e) => {
      const passo = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (passo) { e.preventDefault(); selecionar(guias[(i + passo + guias.length) % guias.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selecionar(guias[0], true); }
      if (e.key === 'End') { e.preventDefault(); selecionar(guias[guias.length - 1], true); }
    });
  });
  document.addEventListener('sc:abrir-aba', (e) => {
    const guia = document.getElementById(`guia-${e.detail}`);
    if (guia) selecionar(guia);
  });

  // Carrossel: pontos acompanham o plano visível.
  const trilho = document.querySelector('.planos-trilho');
  const cartoes = [...document.querySelectorAll('.plano')];
  const pontos = [...document.querySelectorAll('[data-ir-plano]')];
  const centralizar = (alvo, comportamento = 'smooth') => {
    const esquerda = alvo.getBoundingClientRect().left - trilho.getBoundingClientRect().left + trilho.scrollLeft;
    trilho.scrollTo({ left: esquerda - (trilho.clientWidth - alvo.clientWidth) / 2, behavior: comportamento });
  };
  const marcar = (n) => pontos.forEach((p) => p.setAttribute('aria-current', String(p.dataset.irPlano === String(n))));
  // O plano "visível" é o mais perto do centro do carrossel.
  let atual = 0;
  let quadro = 0;
  const conferirCentro = () => {
    quadro = 0;
    if (trilho.scrollWidth <= trilho.clientWidth) return;
    const caixa = trilho.getBoundingClientRect();
    const meio = caixa.left + caixa.width / 2;
    const perto = cartoes.reduce((a, c) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - meio); return d < a.d ? { c, d } : a; }, { c: null, d: Infinity }).c;
    const n = Number(perto.dataset.plano);
    if (n === atual) return;
    atual = n;
    marcar(n);
    document.dispatchEvent(new CustomEvent('sc:plano-visivel', { detail: n }));
  };
  trilho.addEventListener('scroll', () => { if (!quadro) quadro = requestAnimationFrame(conferirCentro); }, { passive: true });
  addEventListener('resize', () => { if (!quadro) quadro = requestAnimationFrame(conferirCentro); });
  marcar(4);
  pontos.forEach((p) =>
    p.addEventListener('click', () => {
      centralizar(document.getElementById(`plano-${p.dataset.irPlano}`));
    }),
  );
  // No celular, começa mostrando o plano em destaque.
  if (trilho.scrollWidth > trilho.clientWidth) {
    const destaque = document.querySelector('.plano-destaque');
    if (destaque) centralizar(destaque, 'instant');
    conferirCentro();
  }

  // "Ver no configurador" leva a quantidade de câmeras para a Tela 3.
  document.querySelectorAll('[data-configurar]').forEach((link) =>
    link.addEventListener('click', () => document.dispatchEvent(new CustomEvent('sc:configurar', { detail: { cameras: Number(link.dataset.configurar) } }))),
  );
  document.querySelectorAll('[data-configurar-ambiente]').forEach((link) =>
    link.addEventListener('click', () => document.dispatchEvent(new CustomEvent('sc:configurar', { detail: { ambiente: link.dataset.configurarAmbiente } }))),
  );
}
