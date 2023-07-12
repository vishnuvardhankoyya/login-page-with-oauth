const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file1');

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Handle file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { filename, path } = req.file;
    const file = new File({ name: filename, path });
    await file.save();
    res.status(200).json({ message: 'File uploaded successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred uploading the file.' });
  }
});

module.exports = router;
