/**
 * Eski satış kayıtlarını temizleme yardımcı modülü
 */

/**
 * Belirli bir gün sayısından eski satışları temizler
 * @param {number} gunSayisi - Kaç günden eski satışların silineceği
 * @param {Function} callback - İşlem sonrası çağrılacak callback fonksiyonu (opsiyonel)
 */
const eskiSatislariTemizle = (gunSayisi = 5, callback) => {
  try {
    console.log(`[TEMIZLEYICI] ${gunSayisi} günden eski satış kayıtları temizleniyor...`);
    const data = global.DB.read();
    
    if (!data.satislar || !Array.isArray(data.satislar)) {
      console.log('[TEMIZLEYICI] Satış kaydı bulunamadı veya geçersiz format.');
      if (callback) callback(null, 0);
      return 0;
    }
    
    console.log(`[TEMIZLEYICI] Toplam satış kaydı: ${data.satislar.length}`);
    
    // X günden eski kayıtları filtrele
    const sinirTarih = new Date();
    sinirTarih.setDate(sinirTarih.getDate() - gunSayisi);
    sinirTarih.setHours(0, 0, 0, 0); // Günün başlangıcı
    
    console.log(`[TEMIZLEYICI] Silinecek satışlar için sınır tarihi: ${sinirTarih.toISOString()}`);
    
    // Tarih kontrolleri için satışları inceleyelim
    data.satislar.forEach((satis, index) => {
      if (!satis.tarih) {
        console.log(`[TEMIZLEYICI] ID: ${satis.id} - Tarih alanı yok!`);
        return;
      }
      
      try {
        const satisTarihi = new Date(satis.tarih);
        console.log(`[TEMIZLEYICI] Satış #${satis.id} Tarih: ${satis.tarih} => JS Tarih Objesi: ${satisTarihi.toISOString()}`);
        
        // Karşılaştırma sonucu
        const eskiMi = satisTarihi < sinirTarih;
        console.log(`[TEMIZLEYICI] Satış #${satis.id} eski mi? ${eskiMi ? 'EVET - SİLİNECEK' : 'HAYIR - KORUNACAK'}`);
      } catch (err) {
        console.log(`[TEMIZLEYICI] Satış #${satis.id} için tarih dönüştürme hatası: ${err.message}`);
      }
    });
    
    const eskiSatislarSayisi = data.satislar.length;
    
    // Belirtilen günden yeni satışları tut - geçersiz tarihleri filtrele
    const yeniSatislar = data.satislar.filter(satis => {
      if (!satis.tarih) return true; // Tarih yoksa koru
      
      try {
        const satisTarihi = new Date(satis.tarih);
        // Geçerli bir tarih mi kontrol et
        if (isNaN(satisTarihi.getTime())) {
          console.log(`[TEMIZLEYICI] Geçersiz tarih: ${satis.tarih} - Satış #${satis.id}`);
          return true; // Geçersiz tarihi koru
        }
        return satisTarihi >= sinirTarih;
      } catch (err) {
        console.log(`[TEMIZLEYICI] Tarih işleme hatası - Satış korunuyor: ${err.message}`);
        return true; // Hata durumunda koru
      }
    });
    
    const silinenSatisSayisi = eskiSatislarSayisi - yeniSatislar.length;
    
    console.log(`[TEMIZLEYICI] Silinecek satış sayısı: ${silinenSatisSayisi}`);
    
    if (silinenSatisSayisi > 0) {
      // Satışları güncelle
      data.satislar = yeniSatislar;
      
      // Veritabanına yaz
      const yazmaBasarili = global.DB.write(data);
      console.log(`[TEMIZLEYICI] Veritabanına yazma sonucu: ${yazmaBasarili ? 'BAŞARILI' : 'BAŞARISIZ'}`);
      
      if (yazmaBasarili) {
        console.log(`[TEMIZLEYICI] ${silinenSatisSayisi} adet eski satış kaydı silindi.`);
      } else {
        console.log(`[TEMIZLEYICI] Veri yazma hatası nedeniyle satışlar silinemedi!`);
        if (callback) callback(new Error('Veri yazma hatası'), 0);
        return 0;
      }
    } else {
      console.log('[TEMIZLEYICI] Silinecek eski satış kaydı bulunamadı.');
    }
    
    if (callback) callback(null, silinenSatisSayisi);
    return silinenSatisSayisi;
  } catch (err) {
    console.error('[TEMIZLEYICI] Satış temizleme hatası:', err);
    if (callback) callback(err, 0);
    return 0;
  }
};

/**
 * Tüm ürünlerin stok miktarını sıfırlar
 * @param {Function} callback - İşlem sonrası çağrılacak callback fonksiyonu (opsiyonel)
 */
const stoklariSifirla = (callback) => {
  try {
    console.log('[TEMIZLEYICI] Tüm ürünlerin stok miktarı sıfırlanıyor...');
    const data = global.DB.read();
    if (!data.urunler || !Array.isArray(data.urunler)) {
      console.log('[TEMIZLEYICI] Ürün kaydı bulunamadı veya geçersiz format.');
      if (callback) callback(null, 0);
      return 0;
    }
    data.urunler = data.urunler.map(urun => ({ ...urun, stokMiktari: 0 }));
    const yazmaBasarili = global.DB.write(data);
    if (yazmaBasarili) {
      console.log('[TEMIZLEYICI] Tüm ürünlerin stok miktarı sıfırlandı.');
      if (callback) callback(null, data.urunler.length);
      return data.urunler.length;
    } else {
      console.log('[TEMIZLEYICI] Veri yazma hatası nedeniyle stoklar sıfırlanamadı!');
      if (callback) callback(new Error('Veri yazma hatası'), 0);
      return 0;
    }
  } catch (err) {
    console.error('[TEMIZLEYICI] Stok sıfırlama hatası:', err);
    if (callback) callback(err, 0);
    return 0;
  }
};

module.exports = {
  eskiSatislariTemizle,
  stoklariSifirla
}; 