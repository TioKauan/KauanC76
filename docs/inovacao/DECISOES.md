# Decisões tomadas

Registro das escolhas feitas durante a construção do site, com o motivo de cada uma.
Qualquer uma pode ser revista: a maioria muda em um único arquivo (`site/src/lib/dados.ts`).

## As 3 pendências do plano

### 1. Preços reais no site ✅
**Decisão:** mostrar os valores dos 5 planos (R$ 49,90 a R$ 159,90/mês).
**Motivo:** o documento *Planos de Locação de CFTV* já traz os valores e até o texto pronto "para site e
catálogo". Preço visível é o maior diferencial frente a integradoras que só dizem "sob consulta", e
filtra contatos de quem não cabe no orçamento.
**Como mudar:** em `site/src/lib/dados.ts`, `mostrarPrecos = false` troca todos os valores por "Sob consulta".

### 2. Ilustração nas telas principais, fotos nas páginas de ambiente ✅
**Decisão:** a abertura, os planos e o configurador usam **ilustração vetorial** (cena isométrica,
mini-plantas). As páginas de ambiente e o Condomínio Evoluído vão usar **fotos reais ou imagens do Kauan**.
**Motivo:** a ilustração explica melhor (mostra cabos, pontos e cobertura) e muda de estado nas
simulações; foto emociona e combina com as páginas de ambiente. Seguimos a regra do projeto: o Claude
não gera foto.
**Situação:** as páginas com foto ficam para uma próxima etapa, porque ainda não temos os arquivos
das fotos. A lista do que é preciso está em `site/public/fotos/LEIA-ME.md`.

### 3. WhatsApp vai para o atendimento manual ✅
**Decisão:** todos os botões abrem `wa.me/5546991331306` com a mensagem já escrita (plano,
ambiente, pontos), para a equipe responder manualmente.
**Motivo:** o robô está fora do ar desde 19/09, e a mensagem pronta compensa: quem atende já sabe o que
a pessoa quer. O site diz "atendimento pela equipe da SC" e não promete resposta automática nem prazo.
**Como mudar:** o número fica em `dados.ts` (`contato.whatsapp`).

## Outras decisões de conteúdo

| Situação | Decisão | Base |
|---|---|---|
| Condomínio no configurador | Vai para **proposta personalizada** (escolhe os sistemas e envia) | Documento: "Projetos empresariais, condomínios, controle de acesso… recebem proposta e contrato personalizados" |
| 5, 6 ou 7 câmeras | Sugere o **plano de 8** e avisa que a quantidade exata vira proposta | Documento: plano fixo não serve para "quantidade de câmeras diferente dos planos" |
| 9 câmeras ou mais | Proposta personalizada | Mesmo motivo |
| Recursos premium (colorida à noite, áudio, análise inteligente, nobreak) | Sempre "sob orçamento", nunca como item do plano | Regras de comunicação do documento |
| Cabo estimado no configurador | Estimativa ilustrativa (distância na planta + folga de subida), avisa "confirmado na visita técnica" | Não prometer metragem exata |
| Gravação | Sempre "aproximadamente 10 dias" | Regras de comunicação |
| Área do cliente | Aparece como **exemplo, em breve** (não é um sistema funcionando) | Fase 4 do plano; depende da operação |
| Destaque do plano de 4 câmeras | "Cobertura completa", texto do próprio documento | Sem "mais vendido" inventado |
| Clientes, depoimentos, números de mercado | Não usados | Regra do projeto: nada inventado |
| Prazo mínimo, cancelamento, cobranças extras, reajuste | **Ficam no contrato**, apresentado antes da assinatura; o site não os repete. A seção de condições virou "Simples de contratar" (assinatura, taxa de instalação, mensalidades na ativação, pagamento) | Decisão do Kauan em 25/09/2026 |
| Taxa de instalação | **Valor de 1 mensalidade do plano, pago antecipadamente** (1 câmera → R$ 49,90; 4 câmeras → R$ 99,90). Aparece nos cartões, na abertura, na barra do celular, em "Simples de contratar" e na dúvida sobre instalação; as mensalidades começam na ativação. Número de mensalidades em `taxaInstalacaoMensalidades` (`dados.ts`) | Decisão do Kauan em 25/09/2026. Substitui "instalação inclusa" do documento de planos |
| Reajuste | "Sujeita a reajustes por melhorias no sistema e na renovação" | Decisão do Kauan em 25/09/2026 (não é anual pelo IPCA) |
| Alarme | "Alarme monitorado pelo app" | A SC não tem central de monitoramento |

## Decisões técnicas

> **Revisão em 25/09/2026:** o Kauan liberou a escolha da tecnologia ("use a linguagem que você achar
> melhor, não a que eu entenda"). A primeira versão usava Vite + JavaScript puro para ser simples de
> manter por quem não programa; a versão atual usa o que é tecnicamente melhor para o projeto.

| Tema | Decisão | Motivo |
|---|---|---|
| Framework | **Astro 7** (saída estática) | Feito para sites de conteúdo com poucas partes interativas: gera HTML pronto para o Nginx e só envia JavaScript para as interações. Substitui o plugin caseiro que montava as seções e já traz rotas para as próximas páginas (ambientes, Condomínio Evoluído), sitemap e otimização de imagens para quando as fotos chegarem |
| Linguagem | **TypeScript estrito** (`strict` + `noUncheckedIndexedAccess`) | Os dados dos planos, os estados do "E se…?" e as contas do configurador têm tipos: um plano sem preço ou um ambiente com nome errado quebra a checagem antes de ir ao ar |
| Interação | TypeScript puro no navegador, sem React/Svelte | As interações são leves e diretas no HTML; um framework de componentes no cliente só adicionaria peso |
| Regras de negócio | Módulos sem tela em `src/lib/` (`dados`, `cenarios`, `configurador-logica`, `busca`) | Podem ser testados isoladamente e reaproveitados em outras páginas |
| Testes | **Vitest** (66 testes das regras) + validador com Playwright (46 itens no navegador) | Os testes cobrem as regras do documento (ex.: 5 a 7 câmeras → plano de 8 ou proposta); o validador cobre a experiência nas telas |
| Animações | CSS + Web Animations API, sem GSAP | Mais leve; tudo desliga com "reduzir movimento" |
| Linha do tempo | IntersectionObserver em vez de `animation-timeline` | A versão só com CSS ainda não roda em todos os navegadores (~84%) |
| Pasta `site/` | Separada do projeto anterior | Evita conflito se o projeto React/Vinext vier para este repositório |
| Fonte e ícones | Embutidos (Manrope OFL, Lucide ISC) | Sem chamadas a servidores de terceiros |
| Node.js | 22.18 ou mais novo | O validador lê `dados.ts` direto (suporte nativo a TypeScript do Node 22.18+) |
