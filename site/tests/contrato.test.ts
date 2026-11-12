import { describe, expect, it } from 'vitest';
import {
  aberturaVideo, canaisDoGravador, condicoesContrato, confiancaGoogle, contratoSimples, duvidas,
  explicacaoGravador, perfis, planos,
} from '../src/lib/dados';

describe('condições do contrato em cinco perguntas (11/11/2026)', () => {
  const resposta = (pergunta: string) => contratoSimples.find((q) => q.pergunta === pergunta)?.resposta ?? '';
  const tudoDoContrato = JSON.stringify({ condicoesContrato, duvidas });

  it('são as cinco perguntas combinadas, nesta ordem', () => {
    expect(contratoSimples.map((q) => q.pergunta)).toEqual([
      'Por quanto tempo é o contrato?',
      'Posso cancelar?',
      'A mensalidade aumenta?',
      'Quem conserta se der defeito?',
      'O que é cobrado à parte?',
    ]);
  });

  it('cada resposta é curta (uma ou duas frases) e cita os números certos', () => {
    expect(resposta('Por quanto tempo é o contrato?')).toMatch(/24 meses/);
    expect(resposta('Posso cancelar?')).toMatch(/30%/);
    expect(resposta('Posso cancelar?')).toMatch(/24 meses/);
    expect(resposta('Posso cancelar?')).toMatch(/30 dias/);
    expect(resposta('A mensalidade aumenta?')).toMatch(/IPCA/);
    expect(resposta('Quem conserta se der defeito?')).toMatch(/equivalente ou superior/);
    for (const q of contratoSimples) {
      const frases = q.resposta.split(/(?<=[.!?])\s+/).filter(Boolean);
      expect(frases.length, q.pergunta).toBeLessThanOrEqual(2);
      expect(q.resposta.length, q.pergunta).toBeLessThanOrEqual(260);
    }
  });

  it('os números das respostas existem nas condições completas e nas dúvidas (nenhuma regra nova)', () => {
    for (const trecho of ['24 meses', '30%', '30 dias', 'IPCA', 'equivalente ou superior', 'sem nova fidelidade']) {
      expect(tudoDoContrato, trecho).toContain(trecho);
    }
    // Os percentuais que aparecem nas respostas são só os do documento.
    const percentuais = contratoSimples.flatMap((q) => q.resposta.match(/\d+%/g) ?? []);
    expect(new Set(percentuais)).toEqual(new Set(['30%']));
  });

  it('"cobrado à parte" diz o que não é coberto e não promete garantia contra raio, furto ou roubo', () => {
    const parte = resposta('O que é cobrado à parte?');
    for (const termo of ['Furto', 'roubo', 'mau uso', 'raio']) expect(parte).toContain(termo);
    expect(parte).toMatch(/não são cobertos/);
    expect(JSON.stringify(contratoSimples)).not.toMatch(/garantia contra raio|cobre raio|reposição (gratuita )?de equipamento furtado|50%/i);
  });
});

describe('gravador de 8 canais (plano de 8 câmeras)', () => {
  it('só o plano de 8 câmeras ganha a linha, ligada ao campo gravador', () => {
    const linhas = planos.map((p) => [p.cameras, explicacaoGravador(p)] as const);
    expect(linhas.filter(([, linha]) => linha).map(([cameras]) => cameras)).toEqual([8]);
    const oito = planos.find((p) => p.cameras === 8)!;
    expect(canaisDoGravador(oito)).toBe(8);
    expect(explicacaoGravador(oito)).toBe('Gravador de 8 canais: um canal para cada câmera');
  });

  it('os outros planos usam gravador de 4 canais', () => {
    for (const p of planos.filter((x) => x.cameras !== 8)) expect(canaisDoGravador(p)).toBe(4);
  });
});

describe('vídeo e linha de confiança da abertura', () => {
  it('o player usa o endereço sem cookies e o link sem JavaScript vai para o YouTube', () => {
    expect(aberturaVideo.embed).toBe('https://www.youtube-nocookie.com/embed/wKUPPBYbi-Q?autoplay=1&rel=0&playsinline=1');
    expect(aberturaVideo.linkYoutube).toBe('https://www.youtube.com/watch?v=wKUPPBYbi-Q');
    expect(aberturaVideo.titulo.length).toBeGreaterThan(20);
  });

  it('a legenda obrigatória diz que a cor à noite é adicional, sob orçamento, e que o plano padrão é preto e branco', () => {
    expect(aberturaVideo.legenda).toMatch(/Demonstração do fabricante/);
    expect(aberturaVideo.legenda).toMatch(/sob orçamento/);
    expect(aberturaVideo.legenda).toMatch(/preto e branco/);
  });

  it('a linha de confiança não traz nota, estrelas nem número, e o perfil é o do Google Maps', () => {
    expect(confiancaGoogle).toBe('Avaliações e endereço no Perfil da Empresa no Google');
    expect(confiancaGoogle).not.toMatch(/\d|★|estrela|nota/i);
    expect(perfis.googleMaps).toMatch(/^https:\/\/maps\.google\.com\//);
  });
});
