const mongoose = require('mongoose');

const satisSchema = new mongoose.Schema({
  fisNo: { type: String, required: true, unique: true },
  urunler: [{
    urunId: { type: String, required: true },
    miktar: { type: Number, required: true },
    birimFiyat: { type: Number, required: true }
  }],
  toplamTutar: { type: Number, required: true },
  odemeYontemi: { type: String, required: true },
  odemeDurumu: { type: String, default: 'Ödendi' },
  parcaliOdeme: { type: Boolean, default: false },
  odemeler: [{
    odemeTipiId: Number,
    odemeTipiAdi: String,
    tutar: Number
  }],
  musteri: {
    ad: String,
    telefon: String
  },
  satisZamani: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Satis', satisSchema);