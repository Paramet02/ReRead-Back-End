const express = require('express');
const { connectDb } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const app = express();
const port = 3000;
const path = require('path');
//เรียกใช้
app.use(cors());

// connecnt database 
connectDb();

// path
app.use('/api', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/products', require('./routes/productRoutes'));


// server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});