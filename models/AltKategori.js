const mongoose = require('mongoose');

const AltKategoriSchema = new mongoose.Schema({
  ad: {
    type: String,
    required: [true, 'Alt kategori adı zorunludur'],
    trim: true
  },
  kategori: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kategori',
    required: [true, 'Ana kategori belirtilmelidir']
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

// Alt kategori güncellendiğinde güncelleme tarihini otomatik ayarla
AltKategoriSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.guncellenmeTarihi = Date.now();
  }
  next();
});

module.exports = mongoose.model('AltKategori', AltKategoriSchema); 