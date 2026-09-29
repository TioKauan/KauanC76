import { describe, expect, it } from 'vitest';
import {
  lerResposta, lerRespostaLead, trechos, mascaraWhatsapp, validarWhatsapp, validarNome, validarCidade,
  novaSessao, lerEstado, estadoNovo, capturaNova, planoDoCartao, linkWhatsappChat, saudacao,
  pergunta, retomar, responderEtapa, primeiraMensagem, primeiroNome, INTERESSES, CAMPO,
  MAX_HISTORICO, SOL_URL, pedeWhatsapp, respostaPedeWhatsapp, mensagemQueroPlano, type Captura,
} from '../src/lib/sol';
import { contato, planos } from '../src/lib/dados';

describe('resposta da Sol (servidor não é confiável)', () => {
  it('lê a resposta completa', () => {
    const r = lerResposta({ ok: true, resposta: 'O plano de 4 câmeras sai R$ 99,90 por mês.', cartoes: [{ tipo: 'plano', cameras: 4 }], opcoes: ['Quero este plano', 'Tenho uma dúvida'], acoes: ['whatsapp'], modo: 'conversa' });
    expect(r).toEqual({ ok: true, resposta: 'O plano de 4 câmeras sai R$ 99,90 por mês.', cartoes: [4], opcoes: ['Quero este plano', 'Tenho uma dúvida'], acoes: ['whatsapp'], contratar: false, semLead: false });
  });

  it('descarta plano que não existe, ação desconhecida e opções demais', () => {
    const r = lerResposta({ ok: true, resposta: 'x', cartoes: [{ cameras: 7 }, { cameras: 8 }, { cameras: 8 }], opcoes: ['a', 'b', 'c', 'd', 'e', 'f', 3], acoes: ['contato', 'apagar', 'whatsapp'] });
    expect(r.cartoes).toEqual([8]);
    expect(r.opcoes).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(r.acoes).toEqual(['whatsapp']);
  });

  it('lixo vira resposta não ok, sem quebrar', () => {
    for (const lixo of [null, undefined, 'texto', 42, [], { ok: true }, { ok: true, resposta: '   ' }]) {
      const r = lerResposta(lixo);
      expect(r.ok).toBe(false);
      expect(r.cartoes).toEqual([]);
      expect(r.contratar).toBe(false);
    }
  });

  it('"quero contratar" só vale com resposta boa', () => {
    expect(lerResposta({ ok: true, resposta: 'A equipe vai te chamar.', modo: 'contratar' }).contratar).toBe(true);
    expect(lerResposta({ ok: false, resposta: 'x', modo: 'contratar' }).contratar).toBe(false);
  });

  it('sem lead no servidor só com 403 e o motivo certo', () => {
    expect(lerResposta({ ok: false, motivo: 'sem_lead', resposta: 'x' }, 403).semLead).toBe(true);
    expect(lerResposta({ ok: false, motivo: 'sem_lead' }, 429).semLead).toBe(false);
    expect(lerResposta(null, 403).semLead).toBe(false);
  });

  it('resposta do envio do lead', () => {
    expect(lerRespostaLead({ ok: true, lead_ok: true })).toEqual({ ok: true, erro: '' });
    expect(lerRespostaLead({ ok: false, resposta: 'Confira o número do WhatsApp com DDD.' })).toEqual({ ok: false, erro: 'Confira o número do WhatsApp com DDD.' });
    expect(lerRespostaLead({ ok: true })).toEqual({ ok: false, erro: '' });
    expect(lerRespostaLead(null).ok).toBe(false);
  });

  it('cartão do plano usa os dados do site', () => {
    expect(planoDoCartao(4)?.preco).toBe(planos.find((p) => p.cameras === 4)?.preco);
    expect(planoDoCartao(5)).toBeUndefined();
  });
});

describe('texto na tela', () => {
  it('*negrito* vira trecho em negrito, e nada vira HTML', () => {
    expect(trechos('Sai *R$ 99,90* por mês.\n<b>oi</b>')).toEqual([
      [{ texto: 'Sai ', negrito: false }, { texto: 'R$ 99,90', negrito: true }, { texto: ' por mês.', negrito: false }],
      [{ texto: '<b>oi</b>', negrito: false }],
    ]);
  });
});

