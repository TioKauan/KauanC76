/**
 * Sol simulada: responde como o fluxo "SomosCella - Sol no Site" do n8n, com
 * respostas roteirizadas, para testar a TELA do chat sem gastar IA e sem
 * depender do servidor. Não é a Sol de verdade e não vai para o ar.
 *
 * Uso direto: node scripts/sol-simulado.mjs   (escuta em http://127.0.0.1:8787/sol)
 * Com o site:  node scripts/dev-simulado.mjs  (sobe isto + o astro dev apontando para cá)
 */
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { planos, formatarPreco } from '../src/lib/dados.ts';

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const sem = (s) => s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();

export function responder(corpo) {
  if (corpo.tipo === 'contato') {
    const d = String(corpo.contato?.whatsapp ?? '').replace(/\D/g, '');
    if (d.length < 10) return { status: 400, json: { ok: false, resposta: 'Confira o número do WhatsApp com DDD, por exemplo (46) 99123-4567.' } };
    const primeiro = String(corpo.contato?.nome ?? '').split(' ')[0];
    return { status: 200, json: { ok: true, contato_ok: true, resposta: `Pronto, ${primeiro}! Enquanto a equipe não te chama, posso tirar mais alguma dúvida por aqui.`, cartoes: [], opcoes: [], acoes: [] } };
  }
  const t = sem(String(corpo.mensagem ?? ''));
  const ok = (resposta, extra = {}) => ({ status: 200, json: { ok: true, resposta, cartoes: [], opcoes: [], acoes: [], ...extra } });
  if (/limite/.test(t)) return { status: 429, json: { ok: false, resposta: 'Você mandou muitas mensagens em pouco tempo. Para continuar, fale com a equipe pelo WhatsApp.', acoes: ['whatsapp'] } };
  if (/cliente|boleto|contrato/.test(t)) return ok('Isso o nosso time de atendimento resolve rapidinho pelo WhatsApp.', { acoes: ['whatsapp'] });
  if (/liga|atendente|equipe|pessoa/.test(t)) return ok('Claro! Deixe seu nome e WhatsApp aqui embaixo que a equipe te chama.', { acoes: ['contato'] });
  const n = Number(t.match(/\b([1-9])\b/)?.[1] ?? t.match(/\b(uma|duas|tres|quatro|oito)\b/)?.[1]?.replace(/uma/, '1').replace(/duas/, '2').replace(/tres/, '3').replace(/quatro/, '4').replace(/oito/, '8'));
  if (n) {
    const cameras = n >= 5 && n <= 7 ? 8 : n;
    const p = planos.find((x) => x.cameras === cameras);
    if (!p) return ok('Para mais de 8 câmeras a equipe monta uma proposta sob medida. Quer deixar seu contato?', { acoes: ['contato'] });
    const folga = cameras !== n ? `Para ${n} câmeras, o indicado é o plano de 8. ` : '';
    return ok(`${folga}O plano de ${p.cameras} ${p.cameras > 1 ? 'câmeras' : 'câmera'} sai *R$ ${formatarPreco(p.preco)}* por mês, com instalação e manutenção. Em que cidade fica o imóvel?`, { cartoes: [{ tipo: 'plano', cameras: p.cameras }] });
  }
  if (/quanto|preco|valor|custa/.test(t)) return ok('Depende de quantas câmeras você quer. Quantos pontos você pensa em cobrir?', { opcoes: ['1 câmera', '2 câmeras', '4 câmeras', '8 câmeras'] });
  if (/casa|comercio|loja|galpao/.test(t)) return ok('O que te fez pensar em câmera agora, aconteceu alguma coisa aí?', { opcoes: ['Já tive problema', 'É prevenção'] });
  if (/problema|roub|entraram|furt/.test(t)) return ok('Com câmera no ponto certo você vê pelo celular quem chegou e a gravação fica guardada. Quantas câmeras você imagina?', { opcoes: ['2 câmeras', '4 câmeras', 'Não sei ainda'] });
  if (/cidade|beltrao|pato|dois vizinhos/.test(t)) return ok('Atendemos direto por aí. Seu caso está pronto para a equipe montar o orçamento.', { acoes: ['contato'] });
  return ok('Me conta um pouco mais: a câmera seria para casa ou para comércio?', { opcoes: ['Casa', 'Comércio', 'Outro lugar'] });
}

export function criarServidor() {
  return createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
    let bruto = '';
    for await (const parte of req) bruto += parte;
    let corpo = {};
    try { corpo = JSON.parse(bruto); } catch { /* corpo vazio */ }
    await espera(900 + Math.random() * 700);
    const { status, json } = responder(corpo);
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(json));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  criarServidor().listen(8787, '127.0.0.1', () => console.log('Sol simulada em http://127.0.0.1:8787/sol'));
}
