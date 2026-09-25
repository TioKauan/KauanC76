/**
 * TODO O CONTEÚDO COMERCIAL DO SITE FICA AQUI.
 *
 * Fonte: documento "Planos de Locação de CFTV | SC Soluções".
 * Mudou preço, prazo, multa ou limite de cabo? Altere só este arquivo:
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
};

export const contato = {
  // Número usado em todos os botões de WhatsApp (atendimento pela equipe; o robô está fora do ar).
  whatsapp: '5546991331306',
  whatsappExibicao: '(46) 99133-1306',
  atendimento: 'Atendimento pela equipe da SC',
};

// false = troca todos os valores por "Sob consulta".
export const mostrarPrecos: boolean = true;

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

export const condicoes: ItemIcone[] = [
  { icone: 'clock-3', titulo: 'Prazo mínimo de 24 meses', texto: 'Depois, segue sem nova fidelidade. Aviso de 30 dias para encerrar.' },
  { icone: 'circle-minus', titulo: 'Saída antecipada', texto: 'Multa de 30% das mensalidades que faltarem até completar 24 meses.' },
  { icone: 'signature', titulo: 'Assinatura eletrônica', texto: 'Contrato do plano enviado e assinado pela ZapSign.' },
  { icone: 'zap', titulo: '1ª mensalidade na ativação', texto: 'Só começa a pagar com o sistema instalado e funcionando.' },
];

export const letraMiuda =
  'Gravação local estimada em aproximadamente 10 dias; o período varia conforme HD, resolução, movimento e modo de gravação. ' +
  'Acesso pelo celular depende de energia, internet e rede compatível. Manutenção cobre defeitos naturais; danos externos, mau uso, ' +
  'surtos e intervenção de terceiros são cobrados à parte. Cabeamento além do limite do plano e infraestrutura especial são orçados ' +
  'separadamente. Reajuste anual pelo IPCA. Os equipamentos permanecem da SC Soluções durante a locação. Vigilância humana não incluída.';

export const porQueLocar: ItemIcone[] = [
  { icone: 'sparkles', titulo: 'Sem investimento inicial', texto: 'Os equipamentos são da SC. Você paga só a mensalidade do plano.' },
  { icone: 'wrench', titulo: 'Defeito natural? A SC resolve', texto: 'Reparo ou troca por equipamento equivalente ou superior, conforme o contrato.' },
  { icone: 'calendar-check', titulo: 'Mensalidade previsível', texto: 'Valor fixo, com reajuste uma vez por ano pelo IPCA.' },
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
    titulo: 'Alarme monitorado',
    texto: 'Proteção conectada ao seu projeto.',
    itens: ['Alarme integrado às câmeras', 'Comunicação de eventos', 'Projeto conforme o imóvel'],
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
  'prazo mínimo, manutenção preventiva e contrato personalizados.';

export const etapas: Etapa[] = [
  { icone: 'mouse-pointer-click', titulo: 'Escolha o plano', texto: 'Pela quantidade de pontos que quer acompanhar, ou montando o sistema no configurador.', meta: '1, 2, 3, 4 ou 8 câmeras' },
  { icone: 'map-pin', titulo: 'A SC confirma o local', texto: 'Pontos, viabilidade técnica e se precisa de alguma infraestrutura extra.', meta: 'Cabo dentro do limite do plano' },
  { icone: 'signature', titulo: 'Assine pelo celular', texto: 'O contrato do plano chega pela ZapSign. Sem papel, sem ir até a loja.', meta: 'Assinatura eletrônica' },
  { icone: 'wrench', titulo: 'Instalação e app', texto: 'Instalamos, configuramos o gravador, testamos e deixamos as imagens no seu celular.', meta: '1ª mensalidade só na ativação' },
  { icone: 'headset', titulo: 'Suporte contínuo', texto: 'Diagnóstico remoto em horário comercial e manutenção de defeitos naturais durante o contrato.', meta: 'Troca por equivalente ou superior' },
];

// Perguntas frequentes: texto do documento.
export const duvidas: Duvida[] = [
  {
    pergunta: 'Preciso comprar os equipamentos?',
    resposta: 'Não. Os equipamentos são fornecidos em regime de locação e permanecem de propriedade da SC Soluções.',
  },
  {
    pergunta: 'A instalação está incluída?',
    resposta: 'Sim. A instalação padrão está incluída dentro do limite de cabeamento do plano. Infraestrutura especial e materiais adicionais são orçados separadamente.',
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
    resposta: 'Defeitos naturais dos equipamentos locados são cobertos. Danos externos, mau uso, vandalismo, surtos e intervenção de terceiros podem gerar cobrança.',
  },
  {
    pergunta: 'Posso cancelar?',
    resposta: 'O prazo mínimo é de 24 meses. Durante esse período, o cancelamento antecipado gera multa de 30% das mensalidades restantes. Depois do prazo mínimo, o contrato continua por prazo indeterminado e pode ser encerrado com aviso de 30 dias.',
  },
  {
    pergunta: 'Posso adicionar câmeras premium?',
    resposta: 'Sim. Imagem colorida à noite, áudio bidirecional, análise inteligente, resolução superior e outros recursos podem ser adicionados mediante análise e orçamento.',
  },
];

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

export function mensagemPlano(plano: Plano): string {
  const valor = mostrarPrecos ? ` (R$ ${formatarPreco(plano.preco)}/mês)` : '';
  return `Olá! Tenho interesse no ${nomePlano(plano)}${valor}. Podemos agendar uma avaliação?`;
}
