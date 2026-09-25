import { icone } from './icones.js';
import {
  planos, upgrades, condicoes, letraMiuda, porQueLocar, servicosProposta, textoProposta,
  formatarPreco, mostrarPrecos, nomePlano, linkWhatsapp, mensagemPlano,
} from '../dados.js';

// Posição (x, y, ângulo em graus) das câmeras na mini-planta 200 × 132.
const posicoes = {
  1: [[100, 116, 90]],
  2: [[60, 116, 90], [140, 16, -90]],
  3: [[60, 116, 90], [140, 16, -90], [172, 66, 180]],
  4: [[28, 116, 45], [172, 116, 135], [28, 16, -45], [172, 16, -135]],
  8: [[28, 116, 45], [172, 116, 135], [28, 16, -45], [172, 16, -135], [100, 116, 90], [100, 16, -90], [28, 66, 0], [172, 66, 180]],
};

/** Mini-planta com os cones de visão de cada câmera do plano. */
export function miniPlanta(n, destaque = false) {
  const cor = destaque ? '#ff9a4a' : '#6de9f6';
  const lista = posicoes[n] || [];
  const cones = lista
    .map(([x, y, a]) => {
      const r = 50;
      const s = (30 * Math.PI) / 180;
      const t = (a * Math.PI) / 180;
      const x1 = x + Math.cos(t - s) * r;
      const y1 = y - Math.sin(t - s) * r;
      const x2 = x + Math.cos(t + s) * r;
      const y2 = y - Math.sin(t + s) * r;
      return `<path class="cone-mini" style="transform-origin:${x}px ${y}px" d="M${x} ${y} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 0 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="url(#mp-${n})"/>`;
    })
    .join('');
  const pontos = lista
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${cor}" opacity=".18"/><circle class="camera-mini" cx="${x}" cy="${y}" r="4.2" fill="${cor}" stroke="#fff" stroke-width="1"/>`)
    .join('');
  return `<svg class="mini-planta" viewBox="0 0 200 132" role="img" aria-label="Planta de exemplo com ${n} ${n > 1 ? 'câmeras' : 'câmera'} e o campo de visão de cada uma">
    <defs><radialGradient id="mp-${n}" cx="0" cy="0" r="1"><stop offset="0" stop-color="${cor}" stop-opacity=".5"/><stop offset="1" stop-color="${cor}" stop-opacity=".05"/></radialGradient></defs>
    <path d="M0 33 H200 M0 66 H200 M0 99 H200 M50 0 V132 M100 0 V132 M150 0 V132" stroke="#0f2336" fill="none"/>
    <rect x="26" y="14" width="148" height="104" rx="2" stroke="#2f5677" stroke-width="1.6" fill="#0a1a2b"/>
    <path d="M26 64 H96 M96 14 V118 M96 84 H174 M136 84 V118" stroke="#244565" fill="none"/>
    <path d="M86 118 h18" stroke="#6de9f6" stroke-width="2.2"/>
    ${cones}${pontos}
  </svg>`;
}

function cartaoPlano(p) {
  const destaque = Boolean(p.destaque);
  const preco = mostrarPrecos
    ? `<div class="preco"><small>R$</small><strong>${formatarPreco(p.preco)}</strong><em>/mês</em></div>`
    : `<div class="preco"><strong class="preco-consulta">Sob consulta</strong></div>`;
  return `
  <article class="cartao plano${destaque ? ' plano-destaque' : ''}" id="plano-${p.cameras}" data-plano="${p.cameras}" aria-labelledby="plano-${p.cameras}-titulo">
    ${destaque ? `<span class="selo selo-laranja plano-selo">${icone('sparkles', { tamanho: 13, traco: 2 })} ${p.destaque}</span>` : ''}
    <div class="plano-mapa">${miniPlanta(p.cameras, destaque)}</div>
    <h3 id="plano-${p.cameras}-titulo">${p.cameras} ${p.cameras > 1 ? 'câmeras' : 'câmera'}</h3>
    <p class="plano-uso">${p.uso}</p>
    ${preco}
    <p class="plano-cabo">${icone('cable', { tamanho: 15 })}<span>Instalação inclusa<br />até ${p.caboMetros} m de cabo</span></p>
    <ul class="plano-lista">
      <li>${icone('check', { tamanho: 16, traco: 2.2 })}${p.cameras} ${p.cameras > 1 ? 'câmeras' : 'câmera'} 2 MP ou superior</li>
      <li>${icone('check', { tamanho: 16, traco: 2.2 })}Gravação local ≈ 10 dias</li>
      <li>${icone('check', { tamanho: 16, traco: 2.2 })}${p.gravador} e imagens no celular</li>
      <li>${icone('check', { tamanho: 16, traco: 2.2 })}Suporte e manutenção</li>
    </ul>
    <a class="btn ${destaque ? 'btn-primario' : 'btn-contorno'} plano-cta" href="${linkWhatsapp(mensagemPlano(p))}" target="_blank" rel="noopener" data-plano-cta="${p.cameras}">Quero este plano ${icone('arrow-up-right', { tamanho: 16, traco: 2 })}<span class="sr"> (${nomePlano(p)}, abre o WhatsApp)</span></a>
    <a class="plano-simular" href="#monte" data-configurar="${p.cameras}">Ver no configurador ${icone('arrow-right', { tamanho: 14 })}</a>
  </article>`;
}

function painelServico(s) {
  const msg = `Olá! Gostaria de uma proposta de ${s.titulo.toLowerCase()} para o meu ambiente.`;
  return `
  <div class="painel-servico cartao" role="tabpanel" id="aba-${s.id}" aria-labelledby="guia-${s.id}" hidden>
    <div class="servico-texto">
      <span class="selo selo-ciano">${icone(s.icone, { tamanho: 14 })} Proposta personalizada</span>
      <h3>${s.titulo}</h3>
      <p>${s.texto}</p>
      <ul>${s.itens.map((i) => `<li>${icone('check', { tamanho: 16, traco: 2.2 })}${i}</li>`).join('')}</ul>
    </div>
    <div class="servico-acao">
      <p>${textoProposta}</p>
      <a class="btn btn-primario" href="${linkWhatsapp(msg)}" target="_blank" rel="noopener">Pedir proposta pelo WhatsApp ${icone('arrow-up-right', { tamanho: 16, traco: 2 })}</a>
      ${s.id === 'condominio' ? `<a class="btn btn-contorno" href="#monte" data-configurar-ambiente="condominio">Montar a proposta no configurador</a>` : ''}
    </div>
  </div>`;
}

export function secaoPlanos() {
  const guias = [
    `<button type="button" role="tab" class="guia" id="guia-cameras" aria-controls="aba-cameras" aria-selected="true">${icone('cctv', { tamanho: 17 })} Câmeras</button>`,
    ...servicosProposta.map(
      (s) => `<button type="button" role="tab" class="guia" id="guia-${s.id}" aria-controls="aba-${s.id}" aria-selected="false" tabindex="-1">${icone(s.icone, { tamanho: 17 })} ${s.nome} <small>Proposta</small></button>`,
    ),
  ].join('');

  return `
<section class="secao planos" id="planos" aria-labelledby="planos-titulo">
  <div class="wrap">
    <div class="cabeca-secao" data-revelar>
      <div>
        <p class="sobretitulo">Planos de locação</p>
        <h2 class="titulo-secao" id="planos-titulo">Proteção sem precisar<br /><span class="destaque">comprar os equipamentos.</span></h2>
      </div>
      <p>Você escolhe quantas câmeras. A SC instala, configura o acesso pelo celular e cuida da manutenção durante o contrato.</p>
    </div>

    <div class="guias" role="tablist" aria-label="Tipo de solução">${guias}</div>

    <div role="tabpanel" id="aba-cameras" aria-labelledby="guia-cameras">
      <div class="planos-trilho" tabindex="-1">
        <div class="planos-grade">${planos.map(cartaoPlano).join('')}</div>
      </div>
      <div class="planos-pontos" aria-label="Escolher plano">
        ${planos.map((p) => `<button type="button" data-ir-plano="${p.cameras}" aria-label="Ver ${nomePlano(p)}"></button>`).join('')}
      </div>
      <div class="cartao upgrades">
        <strong>Personalize seu sistema</strong>
        <ul>${upgrades.map((u) => `<li title="${u.detalhe}">${icone(u.icone, { tamanho: 17 })} ${u.nome}</li>`).join('')}</ul>
        <em>Upgrades sob orçamento</em>
      </div>
    </div>
    ${servicosProposta.map(painelServico).join('')}

    <div class="por-que" data-revelar>
      <div class="por-que-titulo"><h3>Por que locar em vez de comprar?</h3><p>O que muda para quem só quer o sistema funcionando.</p></div>
      ${porQueLocar.map((m) => `<div class="por-que-item">${icone(m.icone, { tamanho: 26, traco: 1.4 })}<b>${m.titulo}</b><span>${m.texto}</span></div>`).join('')}
    </div>

    <div class="tudo-claro" data-revelar>
      <h3>Tudo claro antes de assinar<small>As regras do contrato, sem letra miúda.</small></h3>
      ${condicoes.map((c) => `<div class="condicao">${icone(c.icone, { tamanho: 20 })}<div><b>${c.titulo}</b><span>${c.texto}</span></div></div>`).join('')}
    </div>
    <p class="letra-miuda">${letraMiuda}</p>
  </div>
</section>
<div class="fio" aria-hidden="true"></div>`;
}
