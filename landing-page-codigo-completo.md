# SC Soluções — Landing page: código-fonte e contexto

Gerado em 2026-09-24 a partir de `C:\SC SOLUCOES-LEANDING PAGE`.

## Contexto do projeto (resumo do CLAUDE.md)

# CLAUDE.md

Landing page da **SC Soluções em Segurança e Tecnologia**, publicada em
`https://somoscella.online`, e a pasta de produção de posts do Instagram.
Migrado do Codex em 24/09/2026 (o `AGENTS.md` ao lado é a versão do Codex).

Escreva em português do Brasil. O Kauan não é programador: explique o porquê e dê
um passo por vez.

## Site

Decisões, conteúdo, contatos e comandos estão no `PROJETO.md` — leia antes de
mexer. Resumo:

- React + TypeScript + Vinext, exportação estática. `npm run dev` (prévia),
  `npm run build` (exportação), `npx tsc --noEmit` (tipos).
- Contatos e ambientes em `lib/site-content.ts`. WhatsApp do site:
  `+55 (46) 99133-1306` (desde 19/09/2026).
- A publicação é **manual**, pelo Nginx do painel ICP no VPS da Integrator
  (`/etc/icontainer/apps/nginx/nginx/www/sites/somoscella.online/index`), sempre
  guardando antes a versão anterior. Procedimento e histórico em
  `C:\SomosCella\Vault\Projetos\landing-page-sc-solucoes.md`. **Publicar é ação
  externa: só com pedido explícito do Kauan.**
- ⚠️ O botão do site abre o WhatsApp, e o chatbot está **fora do ar desde 19/09**
  (número banido; migração para a API oficial em andamento). Quem clicar hoje cai
  em atendimento manual.
- Sem preços, clientes, depoimentos, garantias, certificações ou métricas
  inventadas. Nunca reconstrua a logo: use os arquivos de `public/brand/`.
- **O que era só do Codex:** o `PROJETO.md` cita o "Sites" e o
  `.openai/hosting.json` — uma cópia privada e versionada do site na hospedagem da
  OpenAI, que só o Codex publica. **Não é a produção** (a produção é o VPS) e o
  Claude não tem acesso a ela. O histórico de versões fica no git (tags e
  commits) e nos pacotes em `C:\SomosCella-Backup\landing-*.tar.gz`.
- As imagens dos ambientes foram geradas no Codex; os originais em PNG estão em
  `C:\SomosCella-Backup\imagens-geradas-codex\01a07e47-4a33-7320-8447-cd35f602ceaf\`
  (o `PROJETO.md` ainda aponta para a pasta antiga, dentro de `~/.codex`).
- ⚠️ `entregas/`, `parcerias/` e `social-media/` **não estão no git** (~340 MB).
  Há uma cópia conferida por SHA-256 de 24/09/2026 em
  `C:\SomosCella-Backup\landing-pastas-fora-do-git-2026-09-24\`, mas o que mudar
  depois disso só existe aqui.
- ⚠️ **Posts antigos descartados (decisão do Kauan, 24/09/2026):** os lotes
  `semana-01` e `semana-02` e os carrosséis de `entregas/` não serão publicados —
  além do estilo antigo, trazem o WhatsApp `(46) 99113-8360` desenhado nas artes.
  Os arquivos continuam na pasta e no backup só como histórico; **não os use
  como base**. Posts novos serão produzidos do zero, com o kit oficial da logo
  (`C:\Users\kauan\Desktop\01 - Trabalho\SC-Solucoes-kit-vetorial-oficial\`)
  e o WhatsApp `(46) 99133-1306`.

## Parcerias / LinkedIn

`parcerias/` guarda o rascunho de reposicionamento do LinkedIn pessoal do Kauan
para conseguir parcerias técnicas com integradoras (prioridade anunciada em
11/09/2026, antes da decisão de foco de 21/09). Rascunho **não publicado**; contato já
atualizado para `(46) 99133-1306` em 24/09/2026.

## Conteúdo social — PAUSADO

Desde 21/09/2026 o Kauan faz as artes e posta à mão. Só produza posts quando ele
pedir um lote. Nesse caso use a skill `sc-social-semanal`
(`C:/Users/kauan/.claude/skills/sc-social-semanal/SKILL.md`) e os subagentes de
`.claude/agents/` (`sc-pauta`, `sc-roteiro`, `sc-direcao-arte`, `sc-revisao`,
`sc-agendamento`).

Contexto: `social-media/00-config/`. Fotos recebidas:
`social-media/01-fotos-recebidas/`. Lotes: `social-media/03-semanas/`. Preserve os
originais das fotos e mantenha material de clientes fora de `public/`. Não altere
nem publique o site para atender tarefa de conteúdo social.

O Claude não gera imagem fotográfica: use fotos reais e ilustração vetorial
identificada; imagem de IA, quando indispensável, vem do Kauan.

---

## Arquivos de configuração

### `package.json`
```json
{
  "name": "sites-project",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=22.13.0"
  },
  "scripts": {
    "dev": "vinext dev",
    "build": "node --import ./scripts/windows-build-exit.mjs ./node_modules/vinext/dist/cli.js build",
    "start": "node scripts/preview.mjs",
    "lint": "oxlint",
    "format": "oxfmt"
  },
  "dependencies": {
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "react-server-dom-webpack": "19.2.8",
    "vinext": "1.0.0-beta.9",
    "@base-ui/react": "1.7.0",
    "@shadcn/react": "0.3.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.2",
    "input-otp": "1.4.2",
    "lucide-react": "1.31.0",
    "react-day-picker": "9.8.1",
    "react-resizable-panels": "4.5.8",
    "recharts": "3.8.0",
    "shadcn": "4.18.0",
    "tailwind-merge": "3.6.0",
    "tw-animate-css": "1.4.0"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "1.37.1",
    "@cloudflare/workers-types": "4.20260515.1",
    "@openai/sites-vite-plugin": "0.2.0",
    "@tailwindcss/postcss": "4.2.1",
    "@types/node": "22.19.19",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "6.0.2",
    "@vitejs/plugin-rsc": "0.5.34",
    "oxfmt": "0.61.0",
    "oxlint": "1.76.0",
    "oxlint-tsgolint": "7.0.2001",
    "tailwindcss": "4.2.1",
    "typescript": "5.9.3",
    "vite": "8.2.2",
    "wrangler": "4.92.0"
  },
  "type": "module"
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "types": ["node", "@cloudflare/workers-types", "vinext/types"],
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

### `next.config.ts`
```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
```

### `vite.config.ts`
```ts
import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// This landing page exports static HTML and does not require a Worker runtime.
export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { exclude: ['lucide-react'] },
  plugins: [vinext(), sites()],
});
```

### `components.json`
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

---

## Código custom (app/, components/ próprios, lib/, hooks/)

