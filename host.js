// Host half of the Clove desktop pet.
//
// Serves the pet image; same fallback idea as the theme plugin, the artwork
// itself is not part of the repo.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const ASSET = {
  path: '/dsh-clove-pet/pet.png',
  type: 'image/png',
  files: ['pet.png', 'default/pet.png'],
};

async function serve(res) {
  for (const name of ASSET.files) {
    try {
      const body = await readFile(join(here, 'assets', name));
      res.writeHead(200, {
        'Content-Type': ASSET.type,
        'Content-Length': body.length,
        'Cache-Control': 'public, max-age=3600',
      });
      res.end(body);
      return;
    } catch {
      // try the next candidate
    }
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('not found');
}

export default {
  inject: ['webServer'],
  apply(ctx) {
    try {
      const dispose = ctx.webServer.register({
        kind: 'exact',
        path: ASSET.path,
        handler: (_req, res) => serve(res),
      });
      ctx.effect(() => dispose);
    } catch (err) {
      console.warn(`[clove-pet] ${ASSET.path} already served, skipping`);
    }
    console.log('[clove-pet] host half active');
  },
};
