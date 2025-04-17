const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/ProductController');
const { uploadToCloudinary } = require('../config/cloudinary');
const { authMiddleware, verifySeller } = require('../middleware/authMiddleware');
const model = require("../model/productModel")
const upload = multer({ dest: 'uploads/' });


router.get('/myproducts', authMiddleware, model.getProductsByUser);
router.post('/products',
  authMiddleware, 
  verifySeller, 
  upload.single('image_url'),  
  async (req, res, next) => {
    try {
      const url = await uploadToCloudinary(req.file.path);  
      req.image_url = url;
      next();  
    } catch (err) {
      return res.status(500).json({ error: 'Image upload failed' });
    }
  },
  controller.create  
);
router.delete('/products/:id', authMiddleware, controller.delete);

module.exports = router;
