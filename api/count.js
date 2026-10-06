import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';

const COUNTER_KEY = 'foodbingo:users';
const RATE_LIMIT = 30;
const RATE_WINDOW_SECONDS = 60 * 60;
const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|discordbot|preview/i;

const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

const getHeader = (req, name) => {
  const headers = req.headers || {};
  return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || '';
};

const hostname = (value) => {
  try {
    return new URL(value.includes('://') ? value : `http://${value}`).hostname.toLowerCase();
  } catch {
    return '';
  }
};

const isLocalhost = (value) => value === 'localhost' || value === '127.0.0.1' || value === '::1';

const isVercelHost = (value) => value === 'food-bingo-bd.vercel.app' || /^food-bingo-bd-[a-z0-9-]+\.vercel\.app$/.test(value);

export const isAllowedOrigin = (req) => {
  const requestHost = hostname(getHeader(req, 'x-forwarded-host') || getHeader(req, 'host'));
  const source = getHeader(req, 'origin') || getHeader(req, 'referer');
  const sourceHost = hostname(source);
  if (!requestHost || !sourceHost || sourceHost !== requestHost) return false;
  return isLocalhost(requestHost) || isVercelHost(requestHost);
};

const clientFromEnv = (env) => {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
};

const sendJson = (res, status, body, headers = {}) => {
  Object.entries(headers).forEach(([name, value]) => res.setHeader?.(name, value));
  return res.status(status).json(body);
};

const requestIp = (req) => {
  const forwarded = getHeader(req, 'x-forwarded-for');
  return (forwarded ? forwarded.split(',')[0] : getHeader(req, 'x-real-ip') || req.socket?.remoteAddress || 'unknown').trim();
};

export function createHandler({ redis, env = process.env, hash = createHash } = {}) {
  return async function handler(req, res) {
    try {
      const client = redis || clientFromEnv(env);
      if (!client) return sendJson(res, 503, { error: 'not_configured' });

      if (req.method === 'GET') {
        const count = asNumber(await client.get(COUNTER_KEY));
        return sendJson(res, 200, { count }, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }

      if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' });
      if (!isAllowedOrigin(req)) return sendJson(res, 403, { error: 'cross_origin' });

      const userAgent = getHeader(req, 'user-agent');
      if (BOT_UA.test(userAgent)) {
        return sendJson(res, 200, { count: asNumber(await client.get(COUNTER_KEY)) });
      }

      const salt = env.COUNTER_SALT || 'foodbingo-counter-v1';
      const rateKey = `rl:${hash('sha256').update(`${requestIp(req)}${salt}`).digest('hex')}`;
      const attempts = asNumber(await client.incr(rateKey));
      if (attempts === 1) await client.expire(rateKey, RATE_WINDOW_SECONDS);
      if (attempts > RATE_LIMIT) return sendJson(res, 429, { error: 'rate_limited' });

      const count = asNumber(await client.incr(COUNTER_KEY));
      return sendJson(res, 200, { count });
    } catch {
      return sendJson(res, 500, { error: 'internal_error' });
    }
  };
}

export default createHandler();