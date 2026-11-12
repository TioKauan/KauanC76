# Relatório de validação do site

Gerado por `npm run validar` em 12/11/2026, 08:02:21.
Resultado: **181 de 181 itens ✅** — checklist completa.

## Geral

| | Item | Detalhe |
|---|---|---|
| ✅ | Tipos conferidos (astro check) e build sem erro |  |
| ✅ | Testes unitários das regras (Vitest) passam | 164 testes |
| ✅ | Peso total da página ≤ 500 KB (sem compactação) | 258 KB em 9 arquivos; maiores: / 83 KB, /marca/sc-logo.webp 52 KB, /assets/sol.CT3Pa8eK.js 39 KB |
| ✅ | Todo link interno leva a uma seção que existe | 6 destinos conferidos |
| ✅ | Todo WhatsApp usa wa.me/5546991331306 com mensagem preenchida | 6 links |
| ✅ | Todo botão de WhatsApp mostra o ícone do WhatsApp |  |
| ✅ | WhatsApp da equipe só em "Fale com a SC" e nos botões "Quero este plano" |  |
| ✅ | Cabeçalho: "Fale com a SC" aparece uma vez só e leva à seção de contato; o menu do celular tem o item "Contato" e o título "Soluções" | {"botoes":[{"href":"#contato","texto":"Fale com a SC"}],"ocorrencias":1,"menuContato":["Contato"],"menuTitulo":"Soluções","menuBotao":0} |
| ✅ | Número antigo (46) 99113-8360 não aparece |  |
| ✅ | Rodapé identifica a empresa (CNPJ, cidade, e-mail) |  |
| ✅ | Todo preço na página bate com dados.ts | 18 preços encontrados |
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
| ✅ | Sem JavaScript o conteúdo aparece e os contatos funcionam (botões de venda levam a "Fale com a SC") | {"planos":5,"duvidas":10,"escondidos":0,"vendas":1,"whatsContato":true,"solEscondida":true} |
| ✅ | Rodapé tem link para a Política de privacidade |  |
| ✅ | /privacidade/ abre com as 9 seções, sem erro no console e sem rolagem lateral | 9 seções; erros: 0; sobra 0 px |
| ✅ | Buscadores: robots.txt aponta o sitemap, e o sitemap lista todas as páginas | páginas: /, /calculadoras/, /casa/, /comercio/, /condominio/, /empresa/, /monte-seu-sistema/, /privacidade/; no sitemap: /, /calculadoras/, /casa/, /comercio/, /condominio/, /empresa/, /monte-seu-sistema/, /privacidade/ |
| ✅ | Buscadores: /sitemap.xml existe e é igual ao sitemap-0.xml (endereço que o Search Console sugere) | 794 bytes |

## Buscadores

| | Item | Detalhe |
|---|---|---|
| ✅ | Inicial tem os dados da empresa para o Google (schema.org): nome, CNPJ, cidade e e-mail iguais aos do rodapé | SC Soluções · 62.768.829/0001-96 · Francisco Beltrão · somoscella@gmail.com |
| ✅ | FAQPage (Google) tem as mesmas dúvidas do site, na mesma ordem | 10 no JSON; 10 <details> reconhecidos na tela |
| ✅ | Título das páginas de venda cita Francisco Beltrão; todas citam a cidade no título ou na descrição | sem cidade: nenhuma |
| ✅ | IndexNow: o arquivo da chave sai no build, com só a chave, e não está no sitemap | 91de491704f9e409970a313cb9196254 |
| ✅ | Só a página 404 fica fora do Google (noindex); as outras são indexadas |  |
| ✅ | Endereço inexistente: responde 404 com a página "não encontrada" e caminhos para o site (1440 px) | status 404; relativos: 0; âncoras quebradas: 0; WhatsApp fora do contato: 0; sobra 0 px; arquivos que falharam: 0; erros: 0 |
| ✅ | Endereço inexistente: responde 404 com a página "não encontrada" e caminhos para o site (390 px) | status 404; relativos: 0; âncoras quebradas: 0; WhatsApp fora do contato: 0; sobra 0 px; arquivos que falharam: 0; erros: 0 |

