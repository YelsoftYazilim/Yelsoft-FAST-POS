const express = require('express');
const router = express.Router();

// Model
let odemeTipleri = [
  { id: 1, ad: 'Nakit', aciklama: 'Nakit ödeme', aktif: true },
  { id: 2, ad: 'Kredi Kartı', aciklama: 'Kredi kartı ile ödeme', aktif: true },
  { id: 3, ad: 'Havale/EFT', aciklama: 'Banka havalesi ile ödeme', aktif: true }
];

// Tüm ödeme tiplerini getir
router.get('/', (req, res) => {
  res.json(odemeTipleri);
});

// ID'ye göre ödeme tipi getir
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const odemeTipi = odemeTipleri.find(tip => tip.id === id);
  
  if (!odemeTipi) {
    return res.status(404).json({ hata: 'Ödeme tipi bulunamadı' });
  }
  
  res.json(odemeTipi);
});

// Yeni ödeme tipi ekle
router.post('/', (req, res) => {
  const { ad, aciklama, aktif } = req.body;
  
  if (!ad) {
    return res.status(400).json({ hata: 'Ödeme tipi adı zorunludur' });
  }
  
  // Yeni ID oluştur
  const yeniId = Math.max(...odemeTipleri.map(tip => tip.id), 0) + 1;
  
  const yeniOdemeTipi = {
    id: yeniId,
    ad,
    aciklama: aciklama || '',
    aktif: aktif !== undefined ? aktif : true
  };
  
  odemeTipleri.push(yeniOdemeTipi);
  res.status(201).json(yeniOdemeTipi);
});

// Ödeme tipi güncelle
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { ad, aciklama, aktif } = req.body;
  
  const index = odemeTipleri.findIndex(tip => tip.id === id);
  
  if (index === -1) {
    return res.status(404).json({ hata: 'Ödeme tipi bulunamadı' });
  }
  
  // Güncellenecek alanları kontrol et
  if (!ad) {
    return res.status(400).json({ hata: 'Ödeme tipi adı zorunludur' });
  }
  
  // Mevcut ödeme tipini güncelle
  odemeTipleri[index] = {
    id,
    ad,
    aciklama: aciklama !== undefined ? aciklama : odemeTipleri[index].aciklama,
    aktif: aktif !== undefined ? aktif : odemeTipleri[index].aktif
  };
  
  res.json(odemeTipleri[index]);
});

// Ödeme tipi sil
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  const index = odemeTipleri.findIndex(tip => tip.id === id);
  
  if (index === -1) {
    return res.status(404).json({ hata: 'Ödeme tipi bulunamadı' });
  }
  
  // Silinen ödeme tipini kaydet
  const silinenOdemeTipi = odemeTipleri[index];
  
  // Ödeme tipini listeden kaldır
  odemeTipleri = odemeTipleri.filter(tip => tip.id !== id);
  
  res.json(silinenOdemeTipi);
});

module.exports = router;