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
npm run validar    # tipos, build, testes, acessibilidade (axe) e conferências em navegador → docs/inovacao/RELATORIO-VALIDACAO.md
npm run validar -- --fotos   # + fotos em docs/inovacao/site-final/ e lado a lado com os mockups em comparacao/
                             #   (e as do condomínio em docs/inovacao/condominio/site-final/ e comparacao/)
npm run imagens-maquete      # depois de npm run build: refaz as imagens prontas das maquetes (public/<página>/)
                             #   (ou só algumas: npm run imagens-maquete -- casa comercio)
```

## Arquitetura

```
src/
  pages/index.astro        página inicial (compõe as seções; importa os estilos e o script dela)
  pages/condominio.astro   Condomínio Evoluído: capítulos + maquete 3D (plano em docs/inovacao/condominio/)
  pages/[ambiente].astro   Casa, Comércio e Empresa (/casa/, /comercio/, /empresa/): mesma maquete 3D, com "Escolha o plano"
  pages/privacidade.astro  política de privacidade
  pages/robots.txt.ts      robots.txt gerado no build (aponta o sitemap)
  pages/404.astro          endereço que não existe: caminhos para o site (fora do Google; ver Publicação)
  layouts/Base.astro       <head>, fonte e estilos-base comuns a todas as páginas
  components/*.astro       uma seção por componente (Abertura, Planos, Configurador, ComoFunciona…)
  components/maquete/      Palco (maquete, monitor, camadas), Trilho (capítulos) e Ese ("E se…?"), comuns às páginas 3D
  components/condominio/   Capitulos do condomínio (todo o texto da página)
  components/ambiente/     Capitulos de casa, comércio e empresa (com o seletor de plano)
  lib/                     dados e regras, sem DOM (rodam no build e no navegador)
    dados.ts               conteúdo comercial: planos, preços, condições, dúvidas, contato
    cenarios.ts            estados do "E se…?" por ambiente e situação
    cenas.ts + iso.ts      cenas isométricas geradas como SVG no build
    configurador-dados.ts  plantas, zonas e pontos sugeridos
    configurador-logica.ts cabo estimado, recomendação de plano, nomes, mensagem do WhatsApp
    busca.ts               busca nas dúvidas (sinônimos, peso por raridade, intenção de preço)
    buscadores.ts          dados da empresa para o Google (schema.org), tirados de dados.ts
    plantas-svg.ts         desenho das plantas do configurador
    icones.ts              subconjunto do Lucide
    maquete/               tipos.ts (como se descreve uma maquete: prédios, imóveis em corte, móveis, camadas)
                           e cobertura.ts (campo de visão e pontos cegos de qualquer maquete)
    condominio/            maquete.ts (lote, prédios, câmeras), cobertura.ts, capitulos.ts (camadas e
                           enquadramentos), proposta.ts (mensagem para a Sol)
    ambientes/             maquetes.ts (casa, loja e empresa tiradas das plantas do configurador),
                           capitulos.ts, plano.ts (câmeras de cada plano e cabo estimado)
  scripts/*.ts             interação no navegador (sem framework de cliente)
  scripts/maquete/         cena.ts (o motor Three.js, baixado só se o aparelho tiver WebGL 2 e não estiver
                           economizando dados) e roteiro.ts (capítulos por rolagem, camadas, E se…?, explorar)
  scripts/condominio/      pagina.ts (formulário da proposta) e etiquetas.ts
  scripts/ambiente/        pagina.ts (Escolha o plano) e etiquetas.ts
  styles/*.css             estilos por seção; tokens de cor da logo em base.css
tests/*.test.ts            Vitest (regras de negócio)
scripts/validar.mjs        validador de ponta a ponta (Playwright)
scripts/gerar-marca.mjs    favicon, ícone e imagem Open Graph a partir da logo oficial
scripts/gerar-imagens-maquete.mjs    imagens prontas das maquetes (aparecem antes do 3D e no lugar dele)
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
| Mudar textos da página do condomínio | `src/lib/dados.ts` → `paginaCondominio` (os sistemas vêm de `servicosProposta` e do configurador) |
| Mudar prédios ou câmeras da maquete do condomínio | `src/lib/condominio/maquete.ts`; depois `npm run build && npm run imagens-maquete -- condominio` |
| Mudar paredes, móveis ou detalhes da casa, loja ou empresa | `src/lib/ambientes/maquetes.ts` (câmeras e cômodos vêm das plantas do configurador); depois `npm run build && npm run imagens-maquete` |
| Mudar textos das páginas Casa, Comércio e Empresa | `src/lib/dados.ts` → `paginasAmbiente` |
| Mudar o enquadramento de um capítulo de casa, comércio ou empresa | `src/lib/ambientes/capitulos.ts` |
| Mudar o enquadramento de um capítulo | `src/lib/condominio/capitulos.ts` (`vista` e `vistaCelular`) |
| Mudar a taxa de instalação (hoje, 1 mensalidade) | `src/lib/dados.ts` → `taxaInstalacaoMensalidades` |
| Mudar o que aparece em "Simples de contratar" | `src/lib/dados.ts` → `condicoes` |
| Trocar CNPJ, cidade ou e-mail do rodapé | `src/lib/dados.ts` → `empresa` e `contato.email` (os dados para o Google acompanham) |

Depois de qualquer mudança: `npm run validar`. Os testes em `tests/dados.test.ts` conferem invariantes
(preço e cabo crescendo com as câmeras, gravador com canais suficientes, só um destaque, número antigo ausente,
taxa de instalação igual a 1 mensalidade, CNPJ válido).

## Publicação

Manual e **só com decisão do Kauan**. O Nginx do painel ICP serve a pasta
`/etc/icontainer/apps/nginx/nginx/www/sites/somoscella.online/index` no VPS, e a pasta irmã
`landing.vps11377.panel.icontainer.net/index` serve o endereço provisório: publique nas duas.
Passo a passo (25/09/2026, revisto em 01/10/2026):

1. `npm run validar` com 100% ✅ e `npx astro build`.
2. Empacotar `dist/` **sem** `fotos/LEIA-ME.md` (nota interna, não vai para o ar).
3. No servidor, guardar a versão no ar num `.tar.gz` antes de qualquer troca.
4. Extrair o pacote numa pasta `index.novo-<data>` **ao lado** de `index`. **Copie para
   `index.novo-<data>/assets/` os arquivos de `index/assets/` que não existirem lá** (sem
   sobrescrever). Quem tem a página antiga no cache pede o CSS e o JS antigos; sem eles, o Nginx
   devolve a inicial no lugar (`try_files`) e a página aparece sem estilo (aconteceu em 30/09).
   Depois troque as duas pastas com `mv` (a troca é instantânea: o site nunca fica pela metade).
   Donos `root`, pastas 755, arquivos 644.
5. Conferir de fora: HTTPS 200 **e o conteúdo** idêntico ao gerado. Endereço que não existe também
   responde 200 (com a inicial), então só o código não prova nada.
6. Marcar o commit publicado com a tag `publicado-<data>` e enviar ao GitHub.

### Página 404 (configuração do Nginx, uma vez só)

Hoje o Nginx devolve a página inicial, com código 200, para qualquer endereço que não existe
(`try_files … /index.html`). Para o Google isso é uma "página repetida", e quem chega por um link
antigo cai na inicial sem saber por quê. A pasta `dist/` já traz o `404.html`; para o servidor
usá-lo, no site `somoscella.online` (e no endereço provisório) do painel ICP troque o fim do
`try_files` e acrescente o `error_page`:

```nginx
location / {
    try_files $uri $uri/ =404;
}
error_page 404 /404.html;
```

É uma mudança no servidor: só com o "sim" do Kauan, guardando antes a configuração atual. Depois,
confira de fora: `https://somoscella.online/qualquer-coisa` responde **404** e mostra a página
"Este endereço não existe", e `/`, `/condominio/` e `/privacidade/` continuam 200. Os `assets/` das
versões anteriores continuam valendo (passo 4): sem eles, o CSS antigo agora daria 404 em vez da
inicial no lugar, e a página antiga em cache continuaria sem estilo.

**Com os scripts (desde 05/10/2026), os passos 2 a 5 viram dois comandos:**

```bash
# na máquina com o projeto
cd site && npm install && npm run validar && npm run empacotar   # → ../publicar/somoscella-<data>.tar.gz
scp ../publicar/somoscella-<data>.tar.gz scripts/publicar-no-vps.sh root@<vps>:/tmp/
# no VPS, como root
bash /tmp/publicar-no-vps.sh /tmp/somoscella-<data>.tar.gz
# se precisar voltar atrás (a data aparece no fim da publicação)
bash /tmp/publicar-no-vps.sh --voltar <data>
```

O script confere o pacote antes de mexer em qualquer coisa, guarda a versão no ar em
`/opt/somoscella/backups/`, publica nos dois endereços, mantém os `assets/` antigos, troca as pastas
com `mv` e confere que os arquivos no ar são idênticos ao pacote. Depois, conferir de fora (passo 5)
e marcar a tag (passo 6).

O histórico das publicações está em `docs/ALTERACOES.md`.

## Licenças de terceiros

- Fonte Manrope: SIL Open Font License (`src/assets/fontes/OFL-Manrope.txt`).
- Ícones Lucide: licença ISC (texto no topo de `src/lib/icones.ts`).