### `app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { ContactProvider } from '@/components/contact-context';
import './globals.css';
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});
export const metadata: Metadata = {
  title: 'SC Soluções | Integradora de Segurança e Tecnologia',
  description:
    'Integramos segurança eletrônica, redes e infraestrutura para residências, condomínios, comércios e empresas. Do diagnóstico ao sistema funcionando.',
  metadataBase: new URL('https://somoscella.online'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  icons: { icon: 'data:,' },
  openGraph: {
    title: 'SC Soluções | Segurança e Tecnologia',
    description:
      'Porque tecnologia não deve apenas estar instalada. Ela precisa funcionar.',
    locale: 'pt_BR',
    type: 'website',
    url: '/',
    siteName: 'SC Soluções',
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={manrope.variable}><ContactProvider>{children}</ContactProvider></body>
    </html>
  );
}
```

### `app/page.tsx`
```tsx
import {
  ArrowDown,
  ArrowUpRight,
  Cable,
  ScanFace,
  ShieldCheck,
  Wifi,
  House,
  Building2,
  Store,
  BriefcaseBusiness,
  Check,
  ArrowUp,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { ExperienceLoader } from '@/components/experience/experience-loader';
import { ContactSection } from '@/components/contact-section';
import { AnalysisLink } from '@/components/analysis-link';
import { MotionEffects } from '@/components/motion-effects';
/* oxlint-disable next/no-img-element -- The static export uses precompressed WebP and official SVG assets with explicit dimensions. */
import { solutions, story, process } from '@/lib/site-content';

const environmentIcons = {
  home: House,
  building: Building2,
  store: Store,
  office: BriefcaseBusiness,
};

export default function Home() {
  return (
    <>
      <MotionEffects />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo">
        <section className="hero wrap" id="inicio" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow" data-reveal>
              <span className="small-line" /> INTEGRADORA DE TECNOLOGIA
            </p>
            <h1 id="hero-title" data-reveal="solid">
              Porque tecnologia
              <br className="desktop-break" /> não deve apenas
              <br className="desktop-break" /> estar instalada.
              <br />
              <span>Ela precisa funcionar.</span>
            </h1>
            <p className="hero-description" data-reveal data-reveal-delay="110">
              Segurança, redes e infraestrutura conectadas em uma solução
              pensada para o seu ambiente.
            </p>
            <div className="hero-actions" data-reveal data-reveal-delay="190">
              <a className="button-primary" href="#contato">
                Solicitar análise <ArrowUpRight size={20} />
              </a>
              <a className="text-link" href="#solucoes">
                Explore as soluções <ArrowDown size={16} />
              </a>
            </div>
            <p className="hero-note" data-reveal data-reveal-delay="260">Do diagnóstico ao sistema funcionando.</p>
          </div>
          <figure className="hero-visual" data-motion-scene>
            <img
              className="rack-image"
              src="/images/infraestrutura.webp"
              width="1536"
              height="1024"
              fetchPriority="high"
              alt="Ilustração de um rack com conexões de rede organizadas, em azul e laranja"
            />
            <span className="rack-scan" aria-hidden="true" />
            <div className="visual-top">
              <span className="small-line" /> CADA CONEXÃO IMPORTA
            </div>
            <div className="visual-label" data-reveal data-reveal-delay="240">
              <span className="diagram-dot" />
              <div>
                <strong>Uma base bem estruturada.</strong>
                <span>Para tudo funcionar junto.</span>
              </div>
            </div>
            <figcaption>
              Imagem conceitual · infraestrutura tecnológica
            </figcaption>
          </figure>
        </section>
        <div className="expertise-strip wrap" aria-label="Áreas de atuação" data-reveal>
          <span>
            <ShieldCheck /> Segurança
          </span>
          <span>
            <Wifi /> Redes
          </span>
          <span>
            <ScanFace /> Controle de acesso
          </span>
          <span>
            <Cable /> Infraestrutura
          </span>
          <a href="#integracao" aria-label="Conheça nossa essência">
            <ArrowDown />
          </a>
        </div>
        <section
          className="integration-section wrap section-space"
          id="integracao"
          aria-labelledby="integration-title"
        >
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow">
                <span className="section-index">01 /</span> NOSSA ESSÊNCIA
              </p>
              <h2 id="integration-title">
                A diferença está
                <br />
                em como tudo <span>se conecta.</span>
              </h2>
            </div>
            <p>
              O desempenho de um sistema depende de cada detalhe. Nós olhamos
              para o conjunto.
            </p>
          </div>
          <ExperienceLoader />
            <div className="integration-principles">
              {story.map((chapter) => (
                <article
                  className="integration-principle"
                  key={chapter.number}
                  data-reveal
                >
                  <div className="principle-number">{chapter.number}</div>
                  <p className="chapter-tag">{chapter.tag}</p>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.description}</p>
                  <span className="chapter-detail">{chapter.detail}</span>
                </article>
              ))}
            </div>
        </section>
        <section
          className="solutions-section section-space"
          id="solucoes"
          aria-labelledby="solutions-title"
        >
          <div className="wrap">
            <div className="section-heading" data-reveal>
              <div>
                <p className="eyebrow">
                  <span className="section-index">02 /</span> SOLUÇÕES
                </p>
                <h2 id="solutions-title">
                  Seu ambiente.
                  <br />
                  <span>A solução certa.</span>
                </h2>
              </div>
              <p>
                Cada lugar tem seus desafios. Integramos as tecnologias que
                fazem sentido para o seu.
              </p>
            </div>
            <div className="solutions-grid">
              {solutions.map((solution, index) => {
                const Icon = environmentIcons[solution.icon];
                return (
                  <article
                    className="solution-card"
                    key={solution.id}
                    aria-labelledby={`title-${solution.id}`}
                    data-reveal
                    data-reveal-delay={index % 2 === 0 ? 0 : 120}
                  >
                    <div className="solution-top">
                      <span className="environment-icon">
                        <Icon size={29} strokeWidth={1.4} aria-hidden="true" />
                      </span>
                      <span className="solution-number">{solution.number}</span>
                    </div>
                    <h3 id={`title-${solution.id}`}>{solution.title}</h3>
                    <p className="solution-caption">{solution.caption}</p>
                    <p className="solution-challenge">{solution.challenge}</p>
                    <ul
                      className="technology-list"
                      aria-label="Tecnologias que podem compor a solução"
                    >
                      {solution.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>
                    <p className="solution-result">{solution.result}</p>
                    <AnalysisLink id={solution.id} title={solution.title} />
                  </article>
                );
              })}
            </div>
            <p className="solutions-note">
              <span className="diagram-dot" /> Cada projeto começa com um
              diagnóstico. Os componentes são definidos conforme a necessidade.
            </p>
          </div>
        </section>
        <section
          className="process-section wrap section-space"
          id="metodo"
          aria-labelledby="process-title"
        >
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow">
                <span className="section-index">03 /</span> COMO TRABALHAMOS
              </p>
              <h2 id="process-title">
                Critério em cada etapa.
                <br />
                <span>Cuidado em cada detalhe.</span>
              </h2>
            </div>
            <p>
              Um processo claro, da primeira conversa à orientação de uso do
              sistema.
            </p>
          </div>
          <ol className="process-grid">
            {process.map((phase, index) => (
              <li key={phase.number} data-reveal data-reveal-delay={index * 90}>
                <span className="process-number">
                  {phase.number}
                  <span />
                </span>
                <h3>{phase.title}</h3>
                <p className="process-steps">{phase.steps}</p>
                <p>{phase.description}</p>
              </li>
            ))}
          </ol>
          <div className="care-panel" data-reveal>
            <p>
              O que está por trás de
              <br />
              <strong>um sistema bem executado.</strong>
            </p>
            <ul>
              <li>
                <Check aria-hidden="true" /> Cabeamento organizado e
                identificado
              </li>
              <li>
                <Check aria-hidden="true" /> Proteção adequada ao ambiente
              </li>
              <li>
                <Check aria-hidden="true" /> Alimentação dimensionada
              </li>
              <li>
                <Check aria-hidden="true" /> Funcionamento conferido na entrega
              </li>
            </ul>
          </div>
        </section>
        <ContactSection />
      </main>
      <footer className="site-footer wrap">
        <div className="footer-top">
          <a
            className="brand"
            href="#inicio"
            aria-label="SC Soluções — voltar ao início"
          >
            <img
              src="/brand/sc-logo.svg"
              width="1536"
              height="1024"
              alt="SC Soluções"
              loading="lazy"
            />
          </a>
          <p>
            Segurança e Tecnologia
            <br />
            <span>Integradora de Tecnologia</span>
          </p>
          <a className="back-top" href="#inicio">
            Voltar ao início <ArrowUp size={16} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SC Soluções.</span>
          <span>Segurança · Redes · Controle de Acesso · Infraestrutura</span>
        </div>
      </footer>
    </>
  );
}
```

### `app/globals.css`
```css
@import 'tailwindcss' source(none);
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';
@import './experience.css';
@source './';
@source '../components/site-header.tsx';
@source '../components/contact-section.tsx';
@source '../components/analysis-link.tsx';
@source '../components/systems-diagram.tsx';
@source '../components/ui/button.tsx';
@source '../components/ui/sheet.tsx';
@source '../components/experience/';
@source '../components/guided-briefing.tsx';
@source '../components/ui/tabs.tsx';
@source '../components/ui/switch.tsx';
@source '../components/ui/radio-group.tsx';
@custom-variant dark (&:is(.dark *));
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--foreground);
  --color-popover: var(--card);
  --color-popover-foreground: var(--foreground);
  --color-muted: var(--secondary);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--secondary);
  --color-accent-foreground: var(--foreground);
  --color-border: var(--border);
  --color-ring: var(--cyan);
  --font-sans: var(--font-manrope);
  --font-heading: var(--font-manrope);
}
:root,
.dark {
  --background: #020710;
  --foreground: #f8f9fb;
  --card: #0b1521;
  --primary: #ff6a00;
  --primary-foreground: #020710;
  --secondary: #001031;
  --muted-foreground: #a6b3c4;
  --border: #24313f;
  --cyan: #6de9f6;
  --blue: #09a0f6;
  --radius: 1rem;
  --motion-ease: cubic-bezier(0.16, 1, 0.3, 1);
  color-scheme: dark;
}
* {
  box-sizing: border-box;
}
html {
  scroll-behavior: smooth;
  scroll-padding-top: 110px;
}
body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-manrope), Arial, sans-serif;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}
a {
  color: inherit;
  text-decoration: none;
}
button {
  font: inherit;
}
button,
a {
  -webkit-tap-highlight-color: transparent;
}
button:not(:disabled),
a {
  cursor: pointer;
}
button:disabled {
  cursor: not-allowed;
}
:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 5px;
}
::selection {
  color: var(--background);
  background: var(--cyan);
}
svg {
  flex-shrink: 0;
}
.wrap {
  width: calc(100% - 112px);
  max-width: 1328px;
  margin-inline: auto;
}
.skip-link {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 200;
  padding: 16px;
  background: var(--cyan);
  color: var(--background);
  transform: translateY(-150%);
}
.skip-link:focus {
  transform: none;
}
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  height: 84px;
  margin-top: 20px;
  position: relative;
  z-index: 30;
  border-bottom: 1px solid var(--border);
}
.brand {
  display: block;
  width: 174px;
  height: 72px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.brand img {
  position: absolute;
  width: 220px;
  height: auto;
  max-width: none;
  top: -31px;
  left: -22px;
}
.site-header nav {
  display: flex;
  gap: 32px;
  font-size: 14px;
  color: #b9c3ce;
}
.site-header nav a,
.text-link {
  transition: color 0.2s;
}
.site-header nav a:hover,
.text-link:hover {
  color: var(--cyan);
}
.header-cta {
  display: flex;
  align-items: center;
  gap: 17px;
  font-size: 14px;
  border: 1px solid #344251;
  padding: 13px 19px;
  border-radius: 7px;
  transition: border-color 0.2s;
}
.header-cta:hover {
  border-color: var(--cyan);
}
.hero {
  display: grid;
  grid-template-columns: 1.13fr 1fr;
  gap: 10px;
  align-items: center;
  padding-block: 76px 70px;
  position: relative;
}
.eyebrow {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 0 0 25px;
  color: #b1c0cf;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.15em;
  line-height: 1.6;
}
.small-line {
  display: inline-block;
  width: 24px;
  height: 2px;
  background: var(--primary);
  flex-shrink: 0;
}
h1 {
  font-size: clamp(42px, 4.25vw, 65px);
  font-weight: 500;
  letter-spacing: -0.055em;
  line-height: 1.12;
  margin: 0;
}
h1 span {
  color: var(--cyan);
  display: block;
  margin-top: 12px;
  max-width: 600px;
}
.hero-copy {
  position: relative;
  z-index: 2;
  padding-right: 10px;
}
.hero-description {
  color: #aebccb;
  max-width: 440px;
  font-size: 17px;
  line-height: 1.8;
  margin: 26px 0 27px;
}
.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 26px;
}
.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #020710;
  border-radius: 7px;
  padding: 17px 23px;
  font-weight: 700;
  font-size: 14px;
  transition:
    background 0.2s,
    transform 0.2s;
  min-height: 52px;
}
.button-primary:hover {
  background: #ff872f;
  transform: translateY(-2px);
}
.button-primary:disabled:hover {
  transform: none;
}
.text-link {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  font-size: 14px;
}
.hero-note {
  color: #8190a3;
  font-size: 12px;
  margin-top: 19px;
}
.hero-visual {
  align-self: stretch;
  margin: 0 -34px 0 -50px;
  position: relative;
  min-height: 510px;
}
.rack-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 62% center;
  position: absolute;
  border-radius: 4px;
  mask-image:
    linear-gradient(90deg, transparent, #000 22%, #000 85%, transparent),
    linear-gradient(0deg, transparent, #000 20%, #000 85%, transparent);
  mask-composite: intersect;
}
.hero-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #02071088, transparent 55%);
  pointer-events: none;
}
.visual-top {
  position: absolute;
  top: 27px;
  right: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #95a6b9;
  z-index: 1;
}
.visual-top .small-line {
  background: var(--cyan);
  width: 16px;
}
.visual-label {
  position: absolute;
  z-index: 1;
  bottom: 58px;
  right: 36px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 24px;
  border: 1px solid #354f62;
  border-radius: 9px;
  background: #08121ee8;
  box-shadow: 0 16px 50px #0004;
}
.diagram-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 12px #6de9f666;
  flex-shrink: 0;
}
.visual-label strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
}
.visual-label div > span {
  display: block;
  font-size: 12px;
  color: #9dafc1;
  margin-top: 5px;
}
.hero-visual figcaption {
  position: absolute;
  z-index: 1;
  bottom: 27px;
  right: 39px;
  font-size: 12px;
  color: #8b9bab;
}
.expertise-strip {
  border-block: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 0;
  color: #aebdcb;
  gap: 22px;
}
.expertise-strip > span {
  display: flex;
  align-items: center;
  gap: 13px;
  font-size: 14px;
}
.expertise-strip > span svg {
  width: 20px;
  height: 20px;
  color: #5c7e95;
  stroke-width: 1.4;
}
.expertise-strip > a {
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: var(--cyan);
}
.expertise-strip > a svg {
  width: 16px;
}
@media (min-width: 1550px) {
  .hero {
    padding-block: 95px;
  }
}
@media (max-width: 1100px) {
  .wrap {
    width: calc(100% - 64px);
  }
  .site-header nav {
    gap: 20px;
  }
  .hero {
    padding-top: 56px;
  }
  .hero-actions {
    gap: 20px;
  }
  .hero-visual {
    margin-left: -20px;
    margin-right: -20px;
  }
  .visual-label {
    right: 18px;
    padding: 17px;
  }
}
@media (max-width: 800px) {
  .wrap {
    width: calc(100% - 40px);
  }
  .site-header {
    height: 76px;
    margin-top: 8px;
  }
  .site-header nav {
    display: none;
  }
  .header-cta {
    font-size: 12px;
    padding: 11px 13px;
    gap: 9px;
  }
  .brand {
    width: 152px;
    height: 68px;
  }
  .brand img {
    width: 194px;
    top: -25px;
    left: -20px;
  }
  .hero {
    grid-template-columns: 1fr;
    padding-top: 44px;
    padding-bottom: 30px;
    gap: 10px;
  }
  h1 {
    font-size: clamp(37px, 6.2vw, 58px);
    letter-spacing: -0.05em;
    max-width: 660px;
  }
  h1 span {
    max-width: 580px;
  }
  .hero-description {
    font-size: 16px;
    max-width: 480px;
    margin-top: 22px;
  }
  .hero-copy {
    padding: 0;
  }
  .hero-visual {
    margin: 0 -20px;
    height: 350px;
    min-height: 0;
  }
  .rack-image {
    object-position: 60% 50%;
  }
  .visual-top {
    right: 26px;
    top: 24px;
  }
  .visual-label {
    right: 25px;
    bottom: 47px;
  }
  .hero-visual figcaption {
    right: 26px;
    bottom: 20px;
  }
  .expertise-strip {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 22px 0;
    gap: 23px 10px;
  }
  .expertise-strip > span {
    font-size: 13px;
    gap: 9px;
  }
  .expertise-strip > a {
    display: none;
  }
}
@media (max-width: 380px) {
  .wrap {
    width: calc(100% - 32px);
  }
  .header-cta {
    padding-inline: 9px;
  }
  .brand {
    width: 132px;
  }
  .brand img {
    width: 178px;
    left: -19px;
    top: -22px;
  }
  .eyebrow {
    font-size: 12px;
  }
  h1 {
    font-size: 35px;
  }
  .hero-actions {
    gap: 22px;
  }
  .button-primary {
    padding: 16px 18px;
  }
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}

