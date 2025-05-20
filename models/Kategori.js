const mongoose = require('mongoose');

const KategoriSchema = new mongoose.Schema({
  ad: {
    type: String,
    required: [true, 'Kategori adı zorunludur'],
    unique: true,
    trim: true
  },
  aciklama: {
    type: String,
    trim: true
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

// Kategori güncellendiğinde güncelleme tarihini otomatik ayarla
KategoriSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.guncellenmeTarihi = Date.now();
  }
  next();
});

module.exports = mongoose.model('Kategori', KategoriSchema); 