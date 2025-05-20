const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Route importları
const satisRoutes = require('./routes/satisRoutes');

// Middleware'ler
app.use(cors());
app.use(express.json());

// Route tanımlamaları
app.use('/api/satislar', satisRoutes);

// Veritabanı bağlantısı
mongoose.connect('mongodb://localhost:27017/possatis')
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    // Sunucuyu başlat
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor`);
    });
  })
  .catch(err => console.error('MongoDB bağlantı hatası:', err));