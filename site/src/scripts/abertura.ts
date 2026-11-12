/**
 * Vídeo da abertura: o player do YouTube só entra na página quando a pessoa toca no botão de play.
 * Até lá a página não pede nada ao YouTube nem ao Google. Sem este script, o botão é um link
 * para o vídeo no YouTube, em nova aba.
 */
export function iniciarAbertura(): void {
  const capa = document.querySelector<HTMLAnchorElement>('[data-video-abrir]');
  if (!capa) return;

  capa.addEventListener('click', (e) => {
    // Clique com tecla de atalho (abrir em nova aba ou janela) segue o link normal.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const origem = capa.dataset.videoSrc;
    if (!origem) return;
    e.preventDefault();

    const player = document.createElement('iframe');
    player.className = 'video-player';
    player.src = origem;
    player.title = capa.dataset.videoTitulo ?? 'Vídeo de demonstração do fabricante';
    player.allow = 'autoplay; encrypted-media; picture-in-picture';
    player.allowFullscreen = true;
    player.loading = 'lazy';
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    capa.replaceWith(player);
    player.focus();
  });

  // O link responde só ao Enter; o espaço também ativa, como num botão.
  capa.addEventListener('keydown', (e) => {
    if (e.key !== ' ') return;
    e.preventDefault();
    capa.click();
  });
}
