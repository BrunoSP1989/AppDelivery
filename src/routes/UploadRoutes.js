const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/UpdatePictureControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/upload/presigned-url', authMiddleware, uploadController.getPresignedUploadUrl);

module.exports = router;