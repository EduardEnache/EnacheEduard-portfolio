// npm run cv:pdf: convert Eduard's own CV (updated .docx) to public/cv/Eduard-Enache-CV.pdf with LibreOffice,
// then fail unless it is 2 pages, A4, and uses the same fonts as the original PDF export.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DIR = 'design/assets/cv';
const SRC = `${DIR}/Enache_Eduard_Florentin_CV.updated.docx`;
const ORIGINAL = `${DIR}/Enache_Eduard_Florentin_CV.pdf`;
const OUT = 'public/cv/Eduard-Enache-CV.pdf';

const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' });
const fonts = (pdf) => [...new Set(run('pdffonts', [pdf]).split('\n').slice(2).filter(Boolean).map((l) => l.split(/\s+/)[0].replace(/^[A-Z]+\+/, '')))].sort().join(', ');
const fail = (m) => { console.error(`FAIL: ${m}`); process.exit(1); };

const tmp = mkdtempSync(join(tmpdir(), 'cv-'));
run('soffice', ['--headless', '--convert-to', 'pdf', '--outdir', tmp, SRC]);
const pdf = join(tmp, 'Enache_Eduard_Florentin_CV.updated.pdf');

const info = run('pdfinfo', [pdf]);
const pages = Number(/Pages:\s+(\d+)/.exec(info)?.[1]);
if (pages !== 2) fail(`${pages} pages, expected 2`);
if (!/A4/.test(info)) fail('page size is not A4');
if (fonts(pdf) !== fonts(ORIGINAL)) fail(`fonts differ (LibreOffice substituted one?): ${fonts(pdf)} vs ${fonts(ORIGINAL)}`);
copyFileSync(pdf, OUT);
console.log(`OK: ${OUT}, 2 pages, A4, fonts ${fonts(pdf)}`);
