#!/usr/bin/env node
// Generate THIRD_PARTY_NOTICES.md from installed production dependencies.
// Auto-generated. Do not edit.
import { execFileSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';

const relevant = [
  '@breezystack/lamejs',
  'valibot',
  'webaudiofont',
  '@tonejs/midi',
  '@spotify/basic-pitch',
  'next',
  'react',
];

// Scan apps/* and packages/* for pnpm package directories.
const topDirs = ['apps', 'packages'];
const pkgDirs = [];
for (const dir of topDirs) {
  const full = resolve(dir);
  if (!existsSync(full)) continue;
  for (const name of readdirSync(full)) {
    const sub = resolve(full, name);
    if (existsSync(resolve(sub, 'package.json'))) {
      pkgDirs.push(sub);
    }
  }
}

const merged = {};
for (const dir of pkgDirs) {
  try {
    const out = execFileSync(
      'npx --yes license-checker --json --production --excludePrivatePackages',
      { cwd: dir, encoding: 'utf-8', shell: true }
    );
    const data = JSON.parse(out);
    for (const [k, v] of Object.entries(data)) {
      if (!merged[k]) merged[k] = v;
    }
  } catch (err) {
    continue;
  }
}

const lines = ['# Third Party Notices\n', 'Auto-generated. Do not edit.\n\n'];

for (const pkg of relevant) {
  const matchKey = Object.keys(merged).find(k => k === pkg || k.startsWith(pkg + '@'));
  if (matchKey) {
    const info = merged[matchKey];
    lines.push(`## ${pkg}\n`);
    lines.push(`- License: ${info.licenses}\n`);
    let ver = 'N/A';
    if (matchKey.startsWith(pkg + '@')) {
      ver = matchKey.slice(pkg.length + 1);
    } else if (info.version) {
      ver = info.version;
    }
    lines.push(`- Version: ${ver}\n`);
    lines.push(`- Repository: ${info.repository || 'N/A'}\n\n`);
  }
}

writeFileSync('THIRD_PARTY_NOTICES.md', lines.join(''));
console.log('THIRD_PARTY_NOTICES.md generated');
