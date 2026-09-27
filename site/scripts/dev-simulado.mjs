/**
 * Sobe o site em modo de desenvolvimento com o chat apontando para a Sol
 * simulada (scripts/sol-simulado.mjs), para testar a tela sem o n8n.
 * Uso: node scripts/dev-simulado.mjs  →  http://localhost:4321
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { criarServidor } from './sol-simulado.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
criarServidor().listen(8787, '127.0.0.1', () => console.log('Sol simulada em http://127.0.0.1:8787/sol'));
const astro = spawn('npx', ['astro', 'dev', '--port', '4321'], {
  cwd: raiz,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PUBLIC_SOL_URL: 'http://127.0.0.1:8787/sol' },
});
astro.on('exit', (codigo) => process.exit(codigo ?? 0));
