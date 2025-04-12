const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadToCloudinary = async (localPath) => {
  const result = await cloudinary.uploader.upload(localPath, { folder: 'products' });
  fs.unlinkSync(localPath);
  return result.secure_url;
};

module.exports = { uploadToCloudinary };
