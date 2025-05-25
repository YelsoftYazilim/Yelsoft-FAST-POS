const Satis = require('../models/satisModel');

exports.createSatis = async (req, res) => {
  try {
    // Gelen veriyi kontrol et
    const { fisNo, urunler, toplamTutar, odemeYontemi } = req.body;
    
    if (!fisNo || !urunler || !urunler.length || !toplamTutar || !odemeYontemi) {
      return res.status(400).json({ 
        hata: 'Eksik bilgi. fisNo, urunler, toplamTutar ve odemeYontemi zorunludur.' 
      });
    }
    
    // Yeni satış oluştur
    const yeniSatis = new Satis({
      ...req.body,
      satisZamani: new Date()
    });

    const kaydedilmisSatis = await yeniSatis.save();
    res.status(201).json(kaydedilmisSatis);
  } catch (error) {
    console.error('Satış kaydetme hatası:', error);
    res.status(400).json({ hata: `Satış kaydetme hatası: ${error.message}` });
  }
};