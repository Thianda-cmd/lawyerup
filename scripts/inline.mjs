// Inline the Vite build into a single self-contained HTML file: dist/lawyerup.html
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(import.meta.dirname, '..', 'dist');
let html = readFileSync(join(dist, 'index.html'), 'utf8');

html = html.replace(/<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/g, (_m, src) => {
  const js = readFileSync(join(dist, src), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/g, (_m, href) => `<style>${readFileSync(join(dist, href), 'utf8')}</style>`);

if (/src="\.\/assets|href="\.\/assets/.test(html)) throw new Error('Some assets were not inlined');
writeFileSync(join(dist, 'lawyerup.html'), html);
console.log(`dist/lawyerup.html — ${(html.length / 1024).toFixed(0)} KB`);

// Fragment variant for hosts that supply their own <html>/<head>/<body> skeleton.
const head = /<head>([\s\S]*?)<\/head>/.exec(html)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '');
const body = /<body>([\s\S]*?)<\/body>/.exec(html)[1];
const fragment = `${head.trim()}\n${body.trim()}\n`;
writeFileSync(join(dist, 'lawyerup-fragment.html'), fragment);
console.log(`dist/lawyerup-fragment.html — ${(fragment.length / 1024).toFixed(0)} KB`);
