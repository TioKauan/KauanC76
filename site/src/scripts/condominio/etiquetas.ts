/** Etiquetas da maquete do condomínio em cada capítulo (os textos vêm de cenarios.ts, como na inicial). */
import { estadoCena } from '../../lib/cenarios';
import { CAMADAS, type CamadaId } from '../../lib/condominio/capitulos';
import { CAMERAS, INTERFONIA, LOTE, NOBREAK, PONTOS_WIFI, RACK, VISITANTE } from '../../lib/condominio/maquete';
import type { EstadoMaquete, Etiqueta } from '../maquete/estado';

const cor = (id: CamadaId) => CAMADAS.find((c) => c.id === id)!.cor;

export function etiquetasCondominio(e: EstadoMaquete, { celular, noite }: { celular: boolean; noite: boolean }): Etiqueta[] {
  const cap = e.capitulo.id;
  const lista: Etiqueta[] = [];
  const visita = estadoCena('condominio', 'visita', false);
  if (cap === 'acesso' || (cap === 'energia' && e.situacao === 'visita')) {
    lista.push({ pos: [VISITANTE[0] - 1.4, 3.4, VISITANTE[1] + 1.1], cor: '#ffb070', icone: 'user-check', titulo: 'Visitante no portão', sub: visita.textos.acesso });
  }
  if (cap === 'interfonia') lista.push({ pos: [-12, 11, 5], cor: cor('interfonia'), icone: 'phone', titulo: 'Interfonia', sub: `Portaria chamando o ${INTERFONIA.blocos[0]!.bloco}` });
  if (cap === 'rede') {
    lista.push({ pos: [RACK[0], 3, RACK[1]], cor: cor('rede'), icone: 'router', titulo: 'Quadro técnico', sub: 'Gravador e rede' });
    if (!celular) lista.push({ pos: [PONTOS_WIFI[0]![0], 5.4, PONTOS_WIFI[0]![1]], cor: '#9ff3ff', icone: 'wifi', titulo: 'Wi-Fi', sub: 'Áreas comuns' });
  }
  if (cap === 'energia') {
    const s = estadoCena('condominio', e.situacao, e.nobreak);
    if (e.situacao === 'energia') lista.push({ pos: [NOBREAK[0], 3, NOBREAK[1]], cor: cor('energia'), icone: 'battery-charging', titulo: s.textos.energia, sub: 'Quadro técnico' });
    const fundo = CAMERAS.find((c) => c.id === 6)!;
    if (noite && e.nobreak && !celular) lista.push({ pos: [fundo.x - 3, fundo.y + 2, fundo.z + 2], cor: cor('cameras'), icone: 'cctv', titulo: 'Câmeras gravando', sub: s.textos.cameras });
    if (e.situacao === 'internet') lista.push({ pos: [RACK[0], 3, RACK[1]], cor: cor('rede'), icone: 'wifi-off', titulo: s.textos.internet, sub: 'Gravação continua' });
  }
  if (cap === 'alarme') lista.push({ pos: [LOTE.x0 + 6, 4.5, LOTE.z0], cor: cor('alarme'), icone: 'bell-ring', titulo: 'Alarme', sub: 'Avisos no aplicativo' });
  return lista;
}
