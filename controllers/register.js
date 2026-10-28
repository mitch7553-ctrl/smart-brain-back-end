const { sign } = require('../auth');

const handleRegister = async (req, res, db, bcrypt) => {
  const { email, name, password } = req.body || {};
  if (typeof email !== 'string' || typeof name !== 'string' || typeof password !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      !name.trim() || name.length > 100 || password.length < 8 || password.length > 128) {
    return res.status(400).json('Please provide a valid name, email, and password (8-128 characters).');
  }

  if (!process.env.AUTH_TOKEN_SECRET || process.env.AUTH_TOKEN_SECRET.length < 32) {
    return res.status(503).json('Authentication service is not configured');
  }

  try {
    const hash = bcrypt.hashSync(password);
    const user = await db.transaction(async (trx) => {
      await trx('login').insert({ email, hash });
      const users = await trx('users').insert({
        email, name: name.trim(), joined: new Date()
      }).returning(['id', 'name', 'email', 'entries', 'joined']);
      return users[0];
    });
    return res.status(201).json({ ...user, token: sign(user.id) });
  } catch (error) {
    console.error('Registration failed:', error.message);
    if (error.code === '23505') {
      return res.status(409).json('Account already exists');
    }
    return res.status(500).json('Unable to register');
  }
};

module.exports = { handleRegister };