describe('roteiro de captura (nome, WhatsApp, cidade e o que procura)', () => {
  const inicio = capturaNova();
  const passo = (c: Captura, texto: string): Captura => {
    const r = responderEtapa(c, texto);
    if (!r.ok) throw new Error(r.erro);
    return r.captura;
  };

  it('começa pelo nome, que a saudação já pede', () => {
    expect(inicio.etapa).toBe('nome');
    expect(saudacao).toMatch(/assistente virtual/);
    expect(saudacao).toMatch(/como posso te chamar\?$/);
    expect(pergunta('nome')).toBe(saudacao);
  });

  it('segue a ordem e mostra o WhatsApp com máscara no balão da pessoa', () => {
    const r1 = responderEtapa(inicio, '  Ana   Paula ');
    expect(r1).toEqual({ ok: true, mostrar: 'Ana Paula', captura: { ...inicio, nome: 'Ana Paula', etapa: 'whatsapp' } });
    expect(pergunta('whatsapp', 'Ana Paula')).toMatch(/^Prazer, Ana!/);
    const c1 = passo(inicio, 'Ana Paula');
    const r2 = responderEtapa(c1, '46991234567');
    expect(r2.ok && r2.mostrar).toBe('(46) 99123-4567');
    const c2 = passo(c1, '46991234567');
    expect(c2).toMatchObject({ whatsapp: '46991234567', etapa: 'cidade' });
    const c3 = passo(c2, 'Francisco Beltrão');
    expect(c3).toMatchObject({ cidade: 'Francisco Beltrão', etapa: 'interesse', interesse: '' });
    const c4 = passo(c3, 'Câmeras');
    expect(c4).toMatchObject({ interesse: 'Câmeras', etapa: 'interesse' }); // "pronto" só quando o servidor confirmar
  });

  it('recusa dado ruim sem avançar', () => {
    expect(responderEtapa(inicio, 'A')).toEqual({ ok: false, erro: 'Me diga seu nome, por favor.' });
    expect(responderEtapa(inicio, '123')).toMatchObject({ ok: false });
    const noWhats: Captura = { ...inicio, nome: 'Ana', etapa: 'whatsapp' };
    expect(responderEtapa(noWhats, '46 99999-9999')).toMatchObject({ ok: false, erro: expect.stringMatching(/Confira o número/) });
    const naCidade: Captura = { ...noWhats, whatsapp: '46991234567', etapa: 'cidade' };
    expect(responderEtapa(naCidade, '8')).toEqual({ ok: false, erro: 'Me diga a sua cidade, por favor.' });
  });

  it('"Outro" pede para a pessoa escrever, e o texto dela vira o interesse', () => {
    const c3: Captura = { etapa: 'interesse', nome: 'Ana', whatsapp: '46991234567', cidade: 'Pato Branco', interesse: '' };
    const outro = passo(c3, 'Outro');
    expect(outro).toMatchObject({ etapa: 'outro', interesse: '' });
    expect(pergunta('outro')).toMatch(/poucas palavras/);
    expect(passo(outro, 'cerca elétrica na chácara')).toMatchObject({ interesse: 'cerca elétrica na chácara' });
    expect(responderEtapa(outro, 'x')).toMatchObject({ ok: false });
  });

  it('a primeira mensagem para a Sol conta o que a pessoa procura', () => {
    expect(INTERESSES).toContain('Outro');
    expect(primeiraMensagem('Câmeras')).toBe('Procuro câmeras');
    expect(primeiraMensagem('Controle de acesso')).toBe('Procuro controle de acesso');
    expect(primeiraMensagem('cerca elétrica na chácara')).toBe('cerca elétrica na chácara');
  });

  it('pergunta feita antes do fim do roteiro fica para depois', () => {
    expect(retomar('nome')).toBe('Já te respondo! Antes, como posso te chamar?');
    expect(retomar('whatsapp')).toMatch(/WhatsApp com DDD/);
  });

  it('o campo muda com a etapa (teclado numérico no WhatsApp)', () => {
    expect(CAMPO.whatsapp).toMatchObject({ numerico: true, autocompletar: 'tel-national' });
    expect(CAMPO.nome.autocompletar).toBe('given-name');
    expect(CAMPO.pronto.maximo).toBe(600);
    expect(primeiroNome(' Ana Paula ')).toBe('Ana');
  });
});

