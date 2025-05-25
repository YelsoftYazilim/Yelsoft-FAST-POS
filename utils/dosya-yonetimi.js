/**
 * Dosya işlemleri için yardımcı fonksiyonlar
 */
const fs = require('fs').promises;
const path = require('path');

// Veritabanı dosya yolu
const dbFilePath = path.join(__dirname, '..', 'data', 'db.json');

// Veritabanı okuma fonksiyonu
const readDB = async () => {
  try {
    // Dosya var mı kontrol et
    try {
      await fs.access(dbFilePath);
    } catch (err) {
      // Dosya yoksa dizin varlığını kontrol et
      const dirPath = path.dirname(dbFilePath);
      try {
        await fs.access(dirPath);
      } catch (dirErr) {
        // Dizin yoksa oluştur
        await fs.mkdir(dirPath, { recursive: true });
      }
      
      // Boş veritabanı oluştur
      const emptyDB = { 
        urunler: [], 
        satislar: [],
        kategoriler: [],
        altKategoriler: []
      };
      await fs.writeFile(dbFilePath, JSON.stringify(emptyDB, null, 2), 'utf8');
      return emptyDB;
    }
    
    // Dosyayı oku
    const data = await fs.readFile(dbFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Veritabanı okuma hatası (async):', err);
    return { 
      urunler: [], 
      satislar: [],
      kategoriler: [],
      altKategoriler: []
    };
  }
};

// Veritabanına yazma fonksiyonu
const writeDB = async (data) => {
  try {
    // Yedek dosya oluştur
    const yedekDosya = `${dbFilePath}.bak`;
    try {
      await fs.access(dbFilePath);
      await fs.copyFile(dbFilePath, yedekDosya);
      console.log('DB yedek dosyası oluşturuldu (async):', yedekDosya);
    } catch (err) {
      console.log('Yedek oluşturma hatası:', err.message);
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
    await fs.writeFile(dbFilePath, formattedData, 'utf8');
    console.log('Veritabanı başarıyla güncellendi (async)');
    return true;
  } catch (err) {
    console.error('Veritabanı yazma hatası (async):', err);
    
    // Hata durumunda yedeği geri yükle
    try {
      const yedekDosya = `${dbFilePath}.bak`;
      await fs.access(yedekDosya);
      await fs.copyFile(yedekDosya, dbFilePath);
      console.log('Hata nedeniyle yedek dosya geri yüklendi (async)');
    } catch (backupErr) {
      console.error('Yedek dosya geri yükleme hatası:', backupErr);
    }
    
    return false;
  }
};

// Doğrudan veritabanı dosyasını silme (acil durum için)
const resetDB = async () => {
  try {
    // Yedek dosya oluştur
    const yedekDosya = `${dbFilePath}.deleted.${new Date().getTime()}.bak`;
    try {
      await fs.access(dbFilePath);
      await fs.copyFile(dbFilePath, yedekDosya);
      console.log('DB silme öncesi yedek oluşturuldu:', yedekDosya);
    } catch (err) {
      console.log('Silme öncesi yedek oluşturma hatası:', err.message);
    }
    
    // Yeni boş veritabanı oluştur
    const emptyDB = { 
      urunler: [], 
      satislar: [],
      kategoriler: [],
      altKategoriler: []
    };
    
    // Dosyayı yaz
    await fs.writeFile(dbFilePath, JSON.stringify(emptyDB, null, 2), 'utf8');
    console.log('Veritabanı başarıyla sıfırlandı');
    return true;
  } catch (err) {
    console.error('Veritabanı sıfırlama hatası:', err);
    return false;
  }
};

// Gerçek satış silme fonksiyonu
const silEskiSatislar = async (gunSayisi = 5) => {
  try {
    console.log(`[ASYNC] ${gunSayisi} günden eski satışlar temizleniyor...`);
    
    // Veritabanını oku
    const data = await readDB();
    
    if (!data.satislar || !Array.isArray(data.satislar)) {
      console.log('[ASYNC] Satış kaydı bulunamadı veya geçersiz format.');
      return 0;
    }
    
    console.log(`[ASYNC] Toplam satış kaydı: ${data.satislar.length}`);
    
    // X günden eski kayıtları filtrele
    const sinirTarih = new Date();
    sinirTarih.setDate(sinirTarih.getDate() - gunSayisi);
    sinirTarih.setHours(0, 0, 0, 0); // Günün başlangıcı
    
    console.log(`[ASYNC] Silinecek satışlar için sınır tarihi: ${sinirTarih.toISOString()}`);
    
    // Satışları kontrol et
    data.satislar.forEach((satis, index) => {
      if (!satis.tarih) {
        console.log(`[ASYNC] ID: ${satis.id || index} - Tarih alanı yok!`);
        return;
      }
      
      try {
        const satisTarihi = new Date(satis.tarih);
        const eskiMi = satisTarihi < sinirTarih;
        console.log(`[ASYNC] Satış #${satis.id} (${satis.tarih}) eski mi? ${eskiMi ? 'EVET' : 'HAYIR'}`);
      } catch (err) {
        console.log(`[ASYNC] Satış #${satis.id || index} için tarih hatası: ${err.message}`);
      }
    });
    
    const eskiSatislarSayisi = data.satislar.length;
    
    // Belirtilen günden yeni satışları tut
    data.satislar = data.satislar.filter(satis => {
      if (!satis.tarih) return true;
      
      try {
        const satisTarihi = new Date(satis.tarih);
        if (isNaN(satisTarihi.getTime())) {
          return true; // Geçersiz tarihler korunur
        }
        return satisTarihi >= sinirTarih;
      } catch (err) {
        return true; // Hata durumunda koru
      }
    });
    
    const silinenSatisSayisi = eskiSatislarSayisi - data.satislar.length;
    console.log(`[ASYNC] Silinecek satış sayısı: ${silinenSatisSayisi}`);
    
    if (silinenSatisSayisi > 0) {
      // Veritabanına yaz
      const yazmaBasarili = await writeDB(data);
      console.log(`[ASYNC] Veritabanı yazma sonucu: ${yazmaBasarili ? 'BAŞARILI' : 'BAŞARISIZ'}`);
      
      if (yazmaBasarili) {
        console.log(`[ASYNC] ${silinenSatisSayisi} adet eski satış kaydı silindi.`);
        return silinenSatisSayisi;
      } else {
        console.log(`[ASYNC] Veritabanı yazma hatası nedeniyle satışlar silinemedi!`);
        return 0;
      }
    } else {
      console.log('[ASYNC] Silinecek eski satış kaydı bulunamadı.');
      return 0;
    }
  } catch (err) {
    console.error('[ASYNC] Satış temizleme hatası:', err);
    return 0;
  }
};

module.exports = {
  readDB,
  writeDB,
  resetDB,
  silEskiSatislar
}; 