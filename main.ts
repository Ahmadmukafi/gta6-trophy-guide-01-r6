// VICE CITY VAULT — a gta6-trophy-guide-01 entry (Node 22, standard library only).
// The guide itself is app/: plain static files, index.html at the root, the 55
// official trophies with cited guides in app/data/trophies.json, no build step,
// nothing fetched over the network. This program hands the entry in: it copies
// app/ and screenshots/ from beside this file to the output directory and writes
// /output/dossier.json with the vendored make.fun library, exactly as the kit's
// starter does. vendor/makefun-frontend.ts is the kit's file, left unchanged —
// the scorer rebuilds the dossier with its own copy and compares byte for byte.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in app/
// or 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
// Refuse to hand in an entry without its screenshots: the gate needs 3 or 4,
// and a dossier built from an empty screenshots/ folder would fail it.
const shots = readdirSync(join(out, 'screenshots')).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (shots.length < 3 || shots.length > 4) throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);

const dossier = buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 });
if (dossier.length === 0) throw new Error('buildDossier wrote an empty dossier');
writeFileSync(join(out, 'dossier.json'), dossier);
