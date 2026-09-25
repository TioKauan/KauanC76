# Relatório de validação do site

Gerado por `npm run validar` em 25/09/2026, 01:34:43.
Resultado: **46 de 46 itens ✅** — checklist completa.

## Geral

| | Item | Detalhe |
|---|---|---|
| ✅ | Tipos conferidos (astro check) e build sem erro |  |
| ✅ | Testes unitários das regras (Vitest) passam | 66 testes |
| ✅ | Peso total da página ≤ 500 KB (sem compactação) | 346 KB em 5 arquivos; maiores: / 193 KB, /marca/sc-logo.webp 52 KB, /assets/index.CCWjk9oH.css 43 KB |
| ✅ | Todo link interno leva a uma seção que existe | 6 destinos conferidos |
| ✅ | Todo WhatsApp usa wa.me/5546991331306 com mensagem preenchida | 16 links |
| ✅ | Número antigo (46) 99113-8360 não aparece |  |
| ✅ | Todo preço na página bate com dados.ts | 6 preços encontrados |
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
| ✅ | Sem JavaScript o conteúdo aparece e os contatos funcionam | {"planos":5,"duvidas":7,"escondidos":0,"enviar":"https://wa.me/5546991331306?te"} |

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
| ✅ | "Tudo claro antes de assinar": prazo, saída, ZapSign, 1ª mensalidade + letra miúda |  |
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
| ✅ | Linha do tempo acende etapa por etapa | 0 → 1 → 2 → 3 → 3 → 4 → 5 |
| ✅ | 7 perguntas; a busca "celular" mostra a resposta certa | Consigo ver as câmeras pelo celular? |
| ✅ | Busca sem resultado oferece perguntar pelo WhatsApp |  |
| ✅ | Área do cliente identificada como exemplo ("em breve") |  |

## Tela 5 · Celular

| | Item | Detalhe |
|---|---|---|
| ✅ | Planos em carrossel com encaixe e indicador que acompanha | x mandatory; indicador 4 → 8 |
| ✅ | Barra fixa muda conforme a seção | contato → plano → configurador → contato (escondida) |
| ✅ | Menu do celular abre e fecha (também com Esc) |  |
