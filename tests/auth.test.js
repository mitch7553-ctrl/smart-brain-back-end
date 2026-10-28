const test = require('node:test');
const assert = require('node:assert/strict');
const { sign, verify, requireAuth, requireSameUser } = require('../auth');

test('signed tokens validate and tampering fails', () => {
  process.env.AUTH_TOKEN_SECRET = 'development-only-test-secret-at-least-32-chars';
  const token = sign(42);
  assert.equal(verify(token), 42);
  assert.equal(verify(token + 'x'), null);
});

test('requests cannot access another account', () => {
  let status;
  requireSameUser({ userId: 42, body: { id: 43 }, params: {} },
    { status(code) { status = code; return this; }, json() {} }, () => { throw Error('authorized unexpectedly'); });
  assert.equal(status, 403);
});

test('missing token is unauthorized', () => {
  let status;
  requireAuth({ get() { return undefined; } },
    { status(code) { status = code; return this; }, json() {} }, () => { throw Error('authorized unexpectedly'); });
  assert.equal(status, 401);
});
