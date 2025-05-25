const express = require('express');
const router = express.Router();
const AltGrup = require('../models/AltGrup');

// Tüm alt grupları getir
router.get('/', async (req, res) => {
  try {
    const altGruplar = await AltGrup.find().populate('anaGrupId').sort({ ad: 1 });
    res.json(altGruplar);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Ana gruba göre alt grupları getir
router.get('/ana-grup/:anaGrupId', async (req, res) => {
  try {
    const altGruplar = await AltGrup.find({ anaGrupId: req.params.anaGrupId }).sort({ ad: 1 });
    res.json(altGruplar);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Yeni alt grup ekle
router.post('/', async (req, res) => {
  try {
    const yeniAltGrup = new AltGrup(req.body);
    const kaydedilenAltGrup = await yeniAltGrup.save();
    res.status(201).json(kaydedilenAltGrup);
  } catch (err) {
    res.status(400).json({ hata: err.message });
  }
});

// Alt grup güncelle
router.put('/:id', async (req, res) => {
  try {
    const guncellenenAltGrup = await AltGrup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!guncellenenAltGrup) {
      return res.status(404).json({ hata: 'Alt grup bulunamadı' });
    }
    res.json(guncellenenAltGrup);
  } catch (err) {
    res.status(400).json({ hata: err.message });
  }
});

// Alt grup sil
router.delete('/:id', async (req, res) => {
  try {
    const silinenAltGrup = await AltGrup.findByIdAndDelete(req.params.id);
    if (!silinenAltGrup) {
      return res.status(404).json({ hata: 'Alt grup bulunamadı' });
    }
    res.json({ mesaj: 'Alt grup başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

module.exports = router;