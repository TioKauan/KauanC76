/**
 * Cobertura das câmeras do condomínio: a regra comum (src/lib/maquete/cobertura.ts) aplicada à
 * maquete do condomínio. Mantém os nomes de antes para quem já usa.
 */
import { criarCobertura, direcao } from '../maquete/cobertura';
import { MAQUETE_CONDOMINIO } from './maquete';

export { direcao };
export const cobertura = criarCobertura(MAQUETE_CONDOMINIO);
export const { obstaculos: OBSTACULOS, alcanceNaDirecao, campoDeVisao, cameraVe, quemVe, pontoCego, fracaoVista } = cobertura;
