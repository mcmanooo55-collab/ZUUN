// Only the single-file preview has an embedded asset registry. The server build
// keeps its normal, separately cached image and binary requests.
export const standalone = import.meta.env.MODE === 'standalone';
const files = standalone ? JSON.parse(document.getElementById('zuun-embedded')?.textContent || '{}') : null;
export const publicAsset = path => files?.[path] ?? path;
