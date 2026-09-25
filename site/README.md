# Site da SC Soluções

Nova versão de `somoscella.online`, construída a partir do plano de inovação
(`docs/inovacao/`). É um site estático: o resultado final é uma pasta com HTML, CSS,
JavaScript e imagens, que pode ser copiada para o Nginx do VPS como o site atual.

## Ver o site no seu computador

Precisa do [Node.js](https://nodejs.org) 22 ou mais novo (o mesmo usado no projeto atual).

```bash
cd site
npm install        # só na primeira vez
npm run dev        # abre em http://localhost:5173 e atualiza sozinho quando você salva um arquivo
```

## Mudar preço, prazo, texto de plano ou número do WhatsApp

Tudo fica em **um arquivo só: `src/dados.js`**. Exemplos:

- Preço do plano de 4 câmeras: procure `cameras: 4` e troque `preco: 99.9`.
- Limite de cabo: `caboMetros`.
- Número do WhatsApp: `contato.whatsapp` (só números, com 55 e DDD).
- Esconder os preços: troque `mostrarPrecos = true` por `false` (aparece "Sob consulta").
- Dúvidas frequentes: lista `duvidas`.

Salvou? A abertura, os planos, o configurador e as mensagens do WhatsApp acompanham.
Lembre de manter o documento de planos, os contratos e o site com os mesmos valores.

## Conferir se está tudo certo antes de publicar

Na primeira vez, instale o navegador de testes: `npx playwright install chromium`.

```bash
npm run validar            # confere a checklist (43+ itens) e escreve docs/inovacao/RELATORIO-VALIDACAO.md
npm run validar -- --fotos # também tira fotos do site e monta a comparação com os mockups
```

O validador confere, entre outras coisas: preços iguais aos de `dados.js`, todos os links de
WhatsApp com o número certo, nada sobrando para os lados no celular, botões grandes o
suficiente para o dedo, o configurador calculando o plano certo e o site funcionando sem animação.

## Gerar a versão para publicar

```bash
npm run build      # cria a pasta dist/
npm run preview    # abre a versão final em http://localhost:4173 para uma última olhada
```

**Publicar é manual e só com decisão do Kauan.** O procedimento é o mesmo do site atual:
guardar a versão que está no ar, depois copiar o conteúdo de `dist/` para a pasta do site no
Nginx do painel ICP (`/etc/icontainer/apps/nginx/nginx/www/sites/somoscella.online/index`).

## Onde fica cada coisa

| Pasta / arquivo | O que tem |
|---|---|
| `src/dados.js` | Planos, preços, condições, dúvidas, contatos (o conteúdo comercial) |
| `src/cenarios.js` | Ambientes e situações do "E se…?" da abertura |
| `src/configurador-dados.js` | Plantas e pontos sugeridos do "Monte seu sistema" |
| `src/render/` | Monta o HTML de cada seção na hora do build |
| `src/cliente/` | Interações no navegador (simulação, abas, configurador, barra do celular) |
| `src/estilos/` | Aparência (cores da logo em `base.css`) |
| `public/marca/` | Logo, ícone da aba e imagem de compartilhamento |
| `public/fotos/` | Onde vão entrar as fotos reais (ver `LEIA-ME.md`) |
| `scripts/validar.mjs` | O validador automático |
| `scripts/gerar-marca.mjs` | Gera ícone e imagem de compartilhamento a partir da logo oficial |

## Licenças de terceiros

- Fonte Manrope: SIL Open Font License (`src/assets/fontes/OFL-Manrope.txt`).
- Ícones Lucide: licença ISC (texto no topo de `src/render/icones.js`).
