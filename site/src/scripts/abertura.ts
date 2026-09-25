import { estadoCena, type AmbienteId, type SistemaId, type SituacaoId } from '../lib/cenarios';
import { exigir, todos } from './dom';

/** Troca de ambiente e simulação "E se…?" da abertura. */
export function iniciarAbertura(): void {
  const cena = document.querySelector<HTMLElement>('.cena');
  if (!cena) return;
  const chips = todos<HTMLButtonElement>('.ambientes .chip');
  const opcoes = todos<HTMLButtonElement>('.ese-opcao');
  const caixaReserva = exigir('.ese-reserva');
  const reserva = exigir<HTMLInputElement>('input[data-reserva]');
  const campo = (nome: string) => exigir(`[data-ese-${nome}]`);

  const aplicar = () => {
    const ambiente = cena.dataset.ambienteAtivo as AmbienteId;
    const situacao = cena.dataset.cenario as SituacaoId;
    const e = estadoCena(ambiente, situacao, cena.dataset.reserva === 'sim');
    const palco = exigir(`.cena-ambiente[data-ambiente="${ambiente}"]`, cena);
    todos<HTMLElement | SVGElement>('[data-sistema]', palco).forEach((el) => {
      const sistema = el.dataset.sistema as SistemaId;
      el.dataset.estado = e.estados[sistema];
      const texto = el.querySelector('[data-texto]');
      if (texto) texto.textContent = e.textos[sistema];
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
      todos('.cena-ambiente', cena).forEach((p) => (p.hidden = p.dataset.ambiente !== chip.dataset.ambiente));
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
  todos<HTMLAnchorElement>('[data-abrir-aba]').forEach((link) =>
    link.addEventListener('click', () => document.dispatchEvent(new CustomEvent<string>('sc:abrir-aba', { detail: link.dataset.abrirAba ?? '' }))),
  );
}
