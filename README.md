# PosSatis - Satış Noktası Uygulaması
Dünya Açık Kaynak Kodu Destekleyen Yazılımcılar Sayesinde Dönüyor. Bizimde Bu Destekte Ufak Bir Payımız Olsun. PROJEYE DEĞİL İMPLEMENTASYONA BEDEL ÖDENMELİDİR. 
Tanıtmaya gerek yok proje kendini anlatıyor 
## Uygulama Hakkında
PosSatis, küçük işletmeler için geliştirilmiş bir satış noktası (POS) uygulamasıdır. Ürün satışı, stok takibi, kategori yönetimi ve satış raporları gibi temel işlemleri destekler.

## Kurulum

### Otomatik Kurulum
Projenin ana dizininde bulunan `PosSatis-Kur.bat` dosyasına çift tıklayarak tüm gerekli paketleri otomatik olarak kurabilirsiniz.

### Manuel Kurulum
Projeyi manuel olarak kurmak için:

1. Proje dizininde gerekli paketleri yükleyin:
```
npm install
```

2. Client dizininde gerekli paketleri yükleyin:
```
cd client
npm install
```

## Uygulamayı Çalıştırma

Uygulamayı başlatmak için birkaç yöntem bulunmaktadır:

### 1. Tek Tıkla Başlatma

Projenin ana dizininde bulunan `PosSatis.bat` dosyasına çift tıklayarak uygulamayı başlatabilirsiniz. Bu, hem sunucu hem de istemci uygulamasını aynı anda başlatacaktır.

### 2. Arka Planda Çalıştırma

Komut istemi penceresi görmeden arka planda çalıştırmak için `baslat.vbs` dosyasına çift tıklayabilirsiniz. Bu dosya çalıştırıldığında, eğer PosSatis zaten çalışıyorsa önce mevcut süreçleri sonlandırır, ardından yeni bir oturum başlatır.

### 3. Komut Satırından

Projenin ana dizininde aşağıdaki komutu çalıştırarak hem sunucu hem de istemci uygulamasını başlatabilirsiniz:

```
npm run dev
```

## Uygulamayı Kapatma

Uygulamayı kapatmak için:

1. Eğer bat dosyası ile başlattıysanız, açılan komut istemi penceresini kapatabilirsiniz.
2. Arka planda çalışan uygulamayı kapatmak için `PosSatis_Kapat.bat` dosyasına çift tıklayarak tüm Node.js süreçlerini sonlandırabilirsiniz.

## Özellikler

- Ürün satışı ve sepet yönetimi
- Barkodla hızlı ürün ekleme
- Kategori ve alt kategori yönetimi
- Stok takibi
- Satış raporları
- Basit müşteri bilgileri
- Vitrin ürünleri

## Geliştirme

Uygulamanın yazılım altyapısı:
- Frontend: React, React-Bootstrap
- Backend: Express.js (Node.js)
- Veritabanı: JSON (Dosya tabanlı) 
