const { sign } = require('../auth');

const handleSignin = (db, bcrypt) => async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json('incorrect form submission');
  }

  if (!process.env.AUTH_TOKEN_SECRET || process.env.AUTH_TOKEN_SECRET.length < 32) {
    return res.status(503).json('Authentication service is not configured');
  }

  try {
    const credentials = await db.select('email', 'hash').from('login').where({ email }).first();
    if (!credentials || !bcrypt.compareSync(password, credentials.hash)) {
      return res.status(401).json('wrong credentials');
    }

    const user = await db.select('id', 'name', 'email', 'entries', 'joined')
      .from('users').where({ email }).first();
    if (!user) {
      return res.status(401).json('wrong credentials');
    }
    return res.json({ ...user, token: sign(user.id) });
  } catch (error) {
    console.error('Sign-in failed:', error.message);
    return res.status(500).json('unable to sign in');
  }
};

module.exports = { handleSignin };
