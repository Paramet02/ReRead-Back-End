const express = require('express');
const { getUsers } = require('../controllers/userController');

const router = express.Router();

// เส้นทางดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/users', getUsers);

module.exports = router;