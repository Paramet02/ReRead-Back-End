const express = require('express');
const { connectDb } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const port = 3000;
require('dotenv').config();
//เรียกใช้


// connecnt database 
connectDb();

// path
app.use('/api', userRoutes);
app.use('/api', productRoutes);


// server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});