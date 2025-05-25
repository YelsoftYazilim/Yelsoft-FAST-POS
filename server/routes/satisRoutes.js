const express = require('express');
const router = express.Router();
const SatisController = require('../controllers/satisController');

// Ana rotalar - artık /api/satislar rotası ile çalışmak yerine / rotası ile çalışacak
router.post('/api/satislar', SatisController.createSatis);
// Alternatif rota tanımı - ana URL'den de çalışsın
router.post('/', SatisController.createSatis);

module.exports = router;