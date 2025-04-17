const Product = require('../model/productModel');

exports.getAll = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, description, price, condition } = req.body;
  const image_url = req.image_url;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized: No user ID found' });
  }

  const user_id = req.user.id;  

  try {
   
    const newProduct = await Product.createProduct({
      name,
      description,
      price,
      condition,
      image_url,
      user_id,  // ส่งค่า user_id ไปในการสร้างสินค้า
    });

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Product.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', product: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};