const express = require('express');
const multer  = require('multer');
const router = express.Router();
const File = require('../models/file');

// Set up multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("video") || file.mimetype.includes("audio") || file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Route to handle file upload
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const file = new File({
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype
    });
    await file.save();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
