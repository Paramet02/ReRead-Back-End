const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/ProductController');
const { uploadToCloudinary } = require('../config/cloudinary');
// const verifySeller = require('../middleware/authMiddleware');
const upload = multer({ dest: 'uploads/' });

router.get('/products', controller.getAll);
router.get('/products/:id', controller.getById);
router.post('/products', upload.single('image'), async (req, res, next) => {
  const url = await uploadToCloudinary(req.file.path);
  req.image_url = url;
  next();
}, controller.create);

module.exports = router;
