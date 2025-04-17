const express = require('express');
const { connectDb } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const app = express();
const port = 3000;

// connecnt database 
connectDb();

// use cors
app.use(cors());

// use json
app.use(express.json()); 

// path
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', authRoutes)

// server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});