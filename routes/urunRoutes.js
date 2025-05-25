const express = require('express');
const router = express.Router();

// Tüm ürünleri getir
router.get('/', (req, res) => {
  try {
    const db = global.DB.read();
    
    // Kategori ve alt kategori bilgilerini ekle
    const urunler = db.urunler.map(urun => {
      const kategori = urun.kategoriId ? db.kategoriler.find(k => k.id === urun.kategoriId) : null;
      const altKategori = urun.altKategoriId ? db.altKategoriler.find(ak => ak.id === urun.altKategoriId) : null;
      
      return {
        ...urun,
        kategoriAdi: kategori ? kategori.ad : '',
        altKategoriAdi: altKategori ? altKategori.ad : ''
      };
    });
    
    res.json(urunler);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Barkod ile ürün ara
router.get('/barkod/:barkod', (req, res) => {
  try {
    const db = global.DB.read();
    const urun = db.urunler.find(u => u.barkod === req.params.barkod);
    if (!urun) {
      return res.status(404).json({ mesaj: 'Ürün bulunamadı' });
    }
    
    // Kategori ve alt kategori bilgilerini ekle
    const kategori = urun.kategoriId ? db.kategoriler.find(k => k.id === urun.kategoriId) : null;
    const altKategori = urun.altKategoriId ? db.altKategoriler.find(ak => ak.id === urun.altKategoriId) : null;
    
    const sonuc = {
      ...urun,
      kategoriAdi: kategori ? kategori.ad : '',
      altKategoriAdi: altKategori ? altKategori.ad : ''
    };
    
    res.json(sonuc);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// ID ile ürün getir
router.get('/:id', (req, res) => {
  try {
    const db = global.DB.read();
    const urun = db.urunler.find(u => u.id === parseInt(req.params.id));
    if (!urun) {
      return res.status(404).json({ mesaj: 'Ürün bulunamadı' });
    }
    
    // Kategori ve alt kategori bilgilerini ekle
    const kategori = urun.kategoriId ? db.kategoriler.find(k => k.id === urun.kategoriId) : null;
    const altKategori = urun.altKategoriId ? db.altKategoriler.find(ak => ak.id === urun.altKategoriId) : null;
    
    const sonuc = {
      ...urun,
      kategoriAdi: kategori ? kategori.ad : '',
      altKategoriAdi: altKategori ? altKategori.ad : ''
    };
    
    res.json(sonuc);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});


// Yeni ürün ekle
router.post('/', (req, res) => {
  try {
    const db = global.DB.read();
    
    // Kategori ve alt kategori kontrolü
    if (req.body.kategoriId) {
      const kategori = db.kategoriler.find(k => k.id === parseInt(req.body.kategoriId));
      if (!kategori) {
        return res.status(404).json({ mesaj: 'Belirtilen kategori bulunamadı' });
      }
    }
    
    if (req.body.altKategoriId) {
      const altKategori = db.altKategoriler.find(ak => ak.id === parseInt(req.body.altKategoriId));
      if (!altKategori) {
        return res.status(404).json({ mesaj: 'Belirtilen alt kategori bulunamadı' });
      }
      
      // Alt kategorinin seçilen kategoriye ait olup olmadığını kontrol et
      if (req.body.kategoriId && altKategori.kategoriId !== parseInt(req.body.kategoriId)) {
        return res.status(400).json({ 
          mesaj: 'Seçilen alt kategori, seçilen kategoriye ait değil' 
        });
      }
    }
    
    const yeniUrun = {
      id: db.urunler.length > 0 ? Math.max(...db.urunler.map(u => u.id)) + 1 : 1,
      ...req.body,
      kategoriId: req.body.kategoriId ? parseInt(req.body.kategoriId) : null,
      altKategoriId: req.body.altKategoriId ? parseInt(req.body.altKategoriId) : null,
      createdAt: new Date().toISOString()
    };
    
    db.urunler.push(yeniUrun);
    global.DB.write(db);
    
    res.status(201).json(yeniUrun);
  } catch (err) {
    res.status(400).json({ hata: err.message });
  }
});

// Ürün güncelle
router.put('/:id', (req, res) => {
  try {
    const db = global.DB.read();
    const index = db.urunler.findIndex(u => u.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ mesaj: 'Ürün bulunamadı' });
    }
    
    // Kategori ve alt kategori kontrolü
    if (req.body.kategoriId) {
      const kategori = db.kategoriler.find(k => k.id === parseInt(req.body.kategoriId));
      if (!kategori) {
        return res.status(404).json({ mesaj: 'Belirtilen kategori bulunamadı' });
      }
    }
    
    if (req.body.altKategoriId) {
      const altKategori = db.altKategoriler.find(ak => ak.id === parseInt(req.body.altKategoriId));
      if (!altKategori) {
        return res.status(404).json({ mesaj: 'Belirtilen alt kategori bulunamadı' });
      }
      
      // Alt kategorinin seçilen kategoriye ait olup olmadığını kontrol et
      const kategoriId = req.body.kategoriId ? parseInt(req.body.kategoriId) : db.urunler[index].kategoriId;
      if (kategoriId && altKategori.kategoriId !== kategoriId) {
        return res.status(400).json({ 
          mesaj: 'Seçilen alt kategori, seçilen kategoriye ait değil' 
        });
      }
    }
    
    const guncelUrun = {
      ...db.urunler[index],
      ...req.body,
      kategoriId: req.body.kategoriId ? parseInt(req.body.kategoriId) : db.urunler[index].kategoriId,
      altKategoriId: req.body.altKategoriId ? parseInt(req.body.altKategoriId) : db.urunler[index].altKategoriId,
      updatedAt: new Date().toISOString()
    };
    
    db.urunler[index] = guncelUrun;
    global.DB.write(db);
    
    res.json(guncelUrun);
  } catch (err) {
    res.status(400).json({ hata: err.message });
  }
});


// Ürün ara
router.get('/ara', (req, res) => {
  try {
    const { q } = req.query;
    
    const db = global.DB.read();
    
    let urunler;
    
    if (!q || q.trim() === '') {
      // Eğer arama terimi yoksa tüm ürünleri döndür
      urunler = db.urunler;
    } else {
      const arananTerim = q.toLowerCase();
      
      // Barkod, ad veya kategoriye göre ara
      urunler = db.urunler.filter(urun => {
        const adUyusuyor = urun.ad && urun.ad.toLowerCase().includes(arananTerim);
        const barkodUyusuyor = urun.barkod && urun.barkod.toLowerCase().includes(arananTerim);
        
        // Kategori adını bul
        const kategori = urun.kategoriId ? db.kategoriler.find(k => k.id === urun.kategoriId) : null;
        const kategoriUyusuyor = kategori && kategori.ad.toLowerCase().includes(arananTerim);
        
        // Alt kategori adını bul
        const altKategori = urun.altKategoriId ? db.altKategoriler.find(ak => ak.id === urun.altKategoriId) : null;
        const altKategoriUyusuyor = altKategori && altKategori.ad.toLowerCase().includes(arananTerim);
        
        return adUyusuyor || barkodUyusuyor || kategoriUyusuyor || altKategoriUyusuyor;
      });
    }
    
    // Kategori ve alt kategori bilgilerini ekle
    const urunlerDetayli = urunler.map(urun => {
      const kategori = urun.kategoriId ? db.kategoriler.find(k => k.id === urun.kategoriId) : null;
      const altKategori = urun.altKategoriId ? db.altKategoriler.find(ak => ak.id === urun.altKategoriId) : null;
      
      return {
        ...urun,
        kategoriAdi: kategori ? kategori.ad : '',
        altKategoriAdi: altKategori ? altKategori.ad : ''
      };
    });
    
    res.json(urunlerDetayli);
  } catch (err) {
    console.error('Arama hatası:', err);
    res.status(500).json({ hata: err.message });
  }
});

// Ürün sil
router.delete('/:id', (req, res) => {
  try {
    const db = global.DB.read();
    const index = db.urunler.findIndex(u => u.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ mesaj: 'Ürün bulunamadı' });
    }
    
    db.urunler.splice(index, 1);
    global.DB.write(db);
    
    res.json({ mesaj: 'Ürün başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Kategoriye göre ürün filtreleme
router.get('/kategori/:kategoriId', (req, res) => {
  try {
    const db = global.DB.read();
    const kategoriId = parseInt(req.params.kategoriId);
    
    const urunler = db.urunler.filter(urun => urun.kategoriId === kategoriId);
    
    // Kategori ve alt kategori bilgilerini ekle
    const urunlerDetayli = urunler.map(urun => {
      const kategori = db.kategoriler.find(k => k.id === urun.kategoriId);
      const altKategori = urun.altKategoriId ? db.altKategoriler.find(ak => ak.id === urun.altKategoriId) : null;
      
      return {
        ...urun,
        kategoriAdi: kategori ? kategori.ad : '',
        altKategoriAdi: altKategori ? altKategori.ad : ''
      };
    });
    
    res.json(urunlerDetayli);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Alt kategoriye göre ürün filtreleme
router.get('/alt-kategori/:altKategoriId', (req, res) => {
  try {
    const db = global.DB.read();
    const altKategoriId = parseInt(req.params.altKategoriId);
    
    const urunler = db.urunler.filter(urun => urun.altKategoriId === altKategoriId);
    
    // Kategori ve alt kategori bilgilerini ekle
    const urunlerDetayli = urunler.map(urun => {
      const kategori = urun.kategoriId ? db.kategoriler.find(k => k.id === urun.kategoriId) : null;
      const altKategori = db.altKategoriler.find(ak => ak.id === urun.altKategoriId);
      
      return {
        ...urun,
        kategoriAdi: kategori ? kategori.ad : '',
        altKategoriAdi: altKategori ? altKategori.ad : ''
      };
    });
    
    res.json(urunlerDetayli);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Toplu fiyat güncelleme (kategori ve/veya alt kategoriye göre)
router.post('/fiyat-guncelle', (req, res) => {
  try {
    console.log('-------------------------------------------------------------');
    console.log('Fiyat güncelleme isteği alındı. Ham veri:', JSON.stringify(req.body));
    
    // Gelen parametreleri kontrol et
    const kategoriId = req.body.kategoriId ? parseInt(req.body.kategoriId) : null;
    const altKategoriId = req.body.altKategoriId && req.body.altKategoriId !== "0" ? parseInt(req.body.altKategoriId) : null;
    const guncellemeTipi = req.body.guncellemeTipi || 'yuzde';
    const yuzdeDegisim = req.body.yuzdeDegisim !== undefined ? parseFloat(req.body.yuzdeDegisim) : null;
    const tutarDegisim = req.body.tutarDegisim !== undefined ? parseFloat(req.body.tutarDegisim) : null;
    
    console.log(`İşlenmiş parametreler: kategoriId=${kategoriId} (${typeof kategoriId}), altKategoriId=${altKategoriId} (${typeof altKategoriId}), guncellemeTipi=${guncellemeTipi}, yuzdeDegisim=${yuzdeDegisim}, tutarDegisim=${tutarDegisim}`);
    
    // Validasyonlar
    if (!kategoriId) {
      return res.status(400).json({ hata: 'Kategori ID zorunludur' });
    }
    
    // Güncelleme tipine göre doğru validasyon yap
    if (guncellemeTipi === 'yuzde') {
      if (yuzdeDegisim === null || isNaN(yuzdeDegisim)) {
        return res.status(400).json({ hata: 'Geçerli bir yüzde değişim oranı zorunludur' });
      }
    } else if (guncellemeTipi === 'tutar') {
      if (tutarDegisim === null || isNaN(tutarDegisim)) {
        return res.status(400).json({ hata: 'Geçerli bir tutar değişim değeri zorunludur' });
      }
    } else {
      return res.status(400).json({ hata: 'Geçerli bir güncelleme tipi belirtin: yuzde veya tutar' });
    }
    
    // Veritabanını oku
    const db = global.DB.read();
    if (!db || !db.urunler || !Array.isArray(db.urunler)) {
      console.error('DB içeriği:', JSON.stringify(db));
      return res.status(500).json({ hata: 'Veritabanı okunamadı veya geçerli değil' });
    }
    
    // Veritabanında kaç ürün var?
    console.log(`Toplam ürün sayısı: ${db.urunler.length}`);
    
    // İlk 5 ürünü tiplerle birlikte göster
    console.log('Ürün örnekleri (ilk 5):');
    db.urunler.slice(0, 5).forEach(urun => {
      console.log(`ID=${urun.id}, Ad=${urun.ad}, KategoriID=${urun.kategoriId} (${typeof urun.kategoriId}), AltKategoriID=${urun.altKategoriId} (${typeof urun.altKategoriId}), Fiyat=${urun.fiyat} (${typeof urun.fiyat})`);
    });
    
    let etkilenenUrunSayisi = 0;
    
    // Kategori kontrolü
    const kategoriVarMi = db.kategoriler.find(k => k.id === kategoriId);
    if (!kategoriVarMi) {
      return res.status(404).json({ hata: `Belirtilen kategori bulunamadı (ID: ${kategoriId})` });
    }
    
    // Alt kategori kontrolü (eğer belirtilmişse)
    if (altKategoriId) {
      const altKategoriVarMi = db.altKategoriler.find(ak => ak.id === altKategoriId);
      if (!altKategoriVarMi) {
        return res.status(404).json({ hata: `Belirtilen alt kategori bulunamadı (ID: ${altKategoriId})` });
      }
      
      // Alt kategorinin seçilen kategoriye ait olup olmadığını kontrol et
      if (altKategoriVarMi.kategoriId !== kategoriId) {
        return res.status(400).json({ 
          hata: `Seçilen alt kategori (${altKategoriId}), seçilen kategoriye (${kategoriId}) ait değil` 
        });
      }
    }
    
    // Güncelleme faktörü (yüzde için) veya tutarı
    const carpan = guncellemeTipi === 'yuzde' ? (1 + (yuzdeDegisim / 100)) : null;
    
    // Ürünlerin değişmeden önceki kopyasını al
    const yeniUrunler = [...db.urunler];
    
    // Ürünleri güncelle
    for (let i = 0; i < yeniUrunler.length; i++) {
      const urun = yeniUrunler[i];
      
      // Kategori ve alt kategori ID'lerini sayı tipine dönüştürüp karşılaştırma yap
      const urunKategoriId = urun.kategoriId !== null && urun.kategoriId !== undefined ? parseInt(urun.kategoriId) : null;
      const urunAltKategoriId = urun.altKategoriId !== null && urun.altKategoriId !== undefined ? parseInt(urun.altKategoriId) : null;
      
      // Kategori uyuşuyorsa ve alt kategori belirtilmişse alt kategori de uyuşmalı
      const kategoriUyusuyorMu = urunKategoriId === kategoriId;
      
      // Alt kategori karşılaştırma mantığı:
      // 1. Eğer altKategoriId null ise, tüm ürünlere uygula
      // 2. Eğer altKategoriId belirtilmişse, sadece o alt kategorideki ürünlere uygula
      let altKategoriUyusuyorMu = false;
      if (!altKategoriId) {
        altKategoriUyusuyorMu = true; // Alt kategori seçilmediyse tüm kategorideki ürünler
      } else {
        altKategoriUyusuyorMu = urunAltKategoriId === altKategoriId; // Belirli alt kategori seçildiyse sadece o ürünler
      }
      
      console.log(`Ürün kontrol: ID=${urun.id}, Ad=${urun.ad}, KategoriID=${urunKategoriId} (${typeof urunKategoriId}), AltKategoriID=${urunAltKategoriId} (${typeof urunAltKategoriId})`);
      console.log(`Aranan: KategoriID=${kategoriId} (${typeof kategoriId}), AltKategoriID=${altKategoriId} (${typeof altKategoriId})`);
      console.log(`Eşleşme: Kategori=${kategoriUyusuyorMu}, AltKategori=${altKategoriUyusuyorMu}, Toplam=${kategoriUyusuyorMu && altKategoriUyusuyorMu}`);
      
      if (kategoriUyusuyorMu && altKategoriUyusuyorMu) {
        // Fiyat kontrolü
        let fiyat = urun.fiyat;
        
        // Fiyat string ise number'a çevir
        if (typeof fiyat === 'string') {
          fiyat = parseFloat(fiyat);
        }
        
        if (isNaN(fiyat)) {
          console.warn(`Ürün ID ${urun.id}: Geçersiz fiyat değeri (${urun.fiyat}), güncelleme atlanıyor`);
          continue;
        }
        
        // Fiyatı güncelleme tipi ve değerine göre hesapla
        let yeniFiyat;
        if (guncellemeTipi === 'yuzde') {
          yeniFiyat = parseFloat((fiyat * carpan).toFixed(2)); // 2 ondalık basamak
        } else {
          yeniFiyat = parseFloat((fiyat + tutarDegisim).toFixed(2));
          // Fiyat negatif olmamalı 
          if (yeniFiyat < 0) yeniFiyat = 0;
        }
        
        // Ürünü güncelle
        yeniUrunler[i] = {
          ...urun,
          fiyat: yeniFiyat,
          updatedAt: new Date().toISOString()
        };
        
        etkilenenUrunSayisi++;
        console.log(`Ürün güncellendi: ID=${urun.id}, Ad=${urun.ad}, Eski Fiyat=${fiyat}, Yeni Fiyat=${yeniFiyat}`);
      }
    }
    
    // Değişiklikleri kaydet
    const yeniDB = {
      ...db,
      urunler: yeniUrunler
    };
    
    const yazmaBasarili = global.DB.write(yeniDB);
    
    if (!yazmaBasarili) {
      return res.status(500).json({ hata: 'Veritabanına yazma sırasında bir hata oluştu' });
    }
    
    console.log(`Fiyat güncelleme başarılı: ${etkilenenUrunSayisi} ürün güncellendi`);
    
    res.json({
      mesaj: 'Fiyatlar başarıyla güncellendi',
      etkilenenUrunSayisi,
      guncellemeTipi,
      ...(guncellemeTipi === 'yuzde' ? {yuzdeDegisim} : {tutarDegisim})
    });
  } catch (err) {
    console.error('Fiyat güncellerken kritik hata:', err);
    console.error('Hata detayları:', JSON.stringify({
      message: err.message,
      stack: err.stack,
      requestBody: req.body
    }, null, 2));
    res.status(500).json({ hata: `Fiyat güncelleme işlemi sırasında bir hata oluştu: ${err.message}` });
  }
});

// Ürün adına göre toplu fiyat güncelleme
router.post('/fiyat-guncelle-urun-adi', (req, res) => {
  try {
    console.log('-------------------------------------------------------------');
    console.log('Ürün adına göre fiyat güncelleme isteği alındı. Ham veri:', JSON.stringify(req.body));
    
    // Gelen parametreleri kontrol et
    const urunAdi = req.body.urunAdi ? req.body.urunAdi.trim() : null;
    const guncellemeTipi = req.body.guncellemeTipi || 'yuzde';
    const yuzdeDegisim = req.body.yuzdeDegisim !== undefined ? parseFloat(req.body.yuzdeDegisim) : null;
    const tutarDegisim = req.body.tutarDegisim !== undefined ? parseFloat(req.body.tutarDegisim) : null;
    
    console.log(`İşlenmiş parametreler: urunAdi=${urunAdi}, guncellemeTipi=${guncellemeTipi}, yuzdeDegisim=${yuzdeDegisim}, tutarDegisim=${tutarDegisim}`);
    
    // Validasyonlar
    if (!urunAdi) {
      return res.status(400).json({ hata: 'Ürün adı zorunludur' });
    }
    
    // Güncelleme tipine göre doğru validasyon yap
    if (guncellemeTipi === 'yuzde') {
      if (yuzdeDegisim === null || isNaN(yuzdeDegisim)) {
        return res.status(400).json({ hata: 'Geçerli bir yüzde değişim oranı zorunludur' });
      }
    } else if (guncellemeTipi === 'tutar') {
      if (tutarDegisim === null || isNaN(tutarDegisim)) {
        return res.status(400).json({ hata: 'Geçerli bir tutar değişim değeri zorunludur' });
      }
    } else {
      return res.status(400).json({ hata: 'Geçerli bir güncelleme tipi belirtin: yuzde veya tutar' });
    }
    
    // Veritabanını oku
    const db = global.DB.read();
    if (!db || !db.urunler || !Array.isArray(db.urunler)) {
      console.error('DB içeriği:', JSON.stringify(db));
      return res.status(500).json({ hata: 'Veritabanı okunamadı veya geçerli değil' });
    }
    
    // Veritabanında kaç ürün var?
    console.log(`Toplam ürün sayısı: ${db.urunler.length}`);
    
    let etkilenenUrunSayisi = 0;
    
    // Güncelleme faktörü (yüzde için) veya tutarı
    const carpan = guncellemeTipi === 'yuzde' ? (1 + (yuzdeDegisim / 100)) : null;
    
    // Ürünlerin değişmeden önceki kopyasını al
    const yeniUrunler = [...db.urunler];
    
    // Ürünleri güncelle
    for (let i = 0; i < yeniUrunler.length; i++) {
      const urun = yeniUrunler[i];
      
      // Ürün adı içinde aranan metin geçiyorsa güncelle (büyük/küçük harf duyarsız)
      if (urun.ad && urun.ad.toLowerCase().includes(urunAdi.toLowerCase())) {
        // Fiyat kontrolü
        let fiyat = urun.fiyat;
        
        // Fiyat string ise number'a çevir
        if (typeof fiyat === 'string') {
          fiyat = parseFloat(fiyat);
        }
        
        if (isNaN(fiyat)) {
          console.warn(`Ürün ID ${urun.id}: Geçersiz fiyat değeri (${urun.fiyat}), güncelleme atlanıyor`);
          continue;
        }
        
        // Fiyatı güncelleme tipi ve değerine göre hesapla
        let yeniFiyat;
        if (guncellemeTipi === 'yuzde') {
          yeniFiyat = parseFloat((fiyat * carpan).toFixed(2)); // 2 ondalık basamak
        } else {
          yeniFiyat = parseFloat((fiyat + tutarDegisim).toFixed(2));
          // Fiyat negatif olmamalı 
          if (yeniFiyat < 0) yeniFiyat = 0;
        }
        
        // Ürünü güncelle
        yeniUrunler[i] = {
          ...urun,
          fiyat: yeniFiyat,
          updatedAt: new Date().toISOString()
        };
        
        etkilenenUrunSayisi++;
        console.log(`Ürün güncellendi: ID=${urun.id}, Ad=${urun.ad}, Eski Fiyat=${fiyat}, Yeni Fiyat=${yeniFiyat}`);
      }
    }
    
    // Değişiklikleri kaydet
    const yeniDB = {
      ...db,
      urunler: yeniUrunler
    };
    
    const yazmaBasarili = global.DB.write(yeniDB);
    
    if (!yazmaBasarili) {
      return res.status(500).json({ hata: 'Veritabanına yazma sırasında bir hata oluştu' });
    }
    
    console.log(`İsme göre fiyat güncelleme başarılı: ${etkilenenUrunSayisi} ürün güncellendi`);
    
    res.json({
      mesaj: 'İsme göre fiyatlar başarıyla güncellendi',
      etkilenenUrunSayisi,
      guncellemeTipi,
      ...(guncellemeTipi === 'yuzde' ? {yuzdeDegisim} : {tutarDegisim})
    });
  } catch (err) {
    console.error('İsme göre fiyat güncellerken kritik hata:', err);
    console.error('Hata detayları:', JSON.stringify({
      message: err.message,
      stack: err.stack,
      requestBody: req.body
    }, null, 2));
    res.status(500).json({ hata: `İsme göre fiyat güncelleme işlemi sırasında bir hata oluştu: ${err.message}` });
  }
});

// Tüm ürünlerin stok miktarını sıfırla
router.post('/stok-sifirla', (req, res) => {
  try {
    const db = global.DB.read();
    db.urunler = db.urunler.map(urun => ({
      ...urun,
      stokMiktari: 0
    }));
    global.DB.write(db);
    res.json({ mesaj: 'Tüm ürünlerin stok miktarı sıfırlandı.' });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

module.exports = router;