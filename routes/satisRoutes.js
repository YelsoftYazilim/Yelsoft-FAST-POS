const express = require('express');
const router = express.Router();

// Tüm satışları getir
router.get('/', (req, res) => {
  try {
    const db = global.DB.read();
    // Satışları tarihe göre sırala (en yeni en üstte)
    const satislar = [...db.satislar].sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
    res.json(satislar);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Belirli bir satışı getir
router.get('/:id', (req, res) => {
  try {
    const db = global.DB.read();
    const satis = db.satislar.find(s => s.id === parseInt(req.params.id));
    if (!satis) {
      return res.status(404).json({ mesaj: 'Satış bulunamadı' });
    }
    res.json(satis);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Yeni satış oluştur
router.post('/', (req, res) => {
  try {
    console.log('Satış POST isteği alındı:', JSON.stringify(req.body, null, 2));
    
    // İstek gövdesini doğrula
    if (!req.body) {
      console.error('Geçersiz istek formatı: İstek gövdesi boş.');
      return res.status(400).json({ hata: 'Geçersiz istek formatı. İstek gövdesi boş.' });
    }
    
    // Ürünler dizisini doğrula
    if (!req.body.urunler || !Array.isArray(req.body.urunler) || req.body.urunler.length === 0) {
      console.error('Geçersiz istek formatı: Ürünler dizisi bulunamadı veya boş.');
      return res.status(400).json({ hata: 'Geçersiz istek formatı. Ürünler dizisi bulunamadı veya boş.' });
    }
    
    const db = global.DB.read();
    
    // Fiş numarası oluştur (basit bir şekilde)
    const fisNo = `FIS-${new Date().getTime()}`;
    
    // Satış detaylarını hazırla
    let toplamTutar = 0;
    const satisUrunleri = [];
    
    // Ürünleri işle
    for (const item of req.body.urunler) {
      // Client'dan gelen veri yapısına uygun özellik adlarını kullan
      const urunId = item.urunId; // İstemci "urun" veya "urunId" gönderebilir
      const adet = item.miktar; // İstemci "miktar" veya "adet" gönderebilir
      
      if (!urunId) {
        console.error('Ürün ID bilgisi eksik.');
        return res.status(400).json({ hata: 'Ürün ID bilgisi eksik.' });
      }
      
      if (!adet || isNaN(adet)) {
        console.error('Geçersiz miktar bilgisi:', adet);
        return res.status(400).json({ hata: 'Geçersiz miktar bilgisi.' });
      }
      
      const urun = db.urunler.find(u => u.id === parseInt(urunId) || u.id === urunId);
      if (!urun) {
        console.error(`Ürün bulunamadı. ID: ${urunId}`);
        return res.status(404).json({ mesaj: `Ürün bulunamadı. ID: ${urunId}` });
      }
      
      console.log(`İşlenen ürün: ID=${urunId}, Adı=${urun.ad}, Adet=${adet}`);
      
      // String değerleri sayıya dönüştür
      const birimFiyat = parseFloat(item.birimFiyat || urun.fiyat) || 0;
      const kdvOrani = parseFloat(urun.kdvOrani || 0);
      
      console.log(`Fiyat bilgisi: Birim Fiyat=${birimFiyat}, KDV Oranı=${kdvOrani}`);
      
      // Ürün fiyatı KDV dahil olduğundan, KDV hariç birim fiyatı hesapla
      const birimFiyatHaricKDV = kdvOrani > 0 ? birimFiyat / (1 + (kdvOrani / 100)) : birimFiyat;
      
      // KDV tutarını hesapla
      const birimKdvTutari = kdvOrani > 0 ? birimFiyat - birimFiyatHaricKDV : 0;
      const toplamKdvTutari = birimKdvTutari * adet;
      
      // Toplam tutarı hesapla (KDV dahil)
      const urunTutari = adet * birimFiyat;
      toplamTutar += urunTutari;
      
      // Satış detayına ekle
      satisUrunleri.push({
        urunId: urun.id,
        urunAdi: urun.ad,
        adet: adet,
        birimFiyat: birimFiyat,
        birimFiyatHaricKDV: parseFloat(birimFiyatHaricKDV.toFixed(2)),
        kdvOrani: kdvOrani,
        kdvTutari: parseFloat(toplamKdvTutari.toFixed(2)),
        tutar: parseFloat(urunTutari.toFixed(2))
      });

      
      // Stok güncelle
      const urunIndex = db.urunler.findIndex(u => u.id === urun.id);
      db.urunler[urunIndex].stokMiktari -= adet;
    }
    
    // Toplam KDV ve ara toplam hesaplamaları
    let toplamKdv = 0;
    let araToplam = 0;
    
    satisUrunleri.forEach(urun => {
      toplamKdv += urun.kdvTutari || 0;
      araToplam += (urun.tutar - urun.kdvTutari) || 0;
    });
    
    // Yeni satış oluştur
    const yeniSatis = {
      id: db.satislar.length > 0 ? Math.max(...db.satislar.map(s => s.id)) + 1 : 1,
      fisNo: fisNo || req.body.fisNo,
      tarih: new Date().toISOString(),
      urunler: satisUrunleri,
      araToplam: parseFloat(araToplam.toFixed(2)),
      kdvToplam: parseFloat(toplamKdv.toFixed(2)),
      toplamTutar: parseFloat(toplamTutar.toFixed(2)),
      odemeYontemi: req.body.odemeYontemi || 'Nakit',
      odemeDurumu: req.body.odemeDurumu || 'Ödendi',
      musteri: req.body.musteri,
      createdAt: new Date().toISOString()
    };
    
    console.log('Oluşturulan yeni satış:', JSON.stringify(yeniSatis, null, 2));
    
    // Veritabanına ekle
    db.satislar.push(yeniSatis);
    const yazmaBasarisi = global.DB.write(db);
    
    if (!yazmaBasarisi) {
      console.error('Veritabanı yazma hatası oluştu!');
      return res.status(500).json({ hata: 'Veritabanı yazma hatası' });
    }
    
    res.status(201).json(yeniSatis);
  } catch (err) {
    console.error('Satış kaydı hatası:', err);
    res.status(400).json({ hata: err.message });
  }
});

// Satış iptal et
router.put('/:id/iptal', (req, res) => {
  try {
    const db = global.DB.read();
    const index = db.satislar.findIndex(s => s.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ mesaj: 'Satış bulunamadı' });
    }
    
    const satis = db.satislar[index];
    
    // Satış zaten iptal edildiyse hata döndür
    if (satis.odemeDurumu === 'İptal Edildi') {
      return res.status(400).json({ mesaj: 'Bu satış zaten iptal edilmiş' });
    }
    
    // Stokları geri ekle
    for (const item of satis.urunler) {
      const urunIndex = db.urunler.findIndex(u => u.id === item.urunId);
      if (urunIndex !== -1) {
        db.urunler[urunIndex].stokMiktari += item.adet;
      }
    }
    
    // Satışı iptal et
    db.satislar[index].odemeDurumu = 'İptal Edildi';
    db.satislar[index].updatedAt = new Date().toISOString();
    global.DB.write(db);
    
    res.json({ mesaj: 'Satış başarıyla iptal edildi', satis: db.satislar[index] });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Tarih aralığına göre satış raporu getir
router.get('/rapor/tarih', (req, res) => {
  try {
    const { baslangic, bitis } = req.query;
    
    if (!baslangic || !bitis) {
      return res.status(400).json({ mesaj: 'Başlangıç ve bitiş tarihleri gereklidir' });
    }
    
    const db = global.DB.read();
    const baslangicTarihi = new Date(baslangic);
    const bitisTarihi = new Date(bitis);
    
    // Bitiş tarihini günün sonuna ayarla (23:59:59.999)
    bitisTarihi.setHours(23, 59, 59, 999);
    
    // Tarih aralığındaki satışları filtrele
    const filtrelenmisVeriler = db.satislar.filter(satis => {
      const satisTarihi = new Date(satis.tarih);
      return satisTarihi >= baslangicTarihi && satisTarihi <= bitisTarihi;
    });
    
    // Satışlar için toplam ve özet bilgiler
    const toplamSatis = filtrelenmisVeriler.length;
    const toplamCiro = filtrelenmisVeriler.reduce((toplam, satis) => toplam + satis.toplamTutar, 0);
    const urunBazliSatislar = {};
    
    // Ürün bazlı satış toplamları
    filtrelenmisVeriler.forEach(satis => {
      satis.urunler.forEach(urunDetay => {
        if (!urunBazliSatislar[urunDetay.urunId]) {
          urunBazliSatislar[urunDetay.urunId] = {
            urunId: urunDetay.urunId,
            urunAdi: urunDetay.urunAdi || 'Bilinmeyen Ürün',
            toplamAdet: 0,
            toplamTutar: 0
          };
        }
        
        urunBazliSatislar[urunDetay.urunId].toplamAdet += urunDetay.adet;
        urunBazliSatislar[urunDetay.urunId].toplamTutar += urunDetay.tutar || (urunDetay.adet * urunDetay.birimFiyat);
      });
    });
    
    res.json({
      tarihAraligi: {
        baslangic: baslangicTarihi.toISOString(),
        bitis: bitisTarihi.toISOString()
      },
      rapor: {
        toplamSatisSayisi: filtrelenmisVeriler.length,
        toplamCiro: parseFloat(toplamCiro.toFixed(2)),
        urunBazliSatislar: Object.values(urunBazliSatislar).sort((a, b) => b.toplamTutar - a.toplamTutar)
      },
      satislar: filtrelenmisVeriler
    });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Belirtilen gün sayısı kadar eski satışları temizle
router.delete('/temizle/:gun', (req, res) => {
  try {
    const gunSayisi = parseInt(req.params.gun, 10) || 5;
    
    // Günü doğrula
    if (gunSayisi < 1) {
      return res.status(400).json({ mesaj: 'Geçerli bir gün sayısı giriniz (en az 1)' });
    }
    
    // Daha güvenli import yolu kullanma
    const path = require('path');
    const temizleyiciModul = require(path.join(__dirname, '..', 'utils', 'temizleyici'));
    
    // Temizleme işlemini başlat
    const silinenAdet = temizleyiciModul.eskiSatislariTemizle(gunSayisi);
    
    res.json({ 
      mesaj: `${gunSayisi} günden eski satışlar temizlendi.`, 
      silinenAdet 
    });
  } catch (err) {
    console.error('Satış temizleme hatası:', err);
    res.status(500).json({ mesaj: 'Sunucu hatası', hata: err.message });
  }
});

// Test amaçlı - Tüm satışları temizleme endpoint'i
router.delete('/temizle-hepsi', async (req, res) => {
  try {
    console.log('TÜM SATIŞLAR TEMİZLENİYOR');
    
    // Asenkron dosya işlemleri modülünü kullan
    const dosyaYonetimi = require('../utils/dosya-yonetimi');
    
    // Veritabanını oku
    const db = await dosyaYonetimi.readDB();
    
    // Mevcut satış sayısı
    const eskiSayisi = db.satislar.length;
    console.log(`Mevcut satış sayısı: ${eskiSayisi}`);
    
    // Satışları temizle
    db.satislar = [];
    
    // Veritabanına yaz
    const yazmaBasarili = await dosyaYonetimi.writeDB(db);
    console.log(`Veritabanı yazma sonucu: ${yazmaBasarili ? 'BAŞARILI' : 'BAŞARISIZ'}`);
    
    if (!yazmaBasarili) {
      return res.status(500).json({ mesaj: 'Veritabanı yazma hatası' });
    }
    
    res.json({ 
      mesaj: 'Tüm satışlar başarıyla temizlendi', 
      silinenAdet: eskiSayisi 
    });
  } catch (err) {
    console.error('Tüm satışları temizleme hatası:', err);
    res.status(500).json({ mesaj: 'Sunucu hatası', hata: err.message });
  }
});

module.exports = router;