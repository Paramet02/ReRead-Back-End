const express = require('express');
const router = express.Router();
const { SaveCard , CreateSetupIntent , PaymentWithSaveCard , DeletePaymentMethod , GetPaymentMethods } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware'); 

router.post('/save-card', authMiddleware, SaveCard); // เพิ่ม middleware
router.post('/create-setup-intent', authMiddleware, CreateSetupIntent); // เพิ่ม middleware
router.post('/payment', authMiddleware, PaymentWithSaveCard); // เพิ่ม middleware
router.delete('/payment-methods/:id', authMiddleware, DeletePaymentMethod); // เพิ่ม middleware
router.get('/payment-methods', authMiddleware, GetPaymentMethods); // เพิ่ม middleware

module.exports = router;
