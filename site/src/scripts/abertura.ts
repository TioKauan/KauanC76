import { todos } from './dom';

/**
 * Troca de ambiente da abertura: mostra a cena e o convite 3D do ambiente escolhido.
 * O "E se…?" saiu da inicial em 17/10/2026; continua nas páginas 3D (/casa/, /comercio/…).
 */
export function iniciarAbertura(): void {
  const cena = document.querySelector<HTMLElement>('.cena');
  if (!cena) return;
  const chips = todos<HTMLButtonElement>('.ambientes .chip');

  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      cena.dataset.ambienteAtivo = chip.dataset.ambiente;
      todos('.cena-ambiente', cena).forEach((p) => (p.hidden = p.dataset.ambiente !== chip.dataset.ambiente));
      todos('[data-link-ambiente]').forEach((a) => { a.hidden = a.dataset.linkAmbiente !== chip.dataset.ambiente; });
    }),
  );
}
