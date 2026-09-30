# Relatório de validação do site

Gerado por `npm run validar` em 30/09/2026, 13:22:10.
Resultado: **82 de 82 itens ✅** — checklist completa.

## Geral

| | Item | Detalhe |
|---|---|---|
| ✅ | Tipos conferidos (astro check) e build sem erro |  |
| ✅ | Testes unitários das regras (Vitest) passam | 114 testes |
| ✅ | Peso total da página ≤ 500 KB (sem compactação) | 386 KB em 5 arquivos; maiores: / 194 KB, /assets/Base.astro_astro_type_script_index_0_lang.gi_fvzDT.js 63 KB, /assets/Logo.3_xYzUnw.css 53 KB |
| ✅ | Todo link interno leva a uma seção que existe | 7 destinos conferidos |
| ✅ | Todo WhatsApp usa wa.me/5549998325623 com mensagem preenchida | 1 links |
| ✅ | Todo botão de WhatsApp mostra o ícone do WhatsApp |  |
| ✅ | WhatsApp da equipe só na seção "Fale com a SC" |  |
| ✅ | Topo e menu do celular: "Fale com a SC" leva à seção de contato | [{"href":"#contato","texto":"Fale com a SC"},{"href":"#contato","texto":"Fale com a SC"}] |
| ✅ | Número antigo (46) 99113-8360 não aparece |  |
| ✅ | Rodapé identifica a empresa (CNPJ, cidade, e-mail) |  |
| ✅ | Todo preço na página bate com dados.ts | 11 preços encontrados |
| ✅ | Cores-base iguais às da logo | #09a0f6 #6de9f6 #ff6a00 #020710 |
| ✅ | Contraste do texto secundário ≥ 4,5:1 (fundo e cartões) | menor: 6.02:1; texto principal 18.8:1 |
| ✅ | Todo controle tem nome acessível |  |
| ✅ | Controles funcionam no teclado (role=button tem tabindex) |  |
| ✅ | Nenhum id repetido na página |  |
| ✅ | Zero erros no console (computador) |  |
| ✅ | Sem rolagem horizontal em 360 px |  |
| ✅ | Sem rolagem horizontal em 390 px |  |
| ✅ | Zero erros no console (celular) |  |
| ✅ | Celular: botões e controles com área de toque ≥ 44 px |  |
| ✅ | Sem rolagem horizontal em 768 px |  |
| ✅ | Sem rolagem horizontal em 1024 px |  |
| ✅ | Sem rolagem horizontal em 1440 px |  |
| ✅ | "Reduzir movimento": nenhuma animação contínua roda | 0 animações contínuas |
| ✅ | "Reduzir movimento": todo conteúdo aparece sem animação | 0 blocos escondidos |
| ✅ | Sem JavaScript o conteúdo aparece e os contatos funcionam (botões de venda levam a "Fale com a SC") | {"planos":5,"duvidas":7,"escondidos":0,"vendas":10,"whatsContato":true,"solEscondida":true} |
| ✅ | Rodapé tem link para a Política de privacidade |  |
| ✅ | /privacidade/ abre com as 9 seções, sem erro no console e sem rolagem lateral | 9 seções; erros: 0; sobra 0 px |
| ✅ | Buscadores: robots.txt aponta o sitemap, e o sitemap lista todas as páginas | páginas: /, /privacidade/; no sitemap: /, /privacidade/ |

## Tela 1 · Abertura

| | Item | Detalhe |
|---|---|---|
| ✅ | Os 4 ambientes trocam a cena e os rótulos | 4/4 |
| ✅ | Os 4 cenários do "E se…?" mudam a cena e o texto |  |
| ✅ | Em "Faltou energia" o nobreak pode ser ligado | off → reserva |
| ✅ | "A partir de R$ 49,90/mês" visível sem rolar em 1440 px | fim do bloco em 838 de 900 px |
| ✅ | "A partir de R$ 49,90/mês" visível sem rolar em 390 px | fim do bloco em 683 de 768 px |

## Tela 2 · Planos

| | Item | Detalhe |
|---|---|---|
| ✅ | 5 planos com preço, cabo e uso; mini-planta com exatamente N câmeras | 5/5 |
| ✅ | Destaque "Cobertura completa" só no plano de 4 câmeras |  |
| ✅ | "Simples de contratar": assinatura eletrônica, taxa de instalação, mensalidades na ativação, pagamento |  |
| ✅ | Cada plano mostra a taxa de instalação (1 mensalidade) e nada diz que a instalação é grátis | 5/5 |
| ✅ | Condições contratuais ficam no contrato (sem prazo mínimo, multa ou cobranças extras no site) |  |
| ✅ | "Quero este plano" abre a Sol com o plano (orbe, sem WhatsApp; sem JavaScript leva a "Fale com a SC") | 5/5 |
| ✅ | Abas de proposta funcionam (clique e setas do teclado) |  |

## Tela 3 · Configurador

