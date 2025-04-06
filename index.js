const express = require('express');
const app = express();
const port = 3000;

// path
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});