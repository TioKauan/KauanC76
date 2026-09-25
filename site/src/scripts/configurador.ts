import { formatarPreco, mostrarPrecos, linkWhatsapp, type Upgrade } from '../lib/dados';
import { ambientesConfig, sistemasCondominio, LOTE, MAX_CAMERAS, nomeEm, type AmbienteConfigId, type Planta } from '../lib/configurador-dados';
import {
  anguloPara, caboDe, dentro, mensagemWhatsapp, nomeAmbiente, nomeDaZona, plantaDe, resumir,
  type Camera, type EstadoConfigurador,
} from '../lib/configurador-logica';
import { exigir, todos } from './dom';

const NS = 'http://www.w3.org/2000/svg';
const RAIO_CONE = 150;
const ABERTURA = 32;
const DICA = 'Toque na planta para marcar uma câmera. Toque de novo para tirar.';

export interface ResumoBarra { titulo: string; sub: string; link: string; acao: string }
export interface PedidoConfigurar { cameras?: number; ambiente?: AmbienteConfigId }

/** Configurador "Monte seu sistema": planta clicável, plano calculado e mensagem pronta. */
export function iniciarConfigurador(): void {
  const secao = document.getElementById('monte');
  if (!secao) return;
  const svg = exigir<SVGSVGElement>('[data-planta]', secao);
  const camada = (nome: string) => exigir<SVGGElement>(`[data-camada="${nome}"]`, svg);
  const el = <T extends Element = HTMLElement>(sel: string) => exigir<T>(sel, secao);

  const estado: EstadoConfigurador = { ambiente: 'casa', cameras: [], recursos: new Set(), condominio: new Set() };
  let proximoId = 1;
  const planta = (): Planta => {
    const p = plantaDe(estado.ambiente);
    if (!p) throw new Error('O condomínio não tem planta');
    return p;
  };

  /* ---------- ações ---------- */
  let tempoAviso = 0;
  const avisar = (texto: string) => {
    const dica = el('[data-config-dica]');
    const caixa = dica.parentElement!;
    dica.textContent = texto;
    caixa.dataset.alerta = '';
    clearTimeout(tempoAviso);
    tempoAviso = window.setTimeout(() => {
      delete caixa.dataset.alerta;
      dica.textContent = DICA;
    }, 3200);
  };
  const adicionar = (c: Omit<Camera, 'id'>) => {
    if (estado.cameras.length >= MAX_CAMERAS) return avisar(`Limite de ${MAX_CAMERAS} pontos no configurador. Para mais, peça uma proposta.`);
    estado.cameras.push({ id: proximoId++, ...c });
    desenhar();
  };
  const adicionarSugestao = (id: string) => {
    if (estado.cameras.some((c) => c.sugestao === id)) return;
    const s = planta().sugestoes.find((x) => x.id === id);
    if (s) adicionar({ x: s.x, y: s.y, angulo: s.angulo, nome: nomeEm(s.nome, estado.ambiente), sugestao: s.id });
  };
  const remover = (id: number) => {
    estado.cameras = estado.cameras.filter((c) => c.id !== id);
    desenhar();
  };
  const trocarAmbiente = (id: AmbienteConfigId) => {
    const anterior = ambientesConfig.find((a) => a.id === estado.ambiente)?.planta;
    estado.ambiente = id;
    const nova = ambientesConfig.find((a) => a.id === id)?.planta;
    if (nova !== anterior) estado.cameras = [];
    else
      estado.cameras.forEach((c) => {
        const s = c.sugestao ? planta().sugestoes.find((x) => x.id === c.sugestao) : null;
        if (s) c.nome = nomeEm(s.nome, id);
      });
    todos<HTMLButtonElement>('[data-config-ambiente]', secao).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.configAmbiente === id)));
    desenhar();
  };

  /* ---------- desenho da planta ---------- */
  const criar = (tag: string, atributos: Record<string, string | number>, conteudo = '') => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(atributos)) n.setAttribute(k, String(v));
    if (conteudo) n.innerHTML = conteudo;
    return n;
  };
  const cone = (c: Camera) => {
    const t = (c.angulo * Math.PI) / 180;
    const d = (ABERTURA * Math.PI) / 180;
    const x1 = c.x + Math.cos(t - d) * RAIO_CONE;
    const y1 = c.y + Math.sin(t - d) * RAIO_CONE;
    const x2 = c.x + Math.cos(t + d) * RAIO_CONE;
    const y2 = c.y + Math.sin(t + d) * RAIO_CONE;
    const grad = `cone-${c.id}`;
    return criar('g', { class: 'cone-planta' },
      `<defs><radialGradient id="${grad}" cx="${c.x}" cy="${c.y}" r="${RAIO_CONE}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6de9f6" stop-opacity=".42"/><stop offset="1" stop-color="#6de9f6" stop-opacity=".02"/></radialGradient></defs>` +
      `<path d="M${c.x} ${c.y} L${x1.toFixed(1)} ${y1.toFixed(1)} A${RAIO_CONE} ${RAIO_CONE} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="url(#${grad})"/>`);
  };

  const desenhar = () => {
    const condominio = estado.ambiente === 'condominio';
    svg.toggleAttribute('hidden', condominio);
    el('[data-condominio]').hidden = !condominio;
    todos<HTMLElement>('[data-legenda]', secao).forEach((n) => (n.hidden = condominio));
    el('[data-config-ese]').hidden = condominio;
    el('[data-resumo-recursos]').hidden = condominio;
    el('[data-resumo-sugestoes-caixa]').hidden = condominio;
    el('[data-config-limpar]').hidden = condominio;
    el('[data-config-dica]').parentElement!.hidden = condominio;
    todos<SVGGElement>('[data-desenho]', svg).forEach((g) => g.toggleAttribute('data-ativo', g.dataset.desenho === estado.ambiente));

    ['cones', 'cabos', 'sugestoes', 'cameras', 'dvr'].forEach((n) => camada(n).replaceChildren());
    if (!condominio) {
      const p = planta();
      const [dvrX, dvrY] = p.dvr;
      estado.cameras.forEach((c, i) => {
        camada('cones').append(cone(c));
        camada('cabos').append(criar('path', { d: `M${dvrX} ${dvrY} H${c.x} V${c.y}`, class: 'cabo' }));
        // Etiqueta perto da câmera, no trecho vertical do cabo (ou no horizontal, se ele for curto).
        const dy = dvrY - c.y;
        const dx = dvrX - c.x;
        const [lx, ly] = Math.abs(dy) > 64 ? [c.x, c.y + Math.sign(dy) * 44] : [c.x + Math.sign(dx || 1) * 50, dvrY];
        camada('cabos').append(criar('g', { class: 'cabo-rotulo' }, `<rect x="${lx - 27}" y="${ly - 11}" width="54" height="22" rx="11"/><text x="${lx}" y="${ly + 4}" text-anchor="middle">≈ ${caboDe(p, c)} m</text>`));
        camada('cameras').append(criar('g', { class: 'camera-ponto', role: 'button', tabindex: 0, 'data-cam': c.id, 'aria-label': `Câmera ${i + 1}: ${c.nome}. Ativar para remover.` },
          `<circle class="alvo" cx="${c.x}" cy="${c.y}" r="30"/><circle class="aura" cx="${c.x}" cy="${c.y}" r="23"/><circle class="nucleo" cx="${c.x}" cy="${c.y}" r="16" filter="url(#planta-brilho)"/><text x="${c.x}" y="${c.y + 5.5}" text-anchor="middle">${i + 1}</text>`));
      });
      p.sugestoes
        .filter((s) => !estado.cameras.some((c) => c.sugestao === s.id))
        .forEach((s) => {
          camada('sugestoes').append(criar('g', { class: 'sugestao-ponto', role: 'button', tabindex: 0, 'data-sug': s.id, 'aria-label': `Adicionar câmera: ${nomeEm(s.nome, estado.ambiente)}` },
            `<circle class="alvo" cx="${s.x}" cy="${s.y}" r="28"/><circle class="anel" cx="${s.x}" cy="${s.y}" r="17"/><path d="M${s.x - 7} ${s.y} H${s.x + 7} M${s.x} ${s.y - 7} V${s.y + 7}"/>`));
        });
      camada('dvr').append(criar('g', { class: 'dvr' }, `<rect x="${dvrX - 20}" y="${dvrY - 14}" width="40" height="28" rx="6" filter="url(#planta-brilho)"/><text x="${dvrX}" y="${dvrY + 5}" text-anchor="middle">DVR</text>`));
    }
    atualizarResumo();
  };

  /* ---------- resumo, recomendação e mensagem ---------- */
  const atualizarResumo = () => {
    const condominio = estado.ambiente === 'condominio';
    const { recomendacao: rec, quantidade: n, caboEstimado: total, caboExcedente } = resumir(estado);
    const plural = (q: number, um: string, varios: string) => `${q} ${q > 1 ? varios : um}`;

    el('[data-resumo-sub]').textContent = condominio
      ? `Condomínio · ${estado.condominio.size ? plural(estado.condominio.size, 'sistema marcado', 'sistemas marcados') : 'proposta personalizada'}`
      : `${nomeAmbiente(estado.ambiente)} · ${n ? plural(n, 'ponto marcado', 'pontos marcados') : 'nenhum ponto marcado'}`;

    el('[data-resumo-pontos]').innerHTML = condominio
      ? sistemasCondominio.filter((s) => estado.condominio.has(s.id)).map((s) => `<li><span class="num">✓</span>${s.nome}</li>`).join('')
      : estado.cameras.map((c, i) => `<li><span class="num">${i + 1}</span><span class="nome">${c.nome}</span><small>≈ ${caboDe(planta(), c)} m</small><button type="button" class="remover" data-remover="${c.id}" aria-label="Remover câmera ${i + 1}: ${c.nome}">×</button></li>`).join('');

    const livres = condominio ? [] : planta().sugestoes.filter((s) => !estado.cameras.some((c) => c.sugestao === s.id));
    el('[data-resumo-sugestoes]').innerHTML = livres.map((s) => `<button type="button" class="chip chip-p" data-add-sug="${s.id}">+ ${nomeEm(s.nome, estado.ambiente)}</button>`).join('');
    el('[data-resumo-sugestoes-caixa]').hidden = condominio || !livres.length;

    const caixa = el('[data-recomendacao]');
    caixa.dataset.tipo = rec.tipo;
    caixa.dataset.planoRecomendado = rec.plano ? String(rec.plano.cameras) : '';
    if (condominio) {
      caixa.innerHTML = `<p class="rec-k">Condomínio Evoluído</p><div class="rec-linha"><b>Proposta personalizada</b></div><p class="rec-nota">Câmeras, acesso facial, interfonia, rede e nobreak dimensionados para o condomínio, com contrato sob medida.</p>`;
    } else if (rec.tipo === 'vazio') {
      caixa.innerHTML = `<p class="rec-k">Plano recomendado</p><p class="rec-vazio">Marque pelo menos um ponto na planta ou escolha um ponto sugerido.</p>`;
    } else if (rec.tipo === 'proposta') {
      caixa.innerHTML = `<p class="rec-k">Proposta personalizada</p><div class="rec-linha"><b>${n} câmeras</b></div><p class="rec-nota">Mais de 8 câmeras pedem um projeto sob medida (gravador e infraestrutura maiores). A SC monta a proposta.</p>`;
    } else {
      const p = rec.plano;
      const pct = Math.min(100, Math.round((total / p.caboMetros) * 100));
      caixa.innerHTML = `<p class="rec-k">Plano recomendado</p>
        <div class="rec-linha"><b>${plural(p.cameras, 'câmera', 'câmeras')}</b><strong>${mostrarPrecos ? `R$ ${formatarPreco(p.preco)} <small>/mês</small>` : 'Sob consulta'}</strong></div>
        ${rec.tipo === 'folga' ? `<p class="rec-nota">Você marcou ${n} pontos. O plano de 8 cobre com folga; para exatamente ${n} câmeras, a SC faz uma proposta personalizada.</p>` : ''}
        <div class="cabo-medidor${caboExcedente ? ' excede' : ''}">
          <div class="cabo-linha"><span>Cabo estimado</span><span><b>≈ ${total} m</b> de ${p.caboMetros} m inclusos</span></div>
          <div class="cabo-trilho" role="progressbar" aria-label="Cabo estimado em relação ao incluso no plano" aria-valuemin="0" aria-valuemax="${p.caboMetros}" aria-valuenow="${Math.min(total, p.caboMetros)}"><i style="width:${pct}%"></i></div>
          <small>${caboExcedente ? `Passa cerca de ${caboExcedente} m do limite: o excedente é orçado à parte, na visita técnica.` : 'Dentro do limite do plano: sem cobrança de cabo extra.'}</small>
        </div>`;
    }

    // Cartões "E se…?"
    const cartaoEse = (nome: string, ativo: boolean, texto: string | null, acao: string) => {
      const cartao = exigir<HTMLElement>(`[data-ese-cartao="${nome}"]`, secao);
      cartao.dataset.ativo = String(ativo);
      if (texto) exigir('[data-ese-texto]', cartao).textContent = texto;
      exigir('[data-ese-acao]', cartao).textContent = acao;
    };
    const comNobreak = estado.recursos.has('nobreak');
    const comColorida = estado.recursos.has('colorida');
    cartaoEse('energia', comNobreak, comNobreak ? 'Com o nobreak marcado, câmeras e gravador seguem gravando pelo tempo da bateria.' : 'Sem nobreak, câmeras e gravador desligam até a luz voltar.', comNobreak ? '✓ Nobreak marcado' : '+ Adicionar nobreak');
    cartaoEse('noite', comColorida, null, comColorida ? '✓ Já marcado' : '+ Adicionar imagem colorida');

    // Etapas
    const passo = (id: string, s: string) => {
      const li = exigir<HTMLElement>(`[data-passo="${id}"]`, secao);
      if (s) li.dataset.estado = s;
      else delete li.dataset.estado;
    };
    const temAlgo = condominio ? estado.condominio.size > 0 : n > 0;
    const temRecursos = condominio || estado.recursos.size > 0;
    passo('pontos', temAlgo ? 'feito' : 'atual');
    passo('recursos', !temAlgo ? '' : temRecursos ? 'feito' : 'atual');
    passo('enviar', temAlgo && temRecursos ? 'atual' : '');

    // Mensagem
    const texto = mensagemWhatsapp(estado);
    el('[data-mensagem]').textContent = texto;
    el<HTMLAnchorElement>('[data-config-enviar]').href = linkWhatsapp(texto);

    const resumoBarra: ResumoBarra = {
      titulo: condominio ? 'Condomínio Evoluído' : rec.plano ? `${plural(rec.plano.cameras, 'câmera', 'câmeras')} · ${mostrarPrecos ? `R$ ${formatarPreco(rec.plano.preco)}/mês` : 'sob consulta'}` : n ? `${n} câmeras · proposta` : 'Monte seu sistema',
      sub: condominio ? 'Proposta personalizada' : n ? `${plural(n, 'ponto', 'pontos')} · cabo ≈ ${total} m` : 'Toque na planta para marcar',
      link: linkWhatsapp(texto),
      acao: 'Enviar',
    };
    document.dispatchEvent(new CustomEvent<ResumoBarra>('sc:resumo-config', { detail: resumoBarra }));
  };

  /* ---------- eventos ---------- */
  const pontoNoDesenho = (evento: MouseEvent) => {
    const pt = svg.createSVGPoint();
    pt.x = evento.clientX;
    pt.y = evento.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  };
  svg.addEventListener('click', (e) => {
    const alvo = e.target as Element;
    const cam = alvo.closest<SVGElement>('[data-cam]');
    if (cam) return remover(Number(cam.dataset.cam));
    const sug = alvo.closest<SVGElement>('[data-sug]');
    if (sug?.dataset.sug) return adicionarSugestao(sug.dataset.sug);
    const { x, y } = pontoNoDesenho(e);
    if (!dentro(LOTE, x, y)) return avisar('Marque os pontos dentro do terreno.');
    const perto = planta().sugestoes.find((s) => Math.hypot(s.x - x, s.y - y) < 30 && !estado.cameras.some((c) => c.sugestao === s.id));
    if (perto) return adicionarSugestao(perto.id);
    adicionar({ x: Math.round(x), y: Math.round(y), angulo: anguloPara(planta(), x, y), nome: nomeDaZona(planta(), estado.ambiente, estado.cameras, x, y), sugestao: null });
  });
  svg.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const alvo = (e.target as Element).closest<SVGElement>('[data-cam], [data-sug]');
    if (!alvo) return;
    e.preventDefault();
    const eraSugestao = Boolean(alvo.dataset.sug);
    if (alvo.dataset.cam) remover(Number(alvo.dataset.cam));
    else if (alvo.dataset.sug) adicionarSugestao(alvo.dataset.sug);
    // Mantém o foco na planta para continuar pelo teclado.
    svg.querySelector<SVGElement>(eraSugestao ? '[data-sug]' : '[data-cam], [data-sug]')?.focus();
  });

  secao.addEventListener('click', (e) => {
    const alvo = e.target as Element;
    const rem = alvo.closest<HTMLElement>('[data-remover]');
    if (rem) remover(Number(rem.dataset.remover));
    const add = alvo.closest<HTMLElement>('[data-add-sug]');
    if (add?.dataset.addSug) adicionarSugestao(add.dataset.addSug);
    const amb = alvo.closest<HTMLElement>('[data-config-ambiente]');
    if (amb?.dataset.configAmbiente) trocarAmbiente(amb.dataset.configAmbiente as AmbienteConfigId);
    const acao = alvo.closest<HTMLElement>('[data-ese-acao]');
    if (acao) {
      const caixa = exigir<HTMLInputElement>(`[data-recurso][value="${acao.dataset.eseAcao}"]`, secao);
      caixa.checked = !caixa.checked;
      caixa.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  el('[data-config-limpar]').addEventListener('click', () => {
    estado.cameras = [];
    desenhar();
  });
  secao.addEventListener('change', (e) => {
    const campo = e.target as HTMLInputElement;
    if (campo.matches('[data-recurso]')) {
      const id = campo.value as Upgrade['id'];
      if (campo.checked) estado.recursos.add(id);
      else estado.recursos.delete(id);
      atualizarResumo();
    }
    if (campo.matches('[data-cond-sistema]')) {
      if (campo.checked) estado.condominio.add(campo.value);
      else estado.condominio.delete(campo.value);
      atualizarResumo();
    }
  });

  // Vindo de um plano ("Ver no configurador") ou da aba Condomínio.
  document.addEventListener('sc:configurar', (e) => {
    const { cameras, ambiente } = (e as CustomEvent<PedidoConfigurar>).detail;
    if (ambiente) return trocarAmbiente(ambiente);
    if (estado.ambiente === 'condominio') trocarAmbiente('casa');
    const p = planta();
    estado.cameras = [];
    for (const id of p.presets[cameras ?? 0] ?? []) {
      const s = p.sugestoes.find((x) => x.id === id);
      if (s) estado.cameras.push({ id: proximoId++, x: s.x, y: s.y, angulo: s.angulo, nome: nomeEm(s.nome, estado.ambiente), sugestao: s.id });
    }
    desenhar();
  });

  desenhar();
  // No celular a planta fica maior que a tela: começa centralizada.
  const caixaPlanta = el('[data-planta-caixa]');
  if (caixaPlanta.scrollWidth > caixaPlanta.clientWidth) caixaPlanta.scrollLeft = (caixaPlanta.scrollWidth - caixaPlanta.clientWidth) / 2;
}

