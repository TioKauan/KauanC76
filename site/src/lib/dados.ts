/**
 * TODO O CONTEÚDO COMERCIAL DO SITE FICA AQUI.
 *
 * Fonte: documento "Planos de Locação de CFTV | SC Soluções".
 * Mudou preço, condição ou limite de cabo? Altere só este arquivo:
 * a abertura, os planos, o configurador e as mensagens do WhatsApp acompanham.
 */

import type { NomeIcone } from './icones';

export interface Plano {
  id: string;
  cameras: number;
  /** Mensalidade em reais. */
  preco: number;
  /** Metros de cabo incluídos na instalação padrão. */
  caboMetros: number;
  gravador: string;
  uso: string;
  /** Selo de destaque (texto do documento), se houver. */
  destaque?: string;
}
export interface Upgrade { id: 'colorida' | 'audio' | 'analise' | 'armazenamento' | 'nobreak'; nome: string; icone: NomeIcone; detalhe: string }
export interface ItemIcone { icone: NomeIcone; titulo: string; texto: string }
export interface Etapa extends ItemIcone { meta: string }
export interface ServicoProposta { id: string; nome: string; icone: NomeIcone; titulo: string; texto: string; itens: string[] }
export interface Duvida { pergunta: string; resposta: string }
export type Recomendacao =
  | { tipo: 'vazio'; plano: null }
  | { tipo: 'exato'; plano: Plano }
  | { tipo: 'folga'; plano: Plano }
  | { tipo: 'proposta'; plano: null };

export const empresa = {
  nome: 'SC Soluções',
  descricao: 'Segurança e Tecnologia',
  site: 'https://somoscella.online',
  regiao: 'Francisco Beltrão e região',
  // Cidades atendidas (Kauan, 14/10/2026). Vão para os dados do Google (areaServed).
  cidadesAtendidas: ['Francisco Beltrão, PR', 'Dois Vizinhos, PR', 'Realeza, PR', 'Campo Erê, SC'],
  // Identificação no rodapé: só o CNPJ, sem o nome do titular (decisão do Kauan, 25/09/2026).
  cnpj: '62.768.829/0001-96',
  cidade: 'Francisco Beltrão - PR', // espaços que não quebram: "PR" não fica sozinho na linha
};

export const contato = {
  // Número usado em todos os botões de WhatsApp: atendimento humano, pela equipe.
  // A assistente virtual (Sol) atende no chat do próprio site, não no WhatsApp.
  whatsapp: '5546991331306',
  whatsappExibicao: '(46) 99133-1306',
  email: 'somoscella@gmail.com',
  atendimento: 'Atendimento pela equipe da SC',
};

// Perfis oficiais da empresa. Vão só para os dados do Google (schema.org, `sameAs`), que assim
// ligam o site ao Instagram e ao Perfil da Empresa no Google como a mesma empresa. Não aparecem na tela.
export const perfis = {
  instagram: 'https://www.instagram.com/scsolucoes.oficial/',
  // Perfil da Empresa no Google (Maps), pelo número fixo do perfil (cid), não pelo link curto.
  googleMaps: 'https://maps.google.com/?cid=5706617023540447846',
};

// false = troca todos os valores por "Sob consulta".
export const mostrarPrecos: boolean = true;

// Taxa de instalação = valor de N mensalidades do plano, pago antecipadamente (Kauan, 25/09/2026).
export const taxaInstalacaoMensalidades: number = 1;
export const rotuloTaxa = `${taxaInstalacaoMensalidades} ${taxaInstalacaoMensalidades > 1 ? 'mensalidades' : 'mensalidade'}`;

export const planos: Plano[] = [
  {
    id: 'p1',
    cameras: 1,
    preco: 49.9,
    caboMetros: 20,
    gravador: 'DVR 4 canais',
    uso: 'Um ponto estratégico: entrada, garagem, corredor ou caixa.',
  },
  {
    id: 'p2',
    cameras: 2,
    preco: 69.9,
    caboMetros: 40,
    gravador: 'DVR 4 canais',
    uso: 'Frente e fundos, entrada e garagem ou duas áreas críticas.',
  },
  {
    id: 'p3',
    cameras: 3,
    preco: 89.9,
    caboMetros: 60,
    gravador: 'DVR 4 canais',
    uso: 'Residência ou pequeno comércio com circulação e área externa.',
  },
  {
    id: 'p4',
    cameras: 4,
    preco: 99.9,
    caboMetros: 80,
    gravador: 'DVR 4 canais',
    uso: 'Cobertura completa de residência, loja ou escritório.',
    destaque: 'Cobertura completa',
  },
  {
    id: 'p8',
    cameras: 8,
    preco: 159.9,
    caboMetros: 100,
    gravador: 'DVR 8 canais',
    uso: 'Imóvel maior, empresa, mercado, depósito ou cobertura ampla.',
  },
];

