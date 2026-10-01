# Histórico de alterações do site

Registro, em linguagem simples, de cada versão publicada em `https://somoscella.online`.
Cada publicação tem uma tag `publicado-<data>` no Git, apontando para o commit que está no ar.

---

## 30/09/2026, 22:29 (UTC) — Página do Condomínio Evoluído, com a maquete 3D

Tag `publicado-2026-09-30-222923` (código do commit `3ca5ebe`).

### O que mudou para quem visita o site

| Onde | Antes | Agora |
|---|---|---|
| `/condominio/` | Não existia | Página do Condomínio Evoluído: maquete 3D do condomínio que acompanha a leitura em 8 capítulos, acendendo cada camada (câmeras, acesso facial, interfonia, alarme, rede e wi-fi, nobreak); monitor com a imagem de cada câmera, pontos cegos, "E se…?" de falta de energia e "Monte a proposta", que manda os sistemas marcados (e, se quiser, blocos e apartamentos) para a Sol |
| Menu (computador e celular) | — | "Condomínio" leva à página nova |
| Página inicial | Sem link para o condomínio | Links para a página nova na abertura (ao escolher "Condomínio"), na aba Condomínio dos planos e no configurador |
| `/robots.txt` | Não existia (o endereço devolvia a página inicial) | Libera o site para os buscadores e aponta o sitemap, que agora lista as 3 páginas |

Sem 3D (aparelho sem WebGL 2) ou sem JavaScript, a página mostra a imagem pronta da maquete e
todo o texto. A página não tem preço, prazo de contrato nem WhatsApp fora de "Fale com a SC".

### Por quê

- Pedido do Kauan: páginas separadas, começando pelo condomínio, com algo imersivo e interação 3D.
  Ele aprovou o protótipo, o visual e "Condomínio" no menu em 30/09/2026
  (`docs/inovacao/condominio/PLANO.md`).
- `robots.txt`: sem ele, o buscador recebia a página inicial no lugar do arquivo e não achava o
  sitemap.

### Técnico

- Three.js r186, baixado depois da página: primeira visão 249 KB, maquete 616 KB. Desenha só quando
  algo muda, pausa fora da tela e respeita "reduzir movimento".
- Acessibilidade automática (axe, WCAG 2.2 A/AA) na inicial, em `/privacidade/`, em `/condominio/` e
  com o chat aberto, no computador e no celular: nenhuma violação.
- Testes: 142. Validador: 100/100.
- Publicado no domínio, no `www` e no endereço provisório. Conferido de fora: os 22 arquivos, nos 3
  endereços, respondem 200 e são idênticos ao build; no ar, a maquete desenha e o console fica sem
  erros. Versão anterior em
  `/opt/somoscella/backups/site-no-ar-antes-20260930-222923-*.tar.gz` e nas pastas
  `index.antigo-20260930-222923`.

### Corrigido em 01/10: página inicial sem estilo para quem tinha a versão antiga guardada

- O Kauan abriu a inicial no Vivaldi e ela apareceu **sem CSS**. Causa confirmada (com Ctrl + F5
  voltou ao normal): o Vivaldi usou a inicial antiga do cache, que pede o CSS antigo. Esse arquivo
  tinha saído do servidor e o `try_files` devolvia a inicial (200, `text/html`) no lugar dele.
- Conserto (com o "sim" do Kauan): os `assets/` de todas as pastas `index.antigo-*` foram copiados
  para o `index` no ar, sem sobrescrever nada e sem conflito de nome. O CSS antigo agora responde
  `text/css`. **Nas próximas publicações, copie os `assets/` da versão anterior para a pasta nova.**
- Ainda não feito (decisão do Kauan): `Cache-Control: no-cache` no HTML pelo painel ICP.

---

## 29/09/2026, 09:19 (UTC) — WhatsApp só em "Fale com a SC"; os botões de venda abrem a Sol

Tag `publicado-2026-09-29-091929` (código do commit `50e4433`).

### O que mudou para quem visita o site

| Onde | Antes | Agora |
|---|---|---|
| Topo e menu do celular | Botão "WhatsApp" | "Fale com a SC", que leva até a seção de contato |
| Chat da Sol | "Prefiro falar no WhatsApp" aparecia em todas as perguntas do começo | Sem botão fixo; quem escreve "whatsapp", "zap" ou "atendente" recebe o botão da equipe e a Sol continua na mesma pergunta |
| "Quero este plano" (planos) | Abria o WhatsApp | Abre a Sol já com o plano; depois das perguntas do começo, a equipe recebe o aviso de "quer contratar" com o plano certo |
| "Enviar para a SC" (Monte seu sistema) | Abria o WhatsApp com o resumo | Abre a Sol com o resumo |
| "Pedir proposta" (redes, alarme, condomínio, nobreak) | Abria o WhatsApp | Abre a Sol com o pedido |
| Barra fixa do celular | Sol e WhatsApp | Só a Sol |
| Dúvidas sem resultado | "Perguntar pelo WhatsApp" e "Perguntar para a Sol" | Só "Perguntar para a Sol" |
| "Já é cliente? Peça suporte" | Abria o WhatsApp | Leva à seção "Fale com a SC" |
| Seção "Fale com a SC" | WhatsApp e número | Igual: é o único lugar com o WhatsApp da equipe |

