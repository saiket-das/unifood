import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { log } from 'node:console';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { URL } from 'node:url';
import { parseEnv } from 'node:util';
import ts from 'typescript';

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

const template = parseEnv(readFileSync('.env.example', 'utf8'));
for (const file of ['.env.example', '.env']) {
  if (!existsSync(file)) continue;
  const env = parseEnv(readFileSync(file, 'utf8'));
  assert(
    Object.keys(template).every((key) => key in env),
    `${file} has missing keys`,
  );

  const webOrigins = ['STUDENT', 'RESTAURANT', 'ADMIN'].map(
    (app) => env[`${app}_URL`],
  );
  assert.equal(
    env.CORS_ORIGINS,
    webOrigins.join(','),
    `${file} CORS origins do not match`,
  );

  for (const app of ['API', 'STUDENT', 'RESTAURANT', 'ADMIN']) {
    const url = envUrl(env[`${app}_URL`], `${file} ${app}_URL`);
    assert.equal(
      url.protocol,
      'http:',
      `${file} expects HTTP for local web development`,
    );
    assert.equal(
      url.hostname,
      'localhost',
      `${file} expects localhost application URLs`,
    );
    assert.equal(
      url.port,
      env[`${app}_PORT`],
      `${file} has a mismatched ${app} port`,
    );
  }

  const database = envUrl(env.DATABASE_URL, `${file} DATABASE_URL`);
  const redis = envUrl(env.REDIS_URL, `${file} REDIS_URL`);
  assert(
    database.protocol === 'postgresql:',
    `${file} has an invalid DATABASE_URL protocol`,
  );
  assert(
    redis.protocol === 'redis:',
    `${file} has an invalid REDIS_URL protocol`,
  );
  assert(
    database.hostname === '127.0.0.1' && redis.hostname === '127.0.0.1',
    `${file} requires loopback services`,
  );
  assert(
    env.POSTGRES_PASSWORD &&
      decodeURIComponent(database.password) === env.POSTGRES_PASSWORD &&
      decodeURIComponent(database.username) === env.POSTGRES_USER &&
      decodeURIComponent(database.pathname.slice(1)) === env.POSTGRES_DB &&
      (database.port || '5432') === env.POSTGRES_PORT,
    `${file} PostgreSQL settings and DATABASE_URL disagree`,
  );
  assert(
    (redis.port || '6379') === env.REDIS_PORT,
    `${file} Redis port settings disagree`,
  );
  log(`PASS Environment settings in ${file}`);
}

const ignored = [
  '.env',
  'apps/student/.env.production',
  'node_modules/example',
  'apps/api/dist/example.js',
];
for (const path of ignored) {
  execFileSync('git', ['check-ignore', '--quiet', '--', path]);
}
const templateIgnore = spawnSync('git', [
  'check-ignore',
  '--quiet',
  '--',
  '.env.example',
]);
assert.equal(templateIgnore.status, 1, '.env.example must stay trackable');
log('PASS Git ignore rules');
