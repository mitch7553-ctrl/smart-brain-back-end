const CLARIFAI_URL = 'https://api.clarifai.com/v2/models/face-detection/outputs';

function isValidImageUrl(input) {
  if (typeof input !== 'string' || input.length > 2048) return false;
  try {
    const url = new URL(input);
    return (url.protocol === 'http:' || url.protocol === 'https:') &&
      Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

async function handleApiCall(req, res) {
  const input = req.body?.input;
  if (!isValidImageUrl(input)) {
    return res.status(400).json({ error: 'A valid HTTP(S) image URL is required' });
  }

  const pat = process.env.CLARIFAI_PAT;
  if (!pat) {
    return res.status(503).json({ error: 'Face detection is not configured' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(CLARIFAI_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Key ${pat}`
      },
      body: JSON.stringify({
        user_app_id: {
          user_id: process.env.CLARIFAI_USER_ID || 'clarifai',
          app_id: process.env.CLARIFAI_APP_ID || 'main'
        },
        inputs: [{ data: { image: { url: input } } }]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Face detection service returned an error' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Face detection request failed:', error.message);
    return res.status(502).json({ error: 'Face detection service unavailable' });
  } finally {
    clearTimeout(timeout);
  }
}

async function handleImage(req, res, db) {
  const id = Number(req.body?.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Valid user ID required' });
  }

  try {
    const entries = await db('users')
      .where('id', '=', id)
      .increment('entries', 1)
      .returning('entries');
    if (!entries.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(entries[0].entries);
  } catch (error) {
    console.error('Unable to update entries:', error.message);
    return res.status(500).json({ error: 'Unable to update entries' });
  }
}

module.exports = { handleImage, handleApiCall, isValidImageUrl };
