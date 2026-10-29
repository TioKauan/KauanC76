import { iniciarMoldura } from './moldura';
import { iniciarBarra } from './barra';
import { iniciarSol } from './sol';
import { exigir, todos } from './dom';
import { taxaSugerida, type Codec, type Resolucao } from '../lib/calculadoras/bitrate';
import { calcularArmazenamento } from '../lib/calculadoras/armazenamento';
import { calcularCabo, RHO_20C, RHO_70C } from '../lib/calculadoras/cabo';
import { calcularEnergia } from '../lib/calculadoras/energia';
import { calcularBanda } from '../lib/calculadoras/banda';
import { LIMITE_MENSAGEM } from '../lib/sol';

/**
 * Calculadoras de campo: lê os campos, chama as contas de src/lib/calculadoras/ e escreve o resultado
 * (sempre com textContent). Nada é enviado nem guardado; o botão final só passa o resumo para a Sol.
 */
iniciarMoldura();
iniciarBarra();
iniciarSol();

type Id = 'hd' | 'cabo' | 'energia' | 'rede';
const ABAS: Id[] = ['hd', 'cabo', 'energia', 'rede'];

const nf = (casas: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: casas, minimumFractionDigits: 0 });
const n1 = nf(1);
const n2 = nf(2);
const n0 = nf(0);

function numero(form: HTMLFormElement, nome: string): number {
  const campo = form.elements.namedItem(nome) as HTMLInputElement | HTMLSelectElement;
  const v = Number(String(campo.value).replace(',', '.'));
  return Number.isFinite(v) ? v : NaN;
}
function texto(form: HTMLFormElement, nome: string): string {
  return (form.elements.namedItem(nome) as HTMLSelectElement).value;
}

interface Linha { rotulo: string; valor: string; destaque?: boolean }
interface Saida { linhas: Linha[]; aviso?: string; resumo: string }

function desenhar(id: Id, s: Saida | { erro: string }) {
  const alvo = exigir(`[data-saida="${id}"]`);
  alvo.replaceChildren();
  if ('erro' in s) {
    const p = document.createElement('p');
    p.className = 'calc-erro';
    p.textContent = s.erro;
    alvo.append(p);
    return;
  }
  const dl = document.createElement('dl');
  dl.className = 'calc-resultado';
  for (const l of s.linhas) {
    const bloco = document.createElement('div');
    if (l.destaque) bloco.className = 'destaque-linha';
    const dt = document.createElement('dt');
    dt.textContent = l.rotulo;
    const dd = document.createElement('dd');
    dd.textContent = l.valor;
    bloco.append(dt, dd);
    dl.append(bloco);
  }
  alvo.append(dl);
  if (s.aviso) {
    const p = document.createElement('p');
    p.className = 'calc-aviso';
    p.textContent = s.aviso;
    alvo.append(p);
  }
}

const resumos: Record<Id, string> = { hd: '', cabo: '', energia: '', rede: '' };

function validos(...valores: number[]): boolean {
  return valores.every((v) => Number.isFinite(v) && v >= 0);
}

function calcularHd(f: HTMLFormElement): Saida | { erro: string } {
  const e = { cameras: numero(f, 'cameras'), mbps: numero(f, 'mbps'), dias: numero(f, 'dias'), horasPorDia: numero(f, 'horas'), margem: numero(f, 'margem') / 100 };
  if (!validos(e.cameras, e.mbps, e.dias, e.horasPorDia, e.margem) || e.cameras < 1 || e.mbps <= 0 || e.dias < 1 || e.horasPorDia <= 0 || e.horasPorDia > 24) {
    return { erro: 'Confira os campos: câmeras, taxa, dias e horas precisam ser maiores que zero (horas, até 24).' };
  }
  const r = calcularArmazenamento(e);
  const linhas: Linha[] = [
    { rotulo: 'Por câmera, por dia', valor: `${n1.format(r.gbPorCameraDia)} GB` },
    { rotulo: 'Total gravado', valor: `${n2.format(r.totalTB)} TB` },
    { rotulo: `Com ${n0.format(e.margem * 100)} % de margem`, valor: `${n2.format(r.totalComMargemTB)} TB (≈ ${n2.format(r.totalComMargemTiB)} TiB no NVR)`, destaque: true },
    { rotulo: 'Discos sugeridos', valor: r.sugestao ? `${r.sugestao.discos} × ${r.sugestao.tamanhoTB} TB (${r.sugestao.capacidadeTB} TB)` : 'Passa de 16 discos de 20 TB: precisa de mais de um gravador', destaque: true },
  ];
  return { linhas, resumo: `HD: ${e.cameras} câmeras, ${n1.format(e.mbps)} Mbps cada, ${e.dias} dias, ${n0.format(e.horasPorDia)} h por dia: ${n2.format(r.totalComMargemTB)} TB com margem${r.sugestao ? ` (${r.sugestao.discos} × ${r.sugestao.tamanhoTB} TB)` : ''}.` };
}

