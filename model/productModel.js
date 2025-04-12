const { client } = require('../config/db');

exports.getAllProducts = async () => {
  const res = await client.query('SELECT * FROM products');
  return res.rows;
};

exports.getProductById = async (id) => {
  const res = await client.query('SELECT * FROM products WHERE id = $1', [id]);
  return res.rows[0];
};

exports.createProduct = async (product) => {
  const { name, description, price, condition, image_url, user_id } = product;
  const res = await client.query(
    `INSERT INTO products (name, description, price, condition, image_url, user_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, description, price, condition, image_url, user_id]
  );
  return res.rows[0];
};
