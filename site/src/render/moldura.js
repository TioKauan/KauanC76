import { icone } from './icones.js';
import { contato, empresa, linkWhatsapp, menorPreco, formatarPreco, mostrarPrecos } from '../dados.js';

export const links = [
  { href: '#inicio', rotulo: 'Início' },
  { href: '#planos', rotulo: 'Planos' },
  { href: '#monte', rotulo: 'Monte seu sistema' },
  { href: '#como-funciona', rotulo: 'Como funciona' },
  { href: '#duvidas', rotulo: 'Dúvidas' },
];

const msgGeral = 'Olá! Vim pelo site e gostaria de falar com a SC sobre o meu ambiente.';

export function logo(classe = '') {
  return `<span class="logo ${classe}"><img src="/marca/sc-logo.webp" width="1536" height="1024" alt="SC Soluções" decoding="async" /></span>`;
}

export function cabecalho() {
  return `
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<div class="progresso-leitura" aria-hidden="true"></div>
<header class="cabecalho">
  <div class="wrap cabecalho-linha">
    <a href="#inicio" class="logo-link" aria-label="SC Soluções, voltar ao início">${logo()}</a>
    <nav class="nav" aria-label="Navegação principal">
      ${links.map((l) => `<a href="${l.href}">${l.rotulo}</a>`).join('')}
    </nav>
    <a class="btn btn-contorno btn-p cabecalho-cta" href="${linkWhatsapp(msgGeral)}" target="_blank" rel="noopener">Fale com a SC ${icone('arrow-up-right', { tamanho: 16 })}</a>
    <button class="menu-botao" type="button" aria-expanded="false" aria-controls="menu-celular" aria-label="Abrir menu">${icone('menu', { tamanho: 22, classe: 'ic-abrir' })}${icone('x', { tamanho: 22, classe: 'ic-fechar' })}</button>
  </div>
  <div class="menu-celular" id="menu-celular" hidden>
    <nav aria-label="Navegação no celular">
      ${links.map((l, i) => `<a href="${l.href}"><span>0${i + 1}</span>${l.rotulo}${icone('arrow-right', { tamanho: 18 })}</a>`).join('')}
    </nav>
    <a class="btn btn-primario" href="${linkWhatsapp(msgGeral)}" target="_blank" rel="noopener">${icone('message-circle', { tamanho: 18 })} Fale com a SC pelo WhatsApp</a>
    <p class="menu-nota">${contato.atendimento} · ${empresa.regiao}</p>
  </div>
</header>`;
}

export function contatoFinal() {
  return `
<section class="contato-final" id="contato" aria-labelledby="contato-titulo">
  <div class="wrap contato-caixa" data-revelar>
    <div>
      <p class="sobretitulo">Fale com a SC</p>
      <h2 id="contato-titulo">Vamos fazer a tecnologia <span class="destaque">funcionar para você?</span></h2>
      <p class="contato-texto">Conte o que você precisa proteger, conectar ou organizar. A SC entende o seu ambiente e indica o próximo passo.</p>
    </div>
    <div class="contato-acoes">
      <a class="btn btn-primario btn-g" href="${linkWhatsapp(msgGeral)}" target="_blank" rel="noopener">${icone('message-circle', { tamanho: 20 })} Conversar pelo WhatsApp</a>
      <dl class="contato-dados">
        <div><dt>WhatsApp</dt><dd>${contato.whatsappExibicao}</dd></div>
        <div><dt>Atendimento</dt><dd>${empresa.regiao}</dd></div>
      </dl>
      <p class="contato-nota">${icone('users', { tamanho: 16 })} ${contato.atendimento}. Se preferir, monte seu sistema antes e a mensagem já vai pronta.</p>
    </div>
  </div>
</section>`;
}

export function rodape() {
  return `
<footer class="rodape">
  <div class="wrap rodape-linha">
    <a href="#inicio" class="logo-link" aria-label="SC Soluções, voltar ao início">${logo('logo-g')}</a>
    <p class="rodape-desc">Soluções em<br />Segurança e Tecnologia</p>
    <nav class="rodape-nav" aria-label="Rodapé">
      ${links.slice(1).map((l) => `<a href="${l.href}">${l.rotulo}</a>`).join('')}
    </nav>
    <a class="voltar-topo" href="#inicio">Voltar ao início ${icone('arrow-up', { tamanho: 16 })}</a>
  </div>
  <div class="wrap rodape-base">
    <span>© ${new Date().getFullYear()} ${empresa.nome} · somoscella.online</span>
    <span>Segurança · Redes · Acesso · Energia</span>
  </div>
</footer>`;
}

export function barraFixa() {
  const preco = mostrarPrecos ? `A partir de R$ ${formatarPreco(menorPreco)}/mês` : 'Planos de locação de câmeras';
  return `
<div class="barra-fixa" data-modo="contato" aria-live="polite">
  <div class="barra-texto"><b data-barra-titulo>Fale com a SC</b><span data-barra-sub>${preco}</span></div>
  <a class="btn btn-primario btn-p" data-barra-link href="${linkWhatsapp(msgGeral)}" target="_blank" rel="noopener"><span data-barra-acao>Conversar</span> ${icone('arrow-up-right', { tamanho: 15, traco: 2.2 })}</a>
</div>`;
}
