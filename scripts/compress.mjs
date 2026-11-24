import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { brotliCompress, constants, gzip } from 'node:zlib';

const compressBr = promisify(brotliCompress);
const compressGzip = promisify(gzip);
const dist = fileURLToPath(new URL('../dist/', import.meta.url));

const files = (await Promise.all(['assets', 'media'].map(async directory => {
  const folder = join(dist, directory);
  return (await readdir(folder, { withFileTypes: true }))
    .filter(entry => entry.isFile() && /\.(js|css|bin)$/.test(entry.name))
    .map(entry => join(folder, entry.name));
}))).flat();

await Promise.all(files.map(async path => {
  const data = await readFile(path);
  if (data.length < 1024) return;
  const [br, gz] = await Promise.all([
    compressBr(data, { params: { [constants.BROTLI_PARAM_QUALITY]: 7 } }),
    compressGzip(data, { level: 9 }),
  ]);
  await Promise.all([writeFile(`${path}.br`, br), writeFile(`${path}.gz`, gz)]);
}));
