import { Redis } from '@upstash/redis';

const VISITORS_KEY = 'foodbingo:visitor-ids';
const BOT_UA = /bot|crawl|spider|slurp|preview/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const asCount = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const header = (req, name) => req.headers?.[name] || req.headers?.[name.toLowerCase()] || '';
const send = (res, status, body) => res.status(status).json(body);
const clientFromEnv = (env) => {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
};

export function createVisitorHandler({ redis, env = process.env } = {}) {
  return async (req, res) => {
    try {
      const client = redis || clientFromEnv(env);
      if (!client) return send(res, 503, { error: 'not_configured' });
      if (req.method === 'GET') return send(res, 200, { count: asCount(await client.scard(VISITORS_KEY)) });
      if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
      if (BOT_UA.test(header(req, 'user-agent'))) return send(res, 200, { count: asCount(await client.scard(VISITORS_KEY)) });
      const id = typeof req.body?.browserId === 'string' ? req.body.browserId : '';
      if (!UUID.test(id)) return send(res, 400, { error: 'invalid_browser_id' });
      await client.sadd(VISITORS_KEY, id);
      return send(res, 200, { count: asCount(await client.scard(VISITORS_KEY)) });
    } catch { return send(res, 500, { error: 'internal_error' }); }
  };
}
export default createVisitorHandler();