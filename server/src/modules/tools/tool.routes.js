const express = require('express');
const multer = require('multer');
const toolController = require('./tool.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

// Multer memory configuration for handling direct file uploads to buffers.
// Limit images to a max of 5MB.
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    // Only accept image mime types
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Public endpoints
router.get('/', toolController.list);
router.get('/:id', toolController.detail);

// Protected endpoints
router.post('/', authMiddleware, upload.single('image'), toolController.create);
router.patch('/:id', authMiddleware, upload.single('image'), toolController.update);

module.exports = router;
