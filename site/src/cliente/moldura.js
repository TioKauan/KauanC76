import { reduzirMovimento } from './movimento.js';

/** Menu do celular, progresso de leitura, revelar ao rolar, fio condutor e link ativo. */
export function iniciarMoldura() {
  const raiz = document.documentElement;
  if (!reduzirMovimento()) raiz.dataset.movimento = '';

  // Menu do celular
  const botao = document.querySelector('.menu-botao');
  const menu = document.getElementById('menu-celular');
  const abrirMenu = (aberto) => {
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !aberto;
  };
  botao?.addEventListener('click', () => abrirMenu(botao.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) abrirMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && botao?.getAttribute('aria-expanded') === 'true') { abrirMenu(false); botao.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (m) => { if (m.matches) abrirMenu(false); });

  // Revelar ao rolar
  const revelar = new IntersectionObserver((entradas) => {
    for (const e of entradas) if (e.isIntersecting) { e.target.dataset.revelado = ''; revelar.unobserve(e.target); }
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-revelar]').forEach((el) => revelar.observe(el));

  // Progresso de leitura + fio condutor
  const fios = [...document.querySelectorAll('.fio')];
  let quadro = 0;
  const atualizar = () => {
    quadro = 0;
    const faixa = raiz.scrollHeight - innerHeight;
    raiz.style.setProperty('--leitura', faixa > 0 ? Math.min(1, scrollY / faixa).toFixed(4) : '0');
    for (const fio of fios) {
      const r = fio.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.92 - r.top) / (r.height + innerHeight * 0.25)));
      fio.style.setProperty('--fio', reduzirMovimento() ? '1' : p.toFixed(3));
    }
  };
  const agendar = () => { if (!quadro) quadro = requestAnimationFrame(atualizar); };
  addEventListener('scroll', agendar, { passive: true });
  addEventListener('resize', agendar);
  atualizar();

  // Link ativo no menu
  const links = [...document.querySelectorAll('.nav a')];
  const secoes = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const ativo = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      links.forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === `#${e.target.id}`));
      links.forEach((a) => { if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'true'); });
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  secoes.forEach((s) => ativo.observe(s));
}
