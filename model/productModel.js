const { client } = require('../config/db');

exports.getAllProducts = async () => {
  const res = await client.query('SELECT * FROM products'); 
  return res.rows;
};

exports.getProductsByUser = async (req, res) => {
 
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const user_id = req.user.id;

  try {
    const result = await client.query(
      'SELECT * FROM products WHERE user_id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No products found for this user' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteProduct = async (id) => {
  const res = await client.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]); 
  return res.rows[0]; 
};

exports.createProduct = async (product) => {
  const { name, description, price, condition, image_url, category, user_id ,seller} = product;

  const res = await client.query(
    `INSERT INTO products (name, description, price, condition, image_url, category, user_id, seller)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, description, price, condition, image_url, category, user_id, seller]
  );

  return res.rows[0];  // คืนค่าผลลัพธ์สินค้าที่ถูกสร้างขึ้น
};