## Tela 1 · Abertura

| | Item | Detalhe |
|---|---|---|
| ✅ | Abertura da inicial: sem cena, sem chips "Veja no seu ambiente" e sem convites para as páginas de solução | {"cena":false,"chips":0,"convites":0,"rotulosSistema":0} |
| ✅ | Abertura da inicial não promete energia no plano (o nobreak é adicional, sob orçamento) | INTEGRADORA DE SEGURANÇA E TECNOLOGIA Câmeras em locação em Francisco Beltrão. Tecnologia que funciona. Planos a partir de R$ 49,90/mês, sem comprar os equipamentos. Câmeras com gravação local e imagens no celular. Rede, |
| ✅ | Inicial enxuta: sem "E se…?", faixa de serviços, configurador, "Personalize" e Área do cliente; botão leva a /monte-seu-sistema/ | {"ese":false,"faixa":false,"monte":false,"cliente":false,"personalize":false,"botaoMonte":"/monte-seu-sistema/"} |
| ✅ | "A partir de R$ 49,90/mês" visível sem rolar em 1440 px | fim do bloco em 760 de 900 px |
| ✅ | "A partir de R$ 49,90/mês" visível sem rolar em 390 px | fim do bloco em 493 de 768 px |
| ✅ | Abertura: carregar e rolar a inicial não faz pedido a youtube.com, youtube-nocookie.com, ytimg.com, googlevideo.com, google.com nem gstatic.com (1440 px) | 0 pedido(s) a outros servidores |
| ✅ | Abertura: carregar e rolar a inicial não faz pedido a youtube.com, youtube-nocookie.com, ytimg.com, googlevideo.com, google.com nem gstatic.com (390 px) | 0 pedido(s) a outros servidores |
| ✅ | Abertura: tocar no play troca a cena por um iframe de www.youtube-nocookie.com/embed/wKUPPBYbi-Q (com título, autoplay e carregamento tardio), sem abrir outra aba | {"pedidosAntes":0,"pedidosDepois":["https://www.youtube-nocookie.com/embed/wKUPPBYbi-Q?autoplay=1&rel=0&pl"],"player":{"src":"https://www.youtube-nocookie.com/embed/wKUPPBYbi-Q?autoplay=1&rel=0&playsinline=1","title":"Vídeo de demonstração do fabricante: câmeras ColorVu com imagem colorida à noite","allow":"autoplay; encrypted-media; picture-in-picture","loading":"lazy","dentroDoCelular":true,"capaSumiu":true,"legenda":true,"total":1},"abas":1,"erros":[]} |
| ✅ | Abertura sem JavaScript: o play é um link para https://www.youtube.com/watch?v=wKUPPBYbi-Q em nova aba (noopener), sem iframe e sem pedido ao Google | {"href":"https://www.youtube.com/watch?v=wKUPPBYbi-Q","alvo":"_blank","rel":"noopener","iframes":0,"texto":"Toque para ver o vídeo de demonstração do fabricante","externos":0} |
| ✅ | Abertura: a legenda do vídeo aparece logo abaixo do celular e contém "sob orçamento" (1440 px) | 16 px abaixo do celular; "Demonstração do fabricante (Hikvision ColorVu). Imagem colorida à noit…" |
| ✅ | Abertura: a legenda do vídeo aparece logo abaixo do celular e contém "sob orçamento" (390 px) | 16 px abaixo do celular; "Demonstração do fabricante (Hikvision ColorVu). Imagem colorida à noit…" |
| ✅ | Abertura: a linha de confiança leva a perfis.googleMaps (nova aba, noopener), fica abaixo dos botões e não tem estrelas, nota, número nem logo; o JSON-LD não tem AggregateRating nem Review | Avaliações e endereço no Perfil da Empresa no Google; JSON-LD 4108 caracteres |
| ✅ | Abertura: celular deitado com tela 19,5:9 e vídeo 16:9 centralizado; texto e celular lado a lado (1440 px) | {"tela":"2.167","video":"1.778","esq":840,"dir":1320} |
| ✅ | Abertura: celular deitado com tela 19,5:9 e vídeo 16:9 centralizado; texto primeiro, celular embaixo, com 16 px de margem (390 px) | {"tela":"2.167","video":"1.778","esq":16,"dir":374} |

