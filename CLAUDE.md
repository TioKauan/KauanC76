# CLAUDE.md

Repositório do novo site da **SC Soluções em Segurança e Tecnologia** (`somoscella.online`).
Escreva em português do Brasil. O Kauan não é programador, mas liberou a escolha técnica: use a melhor
solução, não a mais simples de entender; nas conversas, explique o porquê das decisões.

## Estrutura

- `site/` — o site (Astro 7 + TypeScript estrito, saída estática; testes com Vitest). Arquitetura e comandos em `site/README.md`.
- `docs/inovacao/` — plano de inovação, mockups, plano de execução, decisões e relatório de validação.
- `landing-page-codigo-completo.md` — código do site anterior (React/Vinext), só como referência.

## Regras

- **Conteúdo comercial só em `site/src/lib/dados.ts`.** Preços, prazos e regras vêm do documento
  "Planos de Locação de CFTV" do Kauan. Nunca invente preços, clientes, depoimentos,
  garantias, certificações ou números.
- Comunicação dos planos: "aproximadamente 10 dias" de gravação; acesso pelo celular depende de
  energia e internet; recursos premium sempre "sob orçamento"; condomínio e empresa com
  infraestrutura especial → proposta personalizada.
- **Condições contratuais ficam no contrato** (25/09/2026): prazo mínimo, cancelamento, cobranças
  extras e reajuste não aparecem no site; o contrato é apresentado antes da assinatura. Só mude isso
  com pedido do Kauan; o validador confere. Rodapé: CNPJ, cidade e e-mail. Alarme é "monitorado
  pelo app".
- **A instalação não é grátis:** taxa = valor de 1 mensalidade do plano, paga antecipadamente
  (`taxaInstalacaoMensalidades` em `dados.ts`). Nunca escreva "instalação inclusa" nem "sem
  investimento inicial"; o validador falha.
- WhatsApp do site: `(49) 99832-5623` (desde 27/09/2026), atendimento humano. Os números
  `(46) 99113-8360` e `(46) 99133-1306` não são usados no site e não podem aparecer.
- **O WhatsApp da equipe fica só na seção "Fale com a SC" (`#contato`)** (decisão do Kauan em
  28/09/2026, noite: "não gostei do WhatsApp ali direto"). O topo e o menu do celular levam até lá; os
  botões de venda ("Quero este plano", "Enviar para a SC", "Pedir proposta") abrem a Sol com a
  escolha (`data-sol-abrir` + `data-sol-mensagem`/`data-sol-plano`) e, sem JavaScript, são links para
  `#contato`. O validador confere que nenhum link `wa.me` fica fora de `#contato`.
- **Chat da Sol** (assistente virtual desde 27/09/2026; agente de captura de lead desde 28/09): tela
  em `src/components/Sol.astro` + `src/scripts/sol.ts`, regras em `src/lib/sol.ts` (com testes).
  Antes da IA, o próprio site pergunta nome, WhatsApp, cidade e o que a pessoa procura (roteiro fixo,
  sem IA) e manda o lead. Não há botão fixo de WhatsApp no chat (saiu em 28/09, noite): quem escreve
  "whatsapp", "zap" ou "atendente" recebe o botão da equipe (`pedeWhatsapp` em `lib/sol.ts`). A IA, os preços
  que ela fala e os avisos à equipe ficam no n8n (fluxo "Sol no Site"); o site só desenha, e o cartão
  de plano usa `dados.ts`. Texto do servidor nunca vira HTML (só `textContent`). Para testar a tela
  sem o n8n: `node scripts/dev-simulado.mjs` (Sol simulada em `scripts/sol-simulado.mjs`).
- **Origem do lead** (28/09/2026): `src/lib/origem.ts` guarda no navegador por onde a pessoa chegou
  (utm, gclid, fbclid, site anterior; 30 dias) e o lead do chat leva isso junto (`leads.origem` no
  banco). Sem cookie, pixel ou ferramenta de análise: a política de privacidade diz isso e só pode
  mudar junto com ela. Links etiquetados em `C:\SomosCella\Projetos\marketing-ia\README.md`.
- **Botões:** todo botão que abre o WhatsApp mostra o ícone do WhatsApp (`IconeWhatsapp.astro` ou
  `iconeWhatsapp()` de `src/lib/marcas.ts`), em contorno ciano, nunca verde; tudo o que abre a Sol
  mostra o orbe laranja. O validador confere o ícone.
- Logo: só os arquivos oficiais (`site/public/marca/`); nunca redesenhe. O Claude não gera foto.
- **Publicar é ação externa: só com pedido explícito do Kauan** (Nginx do VPS, guardando antes a versão no ar).

## Antes de entregar qualquer mudança no site

```bash
cd site && npm install && npm run validar
```

`validar` roda `astro check`, `astro build`, os testes do Vitest e as conferências no navegador.
Regras de negócio novas vão para `src/lib/` (sem DOM) com teste em `tests/`.
Todos os itens precisam ficar ✅ (o relatório vai para `docs/inovacao/RELATORIO-VALIDACAO.md`).
Para mudanças visuais, rode `npm run validar -- --fotos` e confira `docs/inovacao/comparacao/`.
