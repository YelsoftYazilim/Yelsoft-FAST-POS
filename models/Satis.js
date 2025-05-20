const mongoose = require('mongoose');

const SatisDetaySchema = new mongoose.Schema({
  urun: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Urun',
    required: true
  },
  urunAdi: String,
  barkod: String,
  birimFiyat: Number,
  miktar: {
    type: Number,
    required: true,
    min: [1, 'Miktar en az 1 olmalıdır']
  },
  kdvOrani: Number,
  kdvTutari: Number,
  araToplam: Number,
  toplamTutar: Number
});

const SatisSchema = new mongoose.Schema({
  fisNo: {
    type: String,
    required: true,
    unique: true
  },
  urunler: [SatisDetaySchema],
  toplamTutar: {
    type: Number,
    required: true
  },
  kdvToplam: {
    type: Number,
    required: true
  },
  araToplam: {
    type: Number,
    required: true
  },
  odemeYontemi: {
    type: String,
    enum: ['Nakit', 'Kredi Kartı', 'Havale/EFT', 'Diğer'],
    default: 'Nakit'
  },
  odemeDurumu: {
    type: String,
    enum: ['Ödendi', 'Bekliyor', 'İptal Edildi'],
    default: 'Ödendi'
  },
  satisZamani: {
    type: Date,
    default: Date.now
  },
  kasiyer: {
    type: String,
    default: 'Admin'
  },
  musteri: {
    ad: String,
    telefon: String,
    email: String
  },
  notlar: String
});

// Fiş numarası oluşturma fonksiyonu
SatisSchema.statics.generateFisNo = async function() {
  const date = new Date();
  const yil = date.getFullYear().toString().slice(-2);
  const ay = (date.getMonth() + 1).toString().padStart(2, '0');
  const gun = date.getDate().toString().padStart(2, '0');
  const prefix = `${gun}${ay}${yil}`;
  
  // Bugün için son satış numarasını bul
  const sonSatis = await this.findOne(
    { fisNo: new RegExp('^' + prefix) },
    {},
    { sort: { fisNo: -1 } }
  );
  
  let siraNo = 1;
  if (sonSatis) {
    const sonSiraNo = parseInt(sonSatis.fisNo.slice(-4));
    siraNo = sonSiraNo + 1;
  }
  
  // 4 haneli sıra numarası oluştur
  const siraNoStr = siraNo.toString().padStart(4, '0');
  return `${prefix}${siraNoStr}`;
};

module.exports = mongoose.model('Satis', SatisSchema);