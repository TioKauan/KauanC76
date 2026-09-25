import { describe, expect, it } from 'vitest';
import { planos, contato, empresa, planoParaCameras, formatarPreco, linkWhatsapp, mensagemPlano, nomePlano, menorPreco, duvidas, condicoes, porQueLocar, servicosProposta, textoProposta, etapas, taxaInstalacao, textoTaxaInstalacao } from '../src/lib/dados';

describe('planos de locação', () => {
  it('são os planos fixos de 1, 2, 3, 4 e 8 câmeras, em ordem', () => {
    expect(planos.map((p) => p.cameras)).toEqual([1, 2, 3, 4, 8]);
  });

  it('mensalidade e cabo incluso crescem com o número de câmeras', () => {
    for (let i = 1; i < planos.length; i++) {
      expect(planos[i]!.preco).toBeGreaterThan(planos[i - 1]!.preco);
      expect(planos[i]!.caboMetros).toBeGreaterThan(planos[i - 1]!.caboMetros);
    }
  });

  it('gravador tem canais suficientes para as câmeras do plano', () => {
    for (const p of planos) {
      const canais = Number(p.gravador.match(/(\d+) canais/)?.[1]);
      expect(canais).toBeGreaterThanOrEqual(p.cameras);
    }
  });

  it('só o plano de 4 câmeras tem destaque, com o texto do documento', () => {
    const comDestaque = planos.filter((p) => p.destaque);
    expect(comDestaque.map((p) => p.cameras)).toEqual([4]);
    expect(comDestaque[0]!.destaque).toBe('Cobertura completa');
  });

  it('menor preço é o do plano de 1 câmera', () => {
    expect(menorPreco).toBe(planos[0]!.preco);
  });
});

describe('planoParaCameras', () => {
  it.each([
    [0, 'vazio', null],
    [1, 'exato', 1],
    [2, 'exato', 2],
    [3, 'exato', 3],
    [4, 'exato', 4],
    [5, 'folga', 8],
    [6, 'folga', 8],
    [7, 'folga', 8],
    [8, 'exato', 8],
    [9, 'proposta', null],
    [16, 'proposta', null],
  ])('%i câmeras → %s (plano %s)', (n, tipo, cameras) => {
    const r = planoParaCameras(n);
    expect(r.tipo).toBe(tipo);
    expect(r.plano?.cameras ?? null).toBe(cameras);
  });
});

describe('textos e contato', () => {
  it('formata preço no padrão brasileiro', () => {
    expect(formatarPreco(49.9)).toBe('49,90');
    expect(formatarPreco(159.9)).toBe('159,90');
  });

  it('WhatsApp usa o número atual, nunca o antigo', () => {
    expect(contato.whatsapp).toBe('5546991331306');
    expect(JSON.stringify({ contato, planos, duvidas, condicoes })).not.toMatch(/99113.?8360/);
  });

  it('link do WhatsApp leva a mensagem codificada', () => {
    const link = linkWhatsapp('Olá! Plano de 4 câmeras (R$ 99,90/mês)');
    expect(link.startsWith(`https://wa.me/${contato.whatsapp}?text=`)).toBe(true);
    expect(new URL(link).searchParams.get('text')).toBe('Olá! Plano de 4 câmeras (R$ 99,90/mês)');
  });

  it('mensagem de cada plano cita o plano e o valor', () => {
    for (const p of planos) {
      const msg = mensagemPlano(p);
      expect(msg).toContain(nomePlano(p));
      expect(msg).toContain(formatarPreco(p.preco));
    }
  });

  it('condições contratuais (prazo, multa, cobranças extras, reajuste) ficam no contrato, não no site', () => {
    const tudo = JSON.stringify({ condicoes, duvidas, porQueLocar, servicosProposta, textoProposta });
    expect(tudo).not.toMatch(/prazo mínimo|24 meses|multa|IPCA|valor de reposição|desistência|central de monitoramento/i);
    expect(condicoes.map((c) => c.titulo)).toEqual(['Assinatura eletrônica', 'Taxa de instalação', 'Mensalidades na ativação', 'Pagamento mensal']);
  });

  it('taxa de instalação = 1 mensalidade do plano, e nenhum texto diz que a instalação é grátis', () => {
    for (const p of planos) {
      expect(taxaInstalacao(p)).toBe(p.preco);
      expect(textoTaxaInstalacao(p)).toBe(`R$ ${formatarPreco(p.preco)}`);
    }
    const tudo = JSON.stringify({ condicoes, duvidas, porQueLocar, etapas });
    expect(tudo).not.toMatch(/instalação (padrão )?(está )?inclu[sí]|sem investimento inicial|sem pagar antes/i);
    expect(tudo).toMatch(/Valor de 1 mensalidade do plano, pago antecipadamente/);
  });

  it('identifica a empresa com CNPJ válido e e-mail', () => {
    const n = empresa.cnpj.replace(/\D/g, '');
    const dv = (base: string, pesos: number[]) => {
      const r = [...base].reduce((s, d, i) => s + Number(d) * pesos[i]!, 0) % 11;
      return r < 2 ? '0' : String(11 - r);
    };
    const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const d1 = dv(n.slice(0, 12), p1);
    const d2 = dv(n.slice(0, 12) + d1, [6, ...p1]);
    expect(n).toHaveLength(14);
    expect(n.slice(12)).toBe(d1 + d2);
    expect(contato.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/);
  });

  it('respeita as regras de comunicação do documento', () => {
    const tudo = JSON.stringify({ duvidas, condicoes });
    expect(tudo).toMatch(/aproximadamente dez dias/);
    expect(tudo).not.toMatch(/garant(e|ia) (a )?identifica/i);
    expect(duvidas).toHaveLength(7);
  });
});
