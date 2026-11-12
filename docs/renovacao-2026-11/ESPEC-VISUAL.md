# Especificação visual da renovação (SC Soluções, nov/2026)

Vale para todas as ondas. Quem escreve código lê isto antes de começar.

## Direção

"Real e sóbrio". Hoje a página parece um painel de ficção científica (brilhos, gradientes, cenas desenhadas).
A nova aparência mostra coisas reais (tela de celular com vídeo de câmera, foto de fachada) sobre um fundo
escuro limpo. Menos efeito, mais conteúdo legível. Quem chega pelo Google precisa entender a oferta em 5
segundos: "câmeras em locação em Francisco Beltrão, a partir de R$ 49,90/mês, imagem no celular".

## Cores (não mudar os valores: são da logo)

Usar só os tokens de `:root` em `site/src/styles/base.css` (`--fundo`, `--fundo-2`, `--cartao`, `--linha`,
`--linha-2`, `--texto`, `--texto-2`, `--texto-3`, `--ciano`, `--azul`, `--laranja`, `--laranja-2`,
`--laranja-claro`, `--verde`). Pode acrescentar tokens novos derivados (ex.: `--cartao-2`, `--sombra`), nunca
cor solta no meio do CSS de componente.

- Laranja = ação principal (um botão laranja por bloco, no máximo).
- Ciano = ação secundária, ícones, foco, destaques pequenos.
- Gradiente só no texto `.destaque` dos títulos (já existe). Cartões passam a ter fundo liso (`--cartao`),
  sem gradiente; sombra discreta só em elemento flutuante (celular da abertura, menu).
- Contraste AA em todo texto (o validador roda axe).

## Tipografia (Manrope local, já carregada)

| Uso | Tamanho | Peso | Entrelinha |
| --- | --- | --- | --- |
| H1 da abertura | `clamp(36px, 5.2vw, 64px)` | 700 | 1.05, letter-spacing -0.04em |
| H2 de seção | `clamp(28px, 3.4vw, 44px)` | 650 | 1.1 |
| H3 de cartão | 20px | 650 | 1.25 |
| Texto | 17px (16px no celular) | 400 | 1.6 |
| Apoio / legenda | 14px | 500 | 1.5, cor `--texto-3` |

Máximo de 65 caracteres por linha em parágrafo (`max-width: 62ch`).

## Espaçamento e grade

- Escala: 4, 8, 12, 16, 24, 32, 48, 72, 96.
- Seção: `padding-block: 96px` no computador, 64px abaixo de 760px.
- `.wrap`: `width: min(1200px, 100% - 64px)`; abaixo de 760px, `100% - 32px` (16px de margem lateral).
- Nada de rolagem horizontal em 375px. Testar em 375, 768, 1280 e 1440.

## Componentes

- **Cartão:** raio 20px, borda 1px `--linha`, fundo `--cartao`, padding 24px (20px no celular). Hover:
  borda `color-mix(in srgb, var(--ciano) 40%, var(--linha))`.
- **Botão:** mantém `.btn-primario` (laranja) e `.btn-contorno` (ciano); raio 12px; altura mínima 52px; área
  de toque mínima 44px em tudo que é clicável.
- **Selo:** mantém `.selo`, raio 999px.
- **Ícones:** os de `Icone.astro`. WhatsApp sempre com `IconeWhatsapp` em contorno ciano; o que abre a Sol
  sempre com o orbe laranja (regra do validador).
- **Movimento:** só transição curta (200 a 300ms). `prefers-reduced-motion: reduce` desliga tudo que mexe.

## Abertura (hero) com celular

- Computador: duas colunas (texto 7/12, celular 5/12), alinhadas ao centro. Celular (<760px): texto
  primeiro, celular embaixo, ocupando a largura.
- **Celular deitado** (paisagem), desenhado em CSS: moldura com raio 36px, borda 10px na cor `--cartao`,
  proporção da tela 19.5:9, câmera frontal como um ponto na lateral. Dentro, o vídeo 16:9 centralizado.
- **Vídeo com carregamento no clique (fachada):** antes do clique a página não faz nenhum pedido ao Google
  (nem imagem de capa do YouTube). A tela mostra um fundo desenhado em CSS ou SVG (sugestão: cena escura
  em azul com o texto "Toque para ver" e um botão de play grande). No clique, troca por
  `<iframe src="https://www.youtube-nocookie.com/embed/wKUPPBYbi-Q?autoplay=1&rel=0&playsinline=1">` com
  `title` descritivo, `allow="autoplay; encrypted-media; picture-in-picture"` e `loading="lazy"`.
  Sem JavaScript, o botão vira link para o vídeo no YouTube (abre em nova aba).
- Vídeo: "ColorVu G2 Cameras Illuminate Darkness and Provide 24/7 Full Color Images", canal Hikvision USA
  (confirmado pelo oEmbed do YouTube em 11/11/2026). **Os segundos de cena de dia e de noite NÃO foram
  confirmados:** não faça botão dia/noite que pule para um segundo inventado. Deixe o botão dia/noite fora
  desta versão.
- **Legenda obrigatória logo abaixo do celular** (texto em `dados.ts`): "Demonstração do fabricante
  (Hikvision ColorVu). Imagem colorida à noite é um recurso adicional, sob orçamento: no plano padrão a
  imagem noturna é em preto e branco." Motivo: o vídeo mostra cor à noite e o plano básico não tem.
- Abaixo dos botões, uma linha de confiança (não é seção nova): ícone de pino de mapa + "Avaliações e
  endereço no Perfil da Empresa no Google" com link para `perfis.googleMaps` (`target="_blank"`,
  `rel="noopener"`). Sem estrelas, sem nota, sem número, sem logo do Google.

## Inicial enxuta

A inicial continua com: abertura, planos, como funciona + dúvidas, contato. Nenhuma seção nova. A prova
social e o vídeo entram dentro da abertura.

## O que não pode

- Inventar preço, número de clientes, nota, avaliação, depoimento, garantia ou certificação.
- Imagem gerada por IA. Foto de banco sempre com legenda "Foto ilustrativa".
- Pedido a servidor de terceiros antes de um clique do visitante (fontes, imagens, vídeos, scripts).
- `AggregateRating` ou `Review` nos dados do Google.
- Logo de fabricante (Hikvision, Ubiquiti, Intelbras, Google) solta como "parceiro".
