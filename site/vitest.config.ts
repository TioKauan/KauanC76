import { defineConfig } from 'vitest/config';

// Testes das regras (src/lib), sem navegador. O comportamento na tela é conferido por scripts/validar.mjs.
export default defineConfig({
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
