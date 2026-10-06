import assert from 'node:assert/strict';
import test from 'node:test';
import { createHandler, isAllowedOrigin } from '../api/count.js';
import vercelConfig from '../vercel.json' with { type: 'json' };

class MockRedis {
  constructor() { this.values = new Map(); this.ttl = new Map(); }
  async get(key) { return this.values.get(key) ?? null; }
  async incr(key) { const value = Number(this.values.get(key) || 0) + 1; this.values.set(key, value); return value; }
  async expire(key, seconds) { this.ttl.set(key, seconds); return 1; }
}

const response = () => ({ statusCode: 0, body: null, headers: {}, setHeader(name, value) { this.headers[name] = value; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const request = (method, headers = {}) => ({ method, headers: { host: 'food-bingo-bd.vercel.app', origin: 'https://food-bingo-bd.vercel.app', ...headers }, socket: { remoteAddress: '203.0.113.9' } });
const configured = (redis = new MockRedis()) => ({ redis, env: { COUNTER_SALT: 'test-salt' } });

test('GET returns the stored count with cache headers', async () => {
  const redis = new MockRedis(); redis.values.set('foodbingo:users', 24);
  const res = response(); await createHandler(configured(redis))(request('GET'), res);
  assert.equal(res.statusCode, 200); assert.deepEqual(res.body, { count: 24 });
  assert.equal(res.headers['Cache-Control'], 'public, s-maxage=60, stale-while-revalidate=300');
});

test('POST increments the counter', async () => {
  const res = response(); await createHandler(configured())(request('POST'), res);
  assert.equal(res.statusCode, 200); assert.deepEqual(res.body, { count: 1 });
});

test('cross-origin POST is rejected', async () => {
  const res = response(); await createHandler(configured())(request('POST', { origin: 'https://evil.example' }), res);
  assert.equal(res.statusCode, 403); assert.deepEqual(res.body, { error: 'cross_origin' });
});

test('the 31st request from one IP within an hour is rejected', async () => {
  const redis = new MockRedis(); const handler = createHandler(configured(redis));
  for (let index = 0; index < 30; index += 1) { const res = response(); await handler(request('POST'), res); assert.equal(res.statusCode, 200); }
  const blocked = response(); await handler(request('POST'), blocked);
  assert.equal(blocked.statusCode, 429); assert.deepEqual(blocked.body, { error: 'rate_limited' });
});

test('missing Redis configuration returns 503 without throwing', async () => {
  const res = response(); await createHandler({ env: {} })(request('GET'), res);
  assert.equal(res.statusCode, 503); assert.deepEqual(res.body, { error: 'not_configured' });
});
test('production and preview Vercel origins are accepted', () => {
  assert.equal(isAllowedOrigin(request('POST', { host: 'food-bingo-bd.vercel.app', origin: 'https://food-bingo-bd.vercel.app' })), true);
  assert.equal(isAllowedOrigin(request('POST', { host: 'food-bingo-bd-git-main-team.vercel.app', origin: 'https://food-bingo-bd-git-main-team.vercel.app' })), true);
});

test('Vercel catch-all rewrite excludes API routes', () => {
  const rewrites = vercelConfig.rewrites || [];
  assert.ok(rewrites.every((rewrite) => rewrite.destination !== '/index.html' || /api/.test(rewrite.source)));
});