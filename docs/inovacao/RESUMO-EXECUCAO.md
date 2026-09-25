# Resumo da execução: do mockup ao site funcionando

**Situação:** as 5 telas do plano de inovação estão construídas em `site/` e passam nos
**46 itens da checklist automática** (`RELATORIO-VALIDACAO.md`). O site **não foi publicado**:
publicar no VPS é uma decisão do Kauan.

## O que foi feito

| Tela | O que funciona |
|---|---|
| **1 · Abertura** | Cena ilustrada que troca entre casa, comércio, condomínio e empresa. O "E se…?" simula falta de energia (com e sem nobreak), queda da internet e chegada de visita: cabos, pontos e rótulos mudam de cor e de texto. Preço "a partir de R$ 49,90/mês" visível sem rolar. |
| **2 · Planos** | Os 5 planos saem de `dados.ts`, cada um com a mini-planta com exatamente N câmeras. O plano de 4 aparece em destaque como "Cobertura completa". Abas de proposta para redes, alarme, condomínio e nobreak. Também: upgrades sob orçamento, "Por que locar" e "Tudo claro antes de assinar" com a letra miúda. |
| **3 · Monte seu sistema** | Tocar na planta marca uma câmera e tocar de novo remove. Os pontos sugeridos também funcionam pelo teclado. O plano é calculado pela regra do documento (5 a 7 → plano de 8 com aviso; 9 ou mais → proposta). O cabo estimado é comparado com o incluso. Os recursos opcionais ficam ligados aos cartões "E se…?". No condomínio, vira proposta. A mensagem do WhatsApp sai pronta. |
| **4 · Como funciona** | A linha do tempo acende etapa por etapa. As 7 dúvidas do documento têm busca por palavras comuns ("app", "multa", "quebrou", "visão noturna"…). Perguntas de preço levam para os Planos. Quando a busca não acha, oferece perguntar no WhatsApp. A área do cliente aparece como exemplo "em breve". |
| **5 · Celular** | Primeira tela igual ao mockup: título, cena, ambientes e o botão com o preço. Planos em carrossel com encaixe e indicador. A barra fixa embaixo muda por seção (contato → plano visível → resumo do configurador). A planta fica maior e rola para os lados, e todos os botões têm área de toque de 44 px ou mais. |

Também: favicon e imagem de compartilhamento feitos a partir da logo oficial, a mesma fonte do
site atual (Manrope) e o conteúdo aparecendo mesmo sem JavaScript. Nada vem de servidores de terceiros.

Números: página inteira com **348 KB** (sem compactação), **0 erros** no console, contraste mínimo de **6:1**.

## Atualização: Astro + TypeScript

Com a escolha técnica liberada, o site foi migrado de Vite + JavaScript puro para **Astro 7 + TypeScript
estrito**, sem mudar nada do que o visitante vê (as fotos de comparação continuam iguais):

- Seções viraram componentes `.astro`; o Astro gera o HTML estático e só envia o JavaScript das interações.
- Dados e regras ganharam tipos e ficaram em `src/lib/`, separados da tela.
- **66 testes automáticos** (Vitest) cobrem as regras do documento. Eles já pegaram um erro real: a busca
  abria a resposta errada para "quebrou a câmera". A correção fez palavras comuns, como "câmera",
  pesarem menos que palavras específicas.
- O validador agora roda também a checagem de tipos e os testes: **46/46 ✅**.

## Como foi validado

- `npm run validar` confere os tipos, gera o site, roda os 66 testes e abre o site em um navegador de verdade
  (computador, tablet e celular) para conferir os 46 itens: preços, links, WhatsApp, rolagem lateral, toque, teclado,
  "reduzir movimento", as contas do configurador, a busca e a linha do tempo.
- `npm run validar -- --fotos` tira as fotos em `site-final/` e monta o **lado a lado com os
  mockups** em `comparacao/`. As diferenças encontradas nessa comparação foram corrigidas: no
  celular a cena passou para a primeira tela, e no tablet a cena ficou menor e a barra passou a
  mostrar o plano certo.
- Um commit por etapa: base → Tela 1 → 2 → 3 → 4 → 5 → validador e revisão.

## Decisões tomadas

Detalhes e motivos em `DECISOES.md`. Resumo:

1. **Preços reais no site.** Para trocar por "sob consulta": `mostrarPrecos = false` em `site/src/lib/dados.ts`.
2. **Ilustração nas telas principais**; fotos reais nas futuras páginas de ambiente e do Condomínio Evoluído.
3. **WhatsApp com atendimento manual**, com a mensagem já escrita. O site não promete resposta automática.
4. Tecnologia: **Astro 7 + TypeScript estrito + Vitest** (primeiro foi Vite + JavaScript puro; trocado depois que a escolha técnica foi liberada).

## O que ficou pendente

| Pendência | Por quê | O que precisa |
|---|---|---|
| Publicar no VPS | É ação externa, e esta sessão não tem acesso ao servidor | Pedido do Kauan; seguir o passo a passo em `site/README.md` |
| Logo em SVG | Chegaram só o PDF e as imagens PNG/WebP; o site usa a WebP aprovada | Enviar `SC-Solucoes-logo-oficial-transparente.svg` para trocar (fica mais nítida e leve) |
| Páginas de ambiente e Condomínio Evoluído com fotos | Faltam as fotos | Arquivos listados em `site/public/fotos/LEIA-ME.md` |
| Área do cliente de verdade | Depende da operação de locação (fase 4 do plano) | Definir de onde vêm os dados do pedido |
| Vista 3D e "enviar foto do imóvel" no configurador | Eram ideias de "próxima etapa" no mockup | Decidir se vale a pena depois de ver o uso real |
| Revisão jurídica dos textos de condições | O documento de planos pede revisão antes do uso definitivo | Advogado conferir "Tudo claro antes de assinar" e a letra miúda |
| Metragem de cabo mais precisa | Hoje é uma estimativa simples pela planta de exemplo | Opcional: usar medidas reais da visita técnica |
| Recursos do site anterior | O guia de 4 perguntas e o explorador de ambientes foram substituídos pelo configurador e pelo "E se…?" | Nada, a menos que o Kauan queira algum de volta |

## Como testar no seu computador

```bash
cd site
npm install
npx playwright install chromium   # uma vez
npm run dev          # site em http://localhost:4321
npm test             # testes das regras
npm run validar      # confere tudo e atualiza o relatório
```

Roteiro rápido para testar à mão:

1. Na abertura, troque os ambientes, clique em "Faltou energia" e ligue o nobreak.
2. Em Planos, clique em "Ver no configurador" no plano de 4 câmeras.
3. No configurador, toque em mais pontos da planta e veja o plano e o cabo mudarem. Marque "Nobreak" e confira a mensagem.
4. Em Dúvidas, digite "app" ou "multa".
5. No celular (ou no modo celular do navegador), veja a barra de baixo mudar conforme a seção.
