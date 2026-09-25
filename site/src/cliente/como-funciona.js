import { reduzirMovimento } from './movimento.js';
import { linkWhatsapp } from '../dados.js';

// Palavras que as pessoas usam × palavras das respostas.
const sinonimos = {
  app: ['celular', 'aplicativo'], aplicativo: ['celular'], telefone: ['celular'], remoto: ['celular'], ver: ['celular'],
  preco: ['mensalidade', 'plano'], valor: ['mensalidade', 'plano'], custa: ['mensalidade', 'plano'], pagar: ['mensalidade'],
  comprar: ['equipamentos', 'locacao'], dono: ['propriedade', 'equipamentos'],
  multa: ['cancelar', 'cancelamento'], sair: ['cancelar', 'cancelamento'], desistir: ['cancelar', 'cancelamento'], fidelidade: ['prazo', 'cancelar'], contrato: ['prazo', 'cancelar'],
  quebrar: ['manutencao', 'defeitos'], quebrou: ['manutencao', 'defeitos'], estragar: ['manutencao', 'defeitos'], conserto: ['manutencao'], garantia: ['manutencao', 'defeitos'],
  gravacao: ['gravados', 'dias'], grava: ['gravados', 'dias'], hd: ['gravados', 'dias'], tempo: ['dias'],
  instalar: ['instalacao'], instala: ['instalacao'], cabo: ['instalacao', 'cabeamento'], fio: ['instalacao', 'cabeamento'],
  noite: ['premium', 'colorida'], audio: ['premium'], colorida: ['premium'], melhor: ['premium'],
};
const ignorar = new Set(['a', 'o', 'e', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'um', 'uma', 'eu', 'posso', 'pode', 'como', 'que', 'as', 'os', 'se', 'para', 'pra', 'com', 'meu', 'minha', 'tem', 'ter', 'sim', 'nao', 'e?', 'qual', 'quanto', 'quantos']);
const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ');

/** Linha do tempo que acende com a rolagem + busca nas dúvidas. */
export function iniciarComoFunciona() {
  const linha = document.querySelector('[data-linha-tempo]');
  if (!linha) return;

  // Linha do tempo: na horizontal (computador) acende em sequência quando entra na tela;
  // na vertical (celular e tablet) acompanha a rolagem.
  const etapas = [...linha.querySelectorAll('.etapa')];
  const horizontal = matchMedia('(min-width: 1101px)');
  const acender = (quantas, progresso) => {
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
    if (entradas.some((e) => e.isIntersecting) && horizontal.matches) { sequencia(); obs.disconnect(); }
  }, { rootMargin: '0px 0px -35% 0px' }).observe(linha);

  let quadro = 0;
  const atualizar = () => {
    quadro = 0;
    if (horizontal.matches) { if (!sequenciaFeita) acender(0, 0); return; }
    if (reduzirMovimento()) return acender(etapas.length, 1);
    const alvo = innerHeight * 0.62;
    const quantas = etapas.filter((e) => e.getBoundingClientRect().top + 30 < alvo).length;
    const inicio = etapas[0].getBoundingClientRect().top + 30;
    const fim = etapas[etapas.length - 1].getBoundingClientRect().top + 30;
    acender(quantas, Math.min(1, Math.max(0, (alvo - inicio) / Math.max(1, fim - inicio))));
  };
  const agendar = () => { if (!quadro) quadro = requestAnimationFrame(atualizar); };
  addEventListener('scroll', agendar, { passive: true });
  addEventListener('resize', agendar);
  horizontal.addEventListener('change', () => { if (horizontal.matches) { sequenciaFeita = false; sequencia(); } agendar(); });
  atualizar();

  // Busca nas dúvidas
  const campo = document.querySelector('[data-busca]');
  const perguntas = [...document.querySelectorAll('[data-pergunta]')];
  const status = document.querySelector('[data-busca-status]');
  const vazio = document.querySelector('[data-sem-resultado]');
  const linkPergunta = document.querySelector('[data-pergunta-whatsapp]');
  const textos = perguntas.map((p) => ({
    titulo: normalizar(p.querySelector('summary').textContent),
    tudo: normalizar(p.textContent),
    abertaAntes: p.open,
  }));

  const buscar = () => {
    const consulta = campo.value.trim();
    const palavras = normalizar(consulta).split(/\s+/).filter((w) => w.length > 1 && !ignorar.has(w));
    if (!palavras.length) {
      perguntas.forEach((p, i) => { p.hidden = false; p.open = textos[i].abertaAntes; });
      status.textContent = '';
      vazio.hidden = true;
      return;
    }
    const termos = palavras.map((w) => [w, ...(sinonimos[w] || [])]);
    const notas = textos.map((t) =>
      termos.reduce((soma, grupo) => {
        const noTitulo = grupo.some((g) => t.titulo.includes(g.length > 4 ? g.slice(0, -1) : g));
        const noTexto = grupo.some((g) => t.tudo.includes(g.length > 4 ? g.slice(0, -1) : g));
        return soma + (noTitulo ? 3 : noTexto ? 1 : 0);
      }, 0),
    );
    const melhor = Math.max(...notas);
    let achadas = 0;
    perguntas.forEach((p, i) => {
      const mostra = melhor > 0 && notas[i] >= Math.max(1, melhor * 0.5);
      p.hidden = !mostra;
      p.open = mostra && notas[i] === melhor;
      if (mostra) achadas++;
    });
    status.textContent = achadas ? `${achadas} ${achadas > 1 ? 'respostas encontradas' : 'resposta encontrada'}` : '';
    vazio.hidden = achadas > 0;
    linkPergunta.href = linkWhatsapp(`Olá! Tenho uma dúvida sobre os planos de locação: ${consulta}`);
  };
  campo.addEventListener('input', buscar);
}
