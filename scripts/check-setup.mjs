import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { log } from 'node:console';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { URL } from 'node:url';
import { parseEnv } from 'node:util';
import ts from 'typescript';
import { envDirs, webApps } from './env-files.mjs';

const host = {
  ...ts.sys,
  getCanonicalFileName: (fileName) => fileName,
  getNewLine: () => '\n',
  onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
    throw new Error(ts.formatDiagnostics([diagnostic], host));
  },
};

for (const preset of ['base', 'node', 'next']) {
  const configPath = resolve(`packages/config/typescript/${preset}.json`);
  const config = ts.getParsedCommandLineOfConfigFile(configPath, {}, host);
  const program = ts.createProgram([], config.options);
  // Presets are shared settings. Phase 1 supplies each workspace's input files.
  const errors = config.errors.filter(({ code }) => code !== 18003);
  errors.push(...program.getOptionsDiagnostics());
  assert.equal(errors.length, 0, ts.formatDiagnostics(errors, host));
}
log('PASS TypeScript compiler options');

function envUrl(value, label) {
  try {
    return new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL`);
  }
}

function loadEnvSet(name) {
  const set = {};
  for (const dir of envDirs) {
    const path = join(dir, name);
    if (existsSync(path)) set[dir] = parseEnv(readFileSync(path, 'utf8'));
  }
  return set;
}

function checkEnvSet(set, name) {
  const docker = set['infra/docker'];
  const backend = set['apps/backend'];

  const api = envUrl(backend.API_URL, `apps/backend/${name} API_URL`);
  assert(
    api.protocol === 'http:' && api.hostname === 'localhost',
    `apps/backend/${name} expects an http://localhost API_URL`,
  );
  assert.equal(
    api.port,
    backend.PORT,
    `apps/backend/${name} API_URL and PORT disagree`,
  );

  for (const app of webApps) {
    assert.equal(
      set[app].NEXT_PUBLIC_API_URL,
      backend.API_URL,
      `${app}/${name} NEXT_PUBLIC_API_URL must equal the backend API_URL`,
    );
  }
  assert.equal(
    backend.CORS_ORIGINS,
    webApps.map((app) => `http://localhost:${set[app].PORT}`).join(','),
    `apps/backend/${name} CORS_ORIGINS must list the web app ports`,
  );

  const database = envUrl(backend.DATABASE_URL, 'DATABASE_URL');
  const redis = envUrl(backend.REDIS_URL, 'REDIS_URL');
  assert(
    database.protocol === 'postgresql:' && redis.protocol === 'redis:',
    `apps/backend/${name} has an invalid DATABASE_URL or REDIS_URL protocol`,
  );
  assert(
    database.hostname === '127.0.0.1' && redis.hostname === '127.0.0.1',
    `apps/backend/${name} requires loopback services`,
  );
  assert(
    docker.POSTGRES_PASSWORD &&
      decodeURIComponent(database.password) === docker.POSTGRES_PASSWORD &&
      decodeURIComponent(database.username) === docker.POSTGRES_USER &&
      decodeURIComponent(database.pathname.slice(1)) === docker.POSTGRES_DB &&
      (database.port || '5432') === docker.POSTGRES_PORT,
    `apps/backend/${name} DATABASE_URL disagrees with infra/docker/${name}`,
  );
  assert(
    (redis.port || '6379') === docker.REDIS_PORT,
    `apps/backend/${name} REDIS_URL disagrees with infra/docker/${name}`,
  );
}

const templates = loadEnvSet('.env.example');
for (const dir of envDirs) {
  assert(templates[dir], `${dir}/.env.example is missing`);
}
checkEnvSet(templates, '.env.example');
log('PASS Environment templates');

const local = loadEnvSet('.env');
for (const [dir, env] of Object.entries(local)) {
  const missing = Object.keys(templates[dir]).filter((key) => !(key in env));
  assert.equal(
    missing.length,
    0,
    `${dir}/.env is missing ${missing.join(', ')}`,
  );
}
if (Object.keys(local).length === envDirs.length) {
  checkEnvSet(local, '.env');
  log('PASS Local environment files');
} else {
  log('SKIP Local environment files incomplete. Run pnpm env:init.');
}

const ignored = [
  ...envDirs.map((dir) => `${dir}/.env`),
  'apps/student-app/.env.production',
  'node_modules/example',
  'apps/backend/dist/example.js',
];
for (const path of ignored) {
  execFileSync('git', ['check-ignore', '--quiet', '--', path]);
}
for (const dir of envDirs) {
  const template = `${dir}/.env.example`;
  const result = spawnSync('git', ['check-ignore', '--quiet', '--', template]);
  assert.equal(result.status, 1, `${template} must stay trackable`);
}
log('PASS Git ignore rules');
