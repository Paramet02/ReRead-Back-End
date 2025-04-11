const { client } = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const result = await client.query('SELECT is_seller FROM users WHERE id = $1', [req.user.user_id]);
    if (!result.rows[0]?.is_seller) {
      return res.status(403).json({ error: 'ต้องยืนยันตัวตนก่อนขายสินค้า' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'เช็คสิทธิ์ไม่สำเร็จ' });
  }
};