// Recursos premium: sempre "sob orçamento", nunca item padrão do plano.
export const upgrades: Upgrade[] = [
  { id: 'colorida', nome: 'Imagem colorida à noite', icone: 'moon', detalhe: 'Mais cor em baixa iluminação. Depende da iluminação do local e do modelo.' },
  { id: 'audio', nome: 'Áudio bidirecional', icone: 'mic', detalhe: 'Ouvir e falar pelo aplicativo. Exige câmera e gravador compatíveis.' },
  { id: 'analise', nome: 'Análise inteligente', icone: 'scan-eye', detalhe: 'Filtra eventos de pessoas e veículos. Depende do gravador e das câmeras.' },
  { id: 'armazenamento', nome: 'Mais dias de gravação', icone: 'hard-drive', detalhe: 'HD maior, dimensionado pelo modo de gravação.' },
  { id: 'nobreak', nome: 'Nobreak', icone: 'battery-charging', detalhe: 'Mantém o sistema por um período na falta de energia. Depende da bateria e da carga.' },
];

/*
 * "Simples de contratar": o que muda para quem loca e como é a contratação (25/09/2026).
 * Em 17/10/2026 o antigo "Por que locar" entrou aqui, para a inicial ficar mais curta.
 * Desde 02/11/2026 (decisão do Kauan: "vamos mostrar tudo sob o contrato") as condições do
 * contrato (prazo, multa, reajuste, cobranças à parte...) também aparecem no site, em
 * `condicoesContrato`. Fonte: documento "Planos de Locação de CFTV". Site e contrato precisam
 * dizer a mesma coisa: mudou uma regra, mude os dois.
 */
export const condicoes: ItemIcone[] = [
  { icone: 'sparkles', titulo: 'Sem comprar equipamentos', texto: 'Os equipamentos são da SC: você paga a instalação uma vez e depois só a mensalidade do plano.' },
  { icone: 'wrench', titulo: 'Defeito natural? A SC resolve', texto: 'Reparo ou troca por equipamento equivalente ou superior, conforme o contrato.' },
  { icone: 'cable', titulo: 'Taxa de instalação', texto: `Valor de ${rotuloTaxa} do plano, pago antecipadamente.` },
  { icone: 'signature', titulo: 'Contrato e pagamento pelo celular', texto: 'Assinatura eletrônica pela ZapSign. As mensalidades começam na ativação do sistema.' },
];

/*
 * "Condições do contrato" (02/11/2026): o que o cliente assina, em linguagem simples.
 * Fonte: documento "Planos de Locação de CFTV" (seções de condições, danos, cobranças e gravação).
 * Não invente regra aqui: tudo precisa estar no documento.
 */
