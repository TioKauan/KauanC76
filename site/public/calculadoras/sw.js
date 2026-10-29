/*
 * Service worker das calculadoras: vale só para /calculadoras/ (escopo no registro), nunca para o site todo.
 * Páginas (HTML): rede primeiro, cópia guardada só se estiver sem internet; assim uma página antiga
 * em cache nunca fica no lugar da nova. Arquivos em /assets/ têm nome com hash (mudou o conteúdo,
 * mudou o nome): podem ser guardados para sempre. Troque VERSAO para limpar tudo.
 */
const VERSAO = 'sc-calculadoras-v1';
const PAGINA = '/calculadoras/';

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    (async () => {
      const cache = await caches.open(VERSAO);
      const resposta = await fetch(PAGINA, { cache: 'reload' });
      const html = await resposta.clone().text();
      await cache.put(PAGINA, resposta);
      // Guarda já os arquivos que a página usa, para abrir sem internet na primeira vez.
      const arquivos = new Set([...html.matchAll(/(?:href|src)="(\/(?:assets|calculadoras|marca)\/[^"]+)"/g)].map((m) => m[1]));
      await Promise.all([...arquivos].map((a) => cache.add(a).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      for (const nome of await caches.keys()) if (nome !== VERSAO) await caches.delete(nome);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  const url = new URL(pedido.url);
  if (pedido.method !== 'GET' || url.origin !== self.location.origin) return;

  if (pedido.mode === 'navigate' && url.pathname === PAGINA) {
    evento.respondWith(
      fetch(pedido)
        .then((r) => {
          const copia = r.clone();
          caches.open(VERSAO).then((c) => c.put(PAGINA, copia));
          return r;
        })
        .catch(async () => (await caches.match(PAGINA)) || Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/calculadoras/') || url.pathname.startsWith('/marca/')) {
    evento.respondWith(
      caches.match(pedido).then(
        (guardado) =>
          guardado ||
          fetch(pedido).then((r) => {
            if (r.ok) {
              const copia = r.clone();
              caches.open(VERSAO).then((c) => c.put(pedido, copia));
            }
            return r;
          }),
      ),
    );
  }
});