const CIRCUITOS: Record<string, { tensao: number; queda: number; nome: string }> & { cc12: { tensao: number; queda: number; nome: string } } = {
  cc12: { tensao: 12, queda: 5, nome: 'CC 12 V' },
  cc24: { tensao: 24, queda: 5, nome: 'CC 24 V' },
  ca127: { tensao: 127, queda: 4, nome: 'CA 127 V' },
  ca220: { tensao: 220, queda: 4, nome: 'CA 220 V' },
};

function calcularCaboForm(f: HTMLFormElement): Saida | { erro: string } {
  const c = CIRCUITOS[texto(f, 'circuito')] ?? CIRCUITOS.cc12;
  const e = { tensao: c.tensao, corrente: numero(f, 'corrente'), comprimento: numero(f, 'comprimento'), quedaMaximaPct: numero(f, 'queda'), rho: texto(f, 'rho') === '70' ? RHO_70C : RHO_20C };
  if (!validos(e.corrente, e.comprimento, e.quedaMaximaPct) || e.corrente <= 0 || e.comprimento <= 0 || e.quedaMaximaPct <= 0) {
    return { erro: 'Confira os campos: corrente, distância e queda máxima precisam ser maiores que zero.' };
  }
  const r = calcularCabo(e);
  const linhas: Linha[] = [{ rotulo: 'Seção mínima pela queda', valor: `${n2.format(r.secaoMinimaMm2)} mm²` }];
  if (!r.escolhida) {
    return { linhas, aviso: 'Nenhum cabo de até 16 mm² serve nesse trecho. Reduza a distância, divida a carga em mais de uma fonte ou use tensão maior.', resumo: `Cabo: ${c.nome}, ${n1.format(e.corrente)} A, ${n0.format(e.comprimento)} m: nenhum cabo comum serve.` };
  }
  const s = r.escolhida;
  linhas.push(
    { rotulo: 'Cabo indicado', valor: `${n2.format(s.mm2)} mm²${s.awg ? ` (${s.awg})` : ''}`, destaque: true },
    { rotulo: 'Queda real', valor: `${n2.format(r.quedaV)} V (${n2.format(r.quedaPct)} %)` },
    { rotulo: 'Tensão no fim do cabo', valor: `${n2.format(r.tensaoNoFim)} V` },
    { rotulo: 'Corrente máxima do cabo', valor: `${n1.format(s.ampacidade)} A` },
  );
  const aviso = r.limitadaPelaCorrente ? 'Pela queda caberia um cabo mais fino, mas ele não aguenta essa corrente: a seção subiu por causa dela.' : undefined;
  return { linhas, aviso, resumo: `Cabo: ${c.nome}, ${n1.format(e.corrente)} A a ${n0.format(e.comprimento)} m: ${n2.format(s.mm2)} mm² (queda ${n2.format(r.quedaPct)} %).` };
}

