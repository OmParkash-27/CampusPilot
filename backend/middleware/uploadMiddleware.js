const multer = require('multer');

// Use memory storage to upload directly to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
