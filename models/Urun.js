const mongoose = require('mongoose');

const UrunSchema = new mongoose.Schema({
  barkod: {
    type: String,
    required: [true, 'Barkod zorunludur'],
    unique: true,
    trim: true
  },
  ad: {
    type: String,
    required: [true, 'Ürün adı zorunludur'],
    trim: true
  },
  fiyat: {
    type: Number,
    required: [true, 'Fiyat zorunludur'],
    min: [0, 'Fiyat 0\'dan küçük olamaz']
  },
  kdvOrani: {
    type: Number,
    required: [true, 'KDV oranı zorunludur'],
    min: [0, 'KDV oranı 0\'dan küçük olamaz'],
    max: [100, 'KDV oranı 100\'den büyük olamaz']
  },
  stokMiktari: {
    type: Number,
    default: 0,
    min: [0, 'Stok miktarı 0\'dan küçük olamaz']
  },
  birim: {
    type: String,
    default: 'Adet',
    trim: true
  },
  kategoriId: {
    type: Number,
    ref: 'Kategori'
  },
  altKategoriId: {
    type: Number,
    ref: 'AltKategori'
  },
  olusturmaTarihi: {
    type: Date,
    default: Date.now
  },
  guncellenmeTarihi: {
    type: Date,
    default: Date.now
  }
});

// Ürün güncellendiğinde güncelleme tarihini otomatik ayarla
UrunSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.guncellenmeTarihi = Date.now();
  }
  next();
});

module.exports = mongoose.model('Urun', UrunSchema);