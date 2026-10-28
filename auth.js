const crypto = require('node:crypto');
const TTL_SECONDS = 60 * 60 * 8;
const secret = () => process.env.AUTH_TOKEN_SECRET;

function sign(userId) {
  if (!secret() || secret().length < 32) throw new Error('AUTH_TOKEN_SECRET must be at least 32 characters');
  const payload = Buffer.from(JSON.stringify({
    sub: String(userId),
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS
  })).toString('base64url');
  const mac = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return payload + '.' + mac;
}

function verify(token) {
  if (!secret() || secret().length < 32 || typeof token !== 'string') return null;
  const pieces = token.split('.');
  if (pieces.length !== 2) return null;
  const [payload, received] = pieces;
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest();
  let supplied;
  try { supplied = Buffer.from(received, 'base64url'); } catch { return null; }
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const id = Number(data.sub);
    if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(data.exp) ||
        data.exp <= Date.now() / 1000) return null;
    return id;
  } catch { return null; }
}

function requireAuth(req, res, next) {
  const match = /^Bearer (\S+)$/.exec(req.get('authorization') || '');
  const id = match ? verify(match[1]) : null;
  if (!id) return res.status(401).json({ error: 'Authentication required' });
  req.userId = id;
  next();
}

function requireSameUser(req, res, next) {
  const claimed = Number(req.params.id || req.body?.id);
  if (!Number.isSafeInteger(claimed) || claimed !== req.userId)
    return res.status(403).json({ error: 'Not authorized for this account' });
  next();
}

module.exports = { sign, verify, requireAuth, requireSameUser };
