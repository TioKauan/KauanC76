/** Desenhos das plantas de exemplo do configurador (gerados no build). */
import { plantas, LOTE, nomeEm, type AmbienteConfigId } from './configurador-dados';

const rotulo = (x: number, y: number, texto: string, cor = '#6f8aa3', classe = '') =>
  `<text class="planta-rotulo ${classe}" x="${x}" y="${y}" fill="${cor}" text-anchor="middle">${texto}</text>`;

function base(): string {
  return `
    <rect x="0" y="0" width="818" height="540" fill="#040c16"/>
    <rect class="planta-lote" x="${LOTE.x}" y="${LOTE.y}" width="${LOTE.w}" height="${LOTE.h}" rx="6" fill="url(#planta-grama)" stroke="#1d3550" stroke-dasharray="6 6"/>
    <rect x="0" y="482" width="818" height="58" fill="#0a1522"/>
    <path d="M0 511 H818" stroke="#2b3f55" stroke-dasharray="18 14" stroke-width="2"/>
    ${rotulo(409, 531, 'RUA', '#4f6a83')}`;
}

function desenhoCasa(): string {
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

function desenhoComercial(ambiente: AmbienteConfigId): string {
  const n = (i: number) => nomeEm(plantas.comercial.zonas[i]?.nome ?? '', ambiente).toLocaleUpperCase('pt-BR');
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

/** Desenho (SVG) da planta de exemplo de um ambiente. */
export function desenhoPlanta(ambiente: Exclude<AmbienteConfigId, 'condominio'>): string {
  return ambiente === 'casa' ? desenhoCasa() : desenhoComercial(ambiente);
}
