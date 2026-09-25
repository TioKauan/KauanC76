# CLAUDE.md

Repositório do novo site da **SC Soluções em Segurança e Tecnologia** (`somoscella.online`).
Escreva em português do Brasil. O Kauan não é programador: explique o porquê, um passo por vez.

## Estrutura

- `site/` — o site (Vite + JavaScript e CSS puros, sem framework). Instruções em `site/README.md`.
- `docs/inovacao/` — plano de inovação, mockups, plano de execução, decisões e relatório de validação.
- `landing-page-codigo-completo.md` — código do site anterior (React/Vinext), só como referência.

## Regras

- **Conteúdo comercial só em `site/src/dados.js`.** Preços, prazos e regras vêm do documento
  "Planos de Locação de CFTV" do Kauan. Nunca invente preços, clientes, depoimentos,
  garantias, certificações ou números.
- Comunicação dos planos: "aproximadamente 10 dias" de gravação; acesso pelo celular depende de
  energia e internet; recursos premium sempre "sob orçamento"; condomínio e empresa com
  infraestrutura especial → proposta personalizada.
- WhatsApp do site: `(46) 99133-1306`. O número antigo `(46) 99113-8360` não pode aparecer.
- Logo: só os arquivos oficiais (`site/public/marca/`); nunca redesenhe. O Claude não gera foto.
- **Publicar é ação externa: só com pedido explícito do Kauan** (Nginx do VPS, guardando antes a versão no ar).

## Antes de entregar qualquer mudança no site

```bash
cd site && npm install && npm run validar
```

Todos os itens precisam ficar ✅ (o relatório vai para `docs/inovacao/RELATORIO-VALIDACAO.md`).
Para mudanças visuais, rode `npm run validar -- --fotos` e confira `docs/inovacao/comparacao/`.
