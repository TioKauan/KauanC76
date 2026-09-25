import { reduzirMovimento } from './movimento';
import { exigir, todos } from './dom';

/** Menu do celular, progresso de leitura, revelar ao rolar, fio condutor e link ativo. */
export function iniciarMoldura(): void {
  const raiz = document.documentElement;
  if (!reduzirMovimento()) raiz.dataset.movimento = '';

  // Menu do celular
  const botao = exigir<HTMLButtonElement>('.menu-botao');
  const menu = exigir('#menu-celular');
  const abrirMenu = (aberto: boolean) => {
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !aberto;
  };
  botao.addEventListener('click', () => abrirMenu(botao.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) abrirMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
      abrirMenu(false);
      botao.focus();
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (m) => { if (m.matches) abrirMenu(false); });

  // Revelar ao rolar
  const revelar = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      (e.target as HTMLElement).dataset.revelado = '';
      revelar.unobserve(e.target);
    }
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  todos('[data-revelar]').forEach((el) => revelar.observe(el));

  // Progresso de leitura + fio condutor
  const fios = todos('.fio');
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
  const links = todos<HTMLAnchorElement>('.nav a');
  const ativo = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      links.forEach((a) => {
        if (a.getAttribute('href') === `#${e.target.id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((a) => {
    const secao = document.querySelector(a.getAttribute('href') ?? '');
    if (secao) ativo.observe(secao);
  });
}
