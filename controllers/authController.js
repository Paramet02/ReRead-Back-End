const { client } = require('../config/db');  // นำเข้าเฉพาะ client
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const register = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    console.log('เริ่มกระบวนการลงทะเบียน...');

    // ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือไม่
    const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.log('ไม่มีผู้ใช้ที่มีอีเมลนี้.');

    // การแฮชรหัสผ่านก่อนที่จะบันทึก
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('แฮชรหัสผ่านเสร็จสมบูรณ์.');

    // บันทึกผู้ใช้ลงในฐานข้อมูล
    const result = await client.query(
      `INSERT INTO users (email, password, role, is_seller)
       VALUES ($1, $2, 'buyer', false)
       RETURNING id, email, role`,
      [email, hashedPassword]
    );
    console.log('ผู้ใช้ถูกสร้างแล้ว:', result.rows[0]);

    // ส่งข้อมูลผู้ใช้ที่สร้าง (ไม่รวมรหัสผ่าน)
    res.status(201).json({ id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดระหว่างการลงทะเบียน:', err);
    res.status(500).json({ error: "Server error" });
  }
};

// User Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // If user not found, send error
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    // Compare the entered password with the hashed password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid email or password" });

    // Create a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Respond with the token
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
