/**
 * Roteiro das páginas de Casa, Comércio e Empresa: as camadas e o que cada capítulo mostra.
 * Os textos ficam em dados.ts (paginasAmbiente); aqui só o enquadramento e o que acende.
 */
import type { Camada, Capitulo, Vista } from '../maquete/tipos';
import { camerasDoPlano } from './plano';
import type { AmbienteMaquete } from './maquetes';

export type CamadaAmbiente = 'cameras' | 'cabos' | 'rede' | 'energia' | 'alarme' | 'acesso';
export type CapituloAmbiente = 'abertura' | 'cameras' | 'plano' | 'rede' | 'ese' | 'alarme';
export type CapituloDeAmbiente = Capitulo<CapituloAmbiente, CamadaAmbiente>;

const TODAS: readonly Camada<CamadaAmbiente>[] = [
  { id: 'cameras', curto: 'Câmeras', nome: 'Câmeras', icone: 'cctv', cor: '#6de9f6' },
  { id: 'cabos', curto: 'Cabos', nome: 'Cabos até o gravador', icone: 'cable', cor: '#8fd9e8' },
  { id: 'rede', curto: 'Rede e Wi-Fi', nome: 'Rede e Wi-Fi', icone: 'wifi', cor: '#09a0f6' },
  { id: 'energia', curto: 'Nobreak', nome: 'Nobreak', icone: 'battery-charging', cor: '#ff6a00' },
  { id: 'alarme', curto: 'Alarme', nome: 'Alarme monitorado pelo app', icone: 'bell-ring', cor: '#ffc233' },
  { id: 'acesso', curto: 'Acesso', nome: 'Acesso', icone: 'scan-face', cor: '#3be38a', botao: false },
];

/** Camadas de cada página (a casa não tem a de rede: redes gerenciadas são para comércio e empresa). */
export function camadasDe(a: AmbienteMaquete): readonly Camada<CamadaAmbiente>[] {
  return TODAS.filter((c) => a !== 'casa' || c.id !== 'rede');
}

const v = (alvo: Vista['alvo'], raio: number, azimute: number, elevacao: number, deslocar = 0.14): Vista => ({ alvo, raio, azimute, elevacao, deslocar });

export function capitulosDe(a: AmbienteMaquete): readonly CapituloDeAmbiente[] {
  const casa = a === 'casa';
  const padrao = camerasDoPlano(a, 4);
  const r = casa ? 1.32 : 1.45;
  const lista: CapituloDeAmbiente[] = [
    {
      id: 'abertura',
      vista: v([1, 0.5, 1.5], 84 * r, 30, 44, 0.1),
      vistaCelular: v([0, 0.5, 2], 80 * r, 30, 48, 0),
      camadas: ['cameras'],
      instaladas: padrao,
      monitor: padrao.slice(0, 4),
      // A página abre com o telhado no lugar; quando a maquete 3D chega, ele sobe e mostra os cômodos.
      telhado: false,
      zonas: true,
    },
    {
      id: 'cameras',
      vista: v([1, 0, 0.5], 72 * r, 18, 60, 0.16),
      vistaCelular: v([0, 0, 1], 74 * r, 18, 62, 0),
      camadas: ['cameras'],
      pontosCegos: true,
      numeros: true,
      telhado: false,
      selecionada: 2,
      monitor: [2],
    },
    {
      id: 'plano',
      vista: v([1, 0, 1], 74 * r, 34, 54, 0.16),
      vistaCelular: v([0, 0, 1.5], 75 * r, 30, 58, 0),
      camadas: ['cameras', 'cabos'],
      instaladas: padrao,
      pontosCegos: true,
      numeros: true,
      telhado: false,
      monitor: padrao.slice(0, 4),
    },
  ];
  if (!casa) {
    lista.push({
      id: 'rede',
      vista: v([0, 1, -0.5], 70 * r, 40, 56, 0.16),
      vistaCelular: v([0, 1, 0], 74 * r, 36, 60, 0),
      camadas: ['rede', 'cameras'],
      realce: 'rede',
      instaladas: padrao,
      telhado: false,
      monitor: [2, 4],
    });
  }
  lista.push(
    {
      id: 'ese',
      vista: v([1, 1, 1.5], 80 * r, 40, 42, 0.14),
      vistaCelular: v([0, 1, 2.5], 80 * r, 38, 46, 0),
      camadas: ['cameras', 'energia'],
      realce: 'energia',
      instaladas: padrao,
      telhado: false,
      ese: true,
      monitor: [1, padrao[1] ?? 2],
    },
    {
      id: 'alarme',
      vista: v([1, 1, 0.5], 76 * r, 46, 50, 0.15),
      vistaCelular: v([0, 1, 1], 77 * r, 42, 56, 0),
      camadas: ['alarme', 'cameras'],
      realce: 'alarme',
      instaladas: padrao,
      telhado: false,
      monitor: [1, padrao[2] ?? 3],
    },
  );
  lista.forEach((c, i) => { if (i > 0) c.numero = i; });
  return lista;
}
