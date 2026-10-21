// Scripted browser session: node dev/play.mjs <outdir> <steps-json-file>
import { createRequire } from 'module';
import { readFileSync } from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);
const [out, stepsFile] = process.argv.slice(2);
const steps = JSON.parse(readFileSync(stepsFile, 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(process.env.BOT_URL ?? 'http://localhost:5173/', { waitUntil: 'networkidle' });
let n = 0;
for (const st of steps) {
  if (st.click) await page.click(st.click, { timeout: 5000 }).catch((e) => errors.push('click fail ' + st.click + ' ' + e.message.split('\n')[0]));
  if (st.key) for (let i = 0; i < (st.times ?? 1); i++) { await page.keyboard.press(st.key); await page.waitForTimeout(st.gap ?? 120); }
  if (st.skip) { await page.keyboard.down('Control'); await page.waitForTimeout(st.skip); await page.keyboard.up('Control'); await page.waitForTimeout(400); }
  if (st.eval) { const r = await page.evaluate(st.eval).catch((e) => 'EVAL ERR ' + e.message); if (r !== undefined) console.log('eval:', JSON.stringify(r)); }
  if (st.wait) await page.waitForTimeout(st.wait);
  if (st.shot) { await page.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${st.shot}.png` }); }
}
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
await browser.close();
