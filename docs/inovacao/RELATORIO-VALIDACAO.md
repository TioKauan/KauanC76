# Relatório de validação do site

Gerado por `npm run validar` em 27/09/2026, 20:18:03.
Resultado: **63 de 63 itens ✅** — checklist completa.

## Geral

| | Item | Detalhe |
|---|---|---|
| ✅ | Tipos conferidos (astro check) e build sem erro |  |
| ✅ | Testes unitários das regras (Vitest) passam | 86 testes |
| ✅ | Peso total da página ≤ 500 KB (sem compactação) | 395 KB em 5 arquivos; maiores: / 200 KB, /assets/Base.astro_astro_type_script_index_0_lang.DCtT1bw0.js 62 KB, /assets/Logo.DkUqRIMF.css 56 KB |
| ✅ | Todo link interno leva a uma seção que existe | 6 destinos conferidos |
| ✅ | Todo WhatsApp usa wa.me/5549998325623 com mensagem preenchida | 16 links |
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
| ✅ | Sem JavaScript o conteúdo aparece e os contatos funcionam | {"planos":5,"duvidas":7,"escondidos":0,"enviar":"https://wa.me/5549998325623?te","solEscondida":true} |
| ✅ | Rodapé tem link para a Política de privacidade |  |
| ✅ | /privacidade/ abre com as 9 seções, sem erro no console e sem rolagem lateral | 9 seções; erros: 0; sobra 0 px |

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
| ✅ | "Quero este plano" leva nome e valor do plano ao WhatsApp | 5/5 |
| ✅ | Abas de proposta funcionam (clique e setas do teclado) |  |

## Tela 3 · Configurador

| | Item | Detalhe |
|---|---|---|
| ✅ | Tocar na planta adiciona câmera; tocar na câmera remove |  |
| ✅ | Pontos sugeridos funcionam no teclado |  |
| ✅ | Plano calculado: 1-4 exato, 5-7 → 8 com proposta, 8 exato, 9+ proposta |  |
| ✅ | Cabo estimado × incluso atualiza e avisa quando passa do limite | Cabo estimado≈ 61 m de 80 m inclusos |
| ✅ | Mensagem leva ambiente, quantidade, pontos, plano, valor e recursos | Olá! Montei meu sistema no site da SC. / Ambiente: Casa / Câmeras: 8 (entrada principal, garagem e portão, fundos / quintal, lateral esquerda, fundos / quintal  |
| ✅ | Condomínio vai para proposta personalizada |  |

## Tela 4 · Como funciona

| | Item | Detalhe |
|---|---|---|
| ✅ | Linha do tempo acende etapa por etapa | 0 → 1 → 2 → 3 → 4 → 4 → 5 |
| ✅ | 7 perguntas; a busca "celular" mostra a resposta certa | Consigo ver as câmeras pelo celular? |
| ✅ | Busca sem resultado oferece perguntar pelo WhatsApp |  |
| ✅ | Área do cliente identificada como exemplo ("em breve") |  |

## Tela 5 · Celular

| | Item | Detalhe |
|---|---|---|
| ✅ | Planos em carrossel com encaixe e indicador que acompanha | x mandatory; indicador 4 → 8 |
| ✅ | Barra fixa muda conforme a seção | contato → plano → configurador → contato (escondida) |
| ✅ | Menu do celular abre e fecha (também com Esc) |  |

## Sol · chat do site

| | Item | Detalhe |
|---|---|---|
| ✅ | Botão da Sol abre o chat com saudação de assistente virtual e sugestões | 4 sugestões |
| ✅ | Mensagem vai ao n8n com sessão (UUID) e volta com texto, cartão do plano e botões rápidos | 1 cartão (o de 7 câmeras, que não existe, foi descartado); botões: Francisco Beltrão, Outra cidade |
| ✅ | Cartão do plano no chat usa preço, taxa de instalação e cabo de dados.ts |  |
| ✅ | Texto do servidor nunca vira HTML no chat |  |
| ✅ | Cartão de contato valida número e autorização antes de enviar | máscara (46) 99123-4567 |
| ✅ | Contato vai com tipo "contato", número só com dígitos e autorização marcada |  |
| ✅ | Sem conexão com a Sol: aviso e botão do WhatsApp da equipe |  |
| ✅ | Todo preço no chat bate com dados.ts | 3 preços |
| ✅ | Esc fecha o chat (foco volta ao botão) e a conversa continua depois de recarregar | 10 → 10 mensagens |
| ✅ | Zero erros no console com o chat |  |
| ✅ | Celular: Sol na barra fixa, chat em tela cheia, sem rolagem lateral e toques ≥ 44 px |  |
| ✅ | Zero erros no console com o chat (celular) |  |
