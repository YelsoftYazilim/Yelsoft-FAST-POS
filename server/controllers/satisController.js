const Satis = require('../models/satisModel');

exports.createSatis = async (req, res) => {
  try {
    const yeniSatis = new Satis({
      ...req.body,
      satisZamani: new Date()
    });

    const kaydedilmisSatis = await yeniSatis.save();
    res.status(201).json(kaydedilmisSatis);
  } catch (error) {
    res.status(400).json({ hata: error.message });
  }
};