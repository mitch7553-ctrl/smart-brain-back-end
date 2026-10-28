const handleProfileGet = async (req, res, db) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Valid user ID required' });
  }

  try {
    const users = await db.select('id', 'name', 'email', 'entries', 'joined')
      .from('users').where({ id });
    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(users[0]);
  } catch (error) {
    console.error('Unable to get profile:', error.message);
    return res.status(500).json({ error: 'Unable to get user' });
  }
};

module.exports = { handleProfileGet };
