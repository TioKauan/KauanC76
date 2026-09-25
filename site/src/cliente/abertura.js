import { estadoCena } from '../cenarios.js';

/** Troca de ambiente e simulação "E se…?" da abertura. */
export function iniciarAbertura() {
  const cena = document.querySelector('.cena');
  if (!cena) return;
  const chips = [...document.querySelectorAll('.ambientes .chip')];
  const opcoes = [...document.querySelectorAll('.ese-opcao')];
  const caixaReserva = document.querySelector('.ese-reserva');
  const reserva = document.querySelector('input[data-reserva]');
  const campo = (nome) => document.querySelector(`[data-ese-${nome}]`);

  const aplicar = () => {
    const ambiente = cena.dataset.ambienteAtivo;
    const situacao = cena.dataset.cenario;
    const comReserva = cena.dataset.reserva === 'sim';
    const e = estadoCena(ambiente, situacao, comReserva);
    const palco = cena.querySelector(`.cena-ambiente[data-ambiente="${ambiente}"]`);
    palco.querySelectorAll('[data-sistema]').forEach((el) => {
      el.dataset.estado = e.estados[el.dataset.sistema];
      const texto = el.querySelector('[data-texto]');
      if (texto) texto.textContent = e.textos[el.dataset.sistema];
    });
    campo('titulo').textContent = e.titulo;
    campo('explicacao').textContent = e.explicacao;
    campo('condicao').textContent = e.condicao;
    caixaReserva.hidden = situacao !== 'energia';
  };

  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      cena.dataset.ambienteAtivo = chip.dataset.ambiente;
      cena.querySelectorAll('.cena-ambiente').forEach((p) => (p.hidden = p.dataset.ambiente !== chip.dataset.ambiente));
      aplicar();
    }),
  );

  opcoes.forEach((opcao) =>
    opcao.addEventListener('click', () => {
      opcoes.forEach((o) => o.setAttribute('aria-pressed', String(o === opcao)));
      cena.dataset.cenario = opcao.dataset.situacao;
      cena.dataset.reserva = 'nao';
      reserva.checked = false;
      aplicar();
    }),
  );

  reserva.addEventListener('change', () => {
    cena.dataset.reserva = reserva.checked ? 'sim' : 'nao';
    aplicar();
  });

  // Atalhos da faixa de serviços abrem a aba certa na seção de planos.
  document.querySelectorAll('[data-abrir-aba]').forEach((link) =>
    link.addEventListener('click', () => document.dispatchEvent(new CustomEvent('sc:abrir-aba', { detail: link.dataset.abrirAba }))),
  );
}
