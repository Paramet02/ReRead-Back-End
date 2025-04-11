const { client } = require('../config/db');
const path = require('path');

exports.createProduct = async (req, res) => {
    const { name, description, price, condition } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : null;
    console.log('req.file:', req.file);
    const userId = req.user.id;
  
    console.log('Parameters:', [userId, name, description, price, condition, image]);
  
    try {//เพิ่ม userId image
      const result = await client.query(
        'INSERT INTO products ( name, description, price, condition, ) VALUES ($1, $2, $3, $4, ) RETURNING *',
        [name, description, price, condition]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'เพิ่มสินค้าไม่สำเร็จ' });
    }
  };

exports.getAllProducts = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถโหลดสินค้าได้' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, description, price, condition } = req.body;
  const image = req.file ? '/uploads/' + req.file.filename : null;
  const productId = req.params.id;
  const userId = req.user.id;

  try {
    const check = await client.query('SELECT * FROM products WHERE id = $1 AND user_id = $2', [productId, userId]);
    if (check.rows.length === 0) return res.status(403).json({ error: 'ไม่สามารถแก้ไขสินค้านี้ได้' });

    const result = await client.query(
      'UPDATE products SET name=$1, description=$2, price=$3, condition=$4, image=COALESCE($5, image) WHERE id=$6 RETURNING *',
      [name, description, price, condition, image, productId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถแก้ไขสินค้าได้' });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

  try {
    const check = await client.query('SELECT * FROM products WHERE id = $1 AND user_id = $2', [productId, userId]);
    if (check.rows.length === 0) return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบสินค้า' });

    await client.query('DELETE FROM products WHERE id = $1', [productId]);
    res.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'ลบไม่สำเร็จ' });
  }
};
