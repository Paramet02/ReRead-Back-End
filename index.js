const express = require('express');
const { connectDb } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const app = express();
const port = 3000;

// connecnt database 
connectDb();

// path
app.use('/api', userRoutes);

// server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});