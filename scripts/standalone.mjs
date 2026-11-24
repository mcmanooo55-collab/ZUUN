import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('../', import.meta.url));
const result = await build({
  root,
  configFile: false,
  mode: 'standalone',
  plugins: [react()],
  build: { write: false, modulePreload: false, cssCodeSplit: false, rollupOptions: { output: { inlineDynamicImports: true } } },
});
const bundle = Array.isArray(result) ? result.flatMap(part => part.output) : result.output;
const [entry] = bundle.filter(item => item.type === 'chunk');
const html = bundle.find(item => item.fileName === 'index.html');
const css = bundle.find(item => item.fileName.endsWith('.css'));
if (!entry?.isEntry || entry.imports.length || entry.dynamicImports.length || !html || !css || bundle.filter(item => item.type === 'chunk').length !== 1) {
  throw new Error('Expected a single, self-contained JavaScript bundle, stylesheet, and index.');
}

const mime = { '.bin': 'application/octet-stream', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
async function dataUrl(path) {
  const data = await readFile(join(root, 'public', path));
  return `data:${mime[extname(path)]};base64,${data.toString('base64')}`;
}
const media = Object.fromEntries(await Promise.all((await readdir(join(root, 'public/media')))
  .filter(name => mime[extname(name)] && name !== 'icon.png')
  .map(async name => [`/media/${name}`, await dataUrl(`media/${name}`)])));

const styles = String(css.source);
const fontPaths = [...new Set([...styles.matchAll(/url\(["']?(\/fonts\/[\w.-]+)["']?\)/g)].map(match => match[1]))];
const fontUrls = Object.fromEntries(await Promise.all(fontPaths.map(async path => [path, await dataUrl(path.slice(1))])));
const styled = styles.replace(/url\(["']?(\/fonts\/[\w.-]+)["']?\)/g, (_, path) => `url(${fontUrls[path]})`);
const included = (await readdir(join(root, 'licenses'))).map(path => `licenses/${path}`);
for (const path of ['react/LICENSE', 'react-dom/LICENSE', 'react-router/LICENSE.md', 'react-router-dom/LICENSE.md', 'lucide-react/LICENSE', 'scheduler/LICENSE']) {
  included.push(`node_modules/${path}`);
}
const licenses = await Promise.all(included.map(async path => `${path.replace(/^node_modules\//, '')}\n${await readFile(join(root, path), 'utf8')}`));
const escapeScript = source => source.replace(/<\/script/gi, '<\\/script');
const output = String(html.source)
  .replace(/<link rel="preload"[^>]*>\s*/g, '')
  .replace('/media/icon.png', await dataUrl('media/icon.png'))
  .replace(/<script\b[^>]*\bsrc="[^"]+"[^>]*><\/script>/g, '')
  .replace(/<link rel="stylesheet"[^>]*>/, () => `<style>${styled}</style>`)
  .replace('href="./preview/index.html">افتح معاينة الموقع', 'href="./index.html">أعد تحميل المعاينة')
  .replace('href="./preview/index.html">Open the site preview', 'href="./index.html">Reload the preview')
  .replace('</body>', () => `<!-- Bundled font and software licenses\n${licenses.join('\n\n').replaceAll('--', '—')}\n-->\n    <script type="application/json" id="zuun-embedded">${escapeScript(JSON.stringify(media))}</script>\n    <script type="module">${escapeScript(entry.code)}</script>\n  </body>`);

const folder = join(root, 'preview');
await mkdir(folder, { recursive: true });
await writeFile(join(folder, 'index.html.tmp'), output);
await rename(join(folder, 'index.html.tmp'), join(folder, 'index.html'));
console.log(`Standalone preview: preview/index.html (${Buffer.byteLength(output).toLocaleString('en')} bytes)`);
