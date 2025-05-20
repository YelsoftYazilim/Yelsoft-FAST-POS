const express = require('express');
const router = express.Router();

// Tüm kategorileri getir
router.get('/', (req, res) => {
  try {
    const db = global.DB.read();
    res.json(db.kategoriler || []);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Belirli bir kategoriyi getir
router.get('/:id', (req, res) => {
  try {
    const db = global.DB.read();
    const kategori = db.kategoriler.find(k => k.id === parseInt(req.params.id));
    if (!kategori) {
      return res.status(404).json({ mesaj: 'Kategori bulunamadı' });
    }
    res.json(kategori);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Yeni kategori ekle
router.post('/', (req, res) => {
  try {
    const db = global.DB.read();
    
    // Benzersiz ID oluştur
    const yeniId = db.kategoriler.length > 0 
      ? Math.max(...db.kategoriler.map(k => k.id)) + 1 
      : 1;
    
    const yeniKategori = {
      id: yeniId,
      ad: req.body.ad,
      aciklama: req.body.aciklama || '',
      olusturmaTarihi: new Date().toISOString(),
      guncellenmeTarihi: new Date().toISOString()
    };
    
    db.kategoriler.push(yeniKategori);
    global.DB.write(db);
    
    res.status(201).json(yeniKategori);
  } catch (err) {
    res.status(400).json({ hata: err.message });
  }
});

// Kategori güncelle
router.put('/:id', (req, res) => {
  try {
    const db = global.DB.read();
    const index = db.kategoriler.findIndex(k => k.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ mesaj: 'Kategori bulunamadı' });
    }
    
    const guncelKategori = {
      ...db.kategoriler[index],
      ad: req.body.ad || db.kategoriler[index].ad,
      aciklama: req.body.aciklama || db.kategoriler[index].aciklama,
      guncellenmeTarihi: new Date().toISOString()
    };
    
    db.kategoriler[index] = guncelKategori;
    global.DB.write(db);
    
    res.json(guncelKategori);
  } catch (err) {
    res.status(400).json({ hata: err.message });
  }
});

// Kategori sil
router.delete('/:id', (req, res) => {
  try {
    const db = global.DB.read();
    const index = db.kategoriler.findIndex(k => k.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ mesaj: 'Kategori bulunamadı' });
    }
    
    // Bu kategoriye ait alt kategorileri kontrol et
    const altKategoriler = db.altKategoriler.filter(ak => ak.kategoriId === parseInt(req.params.id));
    if (altKategoriler.length > 0) {
      return res.status(400).json({ 
        mesaj: 'Bu kategoriye ait alt kategoriler bulunmaktadır. Önce alt kategorileri silmelisiniz.' 
      });
    }
    
    db.kategoriler.splice(index, 1);
    global.DB.write(db);
    
    res.json({ mesaj: 'Kategori başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// ALT KATEGORİ ROTALARI

// Bir kategoriye ait tüm alt kategorileri getir
router.get('/:kategoriId/alt-kategoriler', (req, res) => {
  try {
    const db = global.DB.read();
    const altKategoriler = db.altKategoriler.filter(ak => ak.kategoriId === parseInt(req.params.kategoriId));
    res.json(altKategoriler);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Tüm alt kategorileri getir
router.get('/alt-kategori/tumu', (req, res) => {
  try {
    const db = global.DB.read();
    res.json(db.altKategoriler || []);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Belirli bir alt kategoriyi getir
router.get('/alt-kategori/:id', (req, res) => {
  try {
    const db = global.DB.read();
    const altKategori = db.altKategoriler.find(ak => ak.id === parseInt(req.params.id));
    if (!altKategori) {
      return res.status(404).json({ mesaj: 'Alt kategori bulunamadı' });
    }
    
    // Ana kategori bilgisini de ekle
    const kategori = db.kategoriler.find(k => k.id === altKategori.kategoriId);
    const sonuc = {
      ...altKategori,
      kategori: kategori || { id: altKategori.kategoriId, ad: 'Bilinmeyen Kategori' }
    };
    
    res.json(sonuc);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Yeni alt kategori ekle
router.post('/alt-kategori', (req, res) => {
  try {
    const db = global.DB.read();
    
    // Kategori varlığını kontrol et
    const kategori = db.kategoriler.find(k => k.id === parseInt(req.body.kategoriId));
    if (!kategori) {
      return res.status(404).json({ mesaj: 'Belirtilen kategori bulunamadı' });
    }
    
    // Benzersiz ID oluştur
    const yeniId = db.altKategoriler.length > 0 
      ? Math.max(...db.altKategoriler.map(ak => ak.id)) + 1 
      : 1;
    
    const yeniAltKategori = {
      id: yeniId,
      ad: req.body.ad,
      kategoriId: parseInt(req.body.kategoriId),
      aciklama: req.body.aciklama || '',
      olusturmaTarihi: new Date().toISOString(),
      guncellenmeTarihi: new Date().toISOString()
    };
    
    db.altKategoriler.push(yeniAltKategori);
    global.DB.write(db);
    
    res.status(201).json(yeniAltKategori);
  } catch (err) {
    res.status(400).json({ hata: err.message });
  }
});

// Alt kategori güncelle
router.put('/alt-kategori/:id', (req, res) => {
  try {
    const db = global.DB.read();
    const index = db.altKategoriler.findIndex(ak => ak.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ mesaj: 'Alt kategori bulunamadı' });
    }
    
    // Kategori değiştirilmişse varlığını kontrol et
    if (req.body.kategoriId) {
      const kategori = db.kategoriler.find(k => k.id === parseInt(req.body.kategoriId));
      if (!kategori) {
        return res.status(404).json({ mesaj: 'Belirtilen kategori bulunamadı' });
      }
    }
    
    const guncelAltKategori = {
      ...db.altKategoriler[index],
      ad: req.body.ad || db.altKategoriler[index].ad,
      kategoriId: req.body.kategoriId ? parseInt(req.body.kategoriId) : db.altKategoriler[index].kategoriId,
      aciklama: req.body.aciklama || db.altKategoriler[index].aciklama,
      guncellenmeTarihi: new Date().toISOString()
    };
    
    db.altKategoriler[index] = guncelAltKategori;
    global.DB.write(db);
    
    res.json(guncelAltKategori);
  } catch (err) {
    res.status(400).json({ hata: err.message });
  }
});

// Alt kategori sil
router.delete('/alt-kategori/:id', (req, res) => {
  try {
    const db = global.DB.read();
    const index = db.altKategoriler.findIndex(ak => ak.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ mesaj: 'Alt kategori bulunamadı' });
    }
    
    db.altKategoriler.splice(index, 1);
    global.DB.write(db);
    
    res.json({ mesaj: 'Alt kategori başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

module.exports = router; 