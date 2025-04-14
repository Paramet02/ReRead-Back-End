const jwt = require('jsonwebtoken');
require('dotenv').config(); // สำหรับดึงค่า JWT_SECRET จากไฟล์ .env

const authMiddleware = (req, res, next) => {
  // ดึง Authorization header ออกมาจาก request
  const authHeader = req.headers.authorization;

  // ถ้าไม่มี Authorization header หรือไม่ใช่ Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Token not found' });
  }

  // เอา token ออกมา
  const token = authHeader.split(' ')[1];

  try {
    // ยืนยัน token ด้วย secret key ที่เก็บใน .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // เก็บข้อมูลของ user ลงใน request (ไว้ใช้ใน route ถัดไป)
    req.user = decoded;
    
    // ถ้าไม่มีปัญหาไปที่ middleware หรือ controller ต่อไป
    next();
  } catch (err) {
    // ถ้าเกิดข้อผิดพลาด (เช่น token หมดอายุ หรือไม่ถูกต้อง)
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
