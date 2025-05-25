const express = require('express');
const router = express.Router();
const AnaGrup = require('../models/AnaGrup');

// Tüm ana grupları getir
router.get('/', async (req, res) => {
  try {
    const anaGruplar = await AnaGrup.find().sort({ ad: 1 });
    res.json(anaGruplar);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Yeni ana grup ekle
router.post('/', async (req, res) => {
  try {
    const yeniAnaGrup = new AnaGrup(req.body);
    const kaydedilenAnaGrup = await yeniAnaGrup.save();
    res.status(201).json(kaydedilenAnaGrup);
  } catch (err) {
    res.status(400).json({ hata: err.message });
  }
});

// Ana grup güncelle
router.put('/:id', async (req, res) => {
  try {
    const guncellenenAnaGrup = await AnaGrup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!guncellenenAnaGrup) {
      return res.status(404).json({ hata: 'Ana grup bulunamadı' });
    }
    res.json(guncellenenAnaGrup);
  } catch (err) {
    res.status(400).json({ hata: err.message });
  }
});

// Ana grup sil
router.delete('/:id', async (req, res) => {
  try {
    const silinenAnaGrup = await AnaGrup.findByIdAndDelete(req.params.id);
    if (!silinenAnaGrup) {
      return res.status(404).json({ hata: 'Ana grup bulunamadı' });
    }
    res.json({ mesaj: 'Ana grup başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

module.exports = router;