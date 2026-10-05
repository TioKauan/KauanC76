/**
 * Pacote para publicar: dist/ sem a nota interna fotos/LEIA-ME.md, em ../publicar/somoscella-<data>.tar.gz.
 * Uso: npm run build && npm run empacotar   (depois, no servidor: scripts/publicar-no-vps.sh <pacote>)
 */
import { cpSync, existsSync, mkdirSync, rmSync, mkdtempSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');
if (!existsSync(path.join(dist, 'index.html'))) { console.error('Rode npm run build antes.'); process.exit(1); }
const temp = mkdtempSync(path.join(tmpdir(), 'sc-pacote-'));
cpSync(dist, temp, { recursive: true });
rmSync(path.join(temp, 'fotos', 'LEIA-ME.md'), { force: true });
const data = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const saida = path.resolve(raiz, '..', 'publicar');
mkdirSync(saida, { recursive: true });
const arquivo = path.join(saida, `somoscella-${data}.tar.gz`);
execFileSync('tar', ['-czf', arquivo, '-C', temp, '.']);
rmSync(temp, { recursive: true, force: true });
console.log(`ok ${path.relative(path.resolve(raiz, '..'), arquivo)} (${(statSync(arquivo).size / 1024).toFixed(0)} KB)`);
