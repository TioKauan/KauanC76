import { defineConfig } from 'vite';

/**
 * Monta as seções do HTML a partir de src/dados.js na hora do build
 * (e a cada recarga no modo de desenvolvimento). Assim o conteúdo aparece
 * mesmo sem JavaScript e os buscadores leem tudo.
 */
function secoesDoSite() {
  let servidor;
  return {
    name: 'secoes-do-site',
    configureServer(s) {
      servidor = s;
    },
    async transformIndexHtml(html) {
      const modulo = servidor
        ? await servidor.ssrLoadModule('/src/render/index.js')
        : await import('./src/render/index.js');
      return modulo.montarPagina(html);
    },
    handleHotUpdate({ file, server }) {
      if (file.includes('/src/render/') || file.endsWith('/src/dados.js')) {
        server.ws.send({ type: 'full-reload' });
      }
    },
  };
}

export default defineConfig({
  plugins: [secoesDoSite()],
  build: { target: 'es2020', assetsInlineLimit: 0 },
});
