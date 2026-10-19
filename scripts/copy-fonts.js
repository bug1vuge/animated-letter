// Copies the self-hosted Newsreader variable font files out of node_modules.
// Fonts are committed to the repo so the site has no build step and makes no
// third-party requests (nothing about a recipient is leaked to a font CDN).
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules/@fontsource-variable/newsreader/files');
const dest = join(root, 'assets/fonts');

const files = [
  'newsreader-latin-opsz-normal.woff2',
  'newsreader-latin-opsz-italic.woff2',
  'newsreader-latin-ext-opsz-normal.woff2',
  'newsreader-latin-ext-opsz-italic.woff2',
];

mkdirSync(dest, { recursive: true });
for (const file of files) {
  copyFileSync(join(src, file), join(dest, file));
  console.log(`copied ${file}`);
}
