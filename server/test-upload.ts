import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create a simple Express app for testing file uploads
const app = express();
const port = 5001;

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/test';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `test_${Date.now()}${fileExt}`;
    cb(null, fileName);
  }
});

// Create upload middleware
const upload = multer({ storage });

// Basic route
app.get('/', (req, res) => {
  res.send('File Upload Test Server');
});

// Test upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('Upload request received');
  console.log('Request file:', req.file);
  
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const relativePath = req.file.path.replace(/^uploads\//, '/uploads/');
  res.json({
    success: true,
    message: 'File uploaded successfully',
    url: relativePath,
    file: req.file
  });
});

// Start server
app.listen(port, () => {
  console.log(`Test upload server running at http://localhost:${port}`);
});