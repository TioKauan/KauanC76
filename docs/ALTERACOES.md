# Histórico de alterações do site

Registro, em linguagem simples, de cada versão publicada em `https://somoscella.online`.
Cada publicação tem uma tag `publicado-<data>` no Git, apontando para o commit que está no ar.

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
