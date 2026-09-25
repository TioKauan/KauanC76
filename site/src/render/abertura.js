import { icone } from './icones.js';
import { cenas } from './cenas.js';
import { ambientes, situacoes, sistemas, estadoCena } from '../cenarios.js';
import { formatarPreco, menorPreco, mostrarPrecos, condicoes } from '../dados.js';

const f = (n) => n.toFixed(2);

function rotulos(ambienteId, cena) {
  const { textos } = estadoCena(ambienteId, 'normal', false);
  return Object.entries(cena.rotulos)
    .map(([sistema, [dx, dy, indice]]) => {
      const ponto = cena.pontos.filter((pt) => pt.sistema === sistema)[indice];
      const x = ((ponto.x + dx) / 760) * 100;
      const y = ((ponto.y + dy) / 600) * 100;
      const px = (ponto.x / 760) * 100;
      const py = (ponto.y / 600) * 100;
      const s = sistemas[sistema];
      return (
        `<svg class="rotulo-linha" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" data-sistema="${sistema}" data-estado="ok"><line x1="${f(px)}" y1="${f(py)}" x2="${f(x)}" y2="${f(y)}" vector-effect="non-scaling-stroke"/></svg>` +
        `<div class="rotulo${dy > 0 ? ' rotulo-baixo' : ''}" style="left:${f(x)}%;top:${f(y)}%" data-sistema="${sistema}" data-estado="ok">` +
        `${icone(s.icone, { tamanho: 18 })}<span><b>${s.nome}</b><small data-texto>${textos[sistema]}</small></span></div>`
      );
    })
    .join('');
}

export function abertura() {
  const estado = estadoCena('casa', 'normal', false);
  const precoTexto = mostrarPrecos
    ? `Locação de câmeras a partir de <em>R$ ${formatarPreco(menorPreco)}</em>/mês`
    : 'Planos de locação de câmeras';
  const prazo = condicoes[0].titulo.toLowerCase();

  const palcos = ambientes
    .map((a, i) => {
      const cena = cenas[a.id]();
      return `<div class="cena-ambiente" data-ambiente="${a.id}"${i ? ' hidden' : ''}>${cena.svg}${rotulos(a.id, cena)}</div>`;
    })
    .join('');

  return `
<section class="abertura" id="inicio" aria-labelledby="abertura-titulo">
  <div class="wrap abertura-grade">
    <div class="abertura-texto">
      <p class="sobretitulo">Integradora de segurança e tecnologia</p>
      <h1 id="abertura-titulo">Porque tecnologia não deve apenas estar instalada. <span class="destaque">Ela precisa funcionar.</span></h1>
      <p class="abertura-lead">Câmeras, rede, acesso e energia conectados em um só projeto. E, se preferir, com planos de locação para começar sem comprar os equipamentos.</p>
      <div class="abertura-acoes">
        <a class="btn btn-primario btn-g" href="#planos"><span class="so-grande">Ver planos de locação</span><span class="so-celular">${mostrarPrecos ? `Ver planos a partir de R$ ${formatarPreco(menorPreco)}` : 'Ver planos de locação'}</span> ${icone('arrow-right', { tamanho: 18, traco: 2 })}</a>
        <a class="btn btn-contorno btn-g" href="#monte">${icone('mouse-pointer-click', { tamanho: 18 })} Monte seu sistema</a>
      </div>
      <div class="ambientes" role="group" aria-label="Veja no seu ambiente">
        <span class="ambientes-rotulo">Veja no seu ambiente:</span>
        ${ambientes.map((a, i) => `<button type="button" class="chip" data-ambiente="${a.id}" aria-pressed="${i === 0}">${icone(a.icone, { tamanho: 16 })} ${a.nome}</button>`).join('')}
      </div>
      <a class="preco-chamada" href="#planos">
        ${icone('cctv', { tamanho: 30, traco: 1.4 })}
        <span><strong>${precoTexto}</strong><small>Instalação padrão inclusa · ${prazo}</small></span>
      </a>
    </div>

    <div class="abertura-cena">
      <div class="cena" data-cenario="normal" data-reserva="nao" data-ambiente-ativo="casa">${palcos}</div>

      <div class="ese" aria-labelledby="ese-titulo">
        <div class="ese-cabeca">
          <div class="ese-topo"><h2 id="ese-titulo">E se…?</h2><span class="ese-selo">Simulação</span></div>
          <div class="ese-opcoes" role="group" aria-label="Situações para simular">
            ${situacoes.map((s, i) => `<button type="button" class="ese-opcao" data-situacao="${s.id}" aria-pressed="${i === 0}">${icone(s.icone, { tamanho: 18 })}<span>${s.nome}</span></button>`).join('')}
          </div>
        </div>
        <div class="ese-corpo">
          <div class="ese-resultado" aria-live="polite">
            <p class="ese-titulo-resultado" data-ese-titulo>${estado.titulo}</p>
            <p class="ese-explicacao" data-ese-explicacao>${estado.explicacao}</p>
            <p class="ese-condicao" data-ese-condicao>${estado.condicao}</p>
          </div>
          <label class="ese-reserva" hidden>
            <input type="checkbox" data-reserva />
            <span class="interruptor" aria-hidden="true"></span>
            <span><b>Com nobreak</b><small>Para câmeras, rede, gravador e acesso</small></span>
          </label>
        </div>
      </div>
    </div>
  </div>

  <div class="wrap faixa-servicos" data-revelar>
    <a href="#planos">${icone('cctv', { tamanho: 26, traco: 1.4 })}<span>Locação de câmeras<small>Planos de 1 a 8 câmeras</small></span></a>
    <a href="#planos" data-abrir-aba="redes">${icone('network', { tamanho: 26, traco: 1.4 })}<span>Redes gerenciadas<small>Wi-Fi e cabeamento</small></span></a>
    <a href="#planos" data-abrir-aba="condominio">${icone('scan-face', { tamanho: 26, traco: 1.4 })}<span>Controle de acesso<small>Facial, biometria, vídeo porteiro</small></span></a>
    <a href="#planos" data-abrir-aba="alarme">${icone('bell-ring', { tamanho: 26, traco: 1.4 })}<span>Alarme monitorado<small>Integrado às câmeras</small></span></a>
    <a href="#planos" data-abrir-aba="nobreak">${icone('battery-charging', { tamanho: 26, traco: 1.4 })}<span>Energia e nobreak<small>Continuidade dos sistemas</small></span></a>
  </div>
</section>
<div class="fio" aria-hidden="true"></div>`;
}
