const { client } = require('../config/db');

exports.verifyCitizen = async (req, res) => {
  const { citizen_id } = req.body;
  const userId = req.user.id; // ดึงจาก token (ผ่าน authMiddleware)

  // ตรวจสอบความถูกต้องของเลขบัตร
  if (!/^\d{13}$/.test(citizen_id)) {
    return res.status(400).json({ error: 'Invalid citizen ID format' });
  }

  try {
    // อัปเดตข้อมูลใน database
    await client.query(
      'UPDATE users SET citizen_id = $1, is_seller = true WHERE id = $2',
      [citizen_id, userId]
    );
    res.json({ message: 'Citizen ID verified successfully. You are now a seller.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