| | Item | Detalhe |
|---|---|---|
| ✅ | Tocar na planta adiciona câmera; tocar na câmera remove |  |
| ✅ | Pontos sugeridos funcionam no teclado |  |
| ✅ | Plano calculado: 1-4 exato, 5-7 → 8 com proposta, 8 exato, 9+ proposta |  |
| ✅ | Cabo estimado × incluso atualiza e avisa quando passa do limite | Cabo estimado≈ 61 m de 80 m inclusos |
| ✅ | Mensagem para a Sol leva ambiente, quantidade, pontos, plano, valor e recursos | Olá! Montei meu sistema no site da SC. / Ambiente: Casa / Câmeras: 8 (entrada principal, garagem e portão, fundos / quintal, lateral esquerda, fundos / quintal  |
| ✅ | Condomínio vai para proposta personalizada |  |

## Tela 4 · Como funciona

| | Item | Detalhe |
|---|---|---|
| ✅ | Linha do tempo acende etapa por etapa | 0 → 1 → 2 → 3 → 4 → 4 → 5 |
| ✅ | 7 perguntas; a busca "celular" mostra a resposta certa | Consigo ver as câmeras pelo celular? |
| ✅ | Busca sem resultado oferece perguntar para a Sol (sem WhatsApp) |  |
| ✅ | Área do cliente identificada como exemplo ("em breve") |  |

## Tela 5 · Celular

| | Item | Detalhe |
|---|---|---|
| ✅ | Planos em carrossel com encaixe e indicador que acompanha | x mandatory; indicador 4 → 8 |
| ✅ | Barra fixa muda conforme a seção | contato → plano → configurador → contato (escondida) |
| ✅ | Barra fixa sem WhatsApp: fica a Sol |  |
| ✅ | Menu do celular abre e fecha (também com Esc) |  |

## Sol · chat do site

| | Item | Detalhe |
|---|---|---|
| ✅ | Chat abre com a Sol pedindo o nome, sem botão fixo de WhatsApp (nada vai ao servidor ainda) | {"dica":"Seu nome","pedidos":0} |
| ✅ | Pedir o WhatsApp no roteiro mostra o botão da equipe e continua na mesma pergunta (nada vai ao servidor) | {"fala":"Claro! É só tocar no botão abaixo para falar com a equipe da SC no WhatsApp. Se preferir seguir por aqui, como posso te chamar?","whats":[{"href":"https://wa.me/5549998325623?text=Ol%C3%A1!%20Vim%20pelo%20chat%20do%20site%20e%20quero%20falar%20com%20a%20equipe%20da%20SC.","icone":true}],"dica":"Seu nome"} |
| ✅ | Depois do nome, pede o WhatsApp com teclado numérico e o aviso de autorização com a política | {"teclado":"numeric","aviso":"Ao enviar, você autoriza a SC Soluções a"} |
| ✅ | WhatsApp é conferido antes de seguir, ganha a máscara e nada vai ao servidor | máscara (46) 99123-4567 |
| ✅ | Cidade com um toque (a da loja) e o aviso some |  |
| ✅ | O que a pessoa procura: 5 botões, sem WhatsApp | Câmeras, Alarme, Controle de acesso, Redes e Wi-Fi, Outro |
| ✅ | Roteiro completo vai como lead (dados só com dígitos e autorização, e a origem da visita) e a Sol entra com o que a pessoa procura | ["lead","mensagem"] |
| ✅ | Mensagem vai ao n8n com a sessão e volta com texto, cartão do plano e botões rápidos | 1 cartão (o de 7 câmeras, que não existe, foi descartado); botões: Quero este plano, Tenho uma dúvida |
| ✅ | Cartão do plano no chat usa preço, taxa de instalação e cabo de dados.ts |  |
| ✅ | "Quero este plano" vai com o plano do cartão e o chat mostra que a equipe foi avisada, com o número | {"plano":4,"mensagem":"Quero este plano"} |
| ✅ | O botão do cartão também manda o plano |  |
| ✅ | Texto do servidor nunca vira HTML no chat |  |
| ✅ | Sem conexão com a Sol: aviso e botão do WhatsApp da equipe |  |
| ✅ | Todo preço no chat bate com dados.ts | 3 preços |
| ✅ | Esc fecha o chat (foco volta ao botão) e a conversa continua depois de recarregar, sem repetir o roteiro | 23 → 23 mensagens |
| ✅ | Servidor sem o lead desta conversa: o chat recomeça pelo roteiro | {"falas":1,"minhas":0} |
| ✅ | Recarregar no meio do roteiro volta na mesma pergunta |  |
| ✅ | Zero erros no console com o chat |  |
| ✅ | Pergunta da caixa de dúvidas antes do roteiro fica guardada e vira a primeira mensagem para a Sol | ["lead","xyzabc qwerty?"] |
| ✅ | "Quero este plano" da página abre a Sol e, depois do roteiro, vai com o plano; a página não sai do lugar | ["lead","Quero o plano de 4 câmeras (plano 4)"] |
| ✅ | Celular: Sol na barra fixa, chat em tela cheia, sem rolagem lateral e toques ≥ 44 px (roteiro e conversa) |  |
| ✅ | Celular: a última mensagem fica à vista com os botões rápidos na tela (roteiro e conversa) | {"vistaRoteiro":true,"vistaConversa":true} |
| ✅ | Zero erros no console com o chat (celular) |  |

## Acessibilidade (axe)

| | Item | Detalhe |
|---|---|---|
| ✅ | Página inicial: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | /privacidade/: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | Chat da Sol aberto: nenhuma violação de acessibilidade (computador e celular) |  |
