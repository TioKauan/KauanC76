import { icone } from './icones.js';
import { upgrades, linkWhatsapp } from '../dados.js';
import { ambientesConfig, plantas, sistemasCondominio, LOTE, nomeEm } from '../configurador-dados.js';

const rotulo = (x, y, texto, cor = '#6f8aa3', classe = '') =>
  `<text class="planta-rotulo ${classe}" x="${x}" y="${y}" fill="${cor}" text-anchor="middle">${texto}</text>`;

function base() {
  return `
    <rect x="0" y="0" width="818" height="540" fill="#040c16"/>
    <rect class="planta-lote" x="${LOTE.x}" y="${LOTE.y}" width="${LOTE.w}" height="${LOTE.h}" rx="6" fill="url(#planta-grama)" stroke="#1d3550" stroke-dasharray="6 6"/>
    <rect x="0" y="482" width="818" height="58" fill="#0a1522"/>
    <path d="M0 511 H818" stroke="#2b3f55" stroke-dasharray="18 14" stroke-width="2"/>
    ${rotulo(409, 531, 'RUA', '#4f6a83')}`;
}

function desenhoCasa() {
  return `${base()}
    <path d="M24 462 H250 M300 462 H590 M750 462 H794" stroke="#4a6a88" stroke-width="5"/>
    <path d="M250 462 H300" stroke="#6de9f6" stroke-width="3"/><path d="M590 462 H750" stroke="#6de9f6" stroke-width="3" stroke-dasharray="8 5"/>
    <rect x="590" y="390" width="160" height="72" fill="#0b1826"/><rect x="250" y="390" width="50" height="72" fill="#0b1826"/>
    <rect x="150" y="90" width="430" height="300" fill="#0c1a2a" stroke="#4d7fa6" stroke-width="4"/>
    <path d="M150 230 H360 M360 90 V390 M360 250 H580 M470 90 V250 M470 250 V300 M360 300 H470" stroke="#2d5475" stroke-width="2" fill="none"/>
    <rect x="580" y="210" width="170" height="180" fill="#0a1624" stroke="#4d7fa6" stroke-width="4"/>
    <path d="M255 390 H300" stroke="#0c1a2a" stroke-width="6"/><path d="M255 390 A45 45 0 0 1 300 345" stroke="#2d5475" fill="none" stroke-dasharray="3 3"/>
    <g fill="none" stroke="#1d3b57" stroke-width="1.5"><rect x="180" y="280" width="120" height="40" rx="6"/><rect x="175" y="110" width="160" height="26" rx="3"/><circle cx="260" cy="180" r="24"/><rect x="380" y="110" width="70" height="90" rx="4"/><rect x="490" y="110" width="70" height="90" rx="4"/><rect x="600" y="240" width="60" height="120" rx="10"/><rect x="670" y="240" width="60" height="120" rx="10"/></g>
    ${rotulo(255, 215, 'COZINHA')}${rotulo(255, 372, 'SALA')}${rotulo(415, 232, 'QUARTO')}${rotulo(525, 232, 'QUARTO')}${rotulo(415, 285, 'BANHO', '#56708a')}${rotulo(665, 380, 'GARAGEM')}${rotulo(400, 58, 'QUINTAL / FUNDOS', '#4f7a73')}${rotulo(86, 250, 'LATERAL', '#4f7a73')}
    ${rotulo(275, 454, 'portão', '#8fd9e8', 'planta-rotulo-p')}${rotulo(670, 454, 'portão da garagem', '#8fd9e8', 'planta-rotulo-p')}`;
}

