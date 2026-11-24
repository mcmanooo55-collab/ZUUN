import { randomBytes } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { services } from './src/content.js';

export const getInboxPath = () => join(resolve(process.env.ZUUN_DATA_DIR || './var'), 'inquiries.jsonl');
const validServices = new Set([...services.map(discipline => discipline.id), 'unsure']);
const buckets = new Map();
const maxBody = 24000;
const windowMs = 60 * 60_000;

const reply = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
};

function limited(req) {
  const now = Date.now();
  for (const [key, value] of buckets) if (value.resetAt <= now) buckets.delete(key);
  const forwarded = process.env.ZUUN_TRUST_PROXY === '1' ? req.headers['x-forwarded-for']?.split(',').at(-1)?.trim() : '';
  const ip = forwarded || req.socket.remoteAddress || 'local';
  const entry = buckets.get(ip) || { count: 0, resetAt: now + windowMs };
  if (entry.count >= 10) return true;
  entry.count++;
  if (buckets.size < 2000 || buckets.has(ip)) buckets.set(ip, entry);
  return false;
}

async function notify(inquiry) {
  const { RESEND_API_KEY, ZUUN_NOTIFY_TO, ZUUN_NOTIFY_FROM } = process.env;
  if (!RESEND_API_KEY || !ZUUN_NOTIFY_TO || !ZUUN_NOTIFY_FROM) return;
  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify({
        from: ZUUN_NOTIFY_FROM,
        to: [ZUUN_NOTIFY_TO],
        reply_to: inquiry.email,
        subject: `ZUUN inquiry ${inquiry.reference}`,
        text: `${inquiry.name}\n${inquiry.email}\nService: ${inquiry.service}\n\n${inquiry.message}`,
      }),
    });
    if (!result.ok) console.error(`Contact notification failed (${result.status}); inquiry ${inquiry.reference} is saved locally.`);
  } catch {
    console.error(`Contact notification unavailable; inquiry ${inquiry.reference} is saved locally.`);
  }
}

export async function handleContact(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return reply(res, 405, { error: 'method' }); }
  if (!/^application\/json\s*(;|$)/i.test(req.headers['content-type'] || '')) return reply(res, 415, { error: 'content' });
  if (Number(req.headers['content-length']) > maxBody) { req.resume(); return reply(res, 413, { error: 'invalid' }); }
  if (limited(req)) { req.resume(); return reply(res, 429, { error: 'limited' }); }
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > maxBody) { reply(res, 413, { error: 'invalid' }); return; }
      chunks.push(chunk);
    }
    let data;
    try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { return reply(res, 400, { error: 'invalid' }); }
    const clean = (value) => typeof value === 'string' ? value.trim() : '';
    const name = clean(data?.name);
    const email = clean(data?.email);
    const message = clean(data?.message);
    const service = clean(data?.service);
    const language = data?.language === 'en' ? 'en' : 'ar';
    const reference = `ZU-${randomBytes(5).toString('hex').toUpperCase()}`;
    if (clean(data?.website)) return reply(res, 201, { reference });
    if (!name || name.length > 100 || email.length > 200 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email) || !validServices.has(service) || message.length < 15 || message.length > 2400) {
      return reply(res, 400, { error: 'invalid' });
    }
    const inquiry = { reference, receivedAt: new Date().toISOString(), language, name, email, service, message };
    await mkdir(resolve(process.env.ZUUN_DATA_DIR || './var'), { recursive: true, mode: 0o700 });
    await appendFile(getInboxPath(), `${JSON.stringify(inquiry)}\n`, { mode: 0o600 });
    reply(res, 201, { reference });
    void notify(inquiry);
  } catch {
    if (!res.headersSent && !res.destroyed) reply(res, 500, { error: 'failed' });
  }
}