export const condicoesContrato: ItemIcone[] = [
  { icone: 'signature', titulo: 'Prazo mínimo de 24 meses', texto: 'Contado da ativação do sistema. A primeira mensalidade vence na ativação.' },
  { icone: 'circle-check', titulo: 'Depois dos 24 meses', texto: 'O contrato segue por prazo indeterminado, sem nova fidelidade automática. Para cancelar, avise por escrito com pelo menos 30 dias de antecedência.' },
  { icone: 'circle-alert', titulo: 'Cancelamento antes dos 24 meses', texto: 'Multa de 30% das mensalidades que faltam para completar os 24 meses.' },
  { icone: 'refresh-cw', titulo: 'Reajuste anual pelo IPCA', texto: 'A mensalidade é reajustada uma vez por ano pela variação acumulada do IPCA ou índice oficial substituto.' },
  { icone: 'cctv', titulo: 'Os equipamentos são da SC', texto: 'Durante a locação os equipamentos continuam sendo da SC, que os retira ao fim do contrato. Marca e modelo podem variar, mantendo ou superando as funções contratadas.' },
  { icone: 'wrench', titulo: 'O que a manutenção cobre', texto: 'Defeito natural dos equipamentos locados. Danos externos e mau uso são cobrados à parte.' },
  { icone: 'triangle-alert', titulo: 'Não coberto gratuitamente', texto: 'Vandalismo, furto, roubo, impacto, mau uso, pragas, infiltração externa, incêndio, raio, surto acima da proteção instalada, oscilação grave, falta de aterramento, desastre natural, obra, intervenção de terceiros e descumprimento de orientação técnica.' },
  { icone: 'cable', titulo: 'Cobrado à parte', texto: 'Cabo além do limite do plano; canaletas, eletrodutos, postes, suportes especiais, rack ou quadro técnico; obras civis, pintura e passagem subterrânea; andaime, plataforma ou trabalho em altura; rede elétrica, aterramento, nobreak e proteção adicional; adequação de internet, roteador ou rede; mudança de endereço, reposicionamento e ampliação; reconfiguração por troca de roteador, provedor ou senha; visita em que não se encontre defeito coberto.' },
  { icone: 'hard-drive', titulo: 'Gravação e acesso pelo celular', texto: 'Cerca de 10 dias de gravação, variando com HD, resolução, movimento e câmeras; o sistema pode apagar as imagens mais antigas, então exporte as importantes antes. A SC não guarda as gravações. O acesso depende de energia, internet, rede, aparelho compatível e senha válida.' },
  { icone: 'scan-eye', titulo: 'Sem vigilância humana', texto: 'Os planos de locação de câmeras não incluem vigilância humana.' },
  { icone: 'map-pin', titulo: 'Foro', texto: 'Comarca de Francisco Beltrão, Paraná, preservados os direitos do consumidor.' },
];

// Serviços que viram proposta personalizada (documento: "Exemplos de soluções personalizadas").
export const servicosProposta: ServicoProposta[] = [
  {
    id: 'redes',
    nome: 'Redes',
    icone: 'network',
    titulo: 'Redes gerenciadas',
    texto: 'Conectividade bem estruturada para a sua operação.',
    itens: ['Roteador e pontos de acesso', 'Separação de redes (VLAN)', 'Portal para visitantes', 'Suporte'],
  },
  {
    id: 'alarme',
    nome: 'Alarme',
    icone: 'bell-ring',
    // Monitorado pelo próprio cliente, no aplicativo: a SC não tem central de monitoramento.
    titulo: 'Alarme monitorado pelo app',
    texto: 'Você acompanha e comanda pelo celular.',
    itens: ['Alarme integrado às câmeras', 'Avisos de eventos no aplicativo', 'Projeto conforme o imóvel'],
  },
  {
    id: 'condominio',
    nome: 'Condomínio',
    icone: 'building-2',
    titulo: 'Condomínio Evoluído',
    texto: 'Acessos, segurança e infraestrutura em um projeto só.',
    itens: ['Câmeras', 'Controle de acesso facial', 'Interfonia', 'Nobreak e quadro técnico'],
  },
  {
    id: 'nobreak',
    nome: 'Nobreak',
    icone: 'battery-charging',
    titulo: 'Locação de nobreak',
    texto: 'Energia de apoio para o que é essencial.',
    itens: ['Nobreak dimensionado para a carga', 'Proteção de infraestrutura crítica', 'Manutenção durante o contrato'],
  },
];

export const textoProposta =
  'A SC prepara proposta técnica, composição de equipamentos, mensalidade, taxa de implantação quando aplicável, ' +
  'manutenção preventiva e contrato personalizados.';

export const etapas: Etapa[] = [
  { icone: 'mouse-pointer-click', titulo: 'Escolha o plano', texto: 'Pela quantidade de pontos que quer acompanhar, ou montando o sistema no configurador.', meta: '1, 2, 3, 4 ou 8 câmeras' },
  { icone: 'map-pin', titulo: 'A SC confirma o local', texto: 'Pontos, viabilidade técnica e se precisa de alguma infraestrutura extra.', meta: 'Cabo dentro do limite do plano' },
  { icone: 'signature', titulo: 'Assine pelo celular', texto: 'O contrato do plano chega pela ZapSign. Sem papel, sem ir até a loja.', meta: 'Assinatura eletrônica' },
  { icone: 'wrench', titulo: 'Instalação e app', texto: 'Instalamos, configuramos o gravador, testamos e deixamos as imagens no seu celular.', meta: 'Mensalidades a partir da ativação' },
  { icone: 'headset', titulo: 'Suporte contínuo', texto: 'Diagnóstico remoto em horário comercial, atendimento presencial quando necessário e agendado, e manutenção de defeitos naturais durante o contrato.', meta: 'Troca por equivalente ou superior' },
];

// Perguntas frequentes: texto do documento.
export const duvidas: Duvida[] = [
  {
    pergunta: 'Preciso comprar os equipamentos?',
    resposta: 'Não. Os equipamentos são fornecidos em regime de locação e permanecem de propriedade da SC Soluções.',
  },
  {
    pergunta: 'Como funciona a instalação?',
    resposta: `A instalação tem taxa no valor de ${rotuloTaxa} do plano, paga antecipadamente. Ela cobre a instalação padrão dentro do limite de cabeamento do plano; infraestrutura especial e materiais adicionais são orçados separadamente.`,
  },
  {
    pergunta: 'Consigo ver as câmeras pelo celular?',
    resposta: 'Sim, desde que o local tenha energia, internet e rede compatível. A SC Soluções realiza a configuração inicial do aplicativo.',
  },
  {
    pergunta: 'Quantos dias ficam gravados?',
    resposta: 'A estimativa é de aproximadamente dez dias. O período varia conforme resolução, movimento, taxa de gravação, capacidade do HD e modo de gravação. Quando o HD enche, o sistema pode substituir as imagens mais antigas; exporte antes as que forem importantes.',
  },
  {
    pergunta: 'A manutenção está incluída?',
    resposta: 'Sim, para defeitos naturais dos equipamentos locados: a SC conserta ou troca por equivalente ou superior. Danos externos e mau uso são cobrados à parte.',
  },
  {
    pergunta: 'Posso cancelar?',
    resposta: 'Sim. O prazo mínimo é de 24 meses, contados da ativação: cancelando antes, a multa é de 30% das mensalidades restantes. Passados os 24 meses, o contrato segue sem nova fidelidade e você cancela com aviso por escrito de 30 dias.',
  },
  {
    pergunta: 'A mensalidade aumenta?',
    resposta: 'Uma vez por ano, pela variação acumulada do IPCA (ou índice oficial substituto). A mensalidade não muda no meio do ano.',
  },
  {
    pergunta: 'E se roubarem ou danificarem as câmeras?',
    resposta: 'Os equipamentos são da SC, e a manutenção cobre defeito natural. Furto, roubo, vandalismo, impacto, mau uso, raio, surto, incêndio e intervenção de terceiros não são cobertos e geram cobrança.',
  },
  {
    pergunta: 'E se faltar energia ou a internet cair?',
    resposta: 'O acesso pelo celular depende de energia elétrica e de internet. Nobreak é um adicional, sob orçamento.',
  },
  {
    pergunta: 'Posso adicionar câmeras premium?',
    resposta: 'Sim. Imagem colorida à noite, áudio bidirecional, análise inteligente, resolução superior e outros recursos podem ser adicionados mediante análise e orçamento.',
  },
];

/*
 * Páginas de solução (/casa/, /comercio/, /empresa/, /condominio/): texto curto, sem recursos
 * interativos. Os fatos vêm daqui mesmo: planos de 1 a 8 câmeras, gravação de aproximadamente
 * 10 dias, imagens no celular (dependem de energia e internet), recursos premium sob orçamento.
 * O condomínio é sempre proposta personalizada: sem preço, dias de gravação nem quantidade de câmeras.
 */
export interface BlocoSolucao { titulo: string; texto: string }

export interface TextosSolucao {
  /** Nome da página (aparece acima do título e nos títulos para redes sociais). */
  sobre: string;
  /** Título principal (H1). */
  titulo: string;
  /** Texto de apoio abaixo do título. */
  lead: string;
  /** Descrição para o Google. */
  descricao: string;
  /** Nome curto da solução. */
  curto: string;
  /** Título da aba e do resultado no Google, com o que a pessoa digita na busca. */
  tituloBusca: string;
  /** Lista curta de destaques, abaixo do texto de apoio. */
  destaques: readonly string[];
  /** De 2 a 4 blocos curtos de conteúdo. */
  blocos: readonly BlocoSolucao[];
}

const energiaInternet = 'Ver as imagens pelo celular depende de energia e de internet no local. Nobreak e outros recursos premium são adicionais, sob orçamento.';
const escolhaDoPlano = 'Escolha pela quantidade de pontos que quer acompanhar, ou monte o sistema no configurador e veja o plano indicado.';
const textoCameras = (onde: string) => `${onde}, com gravação no próprio local por aproximadamente 10 dias e imagens no celular.`;

export const paginaCondominio = {
  sobre: 'Condomínio Evoluído',
  curto: 'Condomínio',
  tituloBusca: 'Câmeras e controle de acesso para condomínio',
  titulo: 'Acessos, segurança e infraestrutura do condomínio em um projeto só.',
  lead: 'Câmeras, controle de acesso facial, interfonia, rede, nobreak e alarme pensados juntos. Cada condomínio recebe uma proposta personalizada.',
  descricao: 'Câmeras, controle de acesso facial, interfonia, rede, nobreak e alarme funcionando juntos no condomínio. Proposta personalizada da SC Soluções em Francisco Beltrão e região.',
  destaques: ['Câmeras', 'Controle de acesso facial', 'Interfonia', 'Nobreak e quadro técnico'],
  blocos: [
    {
      titulo: 'Câmeras nas áreas comuns',
      texto: 'Portaria, garagem, perímetro e lazer, com gravação no próprio condomínio. Na visita técnica, a SC define onde cada câmera fica.',
    },
    {
      titulo: 'Acesso facial e interfonia',
      texto: 'O leitor facial do portão de pedestres reconhece o morador cadastrado e libera a entrada. A portaria chama o apartamento pela interfonia e só libera o visitante depois que o morador confirma.',
    },
    {
      titulo: 'Rede, Wi-Fi e nobreak',
      texto: 'Câmeras, acesso e interfonia ligados ao quadro técnico, e Wi-Fi nas áreas comuns. O nobreak é dimensionado para a carga e mantém o sistema por um período na falta de energia, conforme a bateria.',
    },
    {
      titulo: 'Alarme integrado às câmeras, no celular',
      texto: 'Avisos de eventos no aplicativo: você acompanha e comanda pelo celular. Os sensores seguem o projeto de cada condomínio.',
    },
  ],
  /** Mensagem do botão que abre a Sol. */
  mensagemProposta: 'Quero uma proposta do Condomínio Evoluído para o meu condomínio.',
} as const satisfies TextosSolucao & Record<string, unknown>;

export const paginasAmbiente = {
  casa: {
    sobre: 'Sua casa',
    curto: 'Casa',
    tituloBusca: 'Câmeras de segurança para casa',
    titulo: 'Sua casa protegida, do portão ao quintal.',
    lead: 'Planos de locação de câmeras para a sua casa, com gravação local e imagens no celular.',
    descricao: 'Escolha o plano de locação de câmeras da SC Soluções para a sua casa, com gravação local e imagens no celular. Francisco Beltrão e região.',
    destaques: ['Planos de 1 a 8 câmeras', 'Gravação local', 'Imagens no celular', 'Suporte e manutenção'],
    blocos: [
      { titulo: 'Câmeras onde importa', texto: textoCameras('Entrada, garagem, laterais, fundos e dentro de casa') },
      { titulo: 'Planos de 1 a 8 câmeras', texto: escolhaDoPlano },
      { titulo: 'Energia e internet', texto: energiaInternet },
      { titulo: 'Alarme monitorado pelo app', texto: 'Avisos de eventos no aplicativo: você acompanha e comanda pelo celular. Os sensores seguem o projeto de cada casa.' },
    ],
  },
  comercio: {
    sobre: 'Comércio',
    curto: 'Comércio',
    tituloBusca: 'Câmeras de segurança para comércio',
    titulo: 'Caixa, estoque e entrada à vista, de onde você estiver.',
    lead: 'Planos de locação de câmeras para a sua loja, com gravação local, imagens no celular, rede Wi-Fi e alarme.',
    descricao: 'Câmeras para loja: caixa, salão, estoque e entrada. Planos de locação de câmeras da SC Soluções, rede Wi-Fi e alarme. Francisco Beltrão e região.',
    destaques: ['Planos de 1 a 8 câmeras', 'Gravação local', 'Rede Wi-Fi sob medida', 'Alarme monitorado pelo app'],
    blocos: [
      { titulo: 'Câmeras onde importa', texto: textoCameras('Fachada, caixa, salão, estoque e carga e descarga') },
      { titulo: 'Planos de 1 a 8 câmeras', texto: escolhaDoPlano },
      { titulo: 'Wi-Fi para a equipe e para os clientes', texto: 'Câmeras e Wi-Fi ligados ao mesmo rack, com a rede dos clientes separada da rede da loja. Proposta personalizada.' },
      { titulo: 'Energia e internet', texto: energiaInternet },
    ],
  },
  empresa: {
    sobre: 'Empresa',
    curto: 'Empresa',
    tituloBusca: 'Câmeras e rede para empresas',
    titulo: 'Segurança e rede da sua empresa no mesmo projeto.',
    lead: 'Planos de locação de câmeras ou proposta personalizada, com a rede da empresa pensada junto.',
    descricao: 'Câmeras, rede e alarme para empresas. Planos de locação de câmeras ou proposta personalizada da SC Soluções. Francisco Beltrão e região.',
    destaques: ['Planos de 1 a 8 câmeras', 'Redes gerenciadas', 'Nobreak para o essencial', 'Proposta personalizada'],
    blocos: [
      { titulo: 'Câmeras onde importa', texto: textoCameras('Entrada, recepção, áreas de trabalho e estacionamento') },
      { titulo: 'Comece por um plano', texto: `${escolhaDoPlano} Mais câmeras ou infraestrutura especial? A SC monta uma proposta personalizada.` },
      { titulo: 'Uma rede para a equipe, as câmeras e os visitantes', texto: 'Câmeras e Wi-Fi ligados à sala técnica, com a rede dos visitantes separada da rede da empresa. Proposta personalizada.' },
      { titulo: 'Energia e internet', texto: energiaInternet },
    ],
  },
} as const satisfies Record<'casa' | 'comercio' | 'empresa', TextosSolucao>;

/* ---------- utilidades usadas no site ---------- */

export function formatarPreco(valor: number): string {
  return valor.toFixed(2).replace('.', ',');
}

export function nomePlano(plano: Plano): string {
  return `Plano de ${plano.cameras} ${plano.cameras > 1 ? 'câmeras' : 'câmera'}`;
}

export function textoPreco(plano: Plano): string {
  return mostrarPrecos ? `R$ ${formatarPreco(plano.preco)}/mês` : 'Sob consulta';
}

export function taxaInstalacao(plano: Plano): number {
  return plano.preco * taxaInstalacaoMensalidades;
}

/** "R$ 99,90" (ou "1 mensalidade" quando os preços estão escondidos). */
export function textoTaxaInstalacao(plano: Plano): string {
  return mostrarPrecos ? `R$ ${formatarPreco(taxaInstalacao(plano))}` : rotuloTaxa;
}

export const menorPreco = Math.min(...planos.map((p) => p.preco));

/**
 * Plano recomendado para uma quantidade de câmeras.
 * Regra do documento: plano fixo só para 1, 2, 3, 4 ou 8 câmeras.
 * 5 a 7: sugere o plano de 8 e avisa que a quantidade exata vira proposta.
 * 9 ou mais: proposta personalizada.
 */
export function planoParaCameras(n: number): Recomendacao {
  if (n <= 0) return { plano: null, tipo: 'vazio' };
  const exato = planos.find((p) => p.cameras === n);
  if (exato) return { plano: exato, tipo: 'exato' };
  const oito = planos.find((p) => p.cameras === 8);
  if (n <= 8 && oito) return { plano: oito, tipo: 'folga' };
  return { plano: null, tipo: 'proposta' };
}

export function linkWhatsapp(mensagem: string): string {
  return `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

/** Mensagem do botão "Quero este plano" que abre o WhatsApp da equipe (02/11/2026). */
export function mensagemContratar(plano: Plano): string {
  const valor = mostrarPrecos ? ` (R$ ${formatarPreco(plano.preco)}/mês)` : '';
  return `Olá! Vim pelo site e quero contratar o ${nomePlano(plano)}${valor}. Como agendamos a instalação?`;
}

/** Mensalidade por câmera, arredondada ao centavo (ex.: "24,98"). */
export function precoPorCamera(plano: Plano): string {
  return formatarPreco(Math.round((plano.preco * 100) / plano.cameras) / 100);
}

export function mensagemPlano(plano: Plano): string {
  const valor = mostrarPrecos ? ` (R$ ${formatarPreco(plano.preco)}/mês)` : '';
  return `Olá! Tenho interesse no ${nomePlano(plano)}${valor}. Podemos agendar uma avaliação?`;
}
