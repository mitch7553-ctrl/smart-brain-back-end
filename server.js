const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const auth = require('./auth');

const connection = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT) || 5432,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB
    };

const db = knex({ client: 'pg', connection });
const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '16kb' }));

app.get('/', (_req, res) => res.json({ service: 'smart-brain-api', status: 'ok' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/signin', signin.handleSignin(db, bcrypt));
app.post('/register', (req, res) => register.handleRegister(req, res, db, bcrypt));
app.get('/profile/:id', auth.requireAuth, auth.requireSameUser, (req, res) => profile.handleProfileGet(req, res, db));
app.put('/image', auth.requireAuth, auth.requireSameUser, (req, res) => image.handleImage(req, res, db));
app.post('/imageurl', auth.requireAuth, (req, res) => image.handleApiCall(req, res));

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON request body' });
  }
  if (err && err.status === 413) {
    return res.status(413).json({ error: 'Request body too large' });
  }
  console.error('Unhandled request error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`SmartBrain API listening on port ${port}`));
}

module.exports = app;