### Por quê

- Pedido do Kauan: o aviso de WhatsApp no chat "toda hora é muito chato"; quem quiser o WhatsApp
  pede ou vai em "Fale com a SC". Os botões de venda passam pela Sol, então todo contato vira lead
  com a origem da visita e aviso no Telegram (o que o relatório de anúncios mede).

### Técnico

- Sem JavaScript, os botões de venda são links para `#contato`. `pedeWhatsapp` ignora número de
  telefone digitado. O plano do botão sobrevive a recarregar a página (`pendentePlano`).
- Corrigido no caminho: a resposta ao pedido de WhatsApp saía em duas falas seguidas e o que a pessoa
  digitasse no meio se perdia; agora é uma fala só.
- Testes: 114. Validador: 78/78 (novas: WhatsApp só em "Fale com a SC", topo e menu, barra sem
  WhatsApp, pedido de WhatsApp no chat, "Quero este plano" chegando à Sol com o plano).
- Versão anterior em `/opt/somoscella/backups/site-no-ar-antes-20260929-091929-*.tar.gz` e nas pastas
  `index.antigo-20260929-091929`.

---

## 28/09/2026, 23:35 (UTC) — O lead do chat passa a dizer de onde a pessoa veio

Tag `publicado-2026-09-28-233530` (código do commit `1981dfa`).

### O que mudou para quem visita o site

| Onde | Antes | Agora |
|---|---|---|
| Chat da Sol | O contato chegava à equipe sem a origem | O contato leva junto por onde a pessoa chegou (anúncio no Google, anúncio na Meta, Instagram, Facebook, busca, outro site ou acesso direto), com o nome da campanha quando o link tiver etiqueta |
| `/privacidade/` | — | Seção 1 explica o que é guardado sobre a origem, por quanto tempo (30 dias, no navegador) e que só chega à SC junto com o contato |

Nada muda na tela. O site continua sem cookie e sem ferramenta de análise ou publicidade.

### Por quê

- Plano de marketing de 28/09/2026 (R$ 100/mês): para o relatório semanal dizer quanto custou
  cada contato por canal, o lead precisa saber de onde veio. Sem isso, dá para ver o gasto, mas
  não quem virou cliente.

### Técnico

- `src/lib/origem.ts` (regra sem DOM, 14 testes em `tests/origem.test.ts`): lê `utm_*`, `gclid`
  (ou `gbraid`/`wbraid`), `fbclid` e o site anterior; vale o último canal que não seja acesso
  direto, por 30 dias (`localStorage`, chave `sc-origem`).
- O lead do chat (`tipo: lead`) leva `lead.origem`; o n8n limpa, o banco grava em `leads.origem`
  e o aviso do Telegram mostra "Veio de: ...".
- Testes: 109. Validador: 73/73. Teste de ponta a ponta no servidor: tudo passou.
- Publicado no domínio, no `www` e no endereço provisório. Versão anterior em
  `/opt/somoscella/backups/site-no-ar-antes-20260928-233530-*.tar.gz` e nas pastas
  `index.antigo-20260928-233530`.

---

## 28/09/2026, 22:39 (UTC) — Chat da Sol: o contato vem no começo

Tag `publicado-2026-09-28-223904` (código do commit `e574228`).

### O que mudou para quem visita o site

| Onde | Antes | Agora |
|---|---|---|
| Começo do chat | A Sol conversava direto e oferecia um cartão de contato no fim | O chat pergunta nome, WhatsApp, cidade e o que a pessoa procura (botões para a cidade e para o interesse), com o aviso de autorização junto da pergunta do WhatsApp; a equipe recebe o contato na hora e só então a Sol conversa |
| Durante as perguntas do começo | — | Botão "Prefiro falar no WhatsApp", sempre visível |
| "Quero este plano" | Abria o cartão de contato | Avisa a equipe e mostra "Pedido enviado à equipe" com o número da pessoa |
| Cartão de contato no fim | Existia | Saiu |
| "Perguntar para a Sol" na caixa de dúvidas | A pergunta ia direto | Antes das perguntas do começo, a pergunta fica guardada e vira a primeira mensagem para a Sol |
| Botões de WhatsApp | Nem todos tinham o ícone | Todos com o ícone do WhatsApp, em contorno ciano; na barra do celular a Sol (orbe) e o WhatsApp da equipe (ícone) ficam separados |
| `/privacidade/` | Nome e WhatsApp "só se você pedir que a equipe te chame" | A seção 1 descreve os dados pedidos no começo do chat |