function desenhoComercial(ambiente) {
  const n = (i) => nomeEm(plantas.comercial.zonas[i].nome, ambiente).toLocaleUpperCase('pt-BR');
  return `${base()}
    <path d="M24 462 H794" stroke="#4a6a88" stroke-width="3" stroke-dasharray="2 10"/>
    <g stroke="#2d4d6a" stroke-width="2">${[150, 230, 310, 390, 470, 550, 630, 710].map((x) => `<path d="M${x} 400 V455"/>`).join('')}</g>
    <rect x="110" y="70" width="540" height="300" fill="#0c1a2a" stroke="#4d7fa6" stroke-width="4"/>
    <path d="M110 170 H450 M310 170 V370 M450 70 V370 M450 250 H650" stroke="#2d5475" stroke-width="2" fill="none"/>
    <path d="M180 370 H240" stroke="#6de9f6" stroke-width="4"/>
    <g fill="none" stroke="#1d3b57" stroke-width="1.5">
      <rect x="330" y="300" width="100" height="26" rx="4"/><rect x="140" y="200" width="24" height="140" rx="3"/><rect x="200" y="200" width="24" height="140" rx="3"/><rect x="258" y="200" width="24" height="140" rx="3"/>
      <rect x="470" y="90" width="160" height="22" rx="3"/><rect x="470" y="130" width="160" height="22" rx="3"/><rect x="470" y="170" width="160" height="22" rx="3"/>
      <rect x="130" y="95" width="80" height="50" rx="4"/><rect x="230" y="95" width="80" height="50" rx="4"/><rect x="480" y="280" width="70" height="40" rx="4"/>
    </g>
    ${rotulo(280, 162, n(0))}${rotulo(210, 360, n(1))}${rotulo(380, 355, n(2))}${rotulo(550, 238, n(3))}${rotulo(530, 355, n(4))}
    ${rotulo(420, 49, 'FUNDOS', '#4f7a73')}${rotulo(67, 250, 'LATERAL', '#4f7a73')}
    ${ambiente === 'comercio' ? rotulo(722, 240, 'CARGA E', '#4f7a73') + rotulo(722, 258, 'DESCARGA', '#4f7a73') : rotulo(722, 250, 'LATERAL', '#4f7a73')}
    ${rotulo(452, 438, 'ESTACIONAMENTO', '#4f7a73')}${rotulo(210, 392, 'entrada', '#8fd9e8', 'planta-rotulo-p')}`;
}

function planta(ambiente) {
  const desenho = ambiente === 'casa' ? desenhoCasa() : desenhoComercial(ambiente);
  return `<g class="planta-desenho" data-desenho="${ambiente}"${ambiente === 'casa' ? '' : ' hidden'}>${desenho}</g>`;
}

const msgInicial = 'Olá! Estou montando meu sistema no site da SC (casa) e gostaria de ajuda para escolher os pontos.';

