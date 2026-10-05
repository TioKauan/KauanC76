/** Etiquetas da maquete de Casa, Comércio e Empresa (textos do "E se…?" vêm de cenarios.ts, como na inicial). */
import { estadoCena } from '../../lib/cenarios';
import { MAQUETES, type AmbienteMaquete } from '../../lib/ambientes/maquetes';
import { camadasDe } from '../../lib/ambientes/capitulos';
import { resumoPlano, opcoesDePlano } from '../../lib/ambientes/plano';
import type { ElementoCamada, Ponto2, Ponto3 } from '../../lib/maquete/tipos';
import type { EstadoMaquete, Etiqueta } from '../maquete/estado';

export function etiquetasAmbiente(a: AmbienteMaquete) {
  const m = MAQUETES[a];
  const cor = (id: string) => camadasDe(a).find((c) => c.id === id)?.cor ?? '#6de9f6';
  const achar = <T extends ElementoCamada['tipo']>(camada: string, tipo: T) =>
    m.camadas[camada]?.find((e): e is Extract<ElementoCamada, { tipo: T }> => e.tipo === tipo);
  const no = (p: Ponto2, y: number): Ponto3 => [p[0], y, p[1]];
  const rack = achar('cabos', 'rack')?.pos ?? [0, 0];
  const nobreak = achar('energia', 'nobreak')?.pos ?? rack;
  const wifi = achar('rede', 'wifi')?.pos;
  const visitante = m.pessoas.find((p) => p.papel === 'visitante');
  const sensores = (m.camadas.alarme ?? []).filter((e) => e.tipo === 'sensor');
  const sensor = sensores.at(-1);
  const alto = a === 'casa' ? 3.4 : 4.6;

  return (e: EstadoMaquete, { celular }: { celular: boolean; noite: boolean }): Etiqueta[] => {
    const cap = e.capitulo.id;
    const lista: Etiqueta[] = [];
    if (cap === 'plano' && !celular && e.instaladas && opcoesDePlano.includes(e.instaladas.length)) {
      const r = resumoPlano(a, e.instaladas.length);
      lista.push({ pos: no(rack, alto), cor: cor('cabos'), icone: 'hard-drive', titulo: r.plano.gravador, sub: `Cabo ≈ ${r.caboEstimado} m até as câmeras` });
    }
    if (cap === 'rede' && wifi) {
      lista.push({ pos: no(rack, alto), cor: cor('rede'), icone: 'router', titulo: 'Rack', sub: 'Câmeras, rede e gravador' });
      if (!celular) lista.push({ pos: no(wifi, alto + 0.6), cor: '#9ff3ff', icone: 'wifi', titulo: 'Wi-Fi', sub: a === 'comercio' ? 'Equipe e clientes' : 'Equipe e visitantes' });
    }
    if (cap === 'ese') {
      const s = estadoCena(a, e.situacao, e.nobreak);
      if (e.situacao === 'energia') lista.push({ pos: no(nobreak, alto), cor: cor('energia'), icone: 'battery-charging', titulo: s.textos.energia, sub: 'Gravador e câmeras' });
      if (e.situacao === 'internet') lista.push({ pos: no(rack, alto), cor: cor('cabos'), icone: 'wifi-off', titulo: s.textos.internet, sub: 'Gravação continua' });
      if (e.situacao === 'visita' && visitante) lista.push({ pos: [visitante.x, 3, visitante.z + 0.8], cor: '#ffb070', icone: 'user-check', titulo: 'Chegou visita', sub: s.textos.acesso });
    }
    if (cap === 'alarme' && sensor && sensor.tipo === 'sensor') lista.push({ pos: [sensor.pos[0], sensor.pos[1] + 1.4, sensor.pos[2]], cor: cor('alarme'), icone: 'bell-ring', titulo: 'Alarme', sub: 'Avisos no aplicativo' });
    return lista;
  };
}
