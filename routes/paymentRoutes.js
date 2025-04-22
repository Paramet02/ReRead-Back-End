const express = require('express');
const router = express.Router();
const {
  SaveCard,
  CreateSetupIntent,
  PaymentWithSaveCard,
  DeletePaymentMethod,
  GetPaymentMethods
} = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/save-card', authMiddleware, SaveCard);
router.post('/create-setup-intent', authMiddleware, CreateSetupIntent);
router.post('/payment', authMiddleware, PaymentWithSaveCard);
router.delete('/payment-methods/:id', authMiddleware, DeletePaymentMethod);
router.get('/payment-methods', authMiddleware, GetPaymentMethods);

module.exports = router;