export function secaoConfigurador() {
  return `
<section class="secao configurador" id="monte" aria-labelledby="monte-titulo">
  <div class="wrap">
    <div class="cabeca-secao" data-revelar>
      <div>
        <p class="sobretitulo">Monte seu sistema</p>
        <h2 class="titulo-secao" id="monte-titulo">Marque o que você quer proteger.<br /><span class="destaque">A SC dimensiona o resto.</span></h2>
      </div>
      <ol class="passos" aria-label="Etapas">
        <li data-passo="ambiente" data-estado="feito"><span>1</span>Ambiente</li>
        <li data-passo="pontos" data-estado="atual"><span>2</span>Pontos</li>
        <li data-passo="recursos"><span>3</span>Recursos</li>
        <li data-passo="enviar"><span>4</span>Enviar</li>
      </ol>
    </div>

    <div class="config-ambientes" role="group" aria-label="Qual é o ambiente?">
      ${ambientesConfig.map((a, i) => `<button type="button" class="chip" data-config-ambiente="${a.id}" aria-pressed="${i === 0}">${icone(a.icone, { tamanho: 16 })} ${a.nome}</button>`).join('')}
    </div>

    <div class="config-grade">
      <div class="cartao config-planta">
        <div class="config-planta-topo">
          <p class="config-dica">${icone('mouse-pointer-click', { tamanho: 17 })} <span data-config-dica>Toque na planta para marcar uma câmera. Toque de novo para tirar.</span></p>
          <button type="button" class="btn btn-contorno btn-p" data-config-limpar>${icone('rotate-ccw', { tamanho: 15 })} Recomeçar</button>
        </div>
        <div class="planta-caixa" data-planta-caixa>
          <svg class="planta" viewBox="0 0 818 540" role="application" aria-label="Planta de exemplo: toque para marcar câmeras" data-planta>
            <defs>
              <pattern id="planta-grama" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 14 L14 0" stroke="#0e2a2a" stroke-width="1"/></pattern>
              <filter id="planta-brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            ${planta('casa')}${planta('comercio')}${planta('empresa')}
            <g data-camada="cones"></g><g data-camada="cabos"></g><g data-camada="sugestoes"></g><g data-camada="cameras"></g>
            <g data-camada="dvr"></g>
          </svg>
          <div class="condominio-proposta" data-condominio hidden>
            <span class="selo selo-ciano">${icone('building-2', { tamanho: 14 })} Proposta personalizada</span>
            <h3>Condomínio Evoluído</h3>
            <p>Condomínios recebem projeto e contrato sob medida. Marque o que interessa e a SC monta a proposta.</p>
            <fieldset class="condominio-sistemas">
              <legend class="sr">Sistemas de interesse</legend>
              ${sistemasCondominio.map((s) => `<label class="opcao"><input type="checkbox" value="${s.id}" data-cond-sistema /><span class="caixinha" aria-hidden="true">${icone('check', { tamanho: 13, traco: 3 })}</span>${icone(s.icone, { tamanho: 17 })}<span>${s.nome}</span></label>`).join('')}
            </fieldset>
          </div>
        </div>
        <p class="planta-arraste" data-legenda>${icone('move', { tamanho: 14 })} Arraste para os lados para ver a planta toda</p>
        <div class="planta-legenda" data-legenda>
          <span><i class="leg-camera"></i> Câmera marcada</span>
          <span><i class="leg-sugestao"></i> Ponto sugerido</span>
          <span><i class="leg-dvr"></i> Gravador (DVR)</span>
          <span class="leg-nota">Metragens ilustrativas, confirmadas na visita técnica</span>
        </div>

        <div class="config-ese" data-config-ese>
          <p class="config-ese-titulo">Teste antes de contratar · E se…?</p>
          <div class="config-ese-grade">
            <div class="ese-cartao" data-ese-cartao="energia"><b>${icone('zap-off', { tamanho: 16 })} Faltou energia</b><p data-ese-texto></p><button type="button" class="ese-acao" data-ese-acao="nobreak"></button></div>
            <div class="ese-cartao" data-ese-cartao="internet"><b>${icone('wifi-off', { tamanho: 16 })} A internet caiu</b><p>A gravação continua no gravador do imóvel. Só as imagens pelo celular param até a conexão voltar.</p><span class="ese-acao ese-acao-texto">Nada a adicionar</span></div>
            <div class="ese-cartao" data-ese-cartao="noite"><b>${icone('moon', { tamanho: 16 })} Pouca luz à noite</b><p data-ese-texto></p><button type="button" class="ese-acao" data-ese-acao="colorida"></button></div>
          </div>
        </div>
      </div>

      <aside class="cartao config-resumo" aria-labelledby="resumo-titulo">
        <div>
          <h3 id="resumo-titulo">Seu sistema</h3>
          <p class="resumo-sub" data-resumo-sub>Casa · nenhum ponto marcado</p>
        </div>
        <ol class="resumo-pontos" data-resumo-pontos></ol>
        <div class="resumo-sugestoes" data-resumo-sugestoes-caixa>
          <p>Pontos sugeridos</p>
          <div data-resumo-sugestoes></div>
        </div>
        <div class="recomendacao" data-recomendacao data-tipo="vazio" aria-live="polite"><p class="rec-k">Plano recomendado</p><p class="rec-vazio">Marque pelo menos um ponto na planta ou escolha um ponto sugerido.</p></div>
        <fieldset class="resumo-recursos" data-resumo-recursos>
          <legend>Recursos opcionais <small>sob orçamento</small></legend>
          ${upgrades.map((u) => `<label class="opcao"><input type="checkbox" value="${u.id}" data-recurso /><span class="caixinha" aria-hidden="true">${icone('check', { tamanho: 13, traco: 3 })}</span>${icone(u.icone, { tamanho: 16 })}<span>${u.nome}</span></label>`).join('')}
        </fieldset>
        <div class="mensagem-previa">
          <p class="mensagem-previa-topo">${icone('message-circle', { tamanho: 14 })} Prévia da mensagem</p>
          <p data-mensagem>${msgInicial}</p>
        </div>
        <a class="btn btn-primario btn-g config-enviar" data-config-enviar href="${linkWhatsapp(msgInicial)}" target="_blank" rel="noopener">${icone('message-circle', { tamanho: 19 })} Enviar para a SC pelo WhatsApp</a>
        <p class="resumo-nota">Atendimento pela equipe da SC. A solução final é definida na visita técnica.</p>
      </aside>
    </div>
  </div>
</section>
<div class="fio" aria-hidden="true"></div>`;
}
