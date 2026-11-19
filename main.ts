// GTA 6 trophy guide entry (Node 22, standard library only).
//
// The entry is plain static files under app/: index.html opens the guide in a
// desktop browser with the network off, and app/data/trophies.json holds the
// 55 official PlayStation trophies with a guide for each one. This program
// hands the entry in: it copies app/ and screenshots/ from beside this file
// into the output directory and writes /output/dossier.json, the summary the
// judge reads, using the vendored make.fun library. The vendor file stays
// exactly as the kit shipped it: the scorer rebuilds the dossier from its own
// copy and compares the two byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader mounts a writable /output and leaves MAKEFUN_OUTPUT_DIR unset;
// a local run points it at a scratch directory instead.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Mirror the whole app/ tree, then the screenshots beside it.
mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots of 256 KiB each, app/ at most
// 993 files and 48 MiB, and the dossier text capped at 160 KiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`wrote ${join(outDir, 'dossier.json')} (${dossier.length} bytes)`);
