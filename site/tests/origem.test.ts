import { describe, expect, it } from 'vitest';
import { lerOrigem, escolherOrigem, lerOrigemGuardada, origemParaEnvio, VALIDADE_DIAS, type Origem } from '../src/lib/origem';

const SITE = 'https://somoscella.online/';
const agora = new Date('2026-10-01T12:00:00Z');
const dias = (n: number) => new Date(agora.getTime() - n * 86_400_000);

describe('canal de cada visita', () => {
  it('anúncio do Google: gclid manda, mesmo sem utm', () => {
    const o = lerOrigem(`${SITE}?gclid=Cj0KCQabc`, 'https://www.google.com/', agora);
    expect(o.canal).toBe('google_ads');
    expect(o.gclid).toBe('Cj0KCQabc');
  });

  it('anúncio do Google com utm: guarda campanha, termo e conteúdo', () => {
    const o = lerOrigem(`${SITE}?utm_source=google&utm_medium=cpc&utm_campaign=cameras-fb&utm_term=instalacao%20de%20cameras&utm_content=anuncio1`, '', agora);
    expect(o).toMatchObject({ canal: 'google_ads', fonte: 'google', meio: 'cpc', campanha: 'cameras-fb', termo: 'instalacao de cameras', conteudo: 'anuncio1' });
  });

  it('anúncio na Meta (Facebook ou Instagram) pelo utm pago', () => {
    for (const fonte of ['facebook', 'instagram', 'meta', 'fb', 'ig']) {
      expect(lerOrigem(`${SITE}?utm_source=${fonte}&utm_medium=paid`, '', agora).canal).toBe('meta_ads');
    }
  });

  it('post orgânico com utm vira o canal da rede, não anúncio', () => {
    expect(lerOrigem(`${SITE}?utm_source=instagram&utm_medium=organic&utm_campaign=bio`, '', agora).canal).toBe('instagram');
    expect(lerOrigem(`${SITE}?utm_source=facebook&utm_medium=organic`, '', agora).canal).toBe('facebook');
    expect(lerOrigem(`${SITE}?utm_source=google&utm_medium=organic&utm_campaign=perfil_empresa`, '', agora).canal).toBe('google_busca');
    expect(lerOrigem(`${SITE}?utm_source=jornal&utm_medium=qr`, '', agora).canal).toBe('campanha');
  });

  it('sem utm: o site anterior diz o canal', () => {
    expect(lerOrigem(SITE, 'https://www.google.com.br/', agora)).toMatchObject({ canal: 'google_busca', fonte: 'google.com.br' });
    expect(lerOrigem(SITE, 'https://l.instagram.com/', agora).canal).toBe('instagram');
    expect(lerOrigem(SITE, 'https://m.facebook.com/', agora).canal).toBe('facebook');
    expect(lerOrigem(SITE, 'https://www.bing.com/', agora).canal).toBe('busca_outra');
    expect(lerOrigem(SITE, 'https://exemplo.com.br/lista', agora)).toMatchObject({ canal: 'outro_site', fonte: 'exemplo.com.br' });
  });

  it('link clicado dentro do Facebook sem utm (fbclid) conta como Facebook', () => {
    expect(lerOrigem(`${SITE}?fbclid=IwAR0x`, '', agora)).toMatchObject({ canal: 'facebook', fbclid: 'IwAR0x' });
  });

  it('digitar o endereço ou vir de outra página nossa é acesso direto', () => {
    expect(lerOrigem(SITE, '', agora)).toMatchObject({ canal: 'direto', fonte: '' });
    expect(lerOrigem(SITE, 'https://somoscella.online/privacidade/', agora).canal).toBe('direto');
    expect(lerOrigem(SITE, 'https://www.somoscella.online/', agora).canal).toBe('direto');
  });

  it('endereço com lixo não quebra nem passa caractere perigoso', () => {
    const o = lerOrigem(`${SITE}?utm_source=<script>&utm_campaign=${'x'.repeat(500)}`, 'isto não é url', agora);
    expect(o.fonte).not.toMatch(/[<>]/);
    expect(o.campanha.length).toBe(100);
    expect(lerOrigem('não é url', '', agora)).toMatchObject({ canal: 'direto', pagina: '/' });
  });
});

describe('qual origem vale (último canal que não seja direto, 30 dias)', () => {
  const anuncio = lerOrigem(`${SITE}?gclid=abc`, '', dias(5));

  it('volta direta dentro de 30 dias mantém o anúncio', () => {
    expect(escolherOrigem(lerOrigem(SITE, '', agora), anuncio, agora)).toBe(anuncio);
  });

  it('depois de 30 dias, direto é direto', () => {
    const velho = lerOrigem(`${SITE}?gclid=abc`, '', dias(VALIDADE_DIAS + 1));
    expect(escolherOrigem(lerOrigem(SITE, '', agora), velho, agora).canal).toBe('direto');
  });

  it('canal novo de verdade substitui o guardado', () => {
    expect(escolherOrigem(lerOrigem(SITE, 'https://l.instagram.com/', agora), anuncio, agora).canal).toBe('instagram');
  });
});

describe('origem guardada no navegador (pode ter sido mexida)', () => {
  it('ida e volta sem perder nada', () => {
    const o = lerOrigem(`${SITE}?utm_source=google&utm_medium=cpc&gclid=abc`, '', agora);
    expect(lerOrigemGuardada(JSON.stringify(o))).toEqual(o);
  });

  it('lixo, canal inventado ou data inválida viram nada', () => {
    for (const lixo of [null, '', 'texto', '[]', '{"canal":"tv","em":"2026-10-01T00:00:00Z"}', '{"canal":"direto","em":"ontem"}']) {
      expect(lerOrigemGuardada(lixo)).toBeNull();
    }
  });

  it('só manda os campos preenchidos', () => {
    const envio = origemParaEnvio(lerOrigem(SITE, 'https://l.instagram.com/', agora) as Origem);
    expect(envio).toEqual({ canal: 'instagram', fonte: 'l.instagram.com', pagina: '/', em: agora.toISOString() });
  });
});