## Tela 2 · Planos

| | Item | Detalhe |
|---|---|---|
| ✅ | 5 planos com preço, cabo e uso; mini-planta com exatamente N câmeras | 5/5 |
| ✅ | Destaque "Cobertura completa" só no plano de 4 câmeras |  |
| ✅ | "Simples de contratar": assinatura eletrônica, taxa de instalação, mensalidades na ativação, pagamento |  |
| ✅ | Cada plano mostra a taxa de instalação (1 mensalidade) e nada diz que a instalação é grátis | 5/5 |
| ✅ | Bloco "Condições do contrato" mostra prazo, multa, reajuste, propriedade e foro |  |
| ✅ | Nenhuma condição antiga ou promessa fora do documento (50%, renovação automática, garantia contra raio) |  |
| ✅ | Plano de 8 câmeras mostra "Gravador de 8 canais: um canal para cada câmera"; os outros planos não repetem a linha | planos com a linha: 8 |
| ✅ | Planos no computador: o preço de cada cartão cabe na largura do cartão (sem texto passando da borda) | 0 cartão(ões) com o preço cortado |
| ✅ | Contrato: 5 perguntas curtas com as respostas de dados.ts e um <details> "Ler todas as condições do contrato" fechado, com todos os títulos de condicoesContrato (abre ao tocar) | 5 perguntas; 11/11 condições no <details> |
| ✅ | "Quero este plano" abre o WhatsApp da equipe com o plano, o valor e a pergunta da instalação | 5/5 |
| ✅ | "Ver no configurador" leva à página /monte-seu-sistema/ com a quantidade de câmeras do plano | 5/5 |
| ✅ | Abas de proposta funcionam (clique e setas do teclado) |  |
| ✅ | O textoProposta aparece uma vez só no HTML da inicial | 1 vez(es) |
| ✅ | "Pedir proposta": um só botão e um só texto, abaixo do painel, visíveis nas 4 abas de serviço (cada uma com a própria mensagem) e escondidos nas câmeras; o condomínio mantém os links próprios | [{"id":"redes","visivel":true,"botoes":1,"texto":1,"msg":"Quero uma proposta de redes gerenciadas "},{"id":"alarme","visivel":true,"botoes":1,"texto":1,"msg":"Quero uma proposta de alarme monitorado "},{"id":"condominio","visivel":true,"botoes":1,"texto":1,"msg":"Quero uma proposta de condomínio evoluíd"},{"id":"nobreak","visivel":true,"botoes":1,"texto":1,"msg":"Quero uma proposta de locação de nobreak"}] |
| ✅ | "Pedir proposta" abre a Sol com a mensagem da aba escolhida e a página não sai do lugar | Quero uma proposta de alarme monitorado pelo app para o meu ambiente. → Quero uma proposta de alarme monitorado pelo app para o meu ambiente. |

## Tela 3 · Configurador (/monte-seu-sistema/)