/* Navigation and shared editorial rhythm. */
.site-header {
  position: sticky;
  top: 12px;
  padding-inline: 22px;
  border: 1px solid #24313fbb;
  border-radius: 12px;
  background: #050b14f2;
  backdrop-filter: blur(12px);
}
.mobile-menu {
  display: none;
}
.mobile-sheet {
  background: #07111d;
  padding: 38px 26px;
  width: min(88vw, 390px) !important;
}
.mobile-title {
  font-size: 23px;
}
.menu-trigger,
.menu-close {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: transparent;
  color: #e0e5eb;
  border: 1px solid var(--border);
  border-radius: 7px;
}
.menu-close {
  position: absolute;
  right: 18px;
  top: 26px;
}
.mobile-sheet nav {
  display: flex;
  flex-direction: column;
  margin-top: 36px;
}
.mobile-sheet nav a {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 23px 0;
  border-bottom: 1px solid var(--border);
  font-size: 17px;
}
.mobile-sheet nav a > span {
  color: #7a8da1;
  font-size: 12px;
}
.mobile-sheet nav a > svg {
  margin-left: auto;
  color: var(--cyan);
}
.mobile-menu-note {
  margin-top: auto;
  color: #9cabbc;
  font-size: 13px;
}
.section-space {
  padding-block: 112px;
}
.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 44px;
  align-items: flex-end;
  margin-bottom: 68px;
}
.section-heading h2,
h2 {
  font-size: clamp(33px, 3.2vw, 48px);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 1.18;
  margin: 0;
}
h2 span {
  color: #8da0b4;
}
.section-heading > .eyebrow {
  margin-bottom: 24px;
}
.section-index {
  color: var(--primary);
  letter-spacing: 0.02em;
  font-size: 12px;
  margin-right: 5px;
}
.section-heading > p {
  color: #a7b5c5;
  font-size: 16px;
  line-height: 1.8;
  max-width: 300px;
  margin: 0 0 4px;
}
h3 {
  font-weight: 500;
  letter-spacing: -0.025em;
}
.integration-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 90px;
  align-items: start;
}
.diagram-column {
  position: sticky;
  top: 152px;
}
.systems-diagram {
  margin: 0;
  border: 1px solid #273b4c;
  border-radius: 14px;
  background: radial-gradient(ellipse at 50% 50%, #0a1e30 0%, #07101c 68%);
  overflow: hidden;
}
.diagram-header {
  display: flex;
  justify-content: space-between;
  padding: 24px;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: #95aabf;
  border-bottom: 1px solid #24313f80;
}
.diagram-header svg {
  color: #526d84;
}
.diagram-map {
  width: 100%;
  aspect-ratio: 560/430;
  position: relative;
}
.connection-map {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}
.connection-grid {
  stroke: #61798c12;
  fill: none;
  stroke-width: 1;
  stroke-dasharray: 3 8;
}
.connection-path {
  stroke: #345167;
  stroke-width: 1.5;
  fill: none;
  transition: stroke 0.7s;
}
.map-ring {
  stroke: #31536888;
  fill: none;
  stroke-width: 1;
}
.outer-ring {
  stroke: #31536830;
  stroke-dasharray: 2 8;
}
.diagram-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  width: 41%;
  text-align: center;
}
.node-energy {
  left: 19.65%;
  top: 23.25%;
}
.node-network {
  left: 80.35%;
  top: 23.25%;
}
.node-security {
  left: 19.65%;
  top: 76.75%;
}
.node-access {
  left: 80.35%;
  top: 76.75%;
}
.node-icon {
  display: grid;
  place-items: center;
  height: 50px;
  width: 55px;
  border: 1px solid #315063;
  border-radius: 12px;
  background: #091523;
  color: #698399;
  margin-bottom: 10px;
  transition:
    border-color 0.7s,
    color 0.7s,
    box-shadow 0.7s;
}
.node-icon svg {
  width: 23px;
  height: 23px;
  stroke-width: 1.4;
}
.diagram-node strong {
  font-size: 13px;
  font-weight: 500;
  color: #e0e5eb;
}
.diagram-node > span:last-child {
  font-size: 12px;
  color: #93a6ba;
  margin-top: 5px;
}
.diagram-hub {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 31%;
  aspect-ratio: 1;
  border: 1px solid #35617b;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 35%, #0d293e, #07111f 75%);
  box-shadow: 0 0 42px #09a0f612;
}
.hub-cross {
  color: var(--primary);
  font-size: 20px;
  line-height: 1;
  margin-bottom: 7px;
}
.diagram-hub strong {
  font-size: 24px;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.04em;
}
.diagram-hub > span:last-child {
  font-size: 12px;
  letter-spacing: 0.07em;
  color: #8ea6bd;
  margin-top: 12px;
}
.systems-diagram figcaption {
  padding: 20px 24px;
  border-top: 1px solid #24313f80;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #adc1d2;
  font-size: 12px;
}
.systems-diagram figcaption small {
  margin-left: auto;
  color: #7890a6;
  font-size: 12px;
  letter-spacing: 0.06em;
}
.systems-diagram[data-phase='1'] .base-connection,
.systems-diagram[data-phase='2'] .connection-path {
  stroke: url(#connection-color);
}
.systems-diagram[data-phase='1'] .node-energy .node-icon,
.systems-diagram[data-phase='1'] .node-network .node-icon,
.systems-diagram[data-phase='2'] .node-icon {
  color: var(--cyan);
  border-color: #277393;
  box-shadow: 0 0 24px #09a0f612;
}
.diagram-footnote {
  font-size: 12px;
  color: #8a9cb0;
  line-height: 1.7;
  margin: 17px 4px 0;
  max-width: 490px;
}
.story-chapters {
  padding-left: 29px;
}
.story-chapter {
  position: relative;
  padding: 4px 0 48px 15px;
  min-height: 262px;
  border-left: 1px solid #253648;
}
.story-chapter:last-child {
  padding-bottom: 0;
  min-height: 220px;
  border-left-color: transparent;
}
.chapter-marker {
  position: absolute;
  top: 0;
  left: -29px;
  font-size: 12px;
  color: var(--cyan);
  background: var(--background);
  padding: 7px 16px 12px;
}
.chapter-tag {
  margin: 1px 0 16px;
  color: #91a4b7;
  font-size: 12px;
  letter-spacing: 0.13em;
  font-weight: 600;
  padding-left: 23px;
}
.story-chapter h3 {
  font-size: 25px;
  margin: 0 0 17px;
  padding-left: 23px;
}
.story-chapter > p:not(.chapter-tag) {
  color: #a8b7c8;
  font-size: 15px;
  line-height: 1.8;
  margin: 0 0 17px;
  padding-left: 23px;
}
.chapter-detail {
  display: block;
  font-size: 12px;
  color: #bddbe5;
  padding-left: 23px;
}
.solutions-section {
  background: #08111c;
  border-block: 1px solid #1d2d3c;
}
.solutions-section .section-heading h2 span {
  color: var(--cyan);
}
.solutions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
.solution-card {
  padding: 34px 36px 0;
  border: 1px solid #283c4e;
  background: linear-gradient(135deg, #101e2c, #0b1521 65%);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s;
}
.solution-card:hover,
.solution-card:focus-within {
  border-color: #46768c;
}
.solution-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 27px;
}
.environment-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  color: var(--cyan);
  border: 1px solid #2a455a;
  background: #0d2234;
  border-radius: 11px;
}
.solution-number {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #8195a9;
}
.solution-card h3 {
  font-size: 27px;
  margin: 0 0 8px;
}
.solution-caption {
  color: #c1d1de;
  margin: 0;
  font-size: 13px;
}
.solution-challenge {
  color: #9fafaf;
  margin: 24px 0 20px;
  font-size: 15px;
  line-height: 1.8;
  max-width: 470px;
}
.technology-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  list-style: none;
  padding: 0;
  margin: 0 0 21px;
}
.technology-list li {
  border: 1px solid #2d4051;
  border-radius: 5px;
  padding: 7px 10px;
  color: #bed1e0;
  font-size: 12px;
}
.solution-result {
  font-size: 13px;
  line-height: 1.8;
  color: #a5b8ca;
  margin: 0 0 26px;
  flex: 1;
}
.solution-link {
  border-top: 1px solid #2b3d4d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 21px 0;
  font-size: 13px;
  color: #edf3f7;
}
.solution-link svg {
  color: var(--primary);
  transition: transform 0.2s;
}
.solution-link:hover svg {
  transform: translate(2px, -2px);
}
.solutions-note {
  display: flex;
  align-items: center;
  gap: 11px;
  color: #99acbd;
  font-size: 12px;
  line-height: 1.7;
  margin: 28px 0 0;
}
.solutions-note .diagram-dot {
  width: 4px;
  height: 4px;
}
.process-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  padding: 0;
  list-style: none;
  margin: 0;
}
.process-number {
  display: flex;
  align-items: center;
  gap: 20px;
  color: var(--primary);
  font-size: 13px;
  margin-bottom: 25px;
}
.process-number > span {
  height: 1px;
  flex: 1;
  background: #2b3a49;
}
.process-grid h3 {
  font-size: 25px;
  margin: 0 0 16px;
}
.process-grid p {
  font-size: 14px;
  color: #96a8ba;
  line-height: 1.8;
  margin: 0;
}
.process-grid .process-steps {
  font-size: 12px;
  line-height: 1.7;
  color: #d0dbe6;
  margin-bottom: 16px;
  min-height: 41px;
}
.care-panel {
  border: 1px solid #263d4e;
  border-radius: 10px;
  padding: 32px 36px;
  margin-top: 53px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  background: #07111c;
}
.care-panel > p {
  font-size: 17px;
  line-height: 1.7;
  color: #91a3b8;
  margin: 0;
}
.care-panel strong {
  font-weight: 500;
  color: #d3e0eb;
}
.care-panel ul {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 19px 27px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.care-panel li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #b8c7d7;
}
.care-panel li svg {
  color: var(--cyan);
  width: 15px;
  height: 15px;
}
.contact-section {
  border-top: 1px solid #2b3b4d;
  padding: 90px 0 100px;
  display: grid;
  grid-template-columns: 1.12fr 1fr;
  gap: 110px;
  align-items: center;
}
.contact-intro h2 {
  font-size: clamp(36px, 3.6vw, 52px);
}
.contact-intro h2 span {
  color: var(--cyan);
}
.contact-intro > p:not(.eyebrow) {
  color: #a6b6c7;
  line-height: 1.9;
  font-size: 16px;
  max-width: 435px;
  margin: 25px 0;
}
.contact-intro > .text-link {
  font-size: 13px;
  color: #becdd9;
}
.contact-intro > .text-link svg {
  transform: rotate(180deg);
}
.contact-panel {
  border: 1px solid #2b4358;
  border-radius: 12px;
  padding: 35px;
  background: radial-gradient(ellipse at 0 0, #112f45, #0a1521 65%);
}
.contact-icon {
  color: var(--cyan);
  stroke-width: 1.3;
  margin-bottom: 22px;
}
.contact-panel h3 {
  font-size: 24px;
  margin: 0 0 15px;
}
.contact-panel > p {
  font-size: 14px;
  line-height: 1.8;
  color: #a5b8c9;
  margin: 0;
}
.contact-details {
  margin: 26px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.contact-details dt {
  font-size: 12px;
  letter-spacing: 0.12em;
  color: #8ba3b9;
}
.contact-details dd {
  margin: 8px 0 0;
  font-size: 14px;
  min-height: 27px;
  border-bottom: 1px solid #33495b;
}
.contact-panel .selected-environment {
  margin-top: 18px;
  font-size: 12px;
  color: #bdddea;
}
.contact-button {
  width: 100%;
  justify-content: space-between;
}
.contact-button.unavailable-contact {
  min-height: 53px;
  opacity: 1;
  background: #293a46;
  border-color: #40515e;
  color: #c4d0d8;
  font-size: 14px;
  border-radius: 7px;
}
.contact-panel .contact-status {
  margin-top: 12px;
  font-size: 12px;
  color: #9bacbb;
  text-align: center;
}
.site-footer {
  border-top: 1px solid #253443;
  padding-bottom: 28px;
}
.footer-top {
  display: flex;
  align-items: center;
  gap: 37px;
  padding: 33px 0;
}
.footer-top > p {
  margin: 0;
  padding-left: 35px;
  border-left: 1px solid #2b3b4d;
  font-size: 13px;
  line-height: 1.9;
  color: #b2c3d3;
}
.footer-top > p > span {
  color: #7f94a9;
  font-size: 12px;
}
.back-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
  font-size: 12px;
  color: #a9bbc9;
}
.back-top svg {
  color: var(--cyan);
}
.footer-bottom {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #1b2a38;
  padding-top: 23px;
  gap: 20px;
  font-size: 12px;
  color: #8397aa;
  line-height: 1.7;
}
@media (max-width: 1100px) {
  .site-header {
    gap: 20px;
    padding-inline: 15px;
  }
  .site-header nav {
    font-size: 12px;
    gap: 20px;
  }
  .header-cta {
    font-size: 12px;
  }
  .section-space {
    padding-block: 90px;
  }
  .integration-content {
    gap: 40px;
  }
  .section-heading {
    gap: 30px;
    margin-bottom: 52px;
  }
  .section-heading > p {
    font-size: 14px;
    max-width: 245px;
  }
  .diagram-hub strong {
    font-size: 21px;
  }
  .diagram-node > span:last-child {
    font-size: 12px;
  }
  .node-icon {
    width: 46px;
    height: 42px;
  }
  .systems-diagram figcaption {
    padding: 19px 16px;
    font-size: 12px;
  }
  .story-chapters {
    padding-left: 20px;
  }
  .story-chapter h3 {
    font-size: 23px;
  }
  .story-chapter > p:not(.chapter-tag) {
    font-size: 14px;
  }
  .solution-card {
    padding: 28px 28px 0;
  }
  .solution-card h3 {
    font-size: 24px;
  }
  .care-panel {
    align-items: flex-start;
    flex-direction: column;
    gap: 23px;
  }
  .contact-section {
    gap: 55px;
  }
  .contact-panel {
    padding: 28px;
  }
}
@media (max-width: 800px) {
  html {
    scroll-padding-top: 105px;
  }
  .site-header {
    height: 74px;
    padding-inline: 10px;
    gap: 10px;
    top: 8px;
    border-radius: 10px;
  }
  .site-header .header-cta {
    display: none;
  }
  .mobile-menu {
    display: block;
  }
  .hero {
    padding-top: 43px;
  }
  .eyebrow {
    font-size: 12px;
  }
  .section-space {
    padding-block: 70px;
  }
  .section-heading {
    display: block;
    margin-bottom: 38px;
  }
  .section-heading > p {
    max-width: 430px;
    font-size: 15px;
    margin-top: 24px;
  }
  .section-heading h2,
  h2 {
    font-size: clamp(32px, 5.3vw, 43px);
  }
  .section-heading .eyebrow {
    margin-bottom: 20px;
  }
  .integration-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .diagram-column {
    position: static;
    max-width: 560px;
    width: 100%;
    margin-inline: auto;
  }
  .diagram-hub strong {
    font-size: 26px;
  }
  .node-icon {
    width: 55px;
    height: 49px;
  }
  .diagram-node > span:last-child {
    font-size: 12px;
  }
  .systems-diagram figcaption {
    padding: 20px;
    font-size: 12px;
  }
  .story-chapters {
    padding-left: 19px;
  }
  .story-chapter {
    min-height: 0;
    padding-bottom: 37px;
  }
  .story-chapter:last-child {
    min-height: 0;
  }
  .story-chapter h3 {
    font-size: 24px;
  }
  .story-chapter > p:not(.chapter-tag) {
    font-size: 15px;
  }
  .solutions-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .solution-card {
    padding: 27px 26px 0;
  }
  .solution-top {
    margin-bottom: 23px;
  }
  .solution-card h3 {
    font-size: 26px;
  }
  .solution-challenge {
    margin-top: 20px;
  }
  .solution-result {
    font-size: 14px;
  }
  .technology-list li {
    font-size: 12px;
  }
  .solutions-note {
    font-size: 12px;
    align-items: flex-start;
  }
  .solutions-note .diagram-dot {
    margin-top: 8px;
  }
  .process-grid {
    grid-template-columns: 1fr 1fr;
    gap: 38px 26px;
  }
  .process-number {
    margin-bottom: 19px;
  }
  .process-grid h3 {
    font-size: 24px;
  }
  .process-grid .process-steps {
    min-height: 42px;
  }
  .care-panel {
    padding: 26px;
    margin-top: 36px;
  }
  .care-panel ul {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .care-panel li {
    font-size: 13px;
  }
  .contact-section {
    grid-template-columns: 1fr;
    gap: 35px;
    padding-block: 68px;
  }
  .contact-intro h2 {
    font-size: 40px;
  }
  .contact-panel {
    padding: 28px;
  }
  .contact-panel h3 {
    font-size: 24px;
  }
  .footer-top {
    flex-wrap: wrap;
    gap: 23px;
    padding-block: 27px;
  }
  .footer-top > p {
    border: 0;
    padding: 0;
    margin-left: auto;
    font-size: 12px;
  }
  .footer-top > p > span {
    font-size: 12px;
  }
  .back-top {
    margin-left: 0;
    width: 100%;
    padding-top: 6px;
  }
  .footer-bottom {
    flex-direction: column;
    gap: 10px;
    font-size: 12px;
  }
}
@media (max-width: 400px) {
  .diagram-node strong {
    font-size: 12px;
  }
  .diagram-node > span:last-child {
    font-size: 12px;
  }
  .node-icon {
    width: 43px;
    height: 39px;
    margin-bottom: 6px;
  }
  .node-icon svg {
    width: 21px;
  }
  .diagram-hub strong {
    font-size: 21px;
  }
  .diagram-hub > span:last-child {
    font-size: 12px;
    margin-top: 8px;
  }
  .hub-cross {
    margin-bottom: 3px;
    font-size: 17px;
  }
  .systems-diagram figcaption {
    padding: 17px 12px;
    gap: 7px;
    font-size: 12px;
  }
  .systems-diagram figcaption small {
    font-size: 12px;
  }
  .diagram-header {
    padding: 19px 16px;
    font-size: 12px;
  }
  .process-grid {
    gap: 34px 22px;
  }
  .process-grid h3 {
    font-size: 22px;
  }
  .process-grid p {
    font-size: 13px;
  }
  .contact-panel {
    padding: 24px;
  }
  .contact-intro h2 {
    font-size: 37px;
  }
  .contact-details {
    gap: 15px;
  }
  .contact-details dt {
    font-size: 12px;
  }
}

@media (max-width: 380px) {
  .hero-visual {
    margin-inline: -16px;
  }
}

/* Frame only the empty outer canvas; preserve the complete official artwork. */
.brand {
  width: 180px;
  height: 70px;
}
.brand img {
  width: 185px;
  left: -2px;
  top: -24px;
}
.diagram-node {
  width: 30%;
  height: 50px;
}
.node-icon {
  flex-shrink: 0;
}
.node-energy,
.node-security {
  left: 18%;
}
.node-network,
.node-access {
  left: 82%;
}
.node-security,
.node-access {
  top: 70%;
}
@media (max-width: 800px) {
  .brand {
    width: 160px;
    height: 66px;
  }
  .brand img {
    width: 174px;
    left: -6px;
    top: -24px;
  }
}
@media (max-width: 400px) {
  .diagram-map {
    height: 340px;
    aspect-ratio: auto;
  }
  .diagram-node {
    height: 39px;
  }
  .diagram-hub strong {
    font-size: 19px;
  }
}

/* Motion follows the same language as the identity: connections and light. */
.reading-progress {
  position: fixed;
  inset: 0 0 auto;
  height: 2px;
  z-index: 100;
  background: linear-gradient(90deg, var(--blue), var(--cyan) 65%, var(--primary));
  transform: scaleX(var(--reading-progress, 0));
  transform-origin: left;
  pointer-events: none;
}
.rack-scan,
.connection-signal,
.signal-orbit {
  opacity: 0;
  pointer-events: none;
}
.rack-scan {
  position: absolute;
  top: 14%;
  left: 20%;
  right: 10%;
  height: 60px;
  z-index: 1;
  background: linear-gradient(0deg, #6de9f633, #09a0f60b 20%, transparent);
  border-bottom: 1px solid #6de9f699;
  mask-image: linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent);
}
.connection-signal {
  fill: none;
  stroke: var(--cyan);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 12 100;
  stroke-dashoffset: 12;
}
.signal-orbit {
  fill: none;
  stroke: var(--primary);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-dasharray: 7 93;
  transform-origin: 280px 215px;
}
.site-header nav a {
  position: relative;
}
.site-header nav a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -7px;
  height: 1px;
  background: var(--cyan);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s var(--motion-ease);
}
.site-header nav a:is(:hover, :focus-visible)::after {
  transform: scaleX(1);
}
.button-primary {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.button-primary::before {
  content: '';
  position: absolute;
  inset: -1px;
  z-index: -1;
  background: linear-gradient(110deg, transparent 20%, #fff6 48%, transparent 72%);
  transform: translateX(-120%);
  pointer-events: none;
}
.button-primary svg,
.header-cta svg,
.back-top svg,
.text-link svg {
  transition: translate 0.35s var(--motion-ease);
}
.solution-card {
  transition: border-color 0.3s, translate 0.4s var(--motion-ease), box-shadow 0.4s;
}
.environment-icon {
  transition: transform 0.45s var(--motion-ease), background 0.3s, border-color 0.3s;
}
.solution-link svg {
  transition: transform 0.35s var(--motion-ease);
}
.solution-card:focus-within .environment-icon {
  border-color: #437c96;
}

@media (prefers-reduced-motion: no-preference) {
  html[data-motion-ready] .rack-image {
    translate: 0 var(--hero-drift, 0px);
  }
  html[data-motion-ready] .rack-scan {
    animation: rack-scan 3.4s 0.2s both;
    animation-play-state: paused;
  }
  html[data-motion-ready] .hero-visual[data-in-view] .rack-scan {
    animation-play-state: running;
  }
  html[data-motion-ready] .connection-signal {
    animation: connection-travel 1.7s ease-in-out 2 backwards;
    animation-play-state: paused;
  }
  html[data-motion-ready] .signal-orbit {
    animation: orbit-sweep 4.4s ease-in-out both;
    animation-play-state: paused;
  }
  html[data-motion-ready] .systems-diagram[data-in-view] :is(.connection-signal, .signal-orbit) {
    animation-play-state: running;
  }
  html[data-motion-ready] h1 > span {
    background: linear-gradient(110deg, var(--cyan) 30%, #f8f9fb 47%, var(--cyan) 65%);
    background-size: 250% 100%;
    background-clip: text;
    color: transparent;
    animation: title-light 2.8s 0.15s both;
  }
  .process-grid > [data-revealed] .process-number > span {
    transform-origin: left;
    background: linear-gradient(90deg, #ff6a0099, #2b3a49 90%);
    animation: process-connect 0.9s var(--motion-ease) both;
  }
  .mobile-sheet nav a {
    animation: menu-arrive 0.5s var(--motion-ease) backwards;
  }
  .mobile-sheet nav a:nth-child(2) { animation-delay: 70ms; }
  .mobile-sheet nav a:nth-child(3) { animation-delay: 140ms; }
  .mobile-sheet nav a:nth-child(4) { animation-delay: 210ms; }
  .button-primary:not(:disabled):is(:hover, :focus-visible)::before {
    animation: button-light 0.7s var(--motion-ease);
  }
  .button-primary:not(:disabled):is(:hover, :focus-visible) svg,
  .header-cta:is(:hover, :focus-visible) svg {
    translate: 3px -3px;
  }
  .back-top:is(:hover, :focus-visible) svg { translate: 0 -4px; }
  .text-link:is(:hover, :focus-visible) svg { translate: 0 3px; }
  .button-primary:not(:disabled):active { transform: translateY(0) scale(0.98); }
}
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .solution-card:hover {
    translate: 0 -6px;
    box-shadow: 0 20px 42px #0003;
  }
  .solution-card:hover .environment-icon {
    transform: translateY(-3px) rotate(-5deg);
    background: #10334a;
    border-color: #437c96;
  }
  .solution-card:hover .solution-link svg {
    transform: translate(4px, -4px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .reading-progress,
  .rack-scan,
  .connection-signal,
  .signal-orbit {
    display: none;
  }
  .button-primary:hover,
  .solution-link:hover svg {
    transform: none;
  }
}
@keyframes connection-travel {
  0% { stroke-dashoffset: 12; opacity: 0; }
  12%, 78% { opacity: 1; }
  100% { stroke-dashoffset: -100; opacity: 0; }
}
@keyframes orbit-sweep {
  0% { transform: rotate(-90deg); opacity: 0; }
  15%, 75% { opacity: 0.85; }
  100% { transform: rotate(220deg); opacity: 0; }
}
@keyframes rack-scan {
  0% { translate: 0 0; opacity: 0; }
  15%, 65% { opacity: 0.7; }
  100% { translate: 0 260px; opacity: 0; }
}
@keyframes title-light {
  from { background-position: 120% 0; }
  to { background-position: -100% 0; }
}
@keyframes process-connect {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes menu-arrive {
  from { opacity: 0; transform: translateX(18px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes button-light {
  to { transform: translateX(120%); }
}
```

### `app/experience.css`
```css
.experience-host { min-height: 1070px; }
.scenario-options, .system-selector { margin: 0; padding: 0; min-width: 0; border: 0; }
.experience-kicker { color: var(--cyan); font-size: 12px; font-weight: 600; letter-spacing: .13em; display: block; }
.experience-static { min-height: 850px; display: flex; justify-content: center; align-items: flex-start; flex-direction: column; gap: 22px; padding: 64px; border: 1px solid #263d4e; border-radius: 16px; background: #07111d; }
.experience-static > svg { color: var(--cyan); }
.experience-static h3 { font-size: clamp(28px, 3vw, 44px); max-width: 650px; margin: 0; }
.experience-static p { max-width: 560px; line-height: 1.8; color: #a6b6c8; margin: 0; }
.experience-load-button { min-height: 48px; padding: 12px 18px; gap: 15px; color: var(--cyan); border-color: #38546a; }
.experience-explorer { border: 1px solid #2b4355; border-radius: 16px; background: #07111d; overflow: clip; }
.explorer-heading { padding: 32px 34px 28px; display: flex; align-items: end; justify-content: space-between; gap: 24px; }
.explorer-heading h3 { font-size: clamp(26px, 2.4vw, 35px); margin: 12px 0 0; letter-spacing: -.035em; }
.explorer-heading > p { font-size: 14px; color: #9eb2c3; line-height: 1.8; margin: 0; }
.environment-tabs { gap: 0; }
.environment-tab-list { display: grid; grid-template-columns: repeat(4,1fr); width: auto; height: auto!important; padding: 0 34px; background: transparent; border-radius: 0; gap: 8px; border-bottom: 1px solid #243a4c; }
.environment-tab { min-height: 56px; height: auto; border-radius: 7px 7px 0 0; padding: 14px 20px; color: #a9bbca; font-size: 14px; border: 1px solid transparent; background: transparent; transition: background .25s, color .25s; }
.environment-tab[data-active] { color: var(--cyan)!important; background: #11293b!important; border-color: #365168!important; border-bottom-color: #11293b!important; box-shadow: inset 0 2px 0 var(--cyan); }
.environment-tab:hover { background: #0b1f2f; }
.environment-panel { padding: 0; }
.explorer-main { display: grid; grid-template-columns: minmax(0, 1.85fr) minmax(280px, 1fr); }
.scene-column { min-width: 0; border-right: 1px solid #243a4c; display: flex; flex-direction: column; }
.environment-scene { padding-top: 23px; }
.scene-caption { display: flex; justify-content: space-between; gap: 12px; padding: 0 26px; font-size: 11px; letter-spacing: .09em; color: #a4bbce; }
.scene-caption > span:last-child { letter-spacing: 0; color: #97adbf; }
.scene-art { position: relative; isolation: isolate; width: 100%; aspect-ratio: 3/2; overflow: hidden; margin-top: 12px; }
.scene-art > img { width: 100%; height: 100%; object-fit: contain; display: block; }
.scene-image-fallback { min-height: 100%; padding: 35px 50px; color: #acbed0; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 20px; font-size: 15px; line-height: 1.8; }
.scene-art::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: #01050b; opacity: 0; transition: opacity .45s; z-index: 0; }
.environment-scene[data-scenario='power-out'] .scene-art::after { opacity: .32; }
.scene-connections { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
.scene-route, .scene-signal { fill: none; stroke: var(--cyan); stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.scene-route { stroke-width: 1.3px; opacity: .45; }
.scene-signal { stroke-width: 2.2px; stroke-dasharray: 9 100; opacity: 0; }
.scene-connections [data-offline='true'] .scene-route { stroke: #b9c2ce; stroke-dasharray: 4 5; opacity: .5; }
.scene-hotspot { position: absolute; width: 44px; height: 44px; min-height: 44px; border-radius: 50%; padding: 0; transform: translate(-50%,-50%); color: var(--cyan); border: 1px solid #67cad5; background: #071725ee; z-index: 3; box-shadow: 0 2px 18px #0007; transition: background .2s, box-shadow .2s; }
.scene-hotspot:hover, .scene-hotspot[aria-pressed='true'] { color: #020710; background: var(--cyan); box-shadow: 0 0 0 6px #6de9f61a; }
.scene-hotspot[aria-pressed='true'] { z-index: 4; }
.scene-hotspot:active { transform: translate(-50%,-50%); }
.scene-hotspot[data-status='unavailable'] { color: #d2d7df; border-color: #9ca5b1; background: #28313cee; }
.scene-hotspot:is([data-status='reserve'],[data-status='pending']) { color: #ffd296; border-color: #ffb72b; background: #392716ee; }
.hotspot-number { position: absolute; top: -6px; right: -5px; width: 17px; height: 17px; border-radius: 50%; background: #07111d; color: #e0e5eb; font-size: 10px; border: 1px solid #436078; display: grid; place-items: center; }
.scene-key { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 20px; padding: 8px 16px 19px; font-size: 11px; color: #abbdd0; }
.scene-key > span { display: inline-flex; gap: 7px; align-items: center; }
.scene-key i { width: 5px; height: 5px; border-radius: 50%; background: var(--cyan); }
.scene-key > span:nth-child(2) i { background: #ffb72b; }
.scene-key > span:nth-child(3) i { background: #a5aebb; }
.system-selector { margin-top: auto; padding: 15px 20px; border-top: 1px solid #243a4c; display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; }
.system-option { border-radius: 6px; min-height: 44px; height: auto; padding: 9px 10px; gap: 7px; color: #b3c8d8; font-size: 12px; font-weight: 400; }
.system-option > span { font-size: 10px; color: #9bb1c4; }
.system-option[aria-pressed='true'] { background: #15334a; color: var(--cyan); }
.explorer-detail { padding: 33px 30px; display: flex; flex-direction: column; min-height: 490px; }
.detail-mark { width: 51px; height: 51px; border: 1px solid #31516a; border-radius: 12px; display: grid; place-items: center; color: var(--cyan); background: #0a2032; margin-bottom: 27px; }
.explorer-detail .experience-kicker { font-size: 10px; letter-spacing: .11em; color: #98afc3; }
.explorer-detail h4 { font-size: 27px; letter-spacing: -.035em; font-weight: 500; margin: 13px 0 17px; line-height: 1.25; }
.explorer-detail > p { font-size: 14px; color: #b0c2d1; line-height: 1.85; margin: 0; }
.system-availability { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--cyan); margin-top: 17px; }
.system-availability[data-status='unavailable'] { color: #c0c8d2; }
.system-availability:is([data-status='reserve'],[data-status='pending']) { color: #ffcb87; }
.detail-dependency { border-left: 2px solid #31516a; padding-left: 14px; margin-top: 25px; }
.detail-dependency > span { font-size: 12px; color: #d7e3ed; }
.detail-dependency > p { color: #a1b5c7; font-size: 12px; line-height: 1.85; margin: 8px 0 0; }
.explorer-contact-link { display: inline-flex; align-items: center; justify-content: space-between; gap: 12px; color: #f8ba82; font-size: 13px; padding-top: 27px; margin-top: auto; min-height: 44px; }
.scenario-area { padding: 26px 34px; border-bottom: 1px solid #243a4c; background: #0a1724; }
.scenario-controls { padding: 26px 34px; border-bottom: 1px solid #243a4c; background: #0a1724; }
.scenario-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
.scenario-heading .experience-kicker { color: #ffad70; }
.scenario-heading h4 { font-size: 23px; font-weight: 500; letter-spacing: -.025em; margin: 9px 0 0; }
.reset-scenario { color: #acbfd0; min-height: 44px; height: auto; padding: 8px 12px; font-size: 12px; gap: 8px; }
.scenario-options { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 10px; }
.scenario-option { position: relative; display: flex; flex-direction: column; align-items: start; justify-content: center; height: auto; min-height: 77px; padding: 16px 30px 16px 16px; white-space: normal; gap: 5px; background: #0a1825; border: 1px solid #355168; border-radius: 8px; text-align: left; }
.scenario-option > span { color: #e4edf5; font-size: 13px; font-weight: 500; }
.scenario-option > small { color: #a5bace; font-size: 11px; font-weight: 400; }
.scenario-option > svg { position: absolute; right: 11px; top: 20px; color: #8ba4bb; }
.scenario-option[aria-pressed='true'] { border-color: #ff9e56; background: #2d221d; }
.scenario-option[aria-pressed='true'] > span, .scenario-option[aria-pressed='true'] > svg { color: #ffc18c; }
.backup-control { display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 20px; border: 1px solid #66513a; border-radius: 8px; background: #211e1c; margin-top: 16px; }
.backup-control label { display: flex; flex-direction: column; gap: 5px; cursor: pointer; flex: 1; }
.backup-control strong { font-size: 14px; font-weight: 500; color: #ffd2ab; }
.backup-control label > span { font-size: 12px; color: #bcbbb9; line-height: 1.6; }
.backup-switch { background: #667482; margin: 12px; }
.backup-switch[data-checked] { background: var(--primary); }
.scenario-result { display: grid; grid-template-columns: minmax(0,1.2fr) minmax(350px,1fr); gap: 36px; align-items: start; }
.scenario-explanation h5 { margin: 0 0 12px; font-size: 21px; font-weight: 500; letter-spacing: -.025em; color: #f0f5f9; }
.scenario-explanation > p { font-size: 14px; line-height: 1.8; color: #afc3d4; margin: 0; max-width: 780px; }
.scenario-explanation > .scenario-condition { font-size: 12px; line-height: 1.8; color: #9cb3c8; margin-top: 14px; }
.scenario-statuses { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
.scenario-statuses li { display: flex; align-items: flex-start; gap: 10px; color: #9db1c2; padding: 13px 12px; border: 1px solid #385268; border-radius: 7px; min-height: 85px; }
.scenario-statuses li > svg { flex-shrink: 0; margin-top: 3px; }
.scenario-statuses li[data-status='available'] > svg { color: var(--cyan); }
.scenario-statuses li:is([data-status='reserve'],[data-status='pending'],[data-status='unknown']) > svg { color: #ffbb7b; }
.scenario-statuses span { font-size: 11px; line-height: 1.65; min-width: 0; }
.scenario-statuses strong { display: block; color: #e0e9f0; font-weight: 500; font-size: 13px; }
.experience-footer { display: flex; justify-content: space-between; gap: 25px; padding: 19px 34px; align-items: center; border-top: 1px solid #243a4c; }
.experience-footer p { margin: 0; color: #9db2c5; font-size: 11px; line-height: 1.8; }
.experience-footer a { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: #d7e4ee; white-space: nowrap; min-height: 44px; }
.integration-principles { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 35px; padding-top: 47px; }
.principle-number { color: var(--cyan); font-size: 12px; border-top: 1px solid #2a4357; padding-top: 18px; margin-bottom: 22px; }
.integration-principle .chapter-tag, .integration-principle .chapter-detail { padding-left: 0; }
.integration-principle h3 { font-size: 23px; margin: 0 0 17px; }
.integration-principle > p:not(.chapter-tag) { font-size: 14px; line-height: 1.9; color: #a6b9c9; margin-bottom: 16px; }
.contact-panel .selected-interest { font-size: 12px; color: #b5cfdf; margin-top: 6px; }
.guide-invitation { margin-top: 24px; padding: 24px 0; border-block: 1px solid #2c4459; }
.guide-invitation > span { font-size: 11px; color: var(--cyan); letter-spacing: .1em; }
.guide-invitation > p { font-size: 14px; color: #bed0df; line-height: 1.8; margin: 12px 0 18px; }
.guide-start { border: 1px solid #40677c; background: #102b3d; color: #d0f5f8; width: 100%; min-height: 48px; height: auto; padding: 12px 15px; justify-content: space-between; gap: 12px; font-size: 13px; white-space: normal; }
.guide-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.guide-top > span { font-size: 10px; color: #afc5d7; letter-spacing: .07em; }
.guide-close { min-height: 44px; font-size: 12px; color: #b2c6d6; }
.guide-progress { display: flex; gap: 6px; margin: 12px 0 26px; }
.guide-progress > span { height: 2px; background: #314c60; flex: 1; }
.guide-progress > span[data-current='true'] { background: var(--cyan); }
.guide-step { color: var(--cyan); font-size: 12px; }
.guided-briefing h4 { font-size: 26px; margin: 15px 0 13px; letter-spacing: -.025em; line-height: 1.3; font-weight: 500; }
.guide-caption { color: #a6bdcf; line-height: 1.8; font-size: 14px; margin: 0 0 24px; }
.guide-options { gap: 9px; }
.guide-option { display: flex; align-items: center; gap: 17px; border: 1px solid #34556d; border-radius: 8px; min-height: 57px; padding: 15px 18px; cursor: pointer; }
.guide-option > span { font-size: 13px; line-height: 1.7; color: #c1d4e3; }
.guide-option [data-slot='radio-group-item'] { border-color: #8bb1c8; background: transparent; }
.guide-option:has([data-checked]) { border-color: var(--cyan); background: #113144; }
.guide-option:has([data-checked]) > span { color: #e2f8fa; }
.guide-option [data-checked] { background: var(--cyan)!important; border-color: var(--cyan); }
.guide-option [data-slot='radio-group-indicator'] > span { background: #06202d; }
.guide-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 24px; }
.guide-back { min-height: 48px; color: #b3cad9; font-size: 13px; }
.guide-next { min-height: 48px; height: auto; padding: 13px 17px; gap: 12px; background: var(--primary); color: #020710; font-weight: 700; font-size: 13px; }
.guide-privacy { font-size: 11px; color: #96adc0; line-height: 1.8; margin: 20px 0 0; }
.briefing-summary { margin-top: 25px; }
.briefing-summary > svg { color: var(--cyan); }
.briefing-summary dl { margin: 15px 0 20px; }
.briefing-summary dl > div { padding-block: 12px; border-bottom: 1px solid #2c455b; }
.briefing-summary dt { color: #9fb6c9; font-size: 11px; margin-bottom: 7px; }
.briefing-summary dd { color: #e4eff7; font-size: 14px; margin: 0; line-height: 1.65; }
.briefing-summary > p { font-size: 13px; color: #b4cfdf; line-height: 1.8; margin: 0 0 15px; }
.briefing-summary > p strong { display: block; color: #d4edf5; font-weight: 500; margin-bottom: 6px; }
.briefing-summary > span { display: block; font-size: 11px; line-height: 1.8; color: #a2b9cc; }
.summary-actions { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; margin-top: 10px; }
.summary-actions button { min-height: 44px; color: var(--cyan); font-size: 12px; padding-inline: 0; }
.guide-loading { min-height: 250px; display: flex; flex-wrap: wrap; align-content: center; gap: 18px; }
.guide-loading output { display: block; width: 100%; font-size: 14px; line-height: 1.8; color: #b7cddd; }
.guide-loading button { min-height: 44px; color: #d1edf7; }
@media (prefers-reduced-motion: no-preference) {
  .scene-signal { animation: scene-travel 2.1s ease-out both; animation-play-state: paused; }
  .environment-scene[data-in-view] .scene-signal { animation-play-state: running; }
  .scene-art > img { animation: scene-arrive .5s ease-out both; }
  .scene-hotspot { animation: hotspot-arrive .6s ease-out both; }
}
@keyframes scene-travel { 0% { stroke-dashoffset: 9; opacity: 0; } 15%,80% { opacity: .9; } 100% { stroke-dashoffset: -100; opacity: 0; } }
@keyframes scene-arrive { from { opacity: .4; } to { opacity: 1; } }
@keyframes hotspot-arrive { from { opacity: 0; } to { opacity: 1; } }
@media (max-width: 1100px) {
  .explorer-main { grid-template-columns: minmax(0,1.65fr) minmax(265px,1fr); }
  .explorer-detail { padding: 26px 24px; }
  .explorer-detail h4 { font-size: 25px; }
  .explorer-heading { padding-inline: 25px; }
  .environment-tab-list { padding-inline: 25px; }
  .scenario-area { padding: 25px; }
  .scenario-option { padding-left: 12px; }
  .scenario-option > span { font-size: 12px; }
  .scenario-option > small { font-size: 11px; }
  .scenario-result { grid-template-columns: minmax(0,1fr) minmax(310px,1fr); gap: 24px; }
  .integration-principles { gap: 25px; }
}
@media (max-width: 800px) {
  .experience-host { min-height: 1530px; }
  .experience-static { min-height: 1250px; padding: 30px; justify-content: flex-start; padding-top: 90px; }
  .explorer-heading { align-items: flex-start; padding: 25px 20px; }
  .explorer-heading > p { display: none; }
  .explorer-heading h3 { font-size: 27px; }
  .environment-tab-list { padding: 0 12px; gap: 4px; }
  .environment-tab { font-size: 12px; padding: 13px 5px; min-height: 51px; }
  .explorer-main { grid-template-columns: 1fr; }
  .scenario-controls { padding: 25px 20px; }
  .scene-column { border-right: 0; }
  .environment-scene { padding-top: 18px; }
  .scene-caption { padding-inline: 18px; font-size: 10px; }
  .scene-caption > span:last-child { display: none; }
  .scene-key { font-size: 10px; gap: 10px; padding: 5px 12px 17px; }
  .scene-hotspot { width: 42px; height: 42px; min-height: 42px; }
  .scene-hotspot::after { content: ''; position: absolute; inset: -1px; border-radius: 50%; }
  .system-selector { padding: 12px 8px; gap: 3px; }
  .system-option { font-size: 11px; gap: 5px; padding: 8px; }
  .system-option svg { display: none; }
  .explorer-detail { padding: 25px 22px; border-top: 1px solid #243a4c; min-height: 0; }
  .explorer-detail:not(:has(.system-availability)) :is(.detail-mark, .detail-dependency) { display: none; }
  .detail-mark { width: 43px; height: 43px; margin-bottom: 17px; }
  .detail-mark svg { width: 23px; }
  .explorer-detail h4 { font-size: 26px; margin: 10px 0 13px; }
  .explorer-detail > p { font-size: 14px; }
  .detail-dependency { margin-top: 19px; }
  .explorer-contact-link { padding-top: 23px; }
  .scenario-area { padding: 25px 20px; }
  .scenario-heading { flex-direction: column; align-items: flex-start; gap: 7px; }
  .scenario-heading h4 { font-size: 23px; }
  .reset-scenario { padding-left: 0; }
  .scenario-options { grid-template-columns: 1fr 1fr; gap: 8px; }
  .scenario-option { padding: 13px 12px; min-height: 87px; }
  .scenario-option > span { font-size: 12px; }
  .scenario-option > small { font-size: 11px; }
  .scenario-option > svg { display: none; }
  .backup-control { padding: 16px 14px; gap: 12px; }
  .backup-control strong { font-size: 13px; }
  .backup-control label > span { font-size: 11px; }
  .backup-switch { margin-right: 9px; }
  .scenario-result { grid-template-columns: 1fr; gap: 22px; }
  .scenario-explanation h5 { font-size: 22px; line-height: 1.4; }
  .scenario-explanation > p { font-size: 14px; }
  .scenario-statuses { gap: 10px; }
  .scenario-statuses li { padding: 11px 9px; gap: 7px; }
  .scenario-statuses li > svg { width: 16px; }
  .experience-footer { flex-direction: column; align-items: flex-start; padding: 18px 22px; gap: 8px; }
  .integration-principles { grid-template-columns: 1fr; gap: 30px; }
  .principle-number { margin-bottom: 17px; }
  .integration-principle > p:not(.chapter-tag) { font-size: 15px; }
  .guide-top > span { font-size: 10px; }
  .guided-briefing h4 { font-size: 25px; }
  .guide-option { gap: 17px; padding: 13px 15px; }
  .guide-option > span { font-size: 13px; }
}
@media (max-width: 360px) {
  .environment-tab { font-size: 11px; padding-inline: 2px; }
  .explorer-heading h3 { font-size: 25px; }
  .explorer-heading { padding-inline: 18px; }
  .scenario-area { padding-inline: 17px; }
  .scene-hotspot { width: 38px; height: 38px; min-height: 38px; }
  .scene-hotspot::after { inset: -3px; }
  .guide-start { font-size: 12px; padding-inline: 12px; }
}
```

### `components/analysis-link.tsx`
```tsx
'use client';
import { ArrowUpRight } from 'lucide-react';
import { contactHref } from '@/lib/briefing';
export function AnalysisLink({ id, title, interest = '', className = 'solution-link', label = 'Pensar na minha solução' }: { id: string; title: string; interest?: string; className?: string; label?: string }) {
  const href = contactHref(id, interest);
  return (
    <a
      className={className}
      href={href}
      aria-label={`${label} para ${title.toLowerCase()}`}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        const attributedHref = contactHref(id, interest, window.location.search);
        window.history.pushState(null, '', attributedHref);
        window.dispatchEvent(new Event('sc:contact-change'));
        document.getElementById('contato')?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'instant'
            : 'smooth',
        });
        document
          .getElementById('contact-title')
          ?.focus({ preventScroll: true });
      }}
    >
      {label} <ArrowUpRight size={19} aria-hidden="true" />
    </a>
  );
}
```

### `components/contact-context.tsx`
```tsx
'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { campaignAttribution, parseContact, type Answers, type EnvironmentId, type InterestId } from '@/lib/briefing';

type ContactState = { environment: EnvironmentId | ''; interest: InterestId | ''; campaign: string; answers: Answers | null; revision: number };
const initial: ContactState = { environment: '', interest: '', campaign: '', answers: null, revision: 0 };
const ContactContext = createContext<{
  state: ContactState;
  ready: boolean;
  setAnswers: (answers: Answers | null) => void;
} | null>(null);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setState(previous => ({ ...parseContact(window.location.search), campaign: campaignAttribution(window.location.search), answers: null, revision: previous.revision + 1 }));
    // oxlint-disable-next-line react/react-compiler -- Read the actual URL after hydration before subscribing to navigation; server HTML intentionally has no browser context.
    sync(); setReady(true);
    window.addEventListener('popstate', sync);
    window.addEventListener('sc:contact-change', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('sc:contact-change', sync);
    };
  }, []);
  const setAnswers = (answers: Answers | null) => setState(previous => ({
    ...previous, answers,
    environment: answers ? (answers.environment === 'unsure' ? '' : answers.environment) : previous.environment,
    interest: answers ? '' : previous.interest,
  }));
  return <ContactContext.Provider value={{ state, ready, setAnswers }}>{children}</ContactContext.Provider>;
}

export function useContact() {
  const context = useContext(ContactContext);
  if (!context) throw new Error('ContactProvider is required');
  return context;
}
```

### `components/contact-section.tsx`
```tsx
'use client';
import { useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, MessageSquare, ArrowRight, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { company, contactUrl, solutions } from '@/lib/site-content';
import { useContact } from '@/components/contact-context';
import { emptyAnswers, briefingLines, discussionTopics, interestNames, type Answers } from '@/lib/briefing';
import { GuideLoader } from '@/components/guide-loader';

export function ContactSection() {
  const { state, ready, setAnswers } = useContact();
  const [guideOpen, setGuideOpen] = useState(false);
  const [freshGuide, setFreshGuide] = useState(false);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  const guideTrigger = useRef<HTMLButtonElement>(null);
  const environment = solutions.find(item => item.id === state.environment)?.title || '';
  const lines = state.answers ? briefingLines(state.answers) : [];
  const details = lines.length ? lines.map(line => `${line.label}: ${line.value}`).join('\n') : state.interest ? `Interesse: ${interestNames[state.interest]}` : '';
  const url = contactUrl(environment, details, state.campaign);
  const complete = (answers: Answers) => { setAnswers(answers); setGuideOpen(false); requestAnimationFrame(() => panelHeading.current?.focus({ preventScroll: true })); };
  return (
    <section
      className="contact-section wrap"
      id="contato"
      aria-labelledby="contact-title"
    >
      <div className="contact-intro" data-reveal>
        <p className="eyebrow">
          <span className="small-line" /> VAMOS CONVERSAR
        </p>
        <h2 id="contact-title" tabIndex={-1}>
          Tudo começa
          <br />
          com o seu <span>ambiente.</span>
        </h2>
        <p>
          Conte o que você precisa proteger, conectar ou organizar. O primeiro
          passo é entender a sua necessidade.
        </p>
        <a className="text-link" href="#solucoes">
          Rever os ambientes <ArrowDown size={15} />
        </a>
      </div>
      <div className="contact-panel" data-reveal data-reveal-delay="120">
        {guideOpen ? <GuideLoader key={state.revision} initial={freshGuide ? { ...emptyAnswers } : state.answers || { ...emptyAnswers, environment: state.environment }} onComplete={complete} onCancel={() => { setGuideOpen(false); requestAnimationFrame(() => guideTrigger.current?.focus({ preventScroll: true })); }} /> : <>
        <MessageSquare className="contact-icon" size={26} aria-hidden="true" />
        <h3 ref={panelHeading} tabIndex={-1}>{lines.length ? 'Seu roteiro para nossa conversa.' : 'Vamos pensar na sua solução.'}</h3>
        <p>
          Uma conversa sobre o espaço, a estrutura atual e o que precisa
          funcionar melhor.
        </p>
        {environment && (
          <p className="selected-environment">
            Ambiente: <strong>{environment}</strong>
          </p>
        )}
        {state.interest && !lines.length && <p className="selected-interest">Interesse: <strong>{interestNames[state.interest]}</strong></p>}
        {lines.length ? <div className="briefing-summary"><ClipboardCheck size={23} aria-hidden="true" /><dl>{lines.map(line => <div key={line.label}><dt>{line.label}</dt><dd>{line.value}</dd></div>)}</dl><p><strong>O que podemos avaliar</strong>{discussionTopics(state.answers!)}</p><span>Resumo das suas escolhas para orientar a conversa. A solução será definida após a análise do ambiente.</span><div className="summary-actions"><Button ref={guideTrigger} variant="ghost" onClick={() => { setFreshGuide(false); setGuideOpen(true); }}>Revisar respostas</Button><Button variant="ghost" onClick={() => { setFreshGuide(true); setAnswers(null); setGuideOpen(true); }}>Recomeçar</Button></div></div> : <div className="guide-invitation"><span>POR ONDE COMEÇAR?</span><p>Quatro perguntas para organizar o que você precisa.</p><Button ref={guideTrigger} variant="outline" className="guide-start" disabled={!ready} onClick={() => { setFreshGuide(false); setGuideOpen(true); }}>Descobrir minha necessidade <ArrowRight size={17} /></Button></div>}
        <dl className="contact-details">
          <div>
            <dt>CONTATO</dt>
            <dd>
              {company.whatsapp || company.email || (
                <span className="sr-only">Não informado</span>
              )}
            </dd>
          </div>
          <div>
            <dt>REGIÃO DE ATENDIMENTO</dt>
            <dd>
              {company.region || <span className="sr-only">Não informada</span>}
            </dd>
          </div>
        </dl>
        {url ? (
          <a
            className="button-primary contact-button"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Solicitar análise <ArrowUpRight size={20} />
          </a>
        ) : (
          <>
            <Button
              className="button-primary contact-button unavailable-contact"
              disabled
              aria-describedby="contact-status"
            >
              Solicitar análise <ArrowUpRight size={20} />
            </Button>
            <p id="contact-status" className="contact-status">
              Canal de contato disponível em breve.
            </p>
          </>
        )}
        </>}
      </div>
    </section>
  );
}
```

### `components/guide-loader.tsx`
```tsx
'use client';
import { useEffect, useState, type ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import type { Answers } from '@/lib/briefing';
type Props = { initial: Answers; onComplete: (answers: Answers) => void; onCancel: () => void };
export function GuideLoader(props: Props) {
  const [Guide, setGuide] = useState<ComponentType<Props> | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    import('./guided-briefing').then(module => { if (active) setGuide(() => module.default); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  if (Guide) return <Guide {...props} />;
  return <div className="guide-loading"><output>{failed ? 'As perguntas não carregaram. Recarregue a página para tentar novamente ou volte ao contato.' : 'Preparando as perguntas…'}</output>{failed && <Button variant="outline" onClick={() => window.location.reload()}>Recarregar a página</Button>}<Button variant="ghost" onClick={props.onCancel}>Voltar ao contato</Button></div>;
}
```

### `components/guided-briefing.tsx`
```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { solutions } from '@/lib/site-content';
import { problemOptions, structureOptions, goalOptions, updateAnswer, isComplete, type Answers } from '@/lib/briefing';

const fields = ['environment', 'problem', 'structure', 'goal'] as const;
export default function GuidedBriefing({ initial, onComplete, onCancel }: { initial: Answers; onComplete: (answers: Answers) => void; onCancel: () => void }) {
  const [answers, setAnswers] = useState(initial);
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [step]);
  const questions = [
    { title: 'Qual é o seu ambiente?', caption: 'Vamos partir do lugar que precisa de atenção.', options: [...solutions.map(item => ({ id: item.id, label: item.title })), { id: 'unsure', label: 'Ainda vou definir' }] },
    { title: 'O que você quer resolver?', caption: 'Escolha a prioridade para esta conversa.', options: problemOptions },
    { title: 'O que existe hoje no local?', caption: 'Isso ajuda a entender o ponto de partida.', options: structureOptions },
    { title: 'Qual resultado você procura?', caption: 'Podemos ajudar a definir os próximos passos.', options: goalOptions(answers.problem) },
  ];
  const question = questions[step]; const field = fields[step];
  const canAdvance = question.options.some(option => option.id === answers[field]);
  return <div className="guided-briefing">
    <div className="guide-top"><span>VAMOS ENTENDER SEU AMBIENTE</span><Button className="guide-close" variant="ghost" onClick={onCancel}>Fechar</Button></div>
    <div className="guide-progress" aria-hidden="true">{fields.map((item, index) => <span key={item} data-current={index <= step} />)}</div>
    <progress className="sr-only" aria-label="Progresso das perguntas" max={4} value={step + 1} aria-valuetext={`Pergunta ${step + 1} de 4`} />
    <span className="guide-step">{String(step + 1).padStart(2, '0')} / 04</span>
    <h4 id="guide-question" ref={heading} tabIndex={-1}>{question.title}</h4>
    <p className="guide-caption">{question.caption}</p>
    <RadioGroup className="guide-options" aria-labelledby="guide-question" value={answers[field]} onValueChange={value => setAnswers(current => updateAnswer(current, field, String(value)))}>
      {question.options.map(option => <label key={option.id} className="guide-option"><RadioGroupItem value={option.id} /><span>{option.label}</span></label>)}
    </RadioGroup>
    <div className="guide-actions"><Button className="guide-back" variant="ghost" onClick={() => setStep(current => current - 1)} disabled={step === 0}><ArrowLeft size={16} />Voltar</Button><Button className="guide-next" disabled={!canAdvance} onClick={() => { if (step < 3) setStep(current => current + 1); else if (isComplete(answers)) onComplete(answers); }}>{step < 3 ? 'Continuar' : 'Ver meu resumo'}{step < 3 ? <ArrowRight size={16} /> : <Check size={16} />}</Button></div>
    <p className="guide-privacy">Sem cadastro. As respostas ficam apenas nesta página até você decidir entrar em contato.</p>
  </div>;
}
```

### `components/motion-effects.tsx`
```tsx
'use client';

import { useEffect } from 'react';

/** Motion enhances the server-rendered content; nothing depends on it to appear. */
export function MotionEffects() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 801px)');
    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>('.hero');
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-motion-scene]'));
    const played = new WeakSet<Element>();
    const animations = new Map<Element, Animation>();
    let observer: IntersectionObserver | undefined;
    let frame = 0;

    const updateScroll = () => {
      frame = 0;
      const range = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--reading-progress', String(range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0));
      const offset = desktop.matches && hero ? Math.min(24, Math.max(0, -hero.getBoundingClientRect().top * 0.055)) : 0;
      root.style.setProperty('--hero-drift', `${offset}px`);
    };
    const queueScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScroll);
    };
    const finishAnimations = () => {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    const reveal = (element: HTMLElement) => {
      if (played.has(element)) return;
      played.add(element);
      element.dataset.revealed = 'true';
      // Do not fade the main title or image: keep the initial content readable.
      const solid = element.dataset.reveal === 'solid';
      const animation = element.animate(
        [
          { opacity: solid ? 1 : 0, transform: `translate3d(0, ${solid ? 18 : 32}px, 0)` },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ],
        { duration: 760, delay: Number(element.dataset.revealDelay || 0), easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' },
      );
      animations.set(element, animation);
      animation.onfinish = () => animations.delete(element);
    };
    const configure = () => {
      observer?.disconnect();
      finishAnimations();
      window.cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener('scroll', queueScroll);
      window.removeEventListener('resize', queueScroll);
      if (reduced.matches) {
        delete root.dataset.motionReady;
        root.style.removeProperty('--reading-progress');
        root.style.removeProperty('--hero-drift');
        return;
      }
      root.dataset.motionReady = 'true';
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (element.hasAttribute('data-motion-scene')) {
            element.toggleAttribute('data-in-view', entry.isIntersecting);
          }
          if (entry.isIntersecting && element.hasAttribute('data-reveal')) reveal(element);
        }
      }, { threshold: 0.08 });
      [...reveals, ...scenes].forEach((element) => observer?.observe(element));
      updateScroll();
      window.addEventListener('scroll', queueScroll, { passive: true });
      window.addEventListener('resize', queueScroll);
    };
    const showFocused = (event: FocusEvent) => {
      // Pointer focus must not move a pressed control before mouseup/touchend.
      if (!(event.target instanceof Element) || !event.target.matches(':focus-visible')) return;
      for (const [element, animation] of animations) {
        if (element.contains(event.target)) {
          animation.cancel();
          animations.delete(element);
        }
      }
    };
    configure();
    reduced.addEventListener('change', configure);
    document.addEventListener('focusin', showFocused);
    return () => {
      observer?.disconnect();
      finishAnimations();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queueScroll);
      window.removeEventListener('resize', queueScroll);
      reduced.removeEventListener('change', configure);
      document.removeEventListener('focusin', showFocused);
      delete root.dataset.motionReady;
      root.style.removeProperty('--reading-progress');
      root.style.removeProperty('--hero-drift');
      scenes.forEach((scene) => scene.removeAttribute('data-in-view'));
    };
  }, []);

  return <div className="reading-progress" aria-hidden="true" />;
}
```

### `components/site-header.tsx`
```tsx
'use client';
import { useState } from 'react';
/* oxlint-disable next/no-img-element -- Preserve the official SVG without loading an image optimizer into this static page. */
import { ArrowUpRight, Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';

const links = [
  { href: '#integracao', label: 'Nossa essência' },
  { href: '#solucoes', label: 'Soluções' },
  { href: '#metodo', label: 'Como trabalhamos' },
];
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header wrap">
      <a className="brand" href="#inicio" aria-label="SC Soluções — início">
        <img
          src="/brand/sc-logo.svg"
          width="1536"
          height="1024"
          alt="SC Soluções"
        />
      </a>
      <nav aria-label="Navegação principal">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href="#contato">
        Vamos conversar <ArrowUpRight size={17} aria-hidden="true" />
      </a>
      <div className="mobile-menu">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="menu-trigger" aria-label="Abrir menu">
            <Menu size={23} />
          </SheetTrigger>
          <SheetContent className="mobile-sheet" showCloseButton={false}>
            <SheetTitle className="mobile-title">SC Soluções</SheetTitle>
            <SheetDescription>Segurança e Tecnologia</SheetDescription>
            <SheetClose className="menu-close" aria-label="Fechar menu">
              <X size={24} />
            </SheetClose>
            <nav aria-label="Navegação móvel">
              {[...links, { href: '#contato', label: 'Vamos conversar' }].map(
                (link, index) => (
                  <a
                    href={link.href}
                    key={link.href}
                    onClick={() => setOpen(false)}
                  >
                    <span>0{index + 1}</span>
                    {link.label}
                    <ArrowUpRight size={20} />
                  </a>
                ),
              )}
            </nav>
            <p className="mobile-menu-note">
              Do diagnóstico ao sistema funcionando.
            </p>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
```

### `components/systems-diagram.tsx`
```tsx
'use client';
import { useEffect, useState } from 'react';
import { Cctv, ScanFace, Wifi, Zap, Network } from 'lucide-react';

const connections = [
  { path: 'M101 100 H190 Q210 100 210 120 V190 Q210 215 235 215 H280', phase: 1 },
  { path: 'M459 100 H370 Q350 100 350 120 V190 Q350 215 325 215 H280', phase: 1 },
  { path: 'M101 301 H190 Q210 301 210 281 V240 Q210 215 235 215 H280', phase: 2 },
  { path: 'M459 301 H370 Q350 301 350 281 V240 Q350 215 325 215 H280', phase: 2 },
];

export function SystemsDiagram() {
  const [phase, setPhase] = useState(2);
  useEffect(() => {
    const simplified = window.matchMedia(
      '(max-width: 800px), (prefers-reduced-motion: reduce)',
    );
    let observer: IntersectionObserver | undefined;
    const configure = () => {
      observer?.disconnect();
      if (simplified.matches) {
        setPhase(2);
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting)
              setPhase(
                Number((entry.target as HTMLElement).dataset.storyIndex),
              );
        },
        { rootMargin: '-32% 0px -38% 0px', threshold: 0 },
      );
      document
        .querySelectorAll('[data-story-index]')
        .forEach((el) => observer?.observe(el));
    };
    configure();
    simplified.addEventListener('change', configure);
    return () => {
      observer?.disconnect();
      simplified.removeEventListener('change', configure);
    };
  }, []);
  const phases = [
    'Entender o ambiente',
    'Preparar a base',
    'Integrar os sistemas',
  ];
  return (
    <figure
      className="systems-diagram"
      data-phase={phase}
      data-motion-scene
      data-reveal="solid"
      aria-labelledby="diagram-caption"
    >
      <div className="diagram-header">
        <span>ARQUITETURA DA SOLUÇÃO</span>
        <Network size={16} aria-hidden="true" />
      </div>
      <div className="diagram-map">
        <svg
          className="connection-map"
          viewBox="0 0 560 430"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="connection-color">
              <stop stopColor="#09A0F6" />
              <stop offset="1" stopColor="#6DE9F6" />
            </linearGradient>
          </defs>
          <path
            className="connection-grid"
            d="M0 107 H560 M0 215 H560 M0 322 H560 M140 0 V430 M280 0 V430 M420 0 V430"
          />
          <path
            className="connection-path base-connection"
            d="M101 100 H190 Q210 100 210 120 V190 Q210 215 235 215 H280 M459 100 H370 Q350 100 350 120 V190 Q350 215 325 215 H280"
          />
          <path
            className="connection-path security-connection"
            d="M101 301 H190 Q210 301 210 281 V240 Q210 215 235 215 H280 M459 301 H370 Q350 301 350 281 V240 Q350 215 325 215 H280"
          />
          <g key={phase} className="signal-layer">
            {connections.filter((connection) => connection.phase <= phase).map((connection, index) => (
              <path
                key={connection.path}
                className="connection-signal"
                d={connection.path}
                pathLength="100"
                style={{ animationDelay: `${index * 150}ms` }}
              />
            ))}
          </g>
          <circle className="map-ring" cx="280" cy="215" r="92" />
          <circle className="map-ring outer-ring" cx="280" cy="215" r="113" />
          <circle className="signal-orbit" cx="280" cy="215" r="103" pathLength="100" />
        </svg>
        <div className="diagram-node node-energy">
          <span className="node-icon">
            <Zap />
          </span>
          <strong>Alimentação</strong>
          <span>Proteção e continuidade</span>
        </div>
        <div className="diagram-node node-network">
          <span className="node-icon">
            <Wifi />
          </span>
          <strong>Conectividade</strong>
          <span>Redes e Wi-Fi</span>
        </div>
        <div className="diagram-hub">
          <span className="hub-cross" aria-hidden="true">
            +
          </span>
          <strong>
            Seu
            <br />
            ambiente
          </strong>
        </div>
        <div className="diagram-node node-security">
          <span className="node-icon">
            <Cctv />
          </span>
          <strong>Segurança</strong>
          <span>Câmeras e alarmes</span>
        </div>
        <div className="diagram-node node-access">
          <span className="node-icon">
            <ScanFace />
          </span>
          <strong>Acessos</strong>
          <span>Controle e identificação</span>
        </div>
      </div>
      <figcaption id="diagram-caption">
        <span className="diagram-dot" />
        <span>{phases[phase]}</span>
        <small>CONCEITO</small>
      </figcaption>
    </figure>
  );
}
```

### `components/experience/environment-scene.tsx`
```tsx
'use client';
/* oxlint-disable next/no-img-element -- Local responsive WebP assets are precompressed for this static site. */
import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { systems, type Environment, type SystemId, type ScenarioId } from '@/lib/experience-content';
import { availabilityLabel, type Availability } from '@/lib/experience-state';
import { systemIcons } from './system-icons';

export function EnvironmentScene({ environment, selected, scenario, states, onSelect }: {
  environment: Environment; selected: SystemId | null; scenario: ScenarioId;
  states: Record<SystemId, Availability>; onSelect: (system: SystemId) => void;
}) {
  const [failed, setFailed] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => sceneRef.current?.toggleAttribute('data-in-view', entry.isIntersecting));
    if (sceneRef.current) observer.observe(sceneRef.current);
    return () => observer.disconnect();
  }, []);
  const anchor = environment.points[selected || 'network'];
  return (
    <div className="environment-scene" data-scenario={scenario} ref={sceneRef}>
      <div className="scene-caption"><span>EXEMPLO · {environment.name.toLocaleUpperCase('pt-BR')}</span><span>Toque nos sistemas</span></div>
      <div className="scene-art">
        {!failed ? <img
          src={`/images/environments/${environment.id}.webp`}
          srcSet={`/images/environments/${environment.id}-small.webp 660w, /images/environments/${environment.id}.webp 1200w`}
          sizes="(max-width: 800px) 100vw, 65vw"
          width={1200} height={800} alt={environment.alt} decoding="async"
          onError={() => setFailed(true)}
        /> : <div className="scene-image-fallback"><ImageOff size={30} /><p>A imagem não carregou. Você pode explorar todos os sistemas pelos controles abaixo.</p></div>}
        <svg className="scene-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" key={`${scenario}-${selected}`}>
          {systems.filter(system => system.id !== (selected || 'network')).map(system => {
            const point = environment.points[system.id];
            const inactive = states[system.id] === 'unavailable' || states[selected || 'network'] === 'unavailable';
            const path = `M ${anchor.x} ${anchor.y} L ${anchor.x} ${point.y} L ${point.x} ${point.y}`;
            return <g key={system.id} data-offline={inactive}>
              <path className="scene-route" d={path} />
              {!inactive && <path className="scene-signal" d={path} pathLength="100" />}
            </g>;
          })}
        </svg>
        {systems.map((system, index) => {
          const Icon = systemIcons[system.id]; const point = environment.points[system.id];
          return <Button key={system.id} className="scene-hotspot" variant="outline"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            data-status={states[system.id]} aria-pressed={selected === system.id}
            aria-label={`Explorar ${system.name} — ${availabilityLabel[states[system.id]]}`}
            onClick={() => onSelect(system.id)} aria-controls="explorer-detail">
            <Icon size={18} aria-hidden="true" /><span className="hotspot-number">{index + 1}</span>
          </Button>;
        })}
      </div>
      <div className="scene-key"><span><i /> Funcionando</span><span><i /> {scenario === 'visitor' ? 'Aguardando autorização' : 'Funcionando na reserva'}</span><span><i /> Sem energia</span></div>
    </div>
  );
}
```

### `components/experience/experience-loader.tsx`
```tsx
'use client';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Network, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ExperienceLoader() {
  const host = useRef<HTMLDivElement>(null);
  const [Explorer, setExplorer] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const importing = useRef(false);
  const mounted = useRef(true);
  const load = () => {
    if (importing.current) return;
    importing.current = true; setFailed(false);
    import('./explorer').then(module => { if (mounted.current) setExplorer(() => module.default); }).catch(() => { if (mounted.current) { setFailed(true); importing.current = false; } });
  };
  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- Expose the interactive control only after hydration; the HTML fallback remains usable without JavaScript.
    mounted.current = true; setReady(true);
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { load(); observer.disconnect(); } }, { rootMargin: '120px' });
    if (host.current) observer.observe(host.current);
    return () => { mounted.current = false; observer.disconnect(); };
  }, []);
  return <div ref={host} className="experience-host">
    {Explorer ? <Explorer /> : <div className="experience-static">
      <Network size={42} aria-hidden="true" /><span className="experience-kicker">EXPLORE SEU AMBIENTE</span><h3>Entenda o que mantém tudo funcionando.</h3>
      <p>Com energia e rede local, as câmeras podem gravar no próprio imóvel. Para ver as imagens pelo celular, você também precisa de internet.</p>
      <p>Escolha um ambiente e veja o que acontece quando falta luz, a internet cai ou chega um visitante.</p>
      {failed && <p>A experiência não carregou. Recarregue a página para tentar novamente.</p>}
      {ready && <Button onClick={failed ? () => window.location.reload() : load} variant="outline" className="experience-load-button">{failed ? 'Recarregar a página' : 'Explorar os ambientes'}<ArrowRight size={18} /></Button>}
      <noscript><p>Você pode conhecer nossas soluções e solicitar uma análise pela navegação desta página.</p></noscript>
    </div>}
  </div>;
}
```

### `components/experience/explorer.tsx`
```tsx
'use client';
import { useState } from 'react';
import { ArrowUpRight, RotateCcw, ArrowRight, CircleCheck, CircleMinus, Clock3, BatteryCharging, Globe, HardDrive, Network, ShieldCheck } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { environments, systems, scenarios, type ScenarioId, type SystemId } from '@/lib/experience-content';
import { deriveExperience, availabilityLabel } from '@/lib/experience-state';
import { AnalysisLink } from '@/components/analysis-link';
import { EnvironmentScene } from './environment-scene';
import { systemIcons } from './system-icons';

export default function Explorer() {
  const [environmentId, setEnvironmentId] = useState('comercios');
  const [scenario, setScenario] = useState<ScenarioId>('normal');
  const [selected, setSelected] = useState<SystemId | null>(null);
  const [backup, setBackup] = useState(false);
  const environment = environments.find(item => item.id === environmentId)!;
  const result = deriveExperience(environment, scenario, backup);
  const system = systems.find(item => item.id === selected);
  const reset = () => { setScenario('normal'); setBackup(false); setSelected(null); };
  const statusItems = [
    { id: 'network', icon: Network, label: 'Rede local', status: result.states.network, text: availabilityLabel[result.states.network] },
    { id: 'recording', icon: HardDrive, label: 'Gravação no local', status: result.states.recording, text: availabilityLabel[result.states.recording] },
    { id: 'access', icon: ShieldCheck, label: 'Controle de acesso', status: result.states.access, text: availabilityLabel[result.states.access] },
    { id: 'remote', icon: Globe, label: 'Imagens pelo celular', status: result.remote ? 'available' : scenario === 'power-out' && backup ? 'unknown' : 'unavailable', text: result.remote ? 'Funcionando' : scenario === 'power-out' && backup ? 'Depende da operadora' : 'Indisponíveis' },
  ];
  const selectedStatus = system ? result.states[system.id] : 'available';
  const StatusIcon = selectedStatus === 'unavailable' ? CircleMinus : selectedStatus === 'pending' ? Clock3 : selectedStatus === 'reserve' ? BatteryCharging : CircleCheck;
  return (
    <div className="experience-explorer">
      <div className="explorer-heading"><div><span className="experience-kicker">EXPLORE SEU AMBIENTE</span><h3>Entenda o que mantém tudo funcionando.</h3></div><p>Escolha um ambiente.<br />Depois, teste uma situação.</p></div>
      <Tabs value={environmentId} onValueChange={value => { setEnvironmentId(String(value)); reset(); }} className="environment-tabs">
        <TabsList className="environment-tab-list" aria-label="Tipo de ambiente">
          {environments.map(item => <TabsTrigger key={item.id} value={item.id} className="environment-tab">{item.name}</TabsTrigger>)}
        </TabsList>
        {environments.map(item => <TabsContent key={item.id} value={item.id} className="environment-panel">
          {item.id === environmentId && <>
            <div className="scenario-controls">
              <div className="scenario-heading"><div><span className="experience-kicker">E SE…?</span><h4>O que acontece em cada situação?</h4></div><Button variant="ghost" className="reset-scenario" onClick={reset} disabled={scenario === 'normal' && !selected}><RotateCcw size={15} />Voltar ao normal</Button></div>
              <fieldset className="scenario-options" aria-label="Situações para simular">
                {scenarios.map(entry => <Button key={entry.id} variant="outline" className="scenario-option" aria-pressed={scenario === entry.id} onClick={() => { setScenario(entry.id); setBackup(false); }}><span>{entry.name}</span><small>{entry.caption}</small><ArrowRight size={17} aria-hidden="true" /></Button>)}
              </fieldset>
              {scenario === 'power-out' && <div className="backup-control"><label htmlFor={`backup-${item.id}`}><strong>Usar energia de reserva</strong><span>Para câmeras, rede, gravador e controle de acesso.</span></label><Switch id={`backup-${item.id}`} checked={backup} onCheckedChange={setBackup} aria-label="Usar energia de reserva" className="backup-switch" /></div>}
            </div>
            <div className="scenario-area">
              <div className="scenario-result" aria-live="polite" aria-atomic="true" data-tone={result.tone}>
                <div className="scenario-explanation"><h5>{result.title}</h5><p>{result.explanation}</p><p className="scenario-condition">{result.condition}</p></div>
                <ul className="scenario-statuses">{statusItems.map(item => <li key={item.id} data-system={item.id} data-status={item.status}><item.icon size={18} aria-hidden="true" /><span>{item.label}<strong>{item.text}</strong></span></li>)}</ul>
              </div>
            </div>
            <div className="explorer-main">
              <div className="scene-column">
                <EnvironmentScene key={item.id} environment={environment} selected={selected} scenario={scenario} states={result.states} onSelect={setSelected} />
                <fieldset className="system-selector" aria-label="Sistemas do ambiente">
                  {systems.map((entry, index) => { const Icon = systemIcons[entry.id]; return <Button key={entry.id} className="system-option" variant="ghost" aria-pressed={selected === entry.id} aria-controls="explorer-detail" onClick={() => setSelected(entry.id)}><span>{index + 1}</span><Icon aria-hidden="true" size={16} />{entry.name}</Button>; })}
                </fieldset>
              </div>
              <div className="explorer-detail" id="explorer-detail" aria-live="polite" aria-atomic="true">
                <div className="detail-mark">{system ? (() => { const Icon = systemIcons[system.id]; return <Icon size={28} />; })() : <ShieldCheck size={28} />}</div>
                <span className="experience-kicker">{system ? system.short : 'CONHEÇA OS SISTEMAS'}</span>
                <h4>{system ? system.name : environment.title}</h4>
                <p>{system ? (system.id === 'recording' ? environment.recording : system.description) : environment.description}</p>
                {system && <span className="system-availability" data-status={selectedStatus}><StatusIcon size={15} />{availabilityLabel[selectedStatus]}</span>}
                <div className="detail-dependency"><span>{system ? 'O que precisa para funcionar' : 'Quer entender um equipamento?'}</span><p>{system ? system.dependency : 'Toque em um ponto da imagem ou escolha um sistema na lista para ver sua função.'}</p></div>
                <AnalysisLink id={environment.id} title={environment.name} interest={selected || ''} className="explorer-contact-link" label="Pensar no meu ambiente" />
              </div>
            </div>
          </>}
        </TabsContent>)}
      </Tabs>
      <div className="experience-footer"><p>Exemplo ilustrativo. Os equipamentos e a reserva são definidos para cada projeto.</p><a href="#contato">Vamos conversar <ArrowUpRight size={15} /></a></div>
    </div>
  );
}
```

### `components/experience/system-icons.tsx`
```tsx
import { Cctv, Wifi, HardDrive, BatteryCharging, DoorOpen } from 'lucide-react';
export const systemIcons = { cameras: Cctv, network: Wifi, recording: HardDrive, power: BatteryCharging, access: DoorOpen };
```

### `lib/briefing.ts`
```ts
import { solutions } from './site-content';
export type EnvironmentId = (typeof solutions)[number]['id'];
export type InterestId = 'cameras' | 'network' | 'recording' | 'power' | 'access';
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;
export const interestNames: Record<InterestId, string> = { cameras: 'Câmeras', network: 'Rede local', recording: 'Gravação', power: 'Alimentação', access: 'Controle de acesso' };
export const problemOptions = [
  { id: 'security', label: 'Acompanhar e proteger o ambiente' },
  { id: 'connectivity', label: 'Melhorar a rede e o Wi-Fi' },
  { id: 'access', label: 'Organizar entradas e acessos' },
  { id: 'continuity', label: 'Reduzir interrupções dos sistemas' },
  { id: 'unsure', label: 'Preciso de orientação' },
] as const;
export const structureOptions = [
  { id: 'new', label: 'Vou começar do zero' },
  { id: 'existing', label: 'Já tenho equipamentos instalados' },
  { id: 'expanding', label: 'Quero ampliar a estrutura atual' },
  { id: 'unsure', label: 'Ainda não sei informar' },
] as const;
const goals = {
  security: [{ id: 'visibility', label: 'Ter mais visibilidade sobre o local' }, { id: 'review', label: 'Conferir a solução que já existe' }],
  connectivity: [{ id: 'coverage', label: 'Melhorar a cobertura de Wi-Fi' }, { id: 'stability', label: 'Ter uma conexão mais estável' }],
  access: [{ id: 'visitors', label: 'Organizar a entrada de visitantes' }, { id: 'restricted', label: 'Controlar o acesso a áreas internas' }],
  continuity: [{ id: 'power', label: 'Planejar alimentação de reserva' }, { id: 'reliability', label: 'Entender a causa das interrupções' }],
  unsure: [{ id: 'diagnosis', label: 'Entender o que precisa ser resolvido' }, { id: 'planning', label: 'Planejar uma nova solução' }],
};
export type ProblemId = keyof typeof goals;
export type Answers = { environment: EnvironmentId | 'unsure' | ''; problem: ProblemId | ''; structure: string; goal: string };
export const emptyAnswers: Answers = { environment: '', problem: '', structure: '', goal: '' };
export function goalOptions(problem: Answers['problem']) {
  return [...goals[problem || 'unsure'], { id: 'unsure', label: 'Quero ajuda para definir' }];
}
export function updateAnswer(answers: Answers, field: keyof Answers, value: string): Answers {
  const next = { ...answers, [field]: value } as Answers;
  if (field === 'problem' && value !== answers.problem) next.goal = '';
  return next;
}
export function isComplete(answers: Answers) {
  return (answers.environment === 'unsure' || solutions.some(s => s.id === answers.environment))
    && problemOptions.some(p => p.id === answers.problem)
    && structureOptions.some(s => s.id === answers.structure)
    && goalOptions(answers.problem).some(g => g.id === answers.goal);
}
export function briefingLines(answers: Answers) {
  if (!isComplete(answers)) return [];
  return [
    { label: 'Ambiente', value: solutions.find(s => s.id === answers.environment)?.title || 'A definir' },
    { label: 'Prioridade', value: problemOptions.find(p => p.id === answers.problem)!.label },
    { label: 'Estrutura', value: structureOptions.find(s => s.id === answers.structure)!.label },
    { label: 'Objetivo', value: goalOptions(answers.problem).find(g => g.id === answers.goal)!.label },
  ];
}
export function discussionTopics(answers: Answers) {
  const subjects: Record<ProblemId, string> = {
    security: 'Pontos de interesse, posição das câmeras e forma de gravação.',
    connectivity: 'Uso da rede, barreiras do ambiente e infraestrutura existente.',
    access: 'Fluxo de pessoas, áreas restritas e procedimento de autorização.',
    continuity: 'Alimentação dos equipamentos, dependências da rede e histórico de falhas.',
    unsure: 'Necessidades do ambiente e condições da infraestrutura.',
  };
  return subjects[answers.problem || 'unsure'];
}
export function parseContact(search: string) {
  const params = new URLSearchParams(search);
  const environment = solutions.find(s => s.id === params.get('ambiente'))?.id || '';
  const value = params.get('interesse');
  const interest = value && Object.hasOwn(interestNames, value) ? value as InterestId : '';
  return { environment, interest: environment ? interest : '' } as { environment: EnvironmentId | ''; interest: InterestId | '' };
}
export function campaignAttribution(search: string) {
  const params = new URLSearchParams(search);
  const values = campaignKeys
    .map(key => params.get(key)?.trim() || '')
    .filter(value => /^[a-z0-9._-]{1,60}$/i.test(value));
  return values.join(' / ');
}
export function contactHref(environment: string, interest = '', currentSearch = '') {
  const parsed = parseContact(`ambiente=${encodeURIComponent(environment)}&interesse=${encodeURIComponent(interest)}`);
  const query = new URLSearchParams();
  if (parsed.environment) query.set('ambiente', parsed.environment);
  if (parsed.interest) query.set('interesse', parsed.interest);
  const current = new URLSearchParams(currentSearch);
  for (const key of campaignKeys) {
    const value = current.get(key)?.trim() || '';
    if (/^[a-z0-9._-]{1,60}$/i.test(value)) query.set(key, value);
  }
  return `${query.size ? `?${query}` : ''}#contato`;
}
```

### `lib/experience-content.ts`
```ts
import { solutions } from './site-content';

export type EnvironmentId = (typeof solutions)[number]['id'];
export type SystemId = 'cameras' | 'network' | 'recording' | 'power' | 'access';
export type ScenarioId = 'normal' | 'power-out' | 'internet-out' | 'visitor';
export type Point = { x: number; y: number };

export const systems: { id: SystemId; name: string; short: string; description: string; dependency: string }[] = [
  { id: 'cameras', name: 'Câmeras', short: 'Ver o ambiente', description: 'Captam as imagens e as enviam ao gravador instalado no local.', dependency: 'Energia e conexão com o gravador pela rede local.' },
  { id: 'network', name: 'Rede local', short: 'Conectar os equipamentos', description: 'Liga câmeras, gravador e outros equipamentos dentro do imóvel. Pode funcionar mesmo sem internet.', dependency: 'Equipamentos de rede ligados e conexões configuradas.' },
  { id: 'recording', name: 'Gravação', short: 'Guardar as imagens', description: 'Armazena as imagens das câmeras para você consultar depois.', dependency: 'Câmeras e gravador com energia, rede local e espaço para salvar as imagens.' },
  { id: 'power', name: 'Alimentação', short: 'Manter a energia', description: 'Fornece energia aos equipamentos. A reserva, como um nobreak, mantém os sistemas ligados durante uma falta de luz.', dependency: 'Reserva dimensionada para os equipamentos conectados. A duração depende da bateria e do consumo.' },
  { id: 'access', name: 'Controle de acesso', short: 'Autorizar a entrada', description: 'Controla quem pode entrar. Com energia de reserva, continua funcionando durante a falta de luz.', dependency: 'Energia para o controlador e os dispositivos de entrada, com as permissões configuradas.' },
];

export interface Environment {
  id: EnvironmentId;
  name: string;
  title: string;
  description: string;
  alt: string;
  visit: string;
  recording: string;
  backupSystems: SystemId[];
  points: Record<SystemId, Point>;
}

export const environments: Environment[] = [
  {
    id: 'residencias', name: 'Casa', title: 'Sua casa, conectada.',
    description: 'Câmeras na entrada, imagens gravadas e controle de quem pode entrar.',
    alt: 'Cena conceitual em perspectiva de uma residência, com sala, cozinha e entrada.',
    visit: 'O vídeo porteiro sinaliza a chegada. O morador verifica a solicitação antes de autorizar a entrada.',
    recording: 'Guarda, no próprio imóvel, as imagens da entrada e das áreas monitoradas.',
    backupSystems: ['cameras', 'network', 'recording', 'access'],
    points: { cameras: { x: 22, y: 14 }, network: { x: 49, y: 21 }, recording: { x: 76, y: 26 }, power: { x: 59, y: 61 }, access: { x: 76, y: 74 } },
  },
  {
    id: 'condominios', name: 'Condomínio', title: 'Cada entrada, com critério.',
    description: 'Imagens da portaria e das áreas comuns, com entrada de visitantes autorizada pelo responsável.',
    alt: 'Cena conceitual em perspectiva de uma portaria de condomínio, com recepção e acesso de pedestres.',
    visit: 'A portaria identifica o visitante e confirma a autorização com o responsável antes de liberar a entrada.',
    recording: 'Guarda, no próprio condomínio, as imagens da portaria e das áreas monitoradas.',
    backupSystems: ['cameras', 'network', 'recording', 'access'],
    points: { cameras: { x: 21, y: 22 }, network: { x: 47, y: 31 }, recording: { x: 68, y: 37 }, power: { x: 44, y: 66 }, access: { x: 69, y: 73 } },
  },
  {
    id: 'comercios', name: 'Comércio', title: 'Sua operação, por inteiro.',
    description: 'Imagens do caixa e da loja, com acesso controlado ao estoque e às áreas internas.',
    alt: 'Cena conceitual em perspectiva de uma loja com balcão, prateleiras e entrada.',
    visit: 'Um prestador solicita acesso à área de serviço. O responsável confere a necessidade antes de liberar a passagem.',
    recording: 'Guarda, na própria loja, as imagens da entrada, do caixa e da área de vendas.',
    backupSystems: ['cameras', 'network', 'recording', 'access'],
    points: { cameras: { x: 21, y: 18 }, network: { x: 49, y: 26 }, recording: { x: 76, y: 38 }, power: { x: 61, y: 71 }, access: { x: 86, y: 66 } },
  },
  {
    id: 'empresas', name: 'Escritório', title: 'Uma base para o trabalho.',
    description: 'Rede para os equipamentos, imagens da recepção e acesso controlado às áreas internas.',
    alt: 'Cena conceitual em perspectiva de um escritório com mesas, sala de reunião e área de tecnologia.',
    visit: 'A recepção verifica a visita e a autorização da pessoa responsável antes de permitir acesso às áreas internas.',
    recording: 'Guarda, no próprio escritório, as imagens da recepção e dos acessos.',
    backupSystems: ['cameras', 'network', 'recording', 'access'],
    points: { cameras: { x: 21, y: 15 }, network: { x: 50, y: 26 }, recording: { x: 72, y: 33 }, power: { x: 56, y: 69 }, access: { x: 82, y: 69 } },
  },
];

export const scenarios: { id: ScenarioId; name: string; caption: string }[] = [
  { id: 'normal', name: 'Tudo conectado', caption: 'Sem falhas no momento' },
  { id: 'power-out', name: 'Faltou energia', caption: 'Com ou sem reserva' },
  { id: 'internet-out', name: 'A internet caiu', caption: 'O que continua funcionando?' },
  { id: 'visitor', name: 'Chegou um visitante', caption: 'Quem autoriza a entrada?' },
];

export function environmentById(value?: string | null) {
  return environments.find((environment) => environment.id === value);
}

export function systemById(value?: string | null) {
  return systems.find((system) => system.id === value);
}
```

### `lib/experience-state.ts`
```ts
import type { Environment, ScenarioId, SystemId } from './experience-content';

export type Availability = 'available' | 'reserve' | 'unavailable' | 'pending';
export const availabilityLabel: Record<Availability, string> = {
  available: 'Funcionando', reserve: 'Funcionando na reserva', unavailable: 'Sem energia', pending: 'Aguardando autorização',
};

export function deriveExperience(environment: Environment, scenario: ScenarioId, backup: boolean) {
  const outage = scenario === 'power-out';
  const powered = (id: SystemId) => !outage || (backup && environment.backupSystems.includes(id));
  const localNetwork = powered('network');
  const cameras = powered('cameras') && localNetwork;
  const recording = powered('recording') && cameras;
  const remote = scenario !== 'internet-out' && scenario !== 'power-out' && cameras;
  const states: Record<SystemId, Availability> = {
    cameras: cameras ? (outage ? 'reserve' : 'available') : 'unavailable',
    network: localNetwork ? (outage ? 'reserve' : 'available') : 'unavailable',
    recording: recording ? (outage ? 'reserve' : 'available') : 'unavailable',
    power: outage ? (backup ? 'reserve' : 'unavailable') : 'available',
    access: powered('access') ? (scenario === 'visitor' ? 'pending' : outage ? 'reserve' : 'available') : 'unavailable',
  };

  const protectedNames: [SystemId, string][] = [['cameras', 'câmeras'], ['network', 'rede local'], ['recording', 'gravador'], ['access', 'controle de acesso']];
  const protectedList = protectedNames.filter(([id]) => states[id] === 'reserve').map(([, name]) => name).join(', ').replace(/, ([^,]*)$/, ' e $1');

  if (scenario === 'power-out') return {
    states, localNetwork, recording, remote, tone: backup ? 'reserve' : 'unavailable',
    title: backup ? 'Com reserva, os sistemas seguem funcionando.' : 'Sem reserva, os sistemas ficam sem energia.',
    explanation: backup
      ? protectedList ? `Neste exemplo, a reserva mantém ${protectedList} em funcionamento.` : 'Nenhum equipamento está ligado à reserva neste exemplo.'
      : 'Ative a energia de reserva acima para ver o que muda.',
    condition: backup
      ? 'A duração depende da bateria e do consumo. Ver imagens pelo celular também depende da internet da operadora.'
      : 'Controle de acesso sem energia não significa porta aberta: a condição da porta depende da instalação.',
  };
  if (scenario === 'internet-out') return {
    states, localNetwork, recording, remote, tone: 'reserve',
    title: 'A gravação continua. As imagens pelo celular param.',
    explanation: 'Os equipamentos continuam ligados e conectados dentro do imóvel. O controle de acesso local também funciona.',
    condition: 'Este exemplo usa gravação e autorização no próprio local. Sistemas que dependem da nuvem podem se comportar de outra forma.',
  };
  if (scenario === 'visitor') return {
    states, localNetwork, recording, remote, tone: 'pending',
    title: 'O sistema funciona. A entrada aguarda autorização.',
    explanation: environment.visit,
    condition: 'A chegada do visitante não libera a entrada automaticamente.',
  };
  return {
    states, localNetwork, recording, remote, tone: 'available',
    title: 'Tudo funcionando no dia a dia.',
    explanation: 'As câmeras gravam, os equipamentos se comunicam e o controle de acesso permite autorizar entradas.',
    condition: 'Escolha uma situação acima ou toque em um sistema na imagem para conhecer sua função.',
  };
}
```

### `lib/site-content.ts`
```ts
export const company = {
  name: 'SC Soluções',
  descriptor: 'Segurança e Tecnologia',
  region: 'Francisco Beltrão e região',
  whatsapp: '+55 (46) 99133-1306',
  email: '',
};

export const solutions = [
  {
    id: 'residencias',
    number: '01',
    title: 'Residências',
    icon: 'home',
    caption: 'Cuidado em cada ponto da casa.',
    challenge:
      'Acompanhar os acessos e proteger o que importa, mesmo à distância.',
    technologies: [
      'Câmeras e alarmes',
      'Vídeo porteiro e acesso',
      'Rede e alimentação',
    ],
    result:
      'Mais visibilidade sobre a casa, com acesso às imagens e notificações pelo celular, conforme o sistema.',
  },
  {
    id: 'condominios',
    number: '02',
    title: 'Condomínios',
    icon: 'building',
    caption: 'Acessos organizados. Áreas protegidas.',
    challenge:
      'Controlar o fluxo de pessoas e acompanhar perímetros e áreas comuns.',
    technologies: [
      'Controle de acesso e facial',
      'Vídeo porteiro e CFTV',
      'Rede e nobreak',
    ],
    result:
      'Entrada de moradores, visitantes e prestadores com mais controle e sistemas integrados à infraestrutura.',
  },
  {
    id: 'comercios',
    number: '03',
    title: 'Comércios e lojas',
    icon: 'store',
    caption: 'Segurança que acompanha a operação.',
    challenge:
      'Proteger a área de vendas, o caixa e o estoque sem perder de vista o dia a dia.',
    technologies: [
      'Câmeras e alarmes',
      'Acesso a áreas restritas',
      'Rede estável',
    ],
    result:
      'Imagens e eventos acessíveis remotamente, com conectividade para a segurança e a operação do negócio.',
  },
  {
    id: 'empresas',
    number: '04',
    title: 'Empresas e escritórios',
    icon: 'office',
    caption: 'Uma estrutura à altura do trabalho.',
    challenge:
      'Organizar os acessos e manter equipes e sistemas bem conectados.',
    technologies: [
      'CFTV e controle de acesso',
      'Wi-Fi profissional',
      'Cabeamento, racks e nobreak',
    ],
    result:
      'Segurança e comunicação dimensionadas para o ambiente, com infraestrutura organizada e espaço para evoluir.',
  },
] as const;

export const story = [
  {
    number: '01',
    tag: 'DIAGNÓSTICO',
    title: 'Primeiro, entender o ambiente.',
    description:
      'Uma câmera sem imagem pode ter um problema de alimentação. Um acesso lento pode começar na rede. Investigamos a necessidade e a estrutura existente antes de indicar os componentes.',
    detail: 'O ponto de partida é o problema.',
  },
  {
    number: '02',
    tag: 'INFRAESTRUTURA E REDES',
    title: 'Preparar o que sustenta tudo.',
    description:
      'Cabeamento, proteção, alimentação e conectividade precisam trabalhar juntos. Dimensionamos a base para que cada equipamento tenha as condições necessárias para funcionar.',
    detail: 'Organização também é parte da solução.',
  },
  {
    number: '03',
    tag: 'SEGURANÇA E INTEGRAÇÃO',
    title: 'Conectar. Configurar. Validar.',
    description:
      'Câmeras, alarmes e controle de acesso entram no projeto conforme a necessidade. A integração é configurada e o funcionamento é validado no ambiente.',
    detail: 'O resultado é um sistema pensado como um todo.',
  },
] as const;

export const process = [
  {
    number: '01',
    title: 'Entender',
    steps: 'Diagnóstico + avaliação da infraestrutura',
    description:
      'Conhecer o ambiente, ouvir a necessidade e identificar o que precisa ser resolvido.',
  },
  {
    number: '02',
    title: 'Projetar',
    steps: 'Dimensionamento + escolha técnica',
    description:
      'Definir a solução e os componentes adequados às condições de uso.',
  },
  {
    number: '03',
    title: 'Integrar',
    steps: 'Instalação + configuração',
    description:
      'Organizar a infraestrutura e conectar os sistemas com critério técnico.',
  },
  {
    number: '04',
    title: 'Acompanhar',
    steps: 'Validação + orientação e suporte',
    description:
      'Conferir o funcionamento, orientar o uso e dar continuidade com manutenção e suporte.',
  },
] as const;

export function contactUrl(environment?: string, details?: string, campaign?: string) {
  const number = company.whatsapp.replace(/\D/g, '');
  if (!number) return null;
  const message = environment
    ? `Olá! Gostaria de solicitar uma análise para ${environment.toLowerCase()}.`
    : 'Olá! Gostaria de solicitar uma análise para o meu ambiente.';
  const content = [message, details, campaign ? `Origem da campanha: ${campaign}` : '']
    .filter(Boolean)
    .join('\n\n');
  return `https://wa.me/${number}?text=${encodeURIComponent(content)}`;
}
```

### `lib/utils.ts`
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `hooks/use-mobile.ts`
```ts
import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
```

---

## Componentes de UI (biblioteca shadcn, padrão — não específicos deste projeto)

Estes arquivos existem em `components/ui/` e são componentes genéricos gerados
pelo shadcn (podem ser recriados com `npx shadcn add <nome>` se precisar). Não
colados aqui para não inflar o arquivo — lista dos nomes:

accordion.tsx
alert-dialog.tsx
alert.tsx
aspect-ratio.tsx
attachment.tsx
avatar.tsx
badge.tsx
breadcrumb.tsx
bubble.tsx
button-group.tsx
button.tsx
calendar.tsx
card.tsx
carousel.tsx
chart.tsx
checkbox.tsx
collapsible.tsx
combobox.tsx
command.tsx
context-menu.tsx
dialog.tsx
direction.tsx
drawer.tsx
dropdown-menu.tsx
empty.tsx
field.tsx
hover-card.tsx
input-group.tsx
input-otp.tsx
input.tsx
item.tsx
kbd.tsx
label.tsx
marker.tsx
menubar.tsx
message-scroller.tsx
message.tsx
native-select.tsx
navigation-menu.tsx
pagination.tsx
popover.tsx
progress.tsx
radio-group.tsx
resizable.tsx
scroll-area.tsx
select.tsx
separator.tsx
sheet.tsx
sidebar.tsx
skeleton.tsx
slider.tsx
spinner.tsx
switch.tsx
table.tsx
tabs.tsx
textarea.tsx
toast.tsx
toggle-group.tsx
toggle.tsx
tooltip.tsx