describe('validação dos dados', () => {
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

  it('nome e cidade com pelo menos 2 caracteres e uma letra', () => {
    expect(validarNome('  Ana   Maria ')).toBe('Ana Maria');
    expect(validarNome('A')).toBeNull();
    expect(validarNome('12')).toBeNull();
    expect(validarCidade(' Dois  Vizinhos ')).toBe('Dois Vizinhos');
    expect(validarCidade('--')).toBeNull();
  });
});

describe('sessão e conversa guardadas', () => {
  const pronta = (extra: Record<string, unknown> = {}) => ({
    ...estadoNovo(),
    captura: { etapa: 'pronto', nome: 'Ana', whatsapp: '46991234567', cidade: 'Francisco Beltrão', interesse: 'Câmeras' },
    leadOk: true,
    ...extra,
  });

  it('sessão nova é um UUID v4 e começa pelo roteiro', () => {
    expect(novaSessao()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(novaSessao()).not.toBe(novaSessao());
    expect(estadoNovo()).toMatchObject({ captura: { etapa: 'nome' }, leadOk: false, pendente: '', pendentePlano: null });
  });

  it('guardado estranho vira conversa nova', () => {
    for (const bruto of [null, '', '{', '"x"', '{"sessao":"abc"}', '[]']) {
      const e = lerEstado(bruto);
      expect(e.historico).toEqual([]);
      expect(e.sessao).toMatch(/^[0-9a-f-]{36}$/);
      expect(e.captura.etapa).toBe('nome');
    }
  });

  it('conversa da versão anterior (sem roteiro) vira conversa nova', () => {
    const antiga = { sessao: novaSessao(), historico: [{ de: 'eu', texto: 'oi' }], plano: 4, contatoOk: true };
    const e = lerEstado(JSON.stringify(antiga));
    expect(e.sessao).not.toBe(antiga.sessao);
    expect(e.historico).toEqual([]);
  });

  it('retoma o roteiro no meio, na etapa certa', () => {
    const base = estadoNovo();
    const meio = lerEstado(JSON.stringify({ ...base, captura: { etapa: 'cidade', nome: 'Ana', whatsapp: '46991234567', cidade: '', interesse: '' } }));
    expect(meio.sessao).toBe(base.sessao);
    expect(meio.captura.etapa).toBe('cidade');
    expect(meio.leadOk).toBe(false);
    // Etapa que não bate com os dados (pulou o WhatsApp): conversa nova.
    expect(lerEstado(JSON.stringify({ ...base, captura: { etapa: 'cidade', nome: 'Ana', whatsapp: '', cidade: '', interesse: '' } })).sessao).not.toBe(base.sessao);
    // Envio do lead que não chegou a ser confirmado: volta para a pergunta do interesse.
    const semConfirmar = lerEstado(JSON.stringify({ ...base, captura: { etapa: 'interesse', nome: 'Ana', whatsapp: '46991234567', cidade: 'FB', interesse: 'Câmeras' } }));
    expect(semConfirmar.captura).toMatchObject({ etapa: 'interesse', interesse: '' });
  });

  it('"pronto" exige o lead confirmado', () => {
    const e = pronta();
    expect(lerEstado(JSON.stringify(e))).toMatchObject({ leadOk: true, captura: { etapa: 'pronto', interesse: 'Câmeras' } });
    expect(lerEstado(JSON.stringify({ ...e, leadOk: false })).sessao).not.toBe(e.sessao);
  });

  it('guarda só o que é válido e no máximo o limite de mensagens', () => {
    const base = pronta({ pendente: 'funciona sem internet?' });
    const historico = Array.from({ length: MAX_HISTORICO + 5 }, (_, i) => ({ de: i % 2 ? 'sol' : 'eu', texto: `m${i}` }));
    const e = lerEstado(JSON.stringify({ ...base, historico: [...historico, { de: 'hacker', texto: 'x' }, { de: 'sol', texto: 'ok', cartoes: [4, 7], acoes: ['contato', 'whatsapp', 'x'], avisado: true }] }));
    expect(e.sessao).toBe(base.sessao);
    expect(e.pendente).toBe('funciona sem internet?');
    expect(e.historico).toHaveLength(MAX_HISTORICO);
    expect(e.historico.at(-1)).toEqual({ de: 'sol', texto: 'ok', cartoes: [4], acoes: ['whatsapp'], avisado: true });
  });

  it('plano do botão "Quero este plano" sobrevive ao recarregar, só se for um plano de verdade e com a mensagem junto', () => {
    const e = lerEstado(JSON.stringify({ ...estadoNovo(), pendente: 'Quero o plano de 4 câmeras', pendentePlano: 4 }));
    expect(e).toMatchObject({ pendente: 'Quero o plano de 4 câmeras', pendentePlano: 4 });
    expect(lerEstado(JSON.stringify({ ...estadoNovo(), pendente: 'Quero o plano', pendentePlano: 7 })).pendentePlano).toBeNull();
    expect(lerEstado(JSON.stringify({ ...estadoNovo(), pendente: '', pendentePlano: 4 })).pendentePlano).toBeNull();
    expect(lerEstado(JSON.stringify({ ...estadoNovo(), pendente: 'x', pendentePlano: '4' })).pendentePlano).toBeNull();
  });
});

describe('WhatsApp só quando a pessoa pede (28/09/2026)', () => {
  it('reconhece o pedido, com ou sem acento e nos jeitos comuns de escrever', () => {
    for (const t of ['quero falar pelo WhatsApp', 'tem whats?', 'me passa o zap', 'wpp', 'Whats App', 'prefiro falar com atendente',
      'quero falar com alguém', 'falar com uma pessoa', 'é humano?']) {
      expect(pedeWhatsapp(t), t).toBe(true);
    }
  });

  it('nome, cidade, interesse e o próprio número não são pedido', () => {
    for (const t of ['Ana Paula', 'Francisco Beltrão', 'Câmeras', 'quero câmeras para a loja', 'Zapata',
      'meu whats é 46 99123-4567', '46991234567', '(46) 99123-4567']) {
      expect(pedeWhatsapp(t), t).toBe(false);
    }
  });

  it('a resposta fala do botão e o roteiro continua na mesma pergunta', () => {
    expect(respostaPedeWhatsapp).toMatch(/WhatsApp/);
    expect(retomar('cidade', 'Se preferir seguir por aqui, ')).toBe('Se preferir seguir por aqui, qual é a sua cidade?');
    expect(retomar('cidade')).toBe('Já te respondo! Antes, qual é a sua cidade?');
  });

  it('"Quero este plano" da página vira a frase que o servidor entende como contratar', () => {
    expect(mensagemQueroPlano(1)).toBe('Quero o plano de 1 câmera');
    expect(mensagemQueroPlano(4)).toBe('Quero o plano de 4 câmeras');
    // Mesma regra de Validar Entrada (n8n): "quero (o|esse|este) plano".
    for (const p of planos) expect(/\bquero (o|esse|este) plano\b/.test(mensagemQueroPlano(p.cameras).toLowerCase())).toBe(true);
  });
});

describe('textos fixos do chat', () => {
  it('botão do WhatsApp do chat usa o número do site com mensagem preenchida', () => {
    const link = new URL(linkWhatsappChat());
    expect(link.pathname).toBe(`/${contato.whatsapp}`);
    expect((link.searchParams.get('text') ?? '').length).toBeGreaterThanOrEqual(20);
  });

  it('o chat fala com o n8n por HTTPS', () => {
    expect(SOL_URL).toMatch(/^https:\/\/n8n\.somoscella\.online\/webhook\/sol-site$/);
  });
});
