require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// JSON veritabanı dosya yolu
const dbFilePath = path.join(__dirname, 'data', 'db.json');

// Veritabanı işlemleri için yardımcı fonksiyonlar
const DB = {
  read: () => {
    try {
      if (!fs.existsSync(dbFilePath)) {
        // Eğer dosya yoksa, dizini oluştur ve boş veritabanı oluştur
        if (!fs.existsSync(path.dirname(dbFilePath))) {
          fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
        }
        fs.writeFileSync(dbFilePath, JSON.stringify({ 
          urunler: [], 
          satislar: [],
          kategoriler: [],
          altKategoriler: []
        }));
        return { 
          urunler: [], 
          satislar: [],
          kategoriler: [],
          altKategoriler: []
        };
      }
      const data = fs.readFileSync(dbFilePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Veritabanı okuma hatası:', err);
      return { 
        urunler: [], 
        satislar: [],
        kategoriler: [],
        altKategoriler: []
      };
    }
  },
  write: (data) => {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
      return true;
    } catch (err) {
      console.error('Veritabanı yazma hatası:', err);
      return false;
    }
  }
};

// Express uygulamasını oluştur
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// JSON veritabanını global olarak erişilebilir yap
global.DB = DB;
console.log('JSON veritabanı başarıyla yüklendi');

// Rotaları içe aktarma
const urunRoutes = require('./routes/urunRoutes');
const satisRoutes = require('./routes/satisRoutes');
const odemeTipleriRoutes = require('./routes/odemeTipleriRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');

// Endpoint loglama middleware'i
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API rotaları
app.use('/api/urunler', urunRoutes);
app.use('/api/satislar', satisRoutes);
app.use('/api/odeme-tipleri', odemeTipleriRoutes);
app.use('/api/kategoriler', kategoriRoutes);

// Production ortamında statik dosyaları sunma
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Sunucuyu başlatma
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});