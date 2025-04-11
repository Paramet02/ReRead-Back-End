// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const auth = require('../middlewares/authenticateToken');
const isSeller = require('../middlewares/Isseller');
const upload = require('../middlewares/upload');


router.post('/', auth, isSeller, upload.single('image'), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', auth, isSeller, upload.single('image'), productController.updateProduct);
router.delete('/:id', auth, isSeller, productController.deleteProduct);

module.exports = router;
