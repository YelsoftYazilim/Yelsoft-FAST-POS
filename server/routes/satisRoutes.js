const express = require('express');
const router = express.Router();
const SatisController = require('../controllers/satisController');

// Yeni satış oluşturma
router.post('/api/satislar', SatisController.createSatis);

module.exports = router;