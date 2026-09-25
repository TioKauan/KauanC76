// Gera as imagens PNG dos mockups: node render.mjs [arquivo.html ...]
import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../imagens');
const files = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(here).filter((f) => /^\d\d-.*\.html$/.test(f));
const browser = await chromium.launch();
for (const file of files) {
  const mobile = file.includes('celular');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: mobile ? 2 : 1.5 });
  await page.goto('file://' + path.join(here, file), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const png = path.join(out, file.replace('.html', '.png'));
  await page.screenshot({ path: png, fullPage: true });
  console.log('ok', png);
  await page.close();
}
await browser.close();
