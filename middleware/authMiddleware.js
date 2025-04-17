const jwt = require('jsonwebtoken');
const { client } = require('../config/db'); // เพิ่มเพื่อเช็ค is_seller จาก DB
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Token not found' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔎 ดึง is_seller จาก database
    const result = await client.query('SELECT id, is_seller FROM users WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = result.rows[0]; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const verifySeller = (req, res, next) => {
  if (!req.user.is_seller) {
    return res.status(403).json({ error: 'You must verify your identity to sell products' });
  }
  next();
};

module.exports = { authMiddleware, verifySeller };
