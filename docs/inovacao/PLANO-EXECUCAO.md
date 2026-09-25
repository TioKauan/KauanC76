# Plano de execução: do mockup ao site funcionando

Fonte da verdade: `PLANO-DE-INOVACAO.md`, os 5 mockups em `mockups/` e o documento
*Planos de Locação de CFTV* (preços, regras e textos). Nada de preço, plano ou regra novo.

## 1. Pesquisa (resumo)

- **Configurador**: o UniFi Design Center (Ubiquiti) deixa desenhar câmeras sobre uma planta e mostra o
  campo de visão de cada uma, para conferir se todo ponto está coberto
  ([blog da Ubiquiti](https://blog.ui.com/article/all-new-unifi-design-center),
  [guia LazyAdmin](https://lazyadmin.nl/home-network/unifi-design-center/)). Pegamos só o padrão de
  interação: **tocar na planta → aparece a câmera com o cone de visão**. Sem DORI, PPM ou termos técnicos:
  o público da SC é leigo.
- **Animação ao rolar**: as animações de CSS ligadas à rolagem (`animation-timeline`) ainda não cobrem
  todos os navegadores (cerca de 84% em 2026,
  [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline)).
  Por isso a linha do tempo usa `IntersectionObserver` + JavaScript, que funciona em todos.
- **Biblioteca de animação**: GSAP/anime.js resolveriam, mas somam peso e dependência. As animações
  previstas (pulsos nos cabos, escurecer a cena, acender etapas) cabem em CSS + Web Animations API.

## 2. Decisões técnicas

| Tema | Escolha | Motivo |
|---|---|---|
| Estrutura | **Vite + JavaScript puro + CSS puro**, sem framework | Menos peças para manter; o resultado é HTML estático, igual ao site atual no Nginx |
| Pasta | `site/` na raiz do repositório | Não conflita com o projeto atual (React/Vinext) se ele vier para este repositório |
| Conteúdo | **Um arquivo só**: `site/src/dados.js` (planos, preços, cabos, contatos, dúvidas, condições) | Mudou preço? Troca em um lugar e o site todo acompanha |
| Fonte | Manrope embutida (licença OFL) | Mesma fonte do site atual, sem depender do Google Fonts |
| Ícones | Lucide (licença ISC), só os usados, embutidos | Nenhum pacote extra no navegador |
| Animação | CSS + Web Animations API + IntersectionObserver | Leve; respeita "reduzir movimento" do aparelho |
| Validação | Script com Playwright (`npm run validar`) | Confere a checklist abaixo de forma automática e tira fotos para comparar com os mockups |

## 3. Etapas (um commit por etapa)

1. Documentos: este plano + `DECISOES.md`.
2. Base: Vite, dados, cores da logo, cabeçalho com menu de celular, rodapé, WhatsApp.
3. **Tela 1**: abertura, cena por ambiente, "E se…?", preço em destaque.
4. **Tela 2**: planos, mini-plantas, upgrades, "Por que locar", "Tudo claro antes de assinar".
5. **Tela 3**: configurador (planta clicável, plano calculado, cabo × incluso, mensagem pronta).
6. **Tela 4**: linha do tempo que acende, dúvidas com busca, área do cliente (exemplo).
7. **Tela 5**: celular (carrossel de planos, barra fixa embaixo, gaveta no configurador).
8. Validador automático, revisão cruzada, correções e resumo final.

Depois de cada tela: rodar o validador, olhar as fotos lado a lado com o mockup e só seguir quando
os itens daquela tela estiverem ✅.

## 4. Checklist de "pronto" (mensurável)

> **Situação em 25/09/2026: todos os itens ✅.** Cada item é conferido automaticamente por
> `npm run validar` (em `site/`); o resultado detalhado fica em `RELATORIO-VALIDACAO.md`.

### Geral
- [x] `npm run build` termina sem erro.
- [x] Página inicial com peso total ≤ 500 KB (HTML + CSS + JS + imagens + fontes).
- [x] Zero erros no console, no computador e no celular.
- [x] Sem rolagem horizontal em 360, 390, 768, 1024 e 1440 px de largura.
- [x] Todo link interno (`#…`) leva a uma seção que existe.
- [x] Todo link de WhatsApp usa `wa.me/5546991331306` com mensagem preenchida; o número antigo não aparece.
- [x] Todo preço na página bate com `dados.js` (o validador compara).
- [x] Cores-base iguais às da logo: azul `#09a0f6`, ciano `#6de9f6`, laranja `#ff6a00`, fundo `#020710`.
- [x] Contraste do texto principal e do secundário ≥ 4,5:1 sobre o fundo.
- [x] No celular, botões e controles principais com área de toque ≥ 44 px.
- [x] Com "reduzir movimento" ligado, nenhuma animação contínua roda.
- [x] Todos os controles são botões ou links de verdade (funcionam no teclado, com foco visível).

### Tela 1: abertura
- [x] Os 4 ambientes (casa, comércio, condomínio, empresa) trocam a cena e as etiquetas.
- [x] Os 4 cenários do "E se…?" mudam a cena e o texto; em "Faltou energia" o nobreak pode ser ligado.
- [x] "A partir de R$ 49,90/mês" visível sem rolar, em 1440 px e em 390 px.

### Tela 2: planos
- [x] 5 planos com preço, cabo incluso e uso indicado; a mini-planta mostra exatamente N câmeras.
- [x] Destaque do plano de 4 câmeras como "cobertura completa" (texto do documento).
- [x] "Tudo claro antes de assinar" com prazo, saída antecipada, ZapSign, 1ª mensalidade + letra miúda.
- [x] Cada "Quero este plano" abre o WhatsApp com o nome e o valor do plano na mensagem.

### Tela 3: configurador
- [x] Tocar na planta adiciona câmera; tocar na câmera remove; pontos sugeridos funcionam no teclado.
- [x] Plano calculado: 1→1, 2→2, 3→3, 4→4, 5 a 8→8 (com aviso de proposta para 5 a 7), 9 ou mais→proposta.
- [x] Cabo estimado × incluso atualiza na hora e avisa quando passa do limite.
- [x] Condomínio vai para proposta personalizada (regra do documento).
- [x] A mensagem do WhatsApp leva ambiente, quantidade, pontos, plano, valor e recursos marcados.

### Tela 4: como funciona
- [x] A linha do tempo acende etapa por etapa conforme a rolagem.
- [x] As 7 perguntas do documento; a busca filtra (ex.: "celular" mostra "Consigo ver as câmeras pelo celular").
- [x] Área do cliente identificada como exemplo ("em breve").

### Tela 5: celular
- [x] Até 800 px, planos em carrossel com encaixe (scroll-snap) e indicador que acompanha.
- [x] Barra fixa embaixo muda conforme a seção (plano visível / resumo do configurador / contato).
- [x] Menu do celular abre e fecha (também com Esc).
