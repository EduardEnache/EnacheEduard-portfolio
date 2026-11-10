// Writes nginx/csp.inc: a strict CSP whose script-src lists the sha256 of every inline <script> in dist/.
// Run after `astro build` (npm run deploy:local does). Inline styles stay 'unsafe-inline' (Astro inlines CSS, components set style="").
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

try { process.loadEnvFile('.env'); } catch {}
const DIST = process.env.DIST ?? 'dist'; // DIST / CSP_OUT let a scratch build be checked without touching the live dist/ and nginx/csp.inc
const OUT = process.env.CSP_OUT ?? 'nginx/csp.inc';
const html = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? html(join(d, f)) : f.endsWith('.html') ? [join(d, f)] : []));
const hashes = new Set();
for (const f of html(DIST))
  for (const m of readFileSync(f, 'utf8').matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g))
    if (m[1].trim()) hashes.add(`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);

const contact = process.env.PUBLIC_CONTACT_ENDPOINT ? new URL(process.env.PUBLIC_CONTACT_ENDPOINT).origin : '';
const csp = [
  "default-src 'self'", `script-src 'self' ${[...hashes].join(' ')}`, "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:", "font-src 'self' data:", `connect-src 'self' ${contact}`.trim(), "media-src 'self'",
  `form-action 'self' ${contact}`.trim(), "frame-ancestors 'none'", "base-uri 'self'", "object-src 'none'",
].join('; ');
writeFileSync(OUT, `add_header Content-Security-Policy "${csp}" always;\n`);
console.log(`csp: ${hashes.size} inline script hashes`);
