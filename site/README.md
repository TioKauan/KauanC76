# Site da SC Soluções

Nova versão de `somoscella.online`, construída a partir do plano de inovação (`docs/inovacao/`).
**Astro 7 + TypeScript estrito**, saída 100% estática (a pasta `dist/` vai para o Nginx do VPS).

## Comandos

Requer Node.js ≥ 22.18.

```bash
npm install
npx playwright install chromium   # uma vez, para o validador

npm run dev        # http://localhost:4321 com recarga automática
npm run check      # checagem de tipos (astro check)
npm test           # testes das regras (Vitest)
npm run build      # checagem de tipos + dist/
npm run preview    # serve o dist/ em http://localhost:4173
npm run validar    # tipos, build, testes e 43 conferências em navegador → docs/inovacao/RELATORIO-VALIDACAO.md
npm run validar -- --fotos   # + fotos em docs/inovacao/site-final/ e lado a lado com os mockups em comparacao/
```

## Arquitetura

```
src/
  pages/index.astro        página (compõe as seções)
  layouts/Base.astro       <head>, estilos, fonte e o script de interação
  components/*.astro       uma seção por componente (Abertura, Planos, Configurador, ComoFunciona…)
  lib/                     dados e regras, sem DOM (rodam no build e no navegador)
    dados.ts               conteúdo comercial: planos, preços, condições, dúvidas, contato
    cenarios.ts            estados do "E se…?" por ambiente e situação
    cenas.ts + iso.ts      cenas isométricas geradas como SVG no build
    configurador-dados.ts  plantas, zonas e pontos sugeridos
    configurador-logica.ts cabo estimado, recomendação de plano, nomes, mensagem do WhatsApp
    busca.ts               busca nas dúvidas (sinônimos, peso por raridade, intenção de preço)
    plantas-svg.ts         desenho das plantas do configurador
    icones.ts              subconjunto do Lucide
  scripts/*.ts             interação no navegador (sem framework de cliente)
  styles/*.css             estilos por seção; tokens de cor da logo em base.css
tests/*.test.ts            Vitest (regras de negócio)
scripts/validar.mjs        validador de ponta a ponta (Playwright)
scripts/gerar-marca.mjs    favicon, ícone e imagem Open Graph a partir da logo oficial
```

Princípios:

- **Conteúdo só em `src/lib/dados.ts`**, com os valores do documento *Planos de Locação de CFTV*.
  O HTML, as mensagens do WhatsApp, a barra fixa e o configurador derivam dele.
- **Regras sem DOM** em `src/lib/`, com testes. Os scripts de `src/scripts/` só ligam as regras à tela.
- **Funciona sem JavaScript**: todo o conteúdo e os links de contato já vêm no HTML; o script só acrescenta interação.
- **Acessibilidade**: controles de verdade (botões, abas com setas, `details`), foco visível, alvos ≥ 44 px no
  celular, "reduzir movimento" respeitado.
- Eventos entre módulos: `sc:plano-visivel`, `sc:resumo-config`, `sc:configurar`, `sc:abrir-aba` (tipados nos scripts).

## Mudanças comuns

| Quero… | Onde |
|---|---|
| Mudar preço, cabo incluso ou texto de um plano | `src/lib/dados.ts` → `planos` |
| Esconder os preços ("Sob consulta") | `src/lib/dados.ts` → `mostrarPrecos = false` |
| Trocar o número do WhatsApp | `src/lib/dados.ts` → `contato.whatsapp` |
| Editar as dúvidas frequentes | `src/lib/dados.ts` → `duvidas` (e sinônimos em `src/lib/busca.ts`) |
| Mudar pontos sugeridos do configurador | `src/lib/configurador-dados.ts` |

Depois de qualquer mudança: `npm run validar`. Os testes em `tests/dados.test.ts` conferem invariantes
(preço e cabo crescendo com as câmeras, gravador com canais suficientes, só um destaque, número antigo ausente).

## Publicação

Manual e **só com decisão do Kauan**: guardar a versão no ar e copiar `dist/` para
`/etc/icontainer/apps/nginx/nginx/www/sites/somoscella.online/index` (Nginx do painel ICP no VPS).

## Licenças de terceiros

- Fonte Manrope: SIL Open Font License (`src/assets/fontes/OFL-Manrope.txt`).
- Ícones Lucide: licença ISC (texto no topo de `src/lib/icones.ts`).
