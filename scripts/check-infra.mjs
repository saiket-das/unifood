import { error, log } from 'node:console';
import process, { env } from 'node:process';
import { URL } from 'node:url';
import Redis from 'ioredis';
import pg from 'pg';

function localUrl(variable, protocol) {
  let url;
  try {
    url = new URL(env[variable]);
  } catch {
    throw new Error(`Set a valid ${variable} in apps/backend/.env`);
  }
  if (url.hostname !== '127.0.0.1' || url.protocol !== protocol) {
    throw new Error(`${variable} must use ${protocol} on 127.0.0.1`);
  }
  return url;
}

async function checkPostgres() {
  const client = new pg.Client({
    connectionString: localUrl('DATABASE_URL', 'postgresql:').href,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  });
  try {
    await client.connect();
    const { rows } = await client.query('SELECT 1 AS ok');
    if (rows[0]?.ok !== 1) throw new Error('Unexpected PostgreSQL result');
  } finally {
    await client.end();
  }
}

async function checkRedis() {
  const client = new Redis(localUrl('REDIS_URL', 'redis:').href, {
    lazyConnect: true,
    connectTimeout: 5000,
    commandTimeout: 5000,
    retryStrategy: () => null,
  });
  let redisError;
  client.on('error', (cause) => {
    redisError = cause;
  });
  try {
    await client.connect();
    if ((await client.ping()) !== 'PONG')
      throw new Error('Unexpected Redis result');
  } catch (cause) {
    throw redisError ?? cause;
  } finally {
    client.disconnect();
  }
}

const services = [
  ['PostgreSQL SELECT 1', checkPostgres],
  ['Redis PING', checkRedis],
];
const results = await Promise.allSettled(services.map(([, check]) => check()));
for (const [index, result] of results.entries()) {
  const [label] = services[index];
  if (result.status === 'fulfilled') {
    log(`PASS ${label}`);
  } else {
    error(
      `FAIL ${label} (${result.reason.code ?? result.reason.name}). Check apps/backend/.env and infra/docker/.env.`,
    );
    process.exitCode = 1;
  }
}
