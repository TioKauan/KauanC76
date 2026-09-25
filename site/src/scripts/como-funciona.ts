import { reduzirMovimento } from './movimento';
import { exigir, todos } from './dom';
import { buscarDuvidas } from '../lib/busca';
import { duvidas, linkWhatsapp, formatarPreco, menorPreco, mostrarPrecos } from '../lib/dados';

/** Linha do tempo que acende + busca nas dúvidas. */
export function iniciarComoFunciona(): void {
  const linha = document.querySelector<HTMLElement>('[data-linha-tempo]');
  if (!linha) return;

  // Linha do tempo: na horizontal (computador) acende em sequência quando entra na tela;
  // na vertical (celular e tablet) acompanha a rolagem.
  const etapas = todos('.etapa', linha);
  const horizontal = matchMedia('(min-width: 1101px)');
  const acender = (quantas: number, progresso: number) => {
    etapas.forEach((e, i) => {
      e.toggleAttribute('data-acesa', i < quantas);
      e.toggleAttribute('data-atual', i === quantas - 1 && quantas < etapas.length);
    });
    linha.style.setProperty('--progresso', progresso.toFixed(3));
  };
  let sequenciaFeita = false;
  const sequencia = () => {
    if (sequenciaFeita) return;
    sequenciaFeita = true;
    if (reduzirMovimento()) return acender(etapas.length, 1);
    etapas.forEach((_, i) => setTimeout(() => acender(i + 1, i / (etapas.length - 1)), 250 + i * 520));
  };
  new IntersectionObserver((entradas, obs) => {
    if (entradas.some((e) => e.isIntersecting) && horizontal.matches) {
      sequencia();
      obs.disconnect();
    }
  }, { rootMargin: '0px 0px -35% 0px' }).observe(linha);

  const topoDe = (e: Element | undefined) => (e ? e.getBoundingClientRect().top + 30 : 0);
  let quadro = 0;
  const atualizar = () => {
    quadro = 0;
    if (horizontal.matches) {
      if (!sequenciaFeita) acender(0, 0);
      return;
    }
    if (reduzirMovimento()) return acender(etapas.length, 1);
    const alvo = innerHeight * 0.62;
    const quantas = etapas.filter((e) => topoDe(e) < alvo).length;
    const inicio = topoDe(etapas[0]);
    const fim = topoDe(etapas.at(-1));
    acender(quantas, Math.min(1, Math.max(0, (alvo - inicio) / Math.max(1, fim - inicio))));
  };
  const agendar = () => { if (!quadro) quadro = requestAnimationFrame(atualizar); };
  addEventListener('scroll', agendar, { passive: true });
  addEventListener('resize', agendar);
  horizontal.addEventListener('change', () => {
    if (horizontal.matches) {
      sequenciaFeita = false;
      sequencia();
    }
    agendar();
  });
  atualizar();

  // Busca nas dúvidas
  const campo = exigir<HTMLInputElement>('[data-busca]');
  const perguntas = todos<HTMLDetailsElement>('[data-pergunta]');
  const status = exigir('[data-busca-status]');
  const vazio = exigir('[data-sem-resultado]');
  const linkPergunta = exigir<HTMLAnchorElement>('[data-pergunta-whatsapp]');
  const abertasAntes = perguntas.map((p) => p.open);

  campo.addEventListener('input', () => {
    const consulta = campo.value.trim();
    const r = buscarDuvidas(consulta, duvidas);
    status.textContent = '';
    vazio.hidden = true;
    if (r.tipo === 'vazia') {
      perguntas.forEach((p, i) => { p.hidden = false; p.open = abertasAntes[i] ?? false; });
      return;
    }
    if (r.tipo === 'preco') {
      perguntas.forEach((p) => { p.hidden = true; });
      const link = Object.assign(document.createElement('a'), { href: '#planos', textContent: 'Planos de locação' });
      const extra = mostrarPrecos ? `: a partir de R$ ${formatarPreco(menorPreco)}/mês, com instalação padrão inclusa.` : '.';
      status.replaceChildren('Os valores estão em ', link, extra);
      return;
    }
    perguntas.forEach((p, i) => {
      p.hidden = !r.mostrar.includes(i);
      p.open = r.abrir.includes(i);
    });
    const achadas = r.mostrar.length;
    status.textContent = achadas ? `${achadas} ${achadas > 1 ? 'respostas encontradas' : 'resposta encontrada'}` : '';
    vazio.hidden = achadas > 0;
    linkPergunta.href = linkWhatsapp(`Olá! Tenho uma dúvida sobre os planos de locação: ${consulta}`);
  });
}
