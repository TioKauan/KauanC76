import { describe, expect, it } from 'vitest';
import {
  lerResposta, trechos, textoParaFala, frasesParaFala, mascaraWhatsapp, validarWhatsapp, acharTelefone,
  validarNome, novaSessao, lerEstado, estadoNovo, planoDoCartao, linkWhatsappChat, saudacao, sugestoesIniciais,
  MAX_HISTORICO, SOL_URL,
} from '../src/lib/sol';
import { contato, planos } from '../src/lib/dados';

describe('resposta da Sol (servidor não é confiável)', () => {
  it('lê a resposta completa', () => {
    const r = lerResposta({ ok: true, resposta: 'O plano de 4 câmeras sai R$ 99,90 por mês.', cartoes: [{ tipo: 'plano', cameras: 4 }], opcoes: ['Quero esse', 'Tem desconto?'], acoes: ['contato'] });
    expect(r).toEqual({ ok: true, resposta: 'O plano de 4 câmeras sai R$ 99,90 por mês.', cartoes: [4], opcoes: ['Quero esse', 'Tem desconto?'], acoes: ['contato'], contatoOk: false });
  });

  it('descarta plano que não existe, ação desconhecida e opções demais', () => {
    const r = lerResposta({ ok: true, resposta: 'x', cartoes: [{ cameras: 7 }, { cameras: 8 }, { cameras: 8 }], opcoes: ['a', 'b', 'c', 'd', 'e', 3], acoes: ['contato', 'apagar', 'whatsapp'] });
    expect(r.cartoes).toEqual([8]);
    expect(r.opcoes).toEqual(['a', 'b', 'c', 'd']);
    expect(r.acoes).toEqual(['contato', 'whatsapp']);
  });

  it('lixo vira resposta não ok, sem quebrar', () => {
    for (const lixo of [null, undefined, 'texto', 42, [], { ok: true }, { ok: true, resposta: '   ' }]) {
      const r = lerResposta(lixo);
      expect(r.ok).toBe(false);
      expect(r.cartoes).toEqual([]);
    }
  });

  it('cartão do plano usa os dados do site', () => {
    expect(planoDoCartao(4)?.preco).toBe(planos.find((p) => p.cameras === 4)?.preco);
    expect(planoDoCartao(5)).toBeUndefined();
  });
});

describe('texto na tela e na voz', () => {
  it('*negrito* vira trecho em negrito, e nada vira HTML', () => {
    expect(trechos('Sai *R$ 99,90* por mês.\n<b>oi</b>')).toEqual([
      [{ texto: 'Sai ', negrito: false }, { texto: 'R$ 99,90', negrito: true }, { texto: ' por mês.', negrito: false }],
      [{ texto: '<b>oi</b>', negrito: false }],
    ]);
  });

  it('valores e unidades são falados como gente fala', () => {
    expect(textoParaFala('O plano sai *R$ 99,90*/mês, com até 80 m de cabo.')).toBe('O plano sai 99 reais e 90 centavos por mês, com até 80 metros de cabo.');
    expect(textoParaFala('A instalação é R$ 159,90.')).toBe('A instalação é 159 reais e 90 centavos.');
    expect(textoParaFala('Aqui é a SC Soluções.')).toBe('Aqui é a S C Soluções.');
  });

  it('fala longa é dividida em frases', () => {
    const partes = frasesParaFala('Primeira frase curta. Segunda frase. ' + 'Palavra '.repeat(40) + 'fim.', 60);
    expect(partes.length).toBeGreaterThan(1);
    expect(partes[0]).toBe('Primeira frase curta. Segunda frase.');
  });
});

describe('WhatsApp do cartão de contato', () => {
  it('máscara enquanto digita', () => {
    expect(mascaraWhatsapp('4')).toBe('(4');
    expect(mascaraWhatsapp('4699')).toBe('(46) 99');
    expect(mascaraWhatsapp('46991234567')).toBe('(46) 99123-4567');
    expect(mascaraWhatsapp('4635231234')).toBe('(46) 3523-1234');
    expect(mascaraWhatsapp('+55 46 99123-4567')).toBe('(46) 99123-4567');
  });

  it('aceita celular e fixo com DDD, recusa o resto (mesmas regras do banco)', () => {
    expect(validarWhatsapp('(46) 99123-4567')).toEqual({ ok: true, digitos: '46991234567' });
    expect(validarWhatsapp('+55 46 99123-4567').ok).toBe(true);
    expect(validarWhatsapp('46 3523-1234').ok).toBe(true);
    for (const ruim of ['', '123', '(00) 99123-4567', '(46) 99999-9999', '(46) 09123-4567', '(46) 89123-4567', '469912345678901']) {
      expect(validarWhatsapp(ruim).ok, ruim).toBe(false);
    }
  });

  it('acha telefone escrito no meio da conversa', () => {
    expect(acharTelefone('pode me chamar no 46 99123-4567 à tarde')).toBe('46991234567');
    expect(acharTelefone('(46)991234567')).toBe('46991234567');
    expect(acharTelefone('quero 4 câmeras, R$ 99,90')).toBeNull();
  });

  it('nome com pelo menos 2 letras', () => {
    expect(validarNome('  Ana   Maria ')).toBe('Ana Maria');
    expect(validarNome('A')).toBeNull();
  });
});

describe('sessão e conversa guardadas', () => {
  it('sessão nova é um UUID v4', () => {
    expect(novaSessao()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(novaSessao()).not.toBe(novaSessao());
  });

  it('guardado estranho vira conversa nova', () => {
    for (const bruto of [null, '', '{', '"x"', '{"sessao":"abc"}', '[]']) {
      const e = lerEstado(bruto);
      expect(e.historico).toEqual([]);
      expect(e.sessao).toMatch(/^[0-9a-f-]{36}$/);
    }
  });

  it('guarda só o que é válido e no máximo o limite de mensagens', () => {
    const base = estadoNovo();
    const historico = Array.from({ length: MAX_HISTORICO + 5 }, (_, i) => ({ de: i % 2 ? 'sol' : 'eu', texto: `m${i}` }));
    const e = lerEstado(JSON.stringify({ ...base, voz: true, historico: [...historico, { de: 'hacker', texto: 'x' }, { de: 'sol', texto: 'ok', cartoes: [4, 7], acoes: ['contato', 'x'] }] }));
    expect(e.sessao).toBe(base.sessao);
    expect(e.voz).toBe(true);
    expect(e.historico).toHaveLength(MAX_HISTORICO);
    expect(e.historico.at(-1)).toEqual({ de: 'sol', texto: 'ok', cartoes: [4], acoes: ['contato'] });
  });
});

describe('textos fixos do chat', () => {
  it('saudação se apresenta como assistente virtual e há sugestões', () => {
    expect(saudacao).toMatch(/assistente virtual/);
    expect(sugestoesIniciais.length).toBeGreaterThanOrEqual(3);
  });

  it('botão do WhatsApp do chat usa o número do site com mensagem preenchida', () => {
    const link = new URL(linkWhatsappChat());
    expect(link.pathname).toBe(`/${contato.whatsapp}`);
    expect((link.searchParams.get('text') ?? '').length).toBeGreaterThanOrEqual(20);
  });

  it('o chat fala com o n8n por HTTPS', () => {
    expect(SOL_URL).toMatch(/^https:\/\/n8n\.somoscella\.online\/webhook\/sol-site$/);
  });
});