### Por quê

- A equipe passa a receber o contato de quem procurou a SC mesmo que a conversa pare no meio.

### Técnico

- Testes: 95. Validador: 73/73, com as conferências do roteiro (recusas, retomada depois de
  recarregar, rolagem até a última mensagem).
- Publicado no domínio, no `www` e no endereço provisório. Versão anterior em
  `/opt/somoscella/backups/site-no-ar-antes-20260928-223904-*.tar.gz` e nas pastas
  `index.antigo-20260928-223904`.

---

## 28/09/2026, 01:48 (UTC) — Chat da Sol: ajustes depois do primeiro teste

Tag `publicado-2026-09-28-014847` (código do commit `0b7da09`).

### O que mudou para quem visita o site

| Onde | Antes | Agora |
|---|---|---|
| Chat | Botões de voz (ditar, ouvir, conversa por voz) | Sem voz |
| Cartão de contato | Quando a Sol oferecia o contato de novo, o cartão ficava lá em cima | Desce até a mensagem nova, com o que já foi digitado |
| "Quero este plano" | Só mandava a mensagem | O cartão pede o contato daquele plano, e o plano vai junto no pedido |
| Botões de resposta rápida | Até 4 | Até 5 (os cinco planos cabem numa pergunta) |
| `/privacidade/` | Trecho sobre microfone e voz | Sem esse trecho |

### Técnico

- Testes: 84. Validador: 65/65, com 2 conferências novas (cartão que desce; plano escolhido).
- Publicado no domínio, no `www` e no endereço provisório. Versão anterior em
  `/opt/somoscella/backups/site-no-ar-antes-20260928-014847-*.tar.gz` e nas pastas
  `index.antigo-20260928-014847`.

---

## 28/09/2026, 01:06 (UTC) — Chat da Sol, a assistente virtual

Tag `publicado-2026-09-28-010649` (código do commit `5a0f605`).

### O que mudou para quem visita o site

| Onde | Antes | Agora |
|---|---|---|
| Canto da tela (computador) e barra de baixo (celular) | — | Botão **"Fale com a Sol"**, que abre o chat com a assistente virtual |
| Chat | — | Cartão do plano com mensalidade, taxa de instalação e cabo (os mesmos valores da página), botões de resposta rápida, cartão para pedir que a equipe chame (nome, WhatsApp e autorização) e botão do WhatsApp da equipe |
| Voz | — | Ditar a mensagem, ouvir as respostas e conversar só por voz, pelo próprio navegador (sem microfone no Firefox) |
| "Fale com a SC" e busca de dúvidas sem resultado | Só WhatsApp | + "Tirar dúvidas agora com a Sol" e "Perguntar para a Sol" |
| `/privacidade/` | "O site não coleta dados" | Seção 1 descreve a assistente virtual, o que ela trata e a conversa guardada no navegador; Telegram no compartilhamento; prazo de 12 meses vale para conversas do site |

### Por quê

- O atendimento automático passou a ser feito no próprio site, com respostas na hora e os
  planos aparecendo na tela. O WhatsApp da equipe continua para atendimento humano.

### Técnico

- A IA, os preços que ela fala e a decisão de oferecer o contato ficam no servidor (n8n); o
  site só desenha a resposta. Texto do servidor nunca vira HTML.
- Testes: 86 (17 novos das regras do chat). Validador: 63/63, com 12 conferências do chat
  (respostas simuladas no navegador).
- Publicado no domínio, no `www` e no endereço provisório (este estava com a versão de 25/09).
- Versão anterior guardada no VPS em `/opt/somoscella/backups/site-no-ar-antes-20260928-010649-*.tar.gz`
  e nas pastas `index.antigo-20260928-010649`.

---

## 27/09/2026, 01:53 (UTC) — Política de privacidade e novo WhatsApp

Tag `publicado-2026-09-27-015313`.

### O que mudou para quem visita o site

| Onde | Antes | Agora |
|---|---|---|
| Nova página | — | **`/privacidade/`**: política de privacidade em 9 seções (site, WhatsApp com assistente de IA, clientes, compartilhamento, transferência para Canadá/EUA/China, prazos de guarda, direitos da LGPD, segurança, mudanças) |
| Rodapé | CNPJ, cidade e e-mail | + link "Política de privacidade" |
| Todos os botões de WhatsApp (16) | (46) 99133-1306 | **(49) 99832-5623** |

