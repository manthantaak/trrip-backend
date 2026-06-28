const express = require('express');
const protect = require('../middleware/auth');
const { uploadDocument } = require('../controllers/uploadController');

const router = express.Router();

router.post('/', protect, uploadDocument);

module.exports = router;
