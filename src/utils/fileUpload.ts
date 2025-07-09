import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create an 'uploads' directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir); // Save files to the 'uploads' directory
  },
  filename: function(req, file, cb){
    // Create a unique filename to avoid overwriting files
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize the upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Limit file size to 10MB
}).fields([
    // This defines the names of the file input fields from your form
    { name: 'slip_picture', maxCount: 1 },
    { name: 'seal_1_picture', maxCount: 1 },
    { name: 'seal_2_picture', maxCount: 1 }
]);

export default upload;