### Por quê

- **Política de privacidade:** a Meta exige uma página de política para liberar a API oficial do
  WhatsApp no portfólio da empresa. Antes, qualquer endereço do site devolvia a página inicial.
  Prazos aprovados pelo Kauan em 27/09: conversas sem contrato apagadas em 12 meses; dados de
  clientes por mais 5 anos após o contrato; pedidos respondidos em até 15 dias.
- **WhatsApp:** o (46) 99133-1306 foi banido em 26/09/2026; os botões levariam a um número sem resposta.

### Técnico

- O script de interação da página inicial só roda onde existe o menu (a página de texto não quebra).
- O validador ganhou 2 conferências (link no rodapé; `/privacidade/` sem erro e sem rolagem lateral)
  e o servidor de teste passou a servir endereços de pasta. 51/51 ✅.
- Versão anterior guardada no VPS em `/opt/somoscella/backups/site-no-ar-antes-20260927-015313.tar.gz`
  e na pasta `index.antigo-20260927-015313`.

---

## 25/09/2026, 14:59 — Taxa de instalação, CNPJ e contratação simples

Tag `publicado-2026-09-25-145909`.

### O que mudou para quem visita o site

| Onde | Antes | Agora |
|---|---|---|
| Cartão de cada plano | "Instalação inclusa" | "Instalação: R$ 49,90 (1 mensalidade)" — o valor acompanha o plano |
| Abertura | "Instalação padrão inclusa · prazo mínimo de 24 meses" | "Instalação no valor de 1 mensalidade · mensalidades a partir da ativação" |
| Barra fixa do celular (nos planos) | Prazo mínimo | "Instalação: R$ 99,90" do plano que está na tela |
| Seção de condições | "Tudo claro antes de assinar": prazo, multa, assinatura, 1ª mensalidade | **"Simples de contratar"**: assinatura eletrônica, taxa de instalação, mensalidades na ativação e pagamento por PIX, boleto ou cartão |
| "Por que locar" | "Sem investimento inicial"; reajuste anual pelo IPCA | "Sem comprar equipamentos"; reajustes por melhorias no sistema e na renovação |
| Planos e linha do tempo | "Suporte e manutenção" | "Revisão semestral e manutenção" (revisão preventiva a cada 6 meses) |
| Alarme | "Alarme monitorado" | "Alarme monitorado pelo app" |
| Dúvidas | "A instalação está incluída?" / "Posso cancelar?" com prazo e multa | "Como funciona a instalação?" com a taxa / "Posso cancelar?" remete ao contrato |
| Rodapé e contato | Sem identificação da empresa | CNPJ 62.768.829/0001-96, Francisco Beltrão - PR e somoscella@gmail.com |

### Por quê

- **Taxa de instalação:** a instalação é cobrada, no valor de uma mensalidade do plano, paga
  antecipadamente. O site dizia "instalação inclusa", o que não correspondia à prática.
- **Condições no contrato:** prazo mínimo, cancelamento, cobranças extras e reajuste ficam no
  contrato, que o cliente recebe e lê antes de assinar. O site mostra como é contratar.
- **Identificação:** site que apresenta oferta deve mostrar CNPJ, endereço e e-mail da empresa.

### Como foi conferido

- `npm run validar`: 49 de 49 conferências ✅ e 69 testes das regras ✅.
- Conferências novas que impedem que esses pontos se percam numa mudança futura:
  - cada plano mostra a taxa de instalação igual a 1 mensalidade, e nenhum texto diz que a
    instalação é grátis;
  - o rodapé mostra CNPJ, cidade e e-mail;
  - prazo mínimo, multa e cobranças extras não aparecem no site.
- Depois da publicação: HTTPS 200 no domínio, no `www` e no endereço provisório; `index.html` no
  ar idêntico ao gerado; todos os recursos 200; zero erros no console.

### Detalhe técnico

- A taxa vem de `taxaInstalacaoMensalidades` em `site/src/lib/dados.ts`. Trocar `1` por `2`
  atualiza cartões, abertura, barra do celular, condições e dúvidas de uma vez, com plural certo.
- A busca das dúvidas passou a ignorar "você/vocês": a frase "você pode…" fazia a busca
  "vocês vendem drone" achar uma resposta sem relação.

---

## 25/09/2026, 06:24 — Primeira publicação da versão Astro

Tag `publicado-2026-09-25` (commit `e5a6a48`).

Substituiu a landing anterior (React/Vinext) por esta versão: planos de locação com preço,
configurador "Monte seu sistema", simulações "E se…?", linha do tempo e dúvidas com busca.
Detalhes em `docs/inovacao/RESUMO-EXECUCAO.md` e decisões em `docs/inovacao/DECISOES.md`.