function calcularEnergiaForm(f: HTMLFormElement): Saida | { erro: string } {
  const cameras = numero(f, 'cameras');
  const wCamera = numero(f, 'wCamera');
  const wGravador = numero(f, 'wGravador');
  const wOutros = numero(f, 'wOutros');
  const e = { tensao: numero(f, 'tensao'), folga: numero(f, 'folga') / 100, horasAutonomia: numero(f, 'horas'), profundidadeDescarga: numero(f, 'dod') / 100, eficiencia: numero(f, 'ef') / 100 };
  if (!validos(cameras, wCamera, wGravador, wOutros, e.folga, e.horasAutonomia) || !(e.profundidadeDescarga > 0 && e.profundidadeDescarga <= 1) || !(e.eficiencia > 0 && e.eficiencia <= 1)) {
    return { erro: 'Confira os campos: os números precisam ser zero ou mais (descarga e eficiência, entre 1 e 100).' };
  }
  const r = calcularEnergia({ ...e, cargas: [{ quantidade: cameras, watts: wCamera }, { quantidade: 1, watts: wGravador }, { quantidade: 1, watts: wOutros }] });
  if (r.watts <= 0) return { erro: 'Informe o consumo de pelo menos um equipamento.' };
  const linhas: Linha[] = [
    { rotulo: 'Potência total', valor: `${n1.format(r.watts)} W` },
    { rotulo: `Corrente a ${e.tensao} V`, valor: `${n2.format(r.correnteA)} A (${n2.format(r.correnteComFolgaA)} A com folga)` },
    { rotulo: 'Fonte indicada', valor: r.fonteA ? `${n1.format(r.fonteA)} A` : 'Acima de 30 A: divida em mais de uma fonte', destaque: true },
  ];
  if (r.baterias) {
    linhas.push({ rotulo: `Bateria para ${n1.format(e.horasAutonomia)} h`, valor: `${n1.format(r.ahNecessarios)} Ah necessários → ${r.baterias.paralelo > 1 ? `${r.baterias.paralelo} × ` : ''}${n1.format(r.baterias.ah)} Ah${r.baterias.paralelo > 1 ? ` em paralelo (${n0.format(r.baterias.capacidadeAh)} Ah)` : ''}`, destaque: true });
  }
  return { linhas, resumo: `Energia: ${n0.format(r.watts)} W a ${e.tensao} V: fonte de ${r.fonteA ?? 'mais de 30'} A${r.baterias ? `, bateria de ${n1.format(r.baterias.capacidadeAh)} Ah para ${n1.format(e.horasAutonomia)} h` : ''}.` };
}

function calcularRedeForm(f: HTMLFormElement): Saida | { erro: string } {
  const e = { cameras: numero(f, 'cameras'), mbps: numero(f, 'mbps'), folga: numero(f, 'folga') / 100, acessosRemotos: numero(f, 'remotos'), mbpsSecundario: numero(f, 'secundario') };
  if (!validos(e.cameras, e.mbps, e.folga, e.acessosRemotos, e.mbpsSecundario) || e.cameras < 1 || e.mbps <= 0) {
    return { erro: 'Confira os campos: câmeras e taxa precisam ser maiores que zero.' };
  }
  const r = calcularBanda(e);
  const nomeEnlace = (m: number) => (m >= 1000 ? `${m / 1000} Gbps` : `${m} Mbps`);
  const linhas: Linha[] = [
    { rotulo: 'Câmeras somadas', valor: `${n1.format(r.gravacaoMbps)} Mbps` },
    { rotulo: 'Com a folga de protocolo', valor: `${n1.format(r.gravacaoComFolgaMbps)} Mbps` },
    { rotulo: 'Enlace até o gravador', valor: r.enlaceMbps ? `${nomeEnlace(r.enlaceMbps)} (usa até 70 %)` : 'Acima de 10 Gbps: divida em mais de um gravador', destaque: true },
    { rotulo: 'Upload para ver de fora', valor: `${n2.format(r.uploadRemotoMbps)} Mbps` },
  ];
  const aviso = r.portaDeCameraOk ? undefined : 'Uma câmera sozinha já passa de 70 % de uma porta de 100 Mbps: use porta gigabit.';
  return { linhas, aviso, resumo: `Rede: ${e.cameras} câmeras a ${n1.format(e.mbps)} Mbps: ${n1.format(r.gravacaoComFolgaMbps)} Mbps${r.enlaceMbps ? `, enlace de ${nomeEnlace(r.enlaceMbps)}` : ''}; upload ${n2.format(r.uploadRemotoMbps)} Mbps.` };
}

const CALCULOS: Record<Id, (f: HTMLFormElement) => Saida | { erro: string }> = { hd: calcularHd, cabo: calcularCaboForm, energia: calcularEnergiaForm, rede: calcularRedeForm };

