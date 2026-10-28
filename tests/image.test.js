const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidImageUrl, handleImage, handleApiCall } = require('../controllers/image');

function mockResponse() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

test('accepts http and https image URLs', () => {
  assert.equal(isValidImageUrl('https://example.com/image.jpg'), true);
  assert.equal(isValidImageUrl('http://example.com/photo'), true);
});

test('rejects unsupported, invalid and credentialed URLs', () => {
  for (const input of ['', null, 'file:///etc/passwd', 'javascript:alert(1)', 'https://user:password@example.com/a', 'not-a-url']) {
    assert.equal(isValidImageUrl(input), false);
  }
});

test('rejects invalid user IDs without calling the database', async () => {
  const res = mockResponse();
  await handleImage({ body: { id: 'invalid' } }, res, () => { throw new Error('unexpected database call'); });
  assert.equal(res.statusCode, 400);
});

test('rejects invalid detection input', async () => {
  const res = mockResponse();
  await handleApiCall({ body: { input: 'bad-url' } }, res);
  assert.equal(res.statusCode, 400);
});
