/**
 * Ambientes e situações do "E se…?" da abertura.
 * A lógica (o que liga e o que desliga) é a mesma do simulador do site anterior.
 */

import type { NomeIcone } from './icones';

export type AmbienteId = 'casa' | 'comercio' | 'condominio' | 'empresa';
export type SituacaoId = 'normal' | 'energia' | 'internet' | 'visita';
export type SistemaId = 'rede' | 'cameras' | 'acesso' | 'energia' | 'internet';
/** ok = funcionando · reserva = no nobreak · off = sem energia/sem imagens · pendente = aguardando autorização · incerto = depende da operadora */
export type Estado = 'ok' | 'reserva' | 'off' | 'pendente' | 'incerto';

export interface Ambiente { id: AmbienteId; nome: string; icone: NomeIcone; visita: string; acesso: string }
export interface Situacao { id: SituacaoId; nome: string; icone: NomeIcone }
export interface Sistema { nome: string; icone: NomeIcone; sub: string }
export interface EstadoCena {
  estados: Record<SistemaId, Estado>;
  textos: Record<SistemaId, string>;
  titulo: string;
  explicacao: string;
  condicao: string;
}

export const ambientes: Ambiente[] = [
  {
    id: 'casa',
    nome: 'Casa',
    icone: 'house',
    visita: 'O vídeo porteiro avisa a chegada. O morador confere quem é antes de liberar a entrada.',
    acesso: 'Entrada com autorização',
  },
  {
    id: 'comercio',
    nome: 'Comércio',
    icone: 'store',
    visita: 'Um prestador pede acesso à área de serviço. O responsável confere antes de liberar a passagem.',
    acesso: 'Estoque e áreas internas',
  },
  {
    id: 'condominio',
    nome: 'Condomínio',
    icone: 'building-2',
    visita: 'A portaria identifica o visitante e confirma com o morador antes de liberar a entrada.',
    acesso: 'Portaria e pedestres',
  },
  {
    id: 'empresa',
    nome: 'Empresa',
    icone: 'briefcase-business',
    visita: 'A recepção confere a visita com a pessoa responsável antes de liberar as áreas internas.',
    acesso: 'Recepção e catracas',
  },
];

export const situacoes: Situacao[] = [
  { id: 'normal', nome: 'Tudo normal', icone: 'circle-check' },
  { id: 'energia', nome: 'Faltou energia', icone: 'zap-off' },
  { id: 'internet', nome: 'A internet caiu', icone: 'wifi-off' },
  { id: 'visita', nome: 'Chegou visita', icone: 'user-check' },
];

// Sistemas mostrados na cena. "sub" é o texto quando está tudo normal.
export const sistemas: Record<SistemaId, Sistema> = {
  rede: { nome: 'Rede', icone: 'router', sub: 'Liga tudo no imóvel' },
  cameras: { nome: 'Câmeras', icone: 'cctv', sub: 'Gravação local ≈ 10 dias' },
  acesso: { nome: 'Acesso', icone: 'scan-face', sub: '' },
  energia: { nome: 'Energia', icone: 'battery-charging', sub: 'Nobreak dimensionado' },
  internet: { nome: 'Internet', icone: 'smartphone', sub: 'Imagens no celular' },
};

const rotulosEstado: Record<Estado, string> = {
  ok: 'Funcionando',
  reserva: 'Ligado no nobreak',
  off: 'Sem energia',
  pendente: 'Aguardando autorização',
  incerto: 'Depende da operadora',
};

/** Estado de cada sistema e os textos da situação escolhida. */
export function estadoCena(ambienteId: AmbienteId, situacao: SituacaoId, reserva: boolean): EstadoCena {
  const ambiente = ambientes.find((a) => a.id === ambienteId) ?? ambientes[0]!;
  const falta = situacao === 'energia';
  const base = falta ? (reserva ? 'reserva' : 'off') : 'ok';

  const estados: Record<SistemaId, Estado> = {
    rede: base,
    cameras: base,
    acesso: situacao === 'visita' ? 'pendente' : base,
    energia: falta ? (reserva ? 'reserva' : 'off') : 'ok',
    internet: situacao === 'internet' ? 'off' : falta ? (reserva ? 'incerto' : 'off') : 'ok',
  };

  const textos = {} as Record<SistemaId, string>;
  for (const id of Object.keys(estados) as SistemaId[]) {
    const estado = estados[id];
    if (estado === 'ok' && situacao === 'normal') textos[id] = id === 'acesso' ? ambiente.acesso : sistemas[id].sub;
    else if (id === 'internet') textos[id] = estado === 'ok' ? 'Imagens no celular' : estado === 'incerto' ? 'Depende da operadora' : 'Celular sem imagens';
    else if (id === 'energia' && estado === 'reserva') textos[id] = 'Nobreak segurando';
    else if (id === 'energia' && estado === 'off') textos[id] = 'Faltou luz';
    else textos[id] = rotulosEstado[estado];
  }

  let titulo: string;
  let explicacao: string;
  let condicao: string;
  if (situacao === 'energia' && !reserva) {
    titulo = 'Sem reserva, os sistemas ficam sem energia.';
    explicacao = 'Ligue o nobreak abaixo para ver o que muda.';
    condicao = 'Controle de acesso sem energia não significa porta aberta: a condição da porta depende da instalação.';
  } else if (situacao === 'energia') {
    titulo = 'Com nobreak, os sistemas seguem funcionando.';
    explicacao = 'Neste exemplo, o nobreak mantém câmeras, rede, gravador e controle de acesso ligados.';
    condicao = 'A duração depende da bateria e do consumo. Ver imagens pelo celular também depende da internet da operadora.';
  } else if (situacao === 'internet') {
    titulo = 'A gravação continua. Só o celular fica sem imagens.';
    explicacao = 'Os equipamentos seguem ligados e conectados dentro do imóvel. O controle de acesso local também funciona.';
    condicao = 'Exemplo com gravação e autorização no próprio local. Sistemas que dependem da nuvem podem se comportar de outra forma.';
  } else if (situacao === 'visita') {
    titulo = 'O sistema funciona. A entrada aguarda autorização.';
    explicacao = ambiente.visita;
    condicao = 'A chegada do visitante não libera a entrada sozinha.';
  } else {
    titulo = 'Tudo funcionando no dia a dia.';
    explicacao = 'As câmeras gravam, os equipamentos conversam entre si e o acesso é liberado com autorização.';
    condicao = 'Toque em uma situação para ver o que acontece. Exemplo ilustrativo: cada projeto é dimensionado na visita.';
  }
  return { estados, textos, titulo, explicacao, condicao };
}
