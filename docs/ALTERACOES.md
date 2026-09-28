# Histórico de alterações do site

Registro, em linguagem simples, de cada versão publicada em `https://somoscella.online`.
Cada publicação tem uma tag `publicado-<data>` no Git, apontando para o commit que está no ar.

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