| | Item | Detalhe |
|---|---|---|
| ✅ | Página do configurador: um título principal, WhatsApp só em "Fale com a SC", sem âncora quebrada, sem erro e sem condição contratual ou "instalação inclusa" | {"h1":1,"whatsFora":0,"whatsDentro":1,"ancorasQuebradas":[],"erros":[]} |
| ✅ | Tocar na planta adiciona câmera; tocar na câmera remove |  |
| ✅ | Pontos sugeridos funcionam no teclado |  |
| ✅ | Plano calculado: 1-4 exato, 5-7 → 8 com proposta, 8 exato, 9+ proposta |  |
| ✅ | ?cameras=4 já chega com as 4 câmeras do plano marcadas | 4 câmeras; exato:4 |
| ✅ | Cabo estimado × incluso atualiza e avisa quando passa do limite | Cabo estimado≈ 61 m de 80 m inclusos |
| ✅ | Mensagem para a Sol leva ambiente, quantidade, pontos, plano, valor e recursos | Olá! Montei meu sistema no site da SC. / Ambiente: Casa / Câmeras: 8 (entrada principal, garagem e portão, fundos / quintal, lateral esquerda, fundos / quintal  |
| ✅ | Condomínio vai para proposta personalizada |  |
| ✅ | ?ambiente=condominio abre o configurador no condomínio (link da aba Condomínio) | true |
| ✅ | Link antigo /#monte leva a /monte-seu-sistema/ | http://127.0.0.1:62982/monte-seu-sistema/ |

## Tela 4 · Como funciona

| | Item | Detalhe |
|---|---|---|
| ✅ | Linha do tempo acende etapa por etapa | 0 → 1 → 2 → 3 → 4 → 4 → 5 |
| ✅ | 10 perguntas; a busca "celular" mostra a resposta certa | Consigo ver as câmeras pelo celular? |
| ✅ | Busca sem resultado oferece perguntar para a Sol (sem WhatsApp) |  |

## Tela 5 · Celular

| | Item | Detalhe |
|---|---|---|
| ✅ | Planos em carrossel com encaixe e indicador que acompanha | x mandatory; indicador 4 → 8 |
| ✅ | Barra fixa muda conforme a seção (inicial e configurador) | contato → plano → contato (escondida) → configurador |
| ✅ | Barra fixa sem WhatsApp: fica a Sol |  |
| ✅ | Menu do celular abre e fecha (também com Esc) |  |

## Sol · chat do site

| | Item | Detalhe |
|---|---|---|
| ✅ | Chat abre com a Sol pedindo o nome, sem botão fixo de WhatsApp (nada vai ao servidor ainda) | {"dica":"Seu nome","pedidos":0} |
| ✅ | Pedir o WhatsApp no roteiro mostra o botão da equipe e continua na mesma pergunta (nada vai ao servidor) | {"fala":"Claro! É só tocar no botão abaixo para falar com a equipe da SC no WhatsApp. Se preferir seguir por aqui, como posso te chamar?","whats":[{"href":"https://wa.me/5546991331306?text=Ol%C3%A1!%20Vim%20pelo%20chat%20do%20site%20e%20quero%20falar%20com%20a%20equipe%20da%20SC.","icone":true}],"dica":"Seu nome"} |
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
| ✅ | Botão de venda com plano escolhido abre a Sol e, depois do roteiro, vai com o plano; a página não sai do lugar | ["lead","Quero o plano de 4 câmeras (plano 4)"] |
| ✅ | Celular: Sol na barra fixa, chat em tela cheia, sem rolagem lateral e toques ≥ 44 px (roteiro e conversa) |  |
| ✅ | Celular: a última mensagem fica à vista com os botões rápidos na tela (roteiro e conversa) | {"vistaRoteiro":true,"vistaConversa":true} |
| ✅ | Zero erros no console com o chat (celular) |  |

## Páginas de solução

| | Item | Detalhe |
|---|---|---|
| ✅ | Casa: a página responde (200), tem um só título principal, 2 a 4 blocos, destaques e nenhum canvas | {"status":200,"h1":["Sua casa protegida, do portão ao quintal."],"canvas":0,"destaques":4,"blocos":4,"ancorasQuebradas":[]} |
| ✅ | Casa: WhatsApp da equipe só em "Fale com a SC" e zero erros no console | 1 no contato, 0 fora; erros: 0 |
| ✅ | Casa: "reduzir movimento": nenhuma animação contínua roda | 0 animações contínuas |
| ✅ | Casa: nada fala de maquete, 3D nem "instalação inclusa"; menu "Soluções" leva às quatro páginas |  |
| ✅ | Casa: dados estruturados (schema.org) da página e título com a cidade | 1 bloco(s); Câmeras de segurança para casa / SC Soluções, Francisco Beltrão |
| ✅ | Casa: página leve (peso total ≤ 300 KB, sem compactação) | 160 KB em 7 arquivos |
| ✅ | Casa: planos de 1 a 8 câmeras, gravação de aproximadamente 10 dias, imagens no celular dependem de energia e internet, premium sob orçamento |  |
| ✅ | Casa: botões levam aos planos (/#planos) e ao configurador (?ambiente=casa) | {"planos":"Ver os planos de locação","config":"Montar no configurador","whats":0} |
| ✅ | Casa no celular: sem rolagem lateral, toques ≥ 44 px, item "Contato" no menu e sem erros | {"sobra":0,"pequenos":[],"contatoNoMenu":true,"erros":[]} |
| ✅ | Casa sem JavaScript: texto, blocos, contato e botões funcionam | {"h1":1,"blocos":4,"contato":true,"botoes":"/#planos /monte-seu-sistema/?ambiente=casa"} |
| ✅ | Comércio: a página responde (200), tem um só título principal, 2 a 4 blocos, destaques e nenhum canvas | {"status":200,"h1":["Caixa, estoque e entrada à vista, de onde você estiver."],"canvas":0,"destaques":4,"blocos":4,"ancorasQuebradas":[]} |
| ✅ | Comércio: WhatsApp da equipe só em "Fale com a SC" e zero erros no console | 1 no contato, 0 fora; erros: 0 |
| ✅ | Comércio: "reduzir movimento": nenhuma animação contínua roda | 0 animações contínuas |
| ✅ | Comércio: nada fala de maquete, 3D nem "instalação inclusa"; menu "Soluções" leva às quatro páginas |  |
| ✅ | Comércio: dados estruturados (schema.org) da página e título com a cidade | 1 bloco(s); Câmeras de segurança para comércio / SC Soluções, Francisco Beltrão |
| ✅ | Comércio: página leve (peso total ≤ 300 KB, sem compactação) | 160 KB em 7 arquivos |
| ✅ | Comércio: planos de 1 a 8 câmeras, gravação de aproximadamente 10 dias, imagens no celular dependem de energia e internet, premium sob orçamento |  |
| ✅ | Comércio: botões levam aos planos (/#planos) e ao configurador (?ambiente=comercio) | {"planos":"Ver os planos de locação","config":"Montar no configurador","whats":0} |
| ✅ | Comércio no celular: sem rolagem lateral, toques ≥ 44 px, item "Contato" no menu e sem erros | {"sobra":0,"pequenos":[],"contatoNoMenu":true,"erros":[]} |
| ✅ | Comércio sem JavaScript: texto, blocos, contato e botões funcionam | {"h1":1,"blocos":4,"contato":true,"botoes":"/#planos /monte-seu-sistema/?ambiente=comercio"} |
| ✅ | Empresa: a página responde (200), tem um só título principal, 2 a 4 blocos, destaques e nenhum canvas | {"status":200,"h1":["Segurança e rede da sua empresa no mesmo projeto."],"canvas":0,"destaques":4,"blocos":4,"ancorasQuebradas":[]} |
| ✅ | Empresa: WhatsApp da equipe só em "Fale com a SC" e zero erros no console | 1 no contato, 0 fora; erros: 0 |
| ✅ | Empresa: "reduzir movimento": nenhuma animação contínua roda | 0 animações contínuas |
| ✅ | Empresa: nada fala de maquete, 3D nem "instalação inclusa"; menu "Soluções" leva às quatro páginas |  |
| ✅ | Empresa: dados estruturados (schema.org) da página e título com a cidade | 1 bloco(s); Câmeras e rede para empresas / SC Soluções, Francisco Beltrão |
| ✅ | Empresa: página leve (peso total ≤ 300 KB, sem compactação) | 160 KB em 7 arquivos |
| ✅ | Empresa: planos de 1 a 8 câmeras, gravação de aproximadamente 10 dias, imagens no celular dependem de energia e internet, premium sob orçamento |  |
| ✅ | Empresa: botões levam aos planos (/#planos) e ao configurador (?ambiente=empresa) | {"planos":"Ver os planos de locação","config":"Montar no configurador","whats":0} |
| ✅ | Empresa no celular: sem rolagem lateral, toques ≥ 44 px, item "Contato" no menu e sem erros | {"sobra":0,"pequenos":[],"contatoNoMenu":true,"erros":[]} |
| ✅ | Empresa sem JavaScript: texto, blocos, contato e botões funcionam | {"h1":1,"blocos":4,"contato":true,"botoes":"/#planos /monte-seu-sistema/?ambiente=empresa"} |
| ✅ | Condomínio: a página responde (200), tem um só título principal, 2 a 4 blocos, destaques e nenhum canvas | {"status":200,"h1":["Acessos, segurança e infraestrutura do condomínio em um projeto só."],"canvas":0,"destaques":4,"blocos":4,"ancorasQuebradas":[]} |
| ✅ | Condomínio: WhatsApp da equipe só em "Fale com a SC" e zero erros no console | 1 no contato, 0 fora; erros: 0 |
| ✅ | Condomínio: "reduzir movimento": nenhuma animação contínua roda | 0 animações contínuas |
| ✅ | Condomínio: nada fala de maquete, 3D nem "instalação inclusa"; menu "Soluções" leva às quatro páginas |  |
| ✅ | Condomínio: dados estruturados (schema.org) da página e título com a cidade | 1 bloco(s); Câmeras e controle de acesso para condomínio / SC Soluções, Francisco Beltrão |
| ✅ | Condomínio: página leve (peso total ≤ 300 KB, sem compactação) | 160 KB em 7 arquivos |
| ✅ | Condomínio: sem preço, dias de gravação, quantidade de câmeras, prazo de contrato nem "instalação inclusa" |  |
| ✅ | Condomínio: o botão de proposta tem o orbe da Sol, leva a #contato sem JavaScript e abre o chat da Sol | {"href":"#contato","msg":"Quero uma proposta do Condomínio Evoluído para o meu condomínio.","orbe":true,"whats":false,"config":true} |
| ✅ | Condomínio: "Pedir proposta" abre a Sol e a página não sai do lugar | http://127.0.0.1:62982/condominio/ |
| ✅ | Condomínio no celular: sem rolagem lateral, toques ≥ 44 px, item "Contato" no menu e sem erros | {"sobra":0,"pequenos":[],"contatoNoMenu":true,"erros":[]} |
| ✅ | Condomínio sem JavaScript: texto, blocos, contato e botões funcionam | {"h1":1,"blocos":4,"contato":true,"botoes":"#contato /monte-seu-sistema/?ambiente=condominio"} |
| ✅ | Inicial leva às páginas de solução: aba "Condomínio" dos planos, menu "Soluções" e rodapé; o configurador também (sem falar em 3D) | {"planos":"Conhecer o Condomínio Evoluído","menu":true,"rodape":true,"configurador":"Conhecer o Condomínio Evoluído"} |
| ✅ | Pacote gerado (dist): sem Three.js, sem arquivo de maquete e sem canvas nas páginas de solução | três: 0; maquete: 0; canvas: 0 |

## Layout em 375 px

| | Item | Detalhe |
|---|---|---|
| ✅ | Página inicial em 375 px: scrollWidth ≤ 375, margem lateral de 16 px, celular dentro da tela e nenhum botão com texto cortado | {"sobra":0,"cortados":[],"esquerda":16,"celularDireita":359,"alemDaBorda":[]} |
| ✅ | /monte-seu-sistema/ em 375 px: scrollWidth ≤ 375 e nenhum botão com texto cortado | {"sobra":0,"cortados":[],"esquerda":null,"celularDireita":null,"alemDaBorda":[]} |
| ✅ | /calculadoras/ em 375 px: scrollWidth ≤ 375 e nenhum botão com texto cortado | {"sobra":0,"cortados":[],"esquerda":null,"celularDireita":null,"alemDaBorda":[]} |
| ✅ | /privacidade/ em 375 px: scrollWidth ≤ 375 e nenhum botão com texto cortado | {"sobra":0,"cortados":[],"esquerda":null,"celularDireita":null,"alemDaBorda":[]} |
| ✅ | /casa/ em 375 px: scrollWidth ≤ 375 e nenhum botão com texto cortado | {"sobra":0,"cortados":[],"esquerda":null,"celularDireita":null,"alemDaBorda":[]} |
| ✅ | /comercio/ em 375 px: scrollWidth ≤ 375 e nenhum botão com texto cortado | {"sobra":0,"cortados":[],"esquerda":null,"celularDireita":null,"alemDaBorda":[]} |
| ✅ | /empresa/ em 375 px: scrollWidth ≤ 375 e nenhum botão com texto cortado | {"sobra":0,"cortados":[],"esquerda":null,"celularDireita":null,"alemDaBorda":[]} |
| ✅ | /condominio/ em 375 px: scrollWidth ≤ 375 e nenhum botão com texto cortado | {"sobra":0,"cortados":[],"esquerda":null,"celularDireita":null,"alemDaBorda":[]} |
| ✅ | Página 404 em 375 px: scrollWidth ≤ 375 e nenhum botão com texto cortado | {"sobra":0,"cortados":[],"esquerda":null,"celularDireita":null,"alemDaBorda":[]} |

## Acessibilidade (axe)

| | Item | Detalhe |
|---|---|---|
| ✅ | Página inicial: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | /privacidade/: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | /condominio/: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | Página 404: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | /monte-seu-sistema/: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | /casa/: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | /comercio/: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | /empresa/: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | /calculadoras/: nenhuma violação de acessibilidade (computador e celular) |  |
| ✅ | Chat da Sol aberto: nenhuma violação de acessibilidade (computador e celular) |  |

## Calculadoras de campo

| | Item | Detalhe |
|---|---|---|
| ✅ | Calculadoras: HD com os valores iniciais dá 8,55 TB e 1 disco de 10 TB | Por câmera, por dia32,4 GBTotal gravado7,78 TBCom 10 % de margem8,55 TB (≈ 7,78 TiB no NVR)Discos sugeridos1 × 10 TB (10 TB) |
| ✅ | Calculadoras: cabo com os valores iniciais pede 2,38 mm² e indica 2,5 mm² | Seção mínima pela queda2,38 mm²Cabo indicado2,5 mm² (≈ AWG 14)Queda real0,57 V (4,76 %)Tensão no fim do cabo11,43 VCorrente máxima do cabo24 A |
| ✅ | Calculadoras: trocar de aba mostra só o painel escolhido |  |
| ✅ | Calculadoras: trecho enorme avisa que nenhum cabo serve | Seção mínima pela queda59,52 mm²Nenhum cabo de até 16 mm² serve nesse trecho. Reduza a distância, divida a carga em mais |
| ✅ | Calculadoras: o botão da Sol leva o resumo da conta aberta | Usei as calculadoras do site. Cabo: CC 12 V, 1 A a 40 m: 2,5 mm² (queda 4,76 %). Quero conversar sobre a minha instalação. |
| ✅ | Calculadoras: energia com os valores iniciais dá 70 W, fonte de 10 A e bateria de 65 Ah | Potência total70 WCorrente a 12 V5,83 A (7 A com folga)Fonte indicada10 ABateria para 4 h54,9 Ah necessários → 65 Ah |
| ✅ | Calculadoras: rede com os valores iniciais dá 57,6 Mbps e enlace de 100 Mbps | Câmeras somadas48 MbpsCom a folga de protocolo57,6 MbpsEnlace até o gravador100 Mbps (usa até 70 %)Upload para ver de fora1,2 Mbps |
| ✅ | Calculadoras: manifesto, rodapé, orbe da Sol, um h1, WhatsApp só em "Fale com a SC" e fora do menu do topo | {"manifesto":"/calculadoras/manifest.webmanifest","whatsFora":0,"h1":1,"orbe":true,"rodape":true,"menuTopo":false} |
| ✅ | Calculadoras: service worker só em /calculadoras/ e a página abre e calcula sem internet | http://127.0.0.1:62982/calculadoras/; Calculadoras para instalação de câmeras / SC Soluções, Francisco Beltrão |
| ✅ | Calculadoras: o service worker é versionado, limpa caches velhos e usa rede primeiro para a página |  |
| ✅ | Calculadoras: zero erros no console |  |
| ✅ | Calculadoras no celular: sem rolagem lateral e campos/botões ≥ 44 px | sobra 0; pequenos 0 |
