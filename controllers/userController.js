const { client } = require('../config/db');

// ฟังก์ชันดึงข้อมูลผู้ใช้ทั้งหมด
const getUsers = async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getUsers
};
