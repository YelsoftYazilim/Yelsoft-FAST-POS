require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { eskiSatislariTemizle, stoklariSifirla } = require('./utils/temizleyici');
const dosyaYonetimi = require('./utils/dosya-yonetimi');

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
      // Yedek dosya oluştur
      const yedekDosya = `${dbFilePath}.bak`;
      if (fs.existsSync(dbFilePath)) {
        fs.copyFileSync(dbFilePath, yedekDosya);
        console.log('DB yedek dosyası oluşturuldu:', yedekDosya);
      }

      // Veriyi doğrula
      if (!data || typeof data !== 'object') {
        throw new Error('Geçersiz veri formatı - nesne bekleniyor');
      }
      
      // Zorunlu alanlar mevcut mu kontrol et
      if (!Array.isArray(data.urunler)) data.urunler = [];
      if (!Array.isArray(data.satislar)) data.satislar = [];
      if (!Array.isArray(data.kategoriler)) data.kategoriler = [];
      if (!Array.isArray(data.altKategoriler)) data.altKategoriler = [];
      
      // Veriyi formatlayarak yaz (pretty print)
      const formattedData = JSON.stringify(data, null, 2);
      fs.writeFileSync(dbFilePath, formattedData);
      console.log('Veritabanı başarıyla güncellendi');
      return true;
    } catch (err) {
      console.error('Veritabanı yazma hatası:', err);
      
      // Hata durumunda yedeği geri yükle
      const yedekDosya = `${dbFilePath}.bak`;
      if (fs.existsSync(yedekDosya)) {
        fs.copyFileSync(yedekDosya, dbFilePath);
        console.log('Hata nedeniyle yedek dosya geri yüklendi');
      }
      
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

// Zamanlayıcı kurulumu: Her 5 günde bir çalışacak (her ayın 1, 6, 11, 16, 21, 26 günlerinde)
// Tüm satışları temizleyecek
cron.schedule('0 0 1,6,11,16,21,26 * *', async () => {
  console.log('Zamanlı görev: Tüm satışları temizleme başlatılıyor...');
  try {
    // Veritabanını oku
    const db = await dosyaYonetimi.readDB();
    
    // Mevcut satış sayısı
    const eskiSayisi = db.satislar.length;
    console.log(`Mevcut satış sayısı: ${eskiSayisi}`);
    
    if (eskiSayisi > 0) {
      // Satışları temizle
      db.satislar = [];
      
      // Veritabanına yaz
      const yazmaBasarili = await dosyaYonetimi.writeDB(db);
      console.log(`Veritabanı yazma sonucu: ${yazmaBasarili ? 'BAŞARILI' : 'BAŞARISIZ'}`);
      
      if (yazmaBasarili) {
        console.log(`Otomatik temizleme: Tüm satışlar başarıyla temizlendi (${eskiSayisi} kayıt).`);
      } else {
        console.error('Otomatik temizleme: Veritabanı yazma hatası.');
      }
    } else {
      console.log('Otomatik temizleme: Silinecek satış kaydı bulunamadı.');
    }
  } catch (err) {
    console.error('Otomatik temizleme hatası:', err);
  }
});

// Zamanlayıcı: Her 5 günde bir stokları sıfırla
cron.schedule('5 0 1,6,11,16,21,26 * *', () => {
  console.log('Zamanlı görev: Tüm stokları sıfırlama başlatılıyor...');
  try {
    stoklariSifirla();
  } catch (err) {
    console.error('Otomatik stok sıfırlama hatası:', err);
  }
});

// Uygulama ilk başladığında eski satışları ve stokları kontrol et
setTimeout(() => {
  console.log('Uygulama başlangıcı: Eski satışları ve stokları kontrol etme');
  eskiSatislariTemizle(5);
  stoklariSifirla();
}, 5000);

// Sunucuyu başlatma
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});