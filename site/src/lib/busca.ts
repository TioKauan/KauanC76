/**
 * Busca nas dúvidas frequentes: sem acento, ignorando palavras vazias e com sinônimos
 * do jeito que as pessoas perguntam. Sem nada de tela: testada em tests/busca.test.ts.
 */
import type { Duvida } from './dados';

// Palavras que as pessoas usam × palavras das respostas.
const sinonimos: Record<string, string[]> = {
  app: ['celular', 'aplicativo'], aplicativo: ['celular'], telefone: ['celular'], remoto: ['celular'], ver: ['celular'],
  comprar: ['equipamentos', 'locacao'], dono: ['propriedade', 'equipamentos'],
  multa: ['cancelar', 'cancelamento'], sair: ['cancelar', 'cancelamento'], desistir: ['cancelar', 'cancelamento'], fidelidade: ['prazo', 'cancelar'], contrato: ['prazo', 'cancelar'],
  quebrar: ['manutencao', 'defeitos'], quebrou: ['manutencao', 'defeitos'], estragar: ['manutencao', 'defeitos'], conserto: ['manutencao'], garantia: ['manutencao', 'defeitos'],
  gravacao: ['gravados', 'dias'], grava: ['gravados', 'dias'], hd: ['gravados', 'dias'], tempo: ['dias'],
  instalar: ['instalacao'], instala: ['instalacao'], cabo: ['instalacao', 'cabeamento'], fio: ['instalacao', 'cabeamento'],
  noite: ['premium', 'colorida'], noturna: ['premium', 'colorida'], visao: ['premium'], audio: ['premium'], colorida: ['premium'], melhor: ['premium'], upgrade: ['premium'],
};
const ignorar = new Set(['a', 'o', 'e', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'um', 'uma', 'eu', 'voce', 'voces', 'posso', 'pode', 'como', 'que', 'as', 'os', 'se', 'para', 'pra', 'com', 'meu', 'minha', 'tem', 'ter', 'sim', 'nao', 'qual', 'quanto', 'quantos']);
// Perguntas de preço vão para a seção de planos (não há dúvida frequente sobre valores).
const palavrasPreco = /\b(preco|precos|valor|valores|custa|custo|mensalidade|barato|caro)\b|\bquanto (e|fica|sai|pago|pagaria|vou pagar)\b/;

export const normalizar = (texto: string): string =>
  texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ');

export type ResultadoBusca =
  | { tipo: 'vazia' }
  | { tipo: 'preco' }
  /** mostrar: índices das dúvidas que aparecem; abrir: índices das melhores (ficam abertas). */
  | { tipo: 'resultado'; mostrar: number[]; abrir: number[] };

export function buscarDuvidas(consulta: string, duvidas: Duvida[]): ResultadoBusca {
  const normal = normalizar(consulta.trim());
  const palavras = normal.split(/\s+/).filter((w) => w.length > 1 && !ignorar.has(w));
  if (palavrasPreco.test(normal)) return { tipo: 'preco' };
  if (!palavras.length) return { tipo: 'vazia' };

  // Comparação pelo radical (sem a última letra) para "cancelar" achar "cancelamento" e vice-versa.
  const radical = (g: string) => (g.length > 4 ? g.slice(0, -1) : g);
  const grupos = palavras.map((w) => [w, ...(sinonimos[w] ?? [])].map(radical));
  const textos = duvidas.map((d) => {
    const titulo = normalizar(d.pergunta);
    return { titulo, tudo: `${titulo} ${normalizar(d.resposta)}` };
  });
  // Palavra que aparece em muitas dúvidas (ex.: "câmera") pesa menos que uma específica (ex.: "quebrou").
  const peso = grupos.map((g) => 1 / Math.max(1, textos.filter((t) => g.some((x) => t.tudo.includes(x))).length));
  const notas = textos.map((t) =>
    grupos.reduce((soma, g, i) => soma + (peso[i] ?? 0) * (g.some((x) => t.titulo.includes(x)) ? 3 : g.some((x) => t.tudo.includes(x)) ? 1 : 0), 0),
  );
  const melhor = Math.max(0, ...notas);
  if (!melhor) return { tipo: 'resultado', mostrar: [], abrir: [] };
  const corte = melhor * 0.5;
  const mostrar = notas.flatMap((n, i) => (n >= corte ? [i] : []));
  const abrir = notas.flatMap((n, i) => (n === melhor ? [i] : []));
  return { tipo: 'resultado', mostrar, abrir };
}
