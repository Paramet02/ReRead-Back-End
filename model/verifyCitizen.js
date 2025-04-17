const { client } = require('../config/db');

exports.verifyCitizen = async (req, res) => {
  const { citizen_id } = req.body;
  const userId = req.user.id; 

  if (!/^\d{13}$/.test(citizen_id)) {
    return res.status(400).json({ error: 'Invalid citizen ID' });
  }

  try {
    await client.query(
      'UPDATE users SET citizen_id = $1, is_seller = true WHERE id = $2',
      [citizen_id, userId]
    );
    res.json({ message: 'Citizen ID verified' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

  