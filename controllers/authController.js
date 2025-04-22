const { client } = require('../config/db');  
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    console.log('เริ่มกระบวนการลงทะเบียน...');


    const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.log('ไม่มีผู้ใช้ที่มีอีเมลนี้.');


    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('แฮชรหัสผ่านเสร็จสมบูรณ์.');


    const result = await client.query(
      `INSERT INTO users (username, email, password, role, is_seller)
        VALUES ($1, $2, $3, 'buyer', false)
        RETURNING id, username, email, role`,
      [username, email, hashedPassword]
    );
    console.log('ผู้ใช้ถูกสร้างแล้ว:', result.rows[0]);

    res.status(201).json({ id: result.rows[0].id, username: result.rows[0].username, email: result.rows[0].email, role: result.rows[0].role });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดระหว่างการลงทะเบียน:', err);
    res.status(500).json({ error: "Server error" });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  register,
  login,
};