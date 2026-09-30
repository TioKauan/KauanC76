# Skills do projeto

Orientações que o Claude Code carrega sozinho quando trabalha neste repositório. São só texto
(nenhum script, nenhuma chamada a servidores). Copiadas sem alteração dos repositórios oficiais da
Anthropic, sob a licença Apache 2.0 (texto em `LICENSE.txt` de cada pasta), em 30/09/2026.

| Skill | Para quê | Origem |
|---|---|---|
| `frontend-design` | Direção visual própria (sem cara de "template"), tipografia, cor, movimento com propósito | `anthropics/claude-plugins-official` @ 2a8ad9f, `plugins/frontend-design` |
| `design-critique` | Revisão estruturada de telas e mockups (hierarquia, usabilidade, consistência) | `anthropics/knowledge-work-plugins` @ da38ec1, `design/skills/design-critique` |
| `accessibility-review` | Auditoria WCAG 2.1 AA (contraste, teclado, leitor de tela, toque) | `anthropics/knowledge-work-plugins` @ da38ec1, `design/skills/accessibility-review` |

As regras do `CLAUDE.md` valem por cima de qualquer skill (por exemplo: nada inventado, WhatsApp só
em "Fale com a SC", logo oficial sem redesenho). As menções a Figma e outros conectores dentro das
skills só se aplicam se esses conectores estiverem ligados.
