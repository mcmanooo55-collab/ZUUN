import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleContact } from './contact.mjs';
import { copy, pages } from './src/content.js';

const root = fileURLToPath(new URL('./dist', import.meta.url));
const html = resolve(root, 'index.html');
const types = {
  '.html': 'text/html; charset=UTF-8', '.js': 'text/javascript; charset=UTF-8', '.css': 'text/css; charset=UTF-8',
  '.bin': 'application/octet-stream', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};

// The build generates sidecars once, so serving a cold preview doesn't tax the main process.
function encodings(header) {
  const options = new Map();
  for (const piece of String(header || '').toLowerCase().split(',')) {
    const [name, ...params] = piece.trim().split(';');
    if (!name) continue;
    const q = params.map(param => param.trim()).find(param => param.startsWith('q='));
    const quality = q ? Number(q.slice(2)) : 1;
    options.set(name.trim(), Number.isFinite(quality) && quality >= 0 && quality <= 1 ? quality : 0);
  }
  const rank = name => options.get(name) ?? options.get('*') ?? 0;
  return ['br', 'gzip'].filter(name => rank(name) > 0).sort((a,b) => rank(b) - rank(a));
}

async function serve(req, res, target, code) {
  const entry = await stat(target).catch(() => null);
  if (!entry?.isFile()) return false;
  const type = extname(target);
  if (!types[type]) return false;
  const compressible = type === '.js' || type === '.css' || type === '.bin';
  let file = target, size = entry.size, encoding;
  if (compressible) for (const option of encodings(req.headers['accept-encoding'])) {
    const sidecar = `${target}.${option === 'br' ? 'br' : 'gz'}`;
    const packed = await stat(sidecar).catch(() => null);
    if (packed?.isFile()) { file = sidecar; size = packed.size; encoding = option; break; }
  }
  res.writeHead(code, {
    'Content-Type': types[type], 'Content-Length': size,
    ...(compressible ? { Vary: 'Accept-Encoding' } : {}),
    ...(encoding ? { 'Content-Encoding': encoding } : {}),
    'Cache-Control': type === '.html' ? 'no-cache' : target.startsWith(resolve(root, 'assets') + sep) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  if (req.method === 'HEAD') res.end();
  else createReadStream(file).on('error', () => res.destroy()).pipe(res);
  return true;
}

const escapeHtml = (value) => value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

async function servePage(req, res, pathname) {
  const template = await readFile(html, 'utf8').catch(() => null);
  if (!template) return false;
  const segments = pathname.split('/').filter(Boolean);
  const lang = segments[0] === 'en' ? 'en' : 'ar';
  if (segments[0] === 'en' || segments[0] === 'ar') segments.shift();
  const page = segments.length < 2 && pages.find((item) => item.path === (segments[0] || ''));
  const id = page?.id ?? 'missing';
  const text = copy[lang];
  const title = id === 'home' ? text.hero.label : page?.name[lang] || text.missing.title;
  const description = id === 'home' ? text.hero.description : text[id].text;
  const suffix = page?.path ? `/${page.path}` : '';
  const alternates = page ? `
    <link rel="alternate" hreflang="ar" href="${suffix || '/'}" />
    <link rel="alternate" hreflang="en" href="/en${suffix}" />` : '';
  const preload = lang === 'ar' ? '\n    <link rel="preload" href="/fonts/plex-ar-700.woff2" as="font" type="font/woff2" crossorigin />' : '';
  const body = template.replace('<html lang="ar" dir="rtl">', `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>ZUUN — ${escapeHtml(title)}</title>${alternates}${preload}`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  res.writeHead(page ? 200 : 404, {
    'Content-Type': types['.html'], 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  res.end(req.method === 'HEAD' ? undefined : body);
  return true;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://zuun.local');
    if (url.pathname === '/api/contact') { await handleContact(req, res); return; }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
    const pathname = decodeURIComponent(url.pathname);
    const target = resolve(root, `.${pathname}`);
    if (/^\/(assets|media|fonts)\//.test(pathname) && target.startsWith(root + sep) && await serve(req, res, target, 200)) return;
    if (await servePage(req, res, pathname)) return;
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Run npm run build before starting the server.');
  } catch {
    if (!res.headersSent) res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid request');
  }
});

server.listen(Number(process.env.PORT || 4173), '0.0.0.0', () => console.log(`ZUUN Studio listening on ${server.address().port}`));
