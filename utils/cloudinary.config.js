const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

module.exports.upload = (path, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      {
        folder,
        allowed_formats: ["png", "jpg", "jpeg"],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
  });
};

module.exports.destroy = (folder, filename) => {
  if (folder) filename = `${folder}/${filename}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(filename, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
};
