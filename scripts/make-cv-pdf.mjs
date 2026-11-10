// npm run cv:pdf: build, serve dist on loopback, print /cv/ with headless Chromium, then fail if the PDF holds a phone number.
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, readdirSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { homedir } from 'node:os';

const OUT = 'public/cv/Eduard-Enache-CV.pdf';
// +40, 07xxxxxxxx (spaces/dots/dashes allowed), or any run of 9+ digits with optional separators
export const PHONE = /\+\s?\d{2}|\b0\s?7[\s.-]?\d(?:[\s.-]?\d){7}\b|\d(?:[ .-]?\d){8,}/;
export const hasPhone = (text) => PHONE.test(text);

// shortcut: the check is a regex heuristic, fine for a one-page CV; widen if the CV ever lists legit long numbers.
if (process.argv[1] === new URL(import.meta.url).pathname) await main();

async function main() {
  const chrome = process.env.CHROME_PATH ?? findChrome();
  if (process.argv[2] === '--check') { // self-test: node scripts/make-cv-pdf.mjs --check <pdf>
    return check(process.argv[3]);
  }
  execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' };
  const server = createServer((req, res) => {
    let p = join('dist', decodeURIComponent(req.url.split('?')[0]));
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
    if (!p.startsWith('dist') || !existsSync(p)) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': types[extname(p)] ?? 'application/octet-stream' }).end(readFileSync(p));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    mkdirSync('public/cv', { recursive: true });
    // async spawn: execFileSync would starve the server above; 'exit' awaited as Chromium helpers keep pipes open
    const proc = spawn(chrome, ['--headless', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer',
      `--print-to-pdf=${OUT}`, `http://127.0.0.1:${server.address().port}/cv/`], { stdio: 'ignore', timeout: 60000 });
    await new Promise((ok, fail) => proc.on('exit', (c) => (c === 0 ? ok() : fail(new Error(`chromium exited ${c}`)))));
  } finally {
    server.close();
  }
  check(OUT);
}

function check(pdf) {
  const text = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' });
  const pages = Number(/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }))?.[1]);
  const m = PHONE.exec(text);
  if (m) { console.error(`FAIL: phone-like text in ${pdf}: "${m[0]}"`); process.exit(1); }
  if (pages > 2) { console.error(`FAIL: ${pages} pages, max 2`); process.exit(1); }
  console.log(`OK: ${pdf}, ${pages} page(s), no phone-like text`);
}

function findChrome() {
  const root = join(homedir(), '.cache/ms-playwright');
  const dirs = readdirSync(root).filter((d) => d.startsWith('chromium-')).sort().reverse();
  for (const d of dirs) { const p = join(root, d, 'chrome-linux64/chrome'); if (existsSync(p)) return p; }
  throw new Error('No Chromium found; set CHROME_PATH');
}
