import { icone } from './icones.js';
import { etapas, duvidas, linkWhatsapp } from '../dados.js';

export function secaoComoFunciona() {
  return `
<section class="secao como-funciona" id="como-funciona" aria-labelledby="como-titulo">
  <div class="wrap">
    <div class="cabeca-secao" data-revelar>
      <div>
        <p class="sobretitulo">Como funciona a locação</p>
        <h2 class="titulo-secao" id="como-titulo">Do primeiro contato ao<br /><span class="destaque">sistema funcionando.</span></h2>
      </div>
      <p>Cinco etapas, sem burocracia. Da escolha do plano ao suporte durante todo o contrato.</p>
    </div>

    <ol class="linha-tempo" data-linha-tempo>
      <li class="linha-tempo-cabo" aria-hidden="true"><span></span></li>
      ${etapas
        .map(
          (e, i) => `
      <li class="etapa" data-etapa="${i}">
        <span class="etapa-num" aria-hidden="true">0${i + 1}</span>
        ${icone(e.icone, { tamanho: 30, traco: 1.3, classe: 'etapa-icone' })}
        <h3><span class="sr">Etapa ${i + 1}: </span>${e.titulo}</h3>
        <p>${e.texto}</p>
        <span class="etapa-meta">${e.meta}</span>
      </li>`,
        )
        .join('')}
    </ol>

    <div class="duvidas-grade" id="duvidas">
      <div class="duvidas">
        <p class="sobretitulo">Perguntas frequentes</p>
        <h2 class="titulo-secao duvidas-titulo">Antes de começar, <span class="destaque">tire suas dúvidas.</span></h2>
        <label class="busca">
          ${icone('search', { tamanho: 18 })}
          <span class="sr">Buscar nas dúvidas</span>
          <input type="search" placeholder="Digite sua dúvida, ex.: ver pelo celular" data-busca autocomplete="off" />
        </label>
        <p class="busca-status" data-busca-status aria-live="polite"></p>
        <div class="perguntas" data-perguntas>
          ${duvidas
            .map(
              (d, i) => `
          <details class="pergunta" data-pergunta${i === 3 ? ' open' : ''}>
            <summary>${d.pergunta}${icone('plus', { tamanho: 18, classe: 'ic-mais' })}</summary>
            <p>${d.resposta}</p>
          </details>`,
            )
            .join('')}
        </div>
        <div class="sem-resultado" data-sem-resultado hidden>
          <p>Não achamos essa dúvida por aqui. Pergunte direto para a equipe da SC:</p>
          <a class="btn btn-contorno btn-p" data-pergunta-whatsapp href="${linkWhatsapp('Olá! Tenho uma dúvida sobre os planos de locação.')}" target="_blank" rel="noopener">${icone('message-circle', { tamanho: 16 })} Perguntar pelo WhatsApp</a>
        </div>
      </div>

      <div class="cartao cliente" aria-labelledby="cliente-titulo">
        <span class="selo selo-ciano cliente-selo">Em breve · exemplo</span>
        <p class="cliente-k">Área do cliente</p>
        <h3 id="cliente-titulo">Acompanhe seu pedido pelo celular.</h3>
        <p class="cliente-sub">Um link pessoal, enviado pelo WhatsApp, vai mostrar em que etapa está a sua instalação. Veja como vai ficar:</p>
        <div class="cliente-previa" aria-label="Exemplo ilustrativo da área do cliente">
          <p class="cliente-plano">Plano de 4 câmeras</p>
          <ol class="acompanha">
            <li data-estado="feito"><span class="bolinha">${icone('check', { tamanho: 13, traco: 3 })}</span><div><b>Avaliação do local</b><small>Pontos e cabeamento confirmados</small></div><em>concluído</em></li>
            <li data-estado="feito"><span class="bolinha">${icone('check', { tamanho: 13, traco: 3 })}</span><div><b>Contrato assinado</b><small>Pela ZapSign</small></div><em>concluído</em></li>
            <li data-estado="agora"><span class="bolinha">${icone('calendar-check', { tamanho: 13 })}</span><div><b>Instalação agendada</b><small>Data e horário combinados</small></div><em>próximo</em></li>
            <li><span class="bolinha">${icone('smartphone', { tamanho: 13 })}</span><div><b>Sistema ativado</b><small>App configurado no seu celular</small></div><em></em></li>
          </ol>
          <div class="cliente-equip">
            <span>${icone('cctv', { tamanho: 15 })} 4 câmeras</span>
            <span>${icone('hard-drive', { tamanho: 15 })} Gravador 4 canais</span>
            <span>${icone('shield-check', { tamanho: 15 })} Manutenção ativa</span>
          </div>
        </div>
        <a class="btn btn-contorno cliente-cta" href="${linkWhatsapp('Olá! Já sou cliente da SC e preciso de suporte.')}" target="_blank" rel="noopener">${icone('headset', { tamanho: 17 })} Já é cliente? Peça suporte</a>
      </div>
    </div>
  </div>
</section>`;
}