let abaAtual: Id = 'hd';

function atualizarBotao() {
  const botao = exigir<HTMLAnchorElement>('[data-calc-cta]');
  const base = resumos[abaAtual];
  const mensagem = base ? `Usei as calculadoras do site. ${base} Quero conversar sobre a minha instalação.` : 'Usei as calculadoras do site e quero conversar sobre a minha instalação.';
  botao.dataset.solMensagem = mensagem.slice(0, LIMITE_MENSAGEM);
}

function recalcular(id: Id) {
  const f = exigir<HTMLFormElement>(`[data-form="${id}"]`);
  const s = CALCULOS[id](f);
  desenhar(id, s);
  resumos[id] = 'resumo' in s ? s.resumo : '';
  if (id === abaAtual) atualizarBotao();
}

// Tensão e queda padrão acompanham o circuito escolhido.
const formCabo = exigir<HTMLFormElement>('[data-form="cabo"]');
(formCabo.elements.namedItem('circuito') as HTMLSelectElement).addEventListener('change', () => {
  const c = CIRCUITOS[texto(formCabo, 'circuito')];
  if (c) (formCabo.elements.namedItem('queda') as HTMLInputElement).value = String(c.queda);
});

// A taxa sugerida acompanha resolução e codec; depois dela, o campo pode ser editado à mão.
for (const id of ['hd', 'rede'] as const) {
  const f = exigir<HTMLFormElement>(`[data-form="${id}"]`);
  const sugerir = () => {
    (f.elements.namedItem('mbps') as HTMLInputElement).value = String(taxaSugerida(texto(f, 'resolucao') as Resolucao, texto(f, 'codec') as Codec));
  };
  for (const nome of ['resolucao', 'codec']) {
    (f.elements.namedItem(nome) as HTMLSelectElement).addEventListener('change', () => { sugerir(); recalcular(id); });
  }
  sugerir();
}

for (const id of ABAS) {
  const f = exigir<HTMLFormElement>(`[data-form="${id}"]`);
  f.addEventListener('input', () => recalcular(id));
  f.addEventListener('change', () => recalcular(id));
  f.addEventListener('submit', (ev) => ev.preventDefault());
  recalcular(id);
}

// Abas (padrão ARIA: setas, Home e End; só a aba ativa entra na ordem do Tab).
const botoes = todos<HTMLButtonElement>('[data-aba]');
function abrirAba(id: Id, foco = false) {
  abaAtual = id;
  for (const b of botoes) {
    const ativa = b.dataset.aba === id;
    b.setAttribute('aria-selected', String(ativa));
    b.tabIndex = ativa ? 0 : -1;
    if (ativa && foco) b.focus();
  }
  for (const p of todos('[data-painel]')) p.hidden = p.dataset.painel !== id;
  atualizarBotao();
}
for (const b of botoes) {
  b.addEventListener('click', () => abrirAba(b.dataset.aba as Id));
  b.addEventListener('keydown', (ev) => {
    const i = ABAS.indexOf(b.dataset.aba as Id);
    const destino = ev.key === 'ArrowRight' ? ABAS[(i + 1) % ABAS.length] : ev.key === 'ArrowLeft' ? ABAS[(i + ABAS.length - 1) % ABAS.length] : ev.key === 'Home' ? ABAS[0] : ev.key === 'End' ? ABAS[ABAS.length - 1] : null;
    if (destino) { ev.preventDefault(); abrirAba(destino, true); }
  });
}
const inicial = location.hash.replace('#', '') as Id;
abrirAba(ABAS.includes(inicial) ? inicial : 'hd');

// Instalável e offline: o service worker só vale para /calculadoras/ (nunca para o site todo).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/calculadoras/sw.js', { scope: '/calculadoras/' }).catch(() => {});
}
let convite: (Event & { prompt: () => Promise<void> }) | null = null;
window.addEventListener('beforeinstallprompt', (ev) => {
  ev.preventDefault();
  convite = ev as Event & { prompt: () => Promise<void> };
  exigir('[data-instalar]').hidden = false;
});
exigir('[data-instalar-botao]').addEventListener('click', async () => {
  if (!convite) return;
  await convite.prompt();
  convite = null;
  exigir('[data-instalar]').hidden = true;
});
