import { planoParaCameras, nomePlano, formatarPreco, mostrarPrecos, linkWhatsapp, upgrades } from '../dados.js';
import { ambientesConfig, plantas, sistemasCondominio, LOTE, MAX_CAMERAS, nomeEm } from '../configurador-dados.js';

const NS = 'http://www.w3.org/2000/svg';
const RAIO_CONE = 150;
const ABERTURA = 32;

/** Configurador "Monte seu sistema": planta clicável, plano calculado e mensagem pronta. */
export function iniciarConfigurador() {
  const secao = document.getElementById('monte');
  if (!secao) return;
  const svg = secao.querySelector('[data-planta]');
  const camada = (nome) => svg.querySelector(`[data-camada="${nome}"]`);
  const el = (sel) => secao.querySelector(sel);

  const estado = { ambiente: 'casa', cameras: [], recursos: new Set(), condominio: new Set() };
  let proximoId = 1;

  const planta = () => plantas[ambientesConfig.find((a) => a.id === estado.ambiente).planta];
  const nomeAmbiente = () => ambientesConfig.find((a) => a.id === estado.ambiente).nome;
  const preco = (p) => (mostrarPrecos ? `R$ ${formatarPreco(p.preco)}/mês` : 'sob consulta');

  /* ---------- geometria ---------- */
  const dentro = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  const anguloPara = (x, y) => {
    const { edificios } = planta();
    const casa = edificios.find((r) => dentro(r, x, y));
    if (casa) return (Math.atan2(casa.y + casa.h / 2 - y, casa.x + casa.w / 2 - x) * 180) / Math.PI;
    const perto = edificios.map((r) => ({ r, d: Math.hypot(r.x + r.w / 2 - x, r.y + r.h / 2 - y) })).sort((a, b) => a.d - b.d)[0].r;
    return (Math.atan2(y - (perto.y + perto.h / 2), x - (perto.x + perto.w / 2)) * 180) / Math.PI;
  };
  const nomeDaZona = (x, y) => {
    const zona = planta().zonas.find((z) => dentro(z, x, y));
    const base = zona ? nomeEm(zona.nome, estado.ambiente) : 'Área externa';
    const iguais = estado.cameras.filter((c) => c.nome === base || c.nome.startsWith(`${base} (`)).length;
    return iguais ? `${base} (${iguais + 1})` : base;
  };
  const caboDe = (c) => {
    const { dvr, metrosPorUnidade, folga } = planta();
    return Math.round((Math.abs(c.x - dvr[0]) + Math.abs(c.y - dvr[1])) * metrosPorUnidade + folga);
  };

  /* ---------- ações ---------- */
  const avisar = (texto) => {
    const dica = el('[data-config-dica]');
    dica.textContent = texto;
    dica.parentElement.dataset.alerta = '';
    clearTimeout(avisar.t);
    avisar.t = setTimeout(() => {
      delete dica.parentElement.dataset.alerta;
      dica.textContent = 'Toque na planta para marcar uma câmera. Toque de novo para tirar.';
    }, 3200);
  };
  const adicionar = (c) => {
    if (estado.cameras.length >= MAX_CAMERAS) return avisar(`Limite de ${MAX_CAMERAS} pontos no configurador. Para mais, peça uma proposta.`);
    estado.cameras.push({ id: proximoId++, ...c });
    desenhar();
  };
  const adicionarSugestao = (id) => {
    if (estado.cameras.some((c) => c.sugestao === id)) return;
    const s = planta().sugestoes.find((x) => x.id === id);
    adicionar({ x: s.x, y: s.y, angulo: s.angulo, nome: nomeEm(s.nome, estado.ambiente), sugestao: s.id });
  };
  const remover = (id) => {
    estado.cameras = estado.cameras.filter((c) => c.id !== id);
    desenhar();
  };
  const trocarAmbiente = (id) => {
    const anterior = ambientesConfig.find((a) => a.id === estado.ambiente).planta;
    estado.ambiente = id;
    const nova = ambientesConfig.find((a) => a.id === id).planta;
    if (nova !== anterior) estado.cameras = [];
    else estado.cameras.forEach((c) => {
      if (c.sugestao) c.nome = nomeEm(planta().sugestoes.find((s) => s.id === c.sugestao).nome, id);
    });
    secao.querySelectorAll('[data-config-ambiente]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.configAmbiente === id)));
    desenhar();
  };

  /* ---------- desenho da planta ---------- */
  const criar = (tag, atributos, filhos = '') => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(atributos)) n.setAttribute(k, v);
    if (filhos) n.innerHTML = filhos;
    return n;
  };
  const cone = (c) => {
    const t = (c.angulo * Math.PI) / 180;
    const d = (ABERTURA * Math.PI) / 180;
    const x1 = c.x + Math.cos(t - d) * RAIO_CONE;
    const y1 = c.y + Math.sin(t - d) * RAIO_CONE;
    const x2 = c.x + Math.cos(t + d) * RAIO_CONE;
    const y2 = c.y + Math.sin(t + d) * RAIO_CONE;
    const grad = `cone-${c.id}`;
    const g = criar('g', { class: 'cone-planta' });
    g.innerHTML = `<defs><radialGradient id="${grad}" cx="${c.x}" cy="${c.y}" r="${RAIO_CONE}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6de9f6" stop-opacity=".42"/><stop offset="1" stop-color="#6de9f6" stop-opacity=".02"/></radialGradient></defs>
      <path d="M${c.x} ${c.y} L${x1.toFixed(1)} ${y1.toFixed(1)} A${RAIO_CONE} ${RAIO_CONE} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="url(#${grad})"/>`;
    return g;
  };

  const desenhar = () => {
    const condominio = estado.ambiente === 'condominio';
    svg.toggleAttribute('hidden', condominio);
    el('[data-condominio]').hidden = !condominio;
    secao.querySelectorAll('[data-legenda]').forEach((n) => (n.hidden = condominio));
    el('[data-config-ese]').hidden = condominio;
    el('[data-resumo-recursos]').hidden = condominio;
    el('[data-resumo-sugestoes-caixa]').hidden = condominio;
    el('[data-config-limpar]').hidden = condominio;
    el('[data-config-dica]').parentElement.hidden = condominio;
    svg.querySelectorAll('[data-desenho]').forEach((g) => g.toggleAttribute('hidden', g.dataset.desenho !== estado.ambiente));

    ['cones', 'cabos', 'sugestoes', 'cameras', 'dvr'].forEach((n) => camada(n).replaceChildren());
    if (!condominio) {
      const p = planta();
      estado.cameras.forEach((c, i) => {
        camada('cones').append(cone(c));
        const d = `M${p.dvr[0]} ${p.dvr[1]} H${c.x} V${c.y}`;
        camada('cabos').append(criar('path', { d, class: 'cabo' }));
        // Etiqueta perto da câmera, no trecho vertical do cabo (ou no horizontal, se ele for curto).
        const dy = p.dvr[1] - c.y;
        const dx = p.dvr[0] - c.x;
        const [lx, ly] = Math.abs(dy) > 64 ? [c.x, c.y + Math.sign(dy) * 44] : [c.x + Math.sign(dx || 1) * 50, p.dvr[1]];
        const metros = `≈ ${caboDe(c)} m`;
        camada('cabos').append(criar('g', { class: 'cabo-rotulo' }, `<rect x="${lx - 27}" y="${ly - 11}" width="54" height="22" rx="11"/><text x="${lx}" y="${ly + 4}" text-anchor="middle">${metros}</text>`));
        const botao = criar('g', { class: 'camera-ponto', role: 'button', tabindex: '0', 'data-cam': c.id, 'aria-label': `Câmera ${i + 1}: ${c.nome}. Ativar para remover.` },
          `<circle class="alvo" cx="${c.x}" cy="${c.y}" r="30"/><circle class="aura" cx="${c.x}" cy="${c.y}" r="23"/><circle class="nucleo" cx="${c.x}" cy="${c.y}" r="16" filter="url(#planta-brilho)"/><text x="${c.x}" y="${c.y + 5.5}" text-anchor="middle">${i + 1}</text>`);
        camada('cameras').append(botao);
      });
      p.sugestoes
        .filter((s) => !estado.cameras.some((c) => c.sugestao === s.id))
        .forEach((s) => {
          camada('sugestoes').append(criar('g', { class: 'sugestao-ponto', role: 'button', tabindex: '0', 'data-sug': s.id, 'aria-label': `Adicionar câmera: ${nomeEm(s.nome, estado.ambiente)}` },
            `<circle class="alvo" cx="${s.x}" cy="${s.y}" r="28"/><circle class="anel" cx="${s.x}" cy="${s.y}" r="17"/><path d="M${s.x - 7} ${s.y} H${s.x + 7} M${s.x} ${s.y - 7} V${s.y + 7}"/>`));
        });
      camada('dvr').append(criar('g', { class: 'dvr' }, `<rect x="${p.dvr[0] - 20}" y="${p.dvr[1] - 14}" width="40" height="28" rx="6" filter="url(#planta-brilho)"/><text x="${p.dvr[0]}" y="${p.dvr[1] + 5}" text-anchor="middle">DVR</text>`));
    }
    resumir();
  };

  /* ---------- resumo, recomendação e mensagem ---------- */
  const resumir = () => {
    const condominio = estado.ambiente === 'condominio';
    const n = estado.cameras.length;
    const total = estado.cameras.reduce((s, c) => s + caboDe(c), 0);
    const rec = planoParaCameras(n);

    el('[data-resumo-sub]').textContent = condominio
      ? `Condomínio · ${estado.condominio.size ? `${estado.condominio.size} ${estado.condominio.size > 1 ? 'sistemas marcados' : 'sistema marcado'}` : 'proposta personalizada'}`
      : `${nomeAmbiente()} · ${n ? `${n} ${n > 1 ? 'pontos marcados' : 'ponto marcado'}` : 'nenhum ponto marcado'}`;

    const lista = el('[data-resumo-pontos]');
    lista.innerHTML = condominio
      ? sistemasCondominio.filter((s) => estado.condominio.has(s.id)).map((s) => `<li><span class="num">✓</span>${s.nome}</li>`).join('')
      : estado.cameras.map((c, i) => `<li><span class="num">${i + 1}</span><span class="nome">${c.nome}</span><small>≈ ${caboDe(c)} m</small><button type="button" class="remover" data-remover="${c.id}" aria-label="Remover câmera ${i + 1}: ${c.nome}">×</button></li>`).join('');

    const livres = condominio ? [] : planta().sugestoes.filter((s) => !estado.cameras.some((c) => c.sugestao === s.id));
    el('[data-resumo-sugestoes]').innerHTML = livres.map((s) => `<button type="button" class="chip chip-p" data-add-sug="${s.id}">+ ${nomeEm(s.nome, estado.ambiente)}</button>`).join('');
    el('[data-resumo-sugestoes-caixa]').hidden = condominio || !livres.length;

    const caixa = el('[data-recomendacao]');
    caixa.dataset.tipo = condominio ? 'proposta' : rec.tipo;
    caixa.dataset.planoRecomendado = rec.plano ? rec.plano.cameras : '';
    if (condominio) {
      caixa.innerHTML = `<p class="rec-k">Condomínio Evoluído</p><div class="rec-linha"><b>Proposta personalizada</b></div><p class="rec-nota">Câmeras, acesso facial, interfonia, rede e nobreak dimensionados para o condomínio, com contrato sob medida.</p>`;
    } else if (rec.tipo === 'vazio') {
      caixa.innerHTML = `<p class="rec-k">Plano recomendado</p><p class="rec-vazio">Marque pelo menos um ponto na planta ou escolha um ponto sugerido.</p>`;
    } else if (rec.tipo === 'proposta') {
      caixa.innerHTML = `<p class="rec-k">Proposta personalizada</p><div class="rec-linha"><b>${n} câmeras</b></div><p class="rec-nota">Mais de 8 câmeras pedem um projeto sob medida (gravador e infraestrutura maiores). A SC monta a proposta.</p>`;
    } else {
      const p = rec.plano;
      const excede = total > p.caboMetros;
      const pct = Math.min(100, Math.round((total / p.caboMetros) * 100));
      caixa.innerHTML = `<p class="rec-k">Plano recomendado</p>
        <div class="rec-linha"><b>${p.cameras} ${p.cameras > 1 ? 'câmeras' : 'câmera'}</b><strong>${mostrarPrecos ? `R$ ${formatarPreco(p.preco)} <small>/mês</small>` : 'Sob consulta'}</strong></div>
        ${rec.tipo === 'folga' ? `<p class="rec-nota">Você marcou ${n} pontos. O plano de 8 cobre com folga; para exatamente ${n} câmeras, a SC faz uma proposta personalizada.</p>` : ''}
        <div class="cabo-medidor${excede ? ' excede' : ''}">
          <div class="cabo-linha"><span>Cabo estimado</span><span><b>≈ ${total} m</b> de ${p.caboMetros} m inclusos</span></div>
          <div class="cabo-trilho" role="progressbar" aria-label="Cabo estimado em relação ao incluso no plano" aria-valuemin="0" aria-valuemax="${p.caboMetros}" aria-valuenow="${Math.min(total, p.caboMetros)}"><i style="width:${pct}%"></i></div>
          <small>${excede ? `Passa cerca de ${total - p.caboMetros} m do limite: o excedente é orçado à parte, na visita técnica.` : 'Dentro do limite do plano: sem cobrança de cabo extra.'}</small>
        </div>`;
    }

    // Cartões "E se…?"
    const comNobreak = estado.recursos.has('nobreak');
    const comColorida = estado.recursos.has('colorida');
    const energia = secao.querySelector('[data-ese-cartao="energia"]');
    energia.dataset.ativo = String(comNobreak);
    energia.querySelector('[data-ese-texto]').textContent = comNobreak
      ? 'Com o nobreak marcado, câmeras e gravador seguem gravando pelo tempo da bateria.'
      : 'Sem nobreak, câmeras e gravador desligam até a luz voltar.';
    energia.querySelector('[data-ese-acao]').textContent = comNobreak ? '✓ Nobreak marcado' : '+ Adicionar nobreak';
    const noite = secao.querySelector('[data-ese-cartao="noite"]');
    noite.dataset.ativo = String(comColorida);
    noite.querySelector('[data-ese-texto]').textContent = 'Com imagem colorida à noite, as cores aparecem melhor em baixa iluminação, conforme a luz do local.';
    noite.querySelector('[data-ese-acao]').textContent = comColorida ? '✓ Já marcado' : '+ Adicionar imagem colorida';

    // Etapas
    const passo = (id, s) => { const li = secao.querySelector(`[data-passo="${id}"]`); if (s) li.dataset.estado = s; else delete li.dataset.estado; };
    const temAlgo = condominio ? estado.condominio.size > 0 : n > 0;
    passo('pontos', temAlgo ? 'feito' : 'atual');
    passo('recursos', !temAlgo ? '' : condominio || estado.recursos.size ? 'feito' : 'atual');
    passo('enviar', temAlgo && (condominio || estado.recursos.size) ? 'atual' : '');

    // Mensagem
    const texto = mensagem(rec, n, total);
    el('[data-mensagem]').textContent = texto;
    el('[data-config-enviar]').href = linkWhatsapp(texto);

    document.dispatchEvent(new CustomEvent('sc:resumo-config', {
      detail: {
        titulo: condominio ? 'Condomínio Evoluído' : rec.plano ? `${nomePlano(rec.plano).replace('Plano de ', '')} · ${mostrarPrecos ? `R$ ${formatarPreco(rec.plano.preco)}/mês` : 'sob consulta'}` : n ? `${n} câmeras · proposta` : 'Monte seu sistema',
        sub: condominio ? 'Proposta personalizada' : n ? `${n} ${n > 1 ? 'pontos' : 'ponto'} · cabo ≈ ${total} m` : 'Toque na planta para marcar',
        link: linkWhatsapp(texto),
        acao: 'Enviar',
      },
    }));
  };

  const mensagem = (rec, n, total) => {
    if (estado.ambiente === 'condominio') {
      const sistemas = sistemasCondominio.filter((s) => estado.condominio.has(s.id)).map((s) => s.nome.toLowerCase());
      return ['Olá! Quero uma proposta de Condomínio Evoluído.', sistemas.length ? `Sistemas de interesse: ${sistemas.join(', ')}.` : 'Gostaria de entender o que faz sentido para o condomínio.', 'Podemos conversar?'].join('\n');
    }
    if (!n) return `Olá! Estou montando meu sistema no site da SC (${nomeAmbiente().toLowerCase()}) e gostaria de ajuda para escolher os pontos.`;
    const linhas = ['Olá! Montei meu sistema no site da SC.', `Ambiente: ${nomeAmbiente()}`, `Câmeras: ${n} (${estado.cameras.map((c) => c.nome.toLowerCase()).join(', ')})`];
    if (rec.tipo === 'exato') linhas.push(`Plano sugerido: ${nomePlano(rec.plano)} (${preco(rec.plano)})`, `Cabo estimado: ≈ ${total} m (o plano inclui até ${rec.plano.caboMetros} m)`);
    if (rec.tipo === 'folga') linhas.push(`Plano sugerido: ${nomePlano(rec.plano)} (${preco(rec.plano)}) ou proposta para ${n} câmeras`, `Cabo estimado: ≈ ${total} m`);
    if (rec.tipo === 'proposta') linhas.push(`Quero uma proposta personalizada para ${n} câmeras.`);
    const recursos = upgrades.filter((u) => estado.recursos.has(u.id)).map((u) => u.nome.toLowerCase());
    if (recursos.length) linhas.push(`Recursos de interesse: ${recursos.join(', ')}`);
    linhas.push('Podemos agendar uma avaliação?');
    return linhas.join('\n');
  };

  /* ---------- eventos ---------- */
  const pontoNoDesenho = (evento) => {
    const pt = svg.createSVGPoint();
    pt.x = evento.clientX;
    pt.y = evento.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  svg.addEventListener('click', (e) => {
    const cam = e.target.closest('[data-cam]');
    if (cam) return remover(Number(cam.dataset.cam));
    const sug = e.target.closest('[data-sug]');
    if (sug) return adicionarSugestao(sug.dataset.sug);
    const { x, y } = pontoNoDesenho(e);
    if (!dentro(LOTE, x, y)) return avisar('Marque os pontos dentro do terreno.');
    const perto = planta().sugestoes.find((s) => Math.hypot(s.x - x, s.y - y) < 30 && !estado.cameras.some((c) => c.sugestao === s.id));
    if (perto) return adicionarSugestao(perto.id);
    adicionar({ x: Math.round(x), y: Math.round(y), angulo: anguloPara(x, y), nome: nomeDaZona(x, y), sugestao: null });
  });
  svg.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const alvo = e.target.closest('[data-cam], [data-sug]');
    if (!alvo) return;
    e.preventDefault();
    const eraSugestao = alvo.dataset.sug;
    alvo.dataset.cam ? remover(Number(alvo.dataset.cam)) : adicionarSugestao(alvo.dataset.sug);
    // Mantém o foco na planta para continuar pelo teclado.
    const proximo = svg.querySelector(eraSugestao ? '[data-sug]' : '[data-cam], [data-sug]');
    proximo?.focus();
  });

  secao.addEventListener('click', (e) => {
    const rem = e.target.closest('[data-remover]');
    if (rem) remover(Number(rem.dataset.remover));
    const add = e.target.closest('[data-add-sug]');
    if (add) adicionarSugestao(add.dataset.addSug);
    const amb = e.target.closest('[data-config-ambiente]');
    if (amb) trocarAmbiente(amb.dataset.configAmbiente);
    const acao = e.target.closest('[data-ese-acao]');
    if (acao) {
      const caixa = secao.querySelector(`[data-recurso][value="${acao.dataset.eseAcao}"]`);
      caixa.checked = !caixa.checked;
      caixa.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  el('[data-config-limpar]').addEventListener('click', () => {
    estado.cameras = [];
    desenhar();
  });
  secao.addEventListener('change', (e) => {
    if (e.target.matches('[data-recurso]')) {
      e.target.checked ? estado.recursos.add(e.target.value) : estado.recursos.delete(e.target.value);
      resumir();
    }
    if (e.target.matches('[data-cond-sistema]')) {
      e.target.checked ? estado.condominio.add(e.target.value) : estado.condominio.delete(e.target.value);
      resumir();
    }
  });

  // Vindo de um plano ("Ver no configurador") ou da aba Condomínio.
  document.addEventListener('sc:configurar', (e) => {
    const { cameras, ambiente } = e.detail;
    if (ambiente) return trocarAmbiente(ambiente);
    if (estado.ambiente === 'condominio') trocarAmbiente('casa');
    estado.cameras = [];
    (planta().presets[cameras] || []).forEach((id) => {
      const s = planta().sugestoes.find((x) => x.id === id);
      estado.cameras.push({ id: proximoId++, x: s.x, y: s.y, angulo: s.angulo, nome: nomeEm(s.nome, estado.ambiente), sugestao: s.id });
    });
    desenhar();
  });

  desenhar();
  // No celular a planta fica maior que a tela: começa centralizada.
  const caixaPlanta = el('[data-planta-caixa]');
  if (caixaPlanta.scrollWidth > caixaPlanta.clientWidth) caixaPlanta.scrollLeft = (caixaPlanta.scrollWidth - caixaPlanta.clientWidth) / 2;
}
