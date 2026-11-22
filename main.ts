// The Gilded Vault — entrypoint.
// Copies game/ and screenshots/ to the output directory and writes
// /output/dossier.json with buildDossier from vendor/makefun-game.ts.
// Node 22 standard library only; no network, no install step.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The output directory is emptied by removing its CONTENTS, never the
// directory itself: the grader mounts /output, and removing a mount point
// throws EBUSY (the bug that rejected the first submission of this entry).

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Create the output directory, then empty it child by child.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`wrote ${outDir}/dossier.json (${dossier.length} bytes)`);
