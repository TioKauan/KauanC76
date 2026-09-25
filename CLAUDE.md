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
- WhatsApp do site: `(46) 99133-1306`. O número antigo `(46) 99113-8360` não pode aparecer.
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
