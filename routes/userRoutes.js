const express = require('express');
const { getUsers } = require('../controllers/userController');
const { authMiddleware, verifySeller } = require('../middleware/authMiddleware');
const verify = require('../controllers/verifySeller');
const router = express.Router();


router.get('/users', getUsers);
router.post('/verify-citizen', authMiddleware, verify.verifyCitizen);

module.exports = router;