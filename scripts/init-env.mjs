import { log } from 'node:console';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { envDirs } from './env-files.mjs';

// Creates each missing local .env from its .env.example. Never overwrites.
for (const dir of envDirs) {
  const target = join(dir, '.env');
  if (existsSync(target)) {
    log(`SKIP ${target} already exists`);
    continue;
  }
  copyFileSync(join(dir, '.env.example'), target);
  log(`CREATE ${target}`);
}
