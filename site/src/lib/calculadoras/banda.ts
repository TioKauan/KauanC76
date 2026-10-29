/**
 * Banda de rede das câmeras.
 * Total = soma das taxas das câmeras, mais uma folga de protocolo (cabeçalhos, retransmissão).
 * Um enlace (porta ou uplink) deve ficar abaixo de 70 % da velocidade nominal em uso contínuo.
 * Visualização remota (celular fora da rede local): cada tela aberta puxa um fluxo secundário, e o
 * que limita é a velocidade de ENVIO (upload) da internet do local, não a de download.
 */
export interface EntradaBanda {
  cameras: number;
  mbps: number;
  /** Folga de protocolo (0,2 = 20 %). */
  folga: number;
  /** Telas vendo câmeras ao mesmo tempo, de fora da rede local. */
  acessosRemotos: number;
  /** Mbps do fluxo secundário (o que o celular recebe). */
  mbpsSecundario: number;
}

export const ENLACES_MBPS = [100, 1000, 2500, 10000] as const;
export const USO_MAXIMO_ENLACE = 0.7;

export interface ResultadoBanda {
  gravacaoMbps: number;
  gravacaoComFolgaMbps: number;
  /** Menor enlace comum que atende o total, ou null acima de 10 Gbps. */
  enlaceMbps: number | null;
  /** A taxa de uma câmera cabe numa porta de 100 Mbps? */
  portaDeCameraOk: boolean;
  uploadRemotoMbps: number;
}

export function calcularBanda(e: EntradaBanda): ResultadoBanda {
  const gravacaoMbps = e.cameras * e.mbps;
  const gravacaoComFolgaMbps = gravacaoMbps * (1 + e.folga);
  const enlaceMbps = ENLACES_MBPS.find((n) => n * USO_MAXIMO_ENLACE >= gravacaoComFolgaMbps - 1e-9) ?? null;
  return {
    gravacaoMbps,
    gravacaoComFolgaMbps,
    enlaceMbps,
    portaDeCameraOk: e.mbps * (1 + e.folga) <= 100 * USO_MAXIMO_ENLACE,
    uploadRemotoMbps: e.acessosRemotos * e.mbpsSecundario * (1 + e.folga),
  };
}
