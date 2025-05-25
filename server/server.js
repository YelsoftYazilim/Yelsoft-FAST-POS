const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Route importları
const SatisController = require('./controllers/satisController');

// Middleware'ler
app.use(cors());
app.use(express.json());

// Router tanımlamalarını tamamen basit tutuyoruz
// Satış rotası - doğrudan controller'a bağlıyoruz
app.post('/api/satislar', SatisController.createSatis);

// Veritabanı bağlantısı
mongoose.connect('mongodb://127.0.0.1:27017/possatis', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    // Sunucuyu başlat
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor`);
    });
  })
  .catch(err => console.error('MongoDB bağlantı hatası:', err));