const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, authorize } = require('../middleware/auth');
const { uploadFile, deleteFile } = require('../controllers/upload.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.post('/', auth, authorize('admin'), upload.single('file'), uploadFile);
router.delete('/', auth, authorize('admin'), deleteFile);

module.exports = router;
