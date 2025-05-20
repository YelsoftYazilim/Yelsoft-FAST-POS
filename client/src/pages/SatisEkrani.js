import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Modal, Nav } from 'react-bootstrap';
import { FaBarcode, FaPlus, FaMinus, FaTrash, FaMoneyBill, FaCreditCard, FaPrint, FaTags, FaLayerGroup, FaBackspace, FaEdit, FaCheck, FaPause, FaShoppingCart, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

// CSS stillerini ekleyin
const styles = {
  satisContainer: {
    display: 'flex',
    gap: '20px',
    height: 'calc(100vh - 80px)',
    overflow: 'hidden',
    marginTop: '10px'
  },
  urunContainer: {
    flex: '1 0 60%',
    maxWidth: '65%',
    minWidth: '65%',
    overflow: 'auto',
    height: '100%'
  },
  sepetContainer: {
    flex: '1 0 35%',
    maxWidth: '35%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  sepetUrunler: {
    flex: '1',
    overflow: 'auto',
    marginBottom: '10px'
  },
  sepetOzet: {
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '5px',
    marginBottom: '15px'
  },
  kategoriListe: {
    minHeight: '80px'
  },
  altKategoriListe: {
    minHeight: '80px'
  },
  urunListe: {
    height: 'calc(100% - 160px)',
    overflow: 'auto'
  }
};

const SatisEkrani = () => {
  // State tanımlamaları
  const [barkod, setBarkod] = useState('');
  const [sepet, setSepet] = useState([]);
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [showOdemeModal, setShowOdemeModal] = useState(false);
  const [odemeYontemi, setOdemeYontemi] = useState('Nakit');
  const [odenenTutar, setOdenenTutar] = useState('');
  const [paraUstu, setParaUstu] = useState(0);
  const [musteri, setMusteri] = useState({ ad: '', telefon: '' });
  const [sadecVitrin, setSadecVitrin] = useState(false);
  const [odemeTipleri, setOdemeTipleri] = useState([]);
  const [seciliOdemeTipleri, setSeciliOdemeTipleri] = useState([]);
  const [parcaliOdeme, setParcaliOdeme] = useState(false);
  
  // Fiyat değiştirme için state'ler
  const [showFiyatModal, setShowFiyatModal] = useState(false);
  const [seciliUrunIndex, setSeciliUrunIndex] = useState(null);
  const [yeniFiyat, setYeniFiyat] = useState('');
  const [ilkFiyatTiklama, setIlkFiyatTiklama] = useState(true);
  
  // Kategori filtreleme için state'ler
  const [kategoriler, setKategoriler] = useState([]);
  const [altKategoriler, setAltKategoriler] = useState([]);
  const [secilenKategoriId, setSecilenKategoriId] = useState(null);
  const [secilenAltKategoriId, setSecilenAltKategoriId] = useState(null);
  
  // Barkod input referansı
  const barkodInputRef = useRef(null);

  // Ödenen tutar inputu için ref
  const odenenTutarInputRef = useRef(null);
  
  // Sepet adı inputu için ref
  const sepetAdiInputRef = useRef(null);
  
  // İlk numpad tıklamasını takip etmek için state
  const [ilkNumpadTiklama, setIlkNumpadTiklama] = useState(true);

  // Toplam değerleri hesapla
  const hesaplamalar = sepet.reduce(
    (toplam, item) => {
      // KDV oranı tanımlı değilse 0 olarak kabul et
      const kdvOrani = item.kdvOrani || 0;
      
      // Birim fiyat zaten KDV dahil olduğundan, KDV hariç fiyatı hesapla
      const birimFiyatHaricKDV = kdvOrani > 0 ? item.birimFiyat / (1 + (kdvOrani / 100)) : item.birimFiyat;
      const birimKdvTutari = kdvOrani > 0 ? item.birimFiyat - birimFiyatHaricKDV : 0;
      
      // Toplam tutarlar
      const araToplam = birimFiyatHaricKDV * item.miktar;
      const kdvTutari = birimKdvTutari * item.miktar;
      const satirToplam = item.birimFiyat * item.miktar; // KDV dahil toplam
      
      return {
        araToplam: toplam.araToplam + araToplam,
        kdvToplam: toplam.kdvToplam + kdvTutari,
        genelToplam: toplam.genelToplam + satirToplam
      };
    },
    { araToplam: 0, kdvToplam: 0, genelToplam: 0 }
  );

  // Barkod alanına sürekli otomatik odaklanma
  useEffect(() => {
    // Sayfa yüklendiğinde barkod alanına odaklanma
    setTimeout(() => {
      barkodInputRef.current?.focus();
    }, 500);
  }, []);

  // Sepet değiştiğinde veya barkod temizlendiğinde barkod alanına odaklan
  useEffect(() => {
    // Modal açık değilse odaklan
    if (!showOdemeModal) {
    barkodInputRef.current?.focus();
    }
  }, [sepet, barkod, showOdemeModal]);

  // Düzenli aralıklarla barkod alanına odaklanma kontrolü
  useEffect(() => {
    const interval = setInterval(() => {
      // Eğer modal açık değilse ve odak halihazırda barkod alanında değilse odaklan
      if (!showOdemeModal && document.activeElement !== barkodInputRef.current) {
        barkodInputRef.current?.focus();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [showOdemeModal]);
  
  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    // Tüm ürünleri ve ödeme tiplerini getir
    const veriyiGetir = async () => {
      try {
        setYukleniyor(true);
        
        // Ürünleri getir
        const urunlerRes = await axios.get('/api/urunler');
        setUrunler(urunlerRes.data);
        
        // Kategorileri getir
        const kategorilerRes = await axios.get('/api/kategoriler');
        setKategoriler(kategorilerRes.data);
        
        // Ödeme tiplerini getir
        try {
          const odemeTipleriRes = await axios.get('/api/odeme-tipleri');
          setOdemeTipleri(odemeTipleriRes.data);
        } catch (err) {
          console.error('Ödeme tipleri getirilemedi:', err);
          // Varsayılan ödeme tipleri
          setOdemeTipleri([{ id: 1, ad: 'Nakit' }, { id: 2, ad: 'Kredi Kartı' }]);
        }
      } catch (error) {
        console.error('Veri getirme hatası:', error);
        toast.error('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setYukleniyor(false);
      }
    };
    
    veriyiGetir();
  }, []);
  
  // Kategori seçildiğinde alt kategorileri getir
  useEffect(() => {
    const altKategorileriGetir = async () => {
      if (!secilenKategoriId) {
        setAltKategoriler([]);
        setSecilenAltKategoriId(null);
        return;
      }
      
      try {
        setYukleniyor(true);
        const response = await axios.get(`/api/kategoriler/${secilenKategoriId}/alt-kategoriler`);
        setAltKategoriler(response.data);
        
        // Eğer alt kategori varsa, ilk alt kategoriyi otomatik seç
        if (response.data.length > 0) {
          setSecilenAltKategoriId(response.data[0].id);
        } else {
          setSecilenAltKategoriId(null);
        }
      } catch (err) {
        console.error('Alt kategorileri getirme hatası:', err);
        toast.error('Alt kategoriler yüklenirken bir hata oluştu');
        setAltKategoriler([]);
      } finally {
        setYukleniyor(false);
      }
    };
    
    altKategorileriGetir();
  }, [secilenKategoriId]);

  // Barkod değiştiğinde
  const handleBarkodChange = (e) => {
    setBarkod(e.target.value);
  };

  // Kategori değişikliği
  const handleKategoriChange = (kategoriId) => {
    setSecilenKategoriId(kategoriId);
  };
  
  // Alt kategori değişikliği
  const handleAltKategoriChange = (altKategoriId) => {
    setSecilenAltKategoriId(altKategoriId);
  };
  
  // Filtrelenmiş ürünleri hesapla
  const filtrelenmisUrunler = urunler.filter(urun => {
    // Sadece vitrin filtresi
    if (sadecVitrin && !urun.vitrin) {
      return false;
    }
    
    // Kategori filtresi
    if (secilenKategoriId && urun.kategoriId !== parseInt(secilenKategoriId)) {
      return false;
    }
    
    // Alt kategori filtresi
    if (secilenAltKategoriId && urun.altKategoriId !== parseInt(secilenAltKategoriId)) {
      return false;
    }
    
    return true;
  });

  // Barkod ile ürün ara ve sepete ekle
  const urunAraVeEkle = async (e) => {
    e.preventDefault();
    
    if (!barkod.trim()) {
      barkodInputRef.current?.focus();
      return;
    }
    
    setYukleniyor(true);
    try {
      // Barkod ile ürün ara
      const response = await axios.get(`/api/urunler/barkod/${barkod}`);
      const urun = response.data;
      
      // Stok kontrolü
      if (urun.stokMiktari <= 0) {
        toast.warning(`${urun.ad} ürünü stokta kalmamış!`);
        setBarkod('');
        barkodInputRef.current?.focus();
        return;
      }
      
      // Sepette bu ürün var mı kontrol et
      const sepetIndex = sepet.findIndex(item => item.urunId === urun.id);
      
      if (sepetIndex !== -1) {
        // Ürün sepette varsa miktarını artır
        const yeniSepet = [...sepet];
        yeniSepet[sepetIndex].miktar += 1;
        setSepet(yeniSepet);
      } else {
        // Ürün sepette yoksa ekle
        setSepet([...sepet, {
          urunId: urun.id,
          barkod: urun.barkod,
          ad: urun.ad,
          birimFiyat: urun.fiyat,
          kdvOrani: urun.kdvOrani,
          miktar: 1,
          birim: urun.birim || 'Adet'
        }]);
      }
      
      // Barkod alanını temizle ve odaklan
      setBarkod('');
      barkodInputRef.current?.focus();
    } catch (error) {
      console.error('Ürün arama hatası:', error);
      if (error.response?.status === 404) {
        toast.error('Ürün bulunamadı!');
      } else {
        toast.error('Ürün aranırken bir hata oluştu.');
      }
      setBarkod('');
      barkodInputRef.current?.focus();
    } finally {
      setYukleniyor(false);
    }
  };

  // Sepetten ürün çıkar
  const urunCikar = (index) => {
    const yeniSepet = [...sepet];
    yeniSepet.splice(index, 1);
    setSepet(yeniSepet);
    barkodInputRef.current?.focus();
  };

  // Ürün miktarını artır
  const miktarArtir = (index) => {
    const yeniSepet = [...sepet];
    yeniSepet[index].miktar += 1;
    setSepet(yeniSepet);
    barkodInputRef.current?.focus();
  };

  // Ürün miktarını azalt
  const miktarAzalt = (index) => {
    const yeniSepet = [...sepet];
    if (yeniSepet[index].miktar > 1) {
      yeniSepet[index].miktar -= 1;
      setSepet(yeniSepet);
    }
    barkodInputRef.current?.focus();
  };

  // Sepeti temizle
  const sepetiTemizle = () => {
    if (sepet.length === 0) return;
    
    if (window.confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
      setSepet([]);
      barkodInputRef.current?.focus();
    }
  };

  // Hızlı ürün ekleme - vitrin ürünleri için
  const hizliUrunEkle = async (urun) => {
    // Stok kontrolü
    if (urun.stokMiktari <= 0) {
      toast.warning(`${urun.ad} ürünü stokta kalmamış!`);
      return;
    }
    
    // Sepette bu ürün var mı kontrol et
    const sepetIndex = sepet.findIndex(item => item.urunId === urun.id);
    
    if (sepetIndex !== -1) {
      // Ürün sepette varsa miktarını artır
      const yeniSepet = [...sepet];
      yeniSepet[sepetIndex].miktar += 1;
      setSepet(yeniSepet);
    } else {
      // Ürün sepette yoksa ekle
      setSepet([...sepet, {
        urunId: urun.id,
        barkod: urun.barkod,
        ad: urun.ad,
        birimFiyat: urun.fiyat,
        kdvOrani: urun.kdvOrani,
        miktar: 1,
        birim: urun.birim || 'Adet'
      }]);
    }
    
    toast.success(`${urun.ad} sepete eklendi.`);
    
    // Barkod alanına odaklanma işlemi güçlendirildi
    setTimeout(() => {
      barkodInputRef.current?.focus();
    }, 100);
  };

  // Satışı tamamla
  const satisiTamamla = async () => {
    if (sepet.length === 0) {
      toast.warning('Sepet boş!');
      return;
    }
    
    try {
      // Parçalı ödeme kontrolü
      if (parcaliOdeme) {
        // Toplam ödeme tutarı ile sepet toplamını karşılaştır
        const toplamOdemeTutari = seciliOdemeTipleri.reduce((sum, odeme) => sum + (parseFloat(odeme.tutar) || 0), 0);
        
        if (Math.abs(toplamOdemeTutari - hesaplamalar.genelToplam) > 0.01) {
          toast.error('Toplam ödeme tutarı ile sepet toplamı eşleşmiyor!');
          return;
        }
        
        // Ödeme bilgilerini hazırla
        const odemeBilgileri = seciliOdemeTipleri.map(odeme => ({
          odemeTipiId: odeme.odemeTipiId,
          odemeTipiAdi: odeme.odemeTipiAdi,
          tutar: parseFloat(odeme.tutar)
        }));
        
        // Satış verisini hazırla
        const satisVerisi = {
          urunler: sepet.map(item => ({
            urun: item.urunId,
            miktar: item.miktar
          })),
          parcaliOdeme: true,
          odemeler: odemeBilgileri,
          musteri: musteri.ad ? musteri : undefined
        };
        
        // Satışı kaydet
        const response = await axios.post('/api/satislar', satisVerisi);
        
        // Başarılı satış
        toast.success('Parçalı ödeme ile satış başarıyla tamamlandı!');
        
        // Sepeti temizle ve modalı kapat
        setSepet([]);
        setMusteri({ ad: '', telefon: '' });
        odemeModalKapat();
        
        // Fiş yazdırma işlemi burada yapılabilir
        console.log('Parçalı ödeme ile satış kaydedildi:', response.data);
      } else {
        // Standart ödeme - Satış verisini hazırla
        const satisVerisi = {
          urunler: sepet.map(item => ({
            urun: item.urunId,
            miktar: item.miktar
          })),
          odemeYontemi,
          odemeDurumu: 'Ödendi',
          musteri: musteri.ad ? musteri : undefined
        };
        
        // Satışı kaydet
        console.log('Gönderilen veri:', satisVerisi);
        const response = await axios.post('/api/satislar', satisVerisi);
        
        // Başarılı satış
        toast.success('Satış başarıyla tamamlandı!');
        
        // Sepeti temizle ve modalı kapat
        setSepet([]);
        setMusteri({ ad: '', telefon: '' });
        odemeModalKapat();
        
        // Fiş yazdırma işlemi burada yapılabilir
        console.log('Satış kaydedildi:', response.data);
      }
      
      // Barkod inputuna odaklan - Daha güçlü şekilde
      setTimeout(() => {
        barkodInputRef.current?.focus();
      }, 500);
      
    } catch (error) {
      console.error('Satış hatası:', error);
      toast.error(error.response?.data?.hata || 'Satış işlemi sırasında bir hata oluştu.');
      
      // Hata durumunda da barkod alanına odaklan
      setTimeout(() => {
        barkodInputRef.current?.focus();
      }, 300);
    }
  };

  // Ödeme modalını aç
  const odemeModalAc = () => {
    if (sepet.length === 0) {
      toast.warning('Sepet boş!');
      setTimeout(() => {
        barkodInputRef.current?.focus();
      }, 100);
      return;
    }
    
    // Parçalı ödeme bilgilerini sıfırla
    setParcaliOdeme(false);
    setSeciliOdemeTipleri([{
      odemeTipiId: odemeTipleri.length > 0 ? odemeTipleri[0].id : 1,
      odemeTipiAdi: odemeTipleri.length > 0 ? odemeTipleri[0].ad : 'Nakit',
      tutar: hesaplamalar.genelToplam
    }]);
    
    setOdemeYontemi('Nakit');
    setOdenenTutar(hesaplamalar.genelToplam.toFixed(2));
    setParaUstu(0);
    setShowOdemeModal(true);
    
    // İlk numpad tıklaması için durumu sıfırla
    setIlkNumpadTiklama(true);
    
    // Modal açıldıktan sonra ödenen tutar alanına odaklan
    setTimeout(() => {
      odenenTutarInputRef.current?.focus();
      odenenTutarInputRef.current?.select();
    }, 300);
  };

  // Ödeme tipi değişikliğini işle
  const handleOdemeTipiChange = (index, yeniOdemeTipiId) => {
    const secilenTip = odemeTipleri.find(t => t.id === parseInt(yeniOdemeTipiId));
    if (!secilenTip) return;
    
    const yeniOdemeTipleri = [...seciliOdemeTipleri];
    yeniOdemeTipleri[index] = {
      ...yeniOdemeTipleri[index],
      odemeTipiId: parseInt(yeniOdemeTipiId),
      odemeTipiAdi: secilenTip.ad
    };
    setSeciliOdemeTipleri(yeniOdemeTipleri);
  };
  
  // Ödeme tutarı değişikliğini işle
  const handleOdemeTutariChange = (index, yeniTutar) => {
    const parsedTutar = parseFloat(yeniTutar) || 0;
    
    const yeniOdemeTipleri = [...seciliOdemeTipleri];
    yeniOdemeTipleri[index].tutar = parsedTutar;
    setSeciliOdemeTipleri(yeniOdemeTipleri);
  };
  
  // Ödeme tipi ekle
  const odemeTipiEkle = () => {
    // Kalan toplam tutarı hesapla
    const mevcutToplamOdeme = seciliOdemeTipleri.reduce(
      (toplam, odeme) => toplam + (parseFloat(odeme.tutar) || 0), 0
    );
    const kalanTutar = Math.max(0, hesaplamalar.genelToplam - mevcutToplamOdeme);
    
    // Varsayılan olarak ilk ödeme tipini seç
    const varsayilanOdemeTipi = odemeTipleri.length > 0 ? 
      odemeTipleri[0] : { id: 1, ad: 'Nakit' };
    
    setSeciliOdemeTipleri([
      ...seciliOdemeTipleri,
      {
        odemeTipiId: varsayilanOdemeTipi.id,
        odemeTipiAdi: varsayilanOdemeTipi.ad,
        tutar: kalanTutar
      }
    ]);
  };
  
  // Ödeme tipi kaldır
  const odemeTipiKaldir = (index) => {
    if (seciliOdemeTipleri.length <= 1) return; // En az bir ödeme tipi olmalı
    
    const silinecekTutar = parseFloat(seciliOdemeTipleri[index].tutar) || 0;
    const yeniOdemeTipleri = seciliOdemeTipleri.filter((_, i) => i !== index);
    
    // Silinen tutarı ilk ödeme tipine ekle
    if (yeniOdemeTipleri.length > 0 && silinecekTutar > 0) {
      yeniOdemeTipleri[0].tutar = (parseFloat(yeniOdemeTipleri[0].tutar) || 0) + silinecekTutar;
    }
    
    setSeciliOdemeTipleri(yeniOdemeTipleri);
  };

  // Ödeme modalını kapat
  const odemeModalKapat = () => {
    setShowOdemeModal(false);
    // Modal kapandığında barkod alanına odaklan
    setTimeout(() => {
      barkodInputRef.current?.focus();
    }, 300);
  };

  // Ödenen tutar değiştiğinde para üstünü hesapla
  const handleOdenenTutarChange = (e) => {
    const tutar = parseFloat(e.target.value) || 0;
    setOdenenTutar(tutar);
    setParaUstu(Math.max(0, tutar - hesaplamalar.genelToplam));
  };

  // Sayısal tuş takımından değer ekleme
  const handleNumpadClick = (value) => {
    let yeniTutar;
    
    // Backspace tuşu için
    if (value === 'backspace') {
      const tutarStr = odenenTutar.toString();
      yeniTutar = tutarStr.length > 0 ? 
        parseFloat(tutarStr.slice(0, -1) || '0') : 0;
      
      // İlk tıklama durumunu korumak için
      setIlkNumpadTiklama(false);
    } 
    // Temizleme tuşu
    else if (value === 'clear') {
      yeniTutar = 0;
      
      // İlk tıklama durumunu sıfırla
      setIlkNumpadTiklama(true);
    }
    // Sayı tuşları
    else {
      // İlk tıklama ise mevcut değeri sil ve yeni rakamla başla
      if (ilkNumpadTiklama) {
        yeniTutar = value === '.' ? '0.' : value;
        setIlkNumpadTiklama(false);
      } else {
        const tutarStr = odenenTutar.toString();
        // Eğer tutar 0 ise, yerine yeni rakamı koy
        if (tutarStr === '0' && value !== '.') {
          yeniTutar = value;
        } else {
          yeniTutar = tutarStr + value;
        }
      }
    }
    
    setOdenenTutar(yeniTutar);
    setParaUstu(Math.max(0, parseFloat(yeniTutar) - hesaplamalar.genelToplam));
  };
  
  // Müşteri bilgileri tanımlamaları
  const handleInputFocus = (e) => {
    e.target.select();
    // Odaklandığında ilk numpad tıklamasını aktifleştir
    setIlkNumpadTiklama(true);
  };
  
  // Modal kapandığında odaklanmayı reset et
  useEffect(() => {
    if (!showOdemeModal) {
      setIlkNumpadTiklama(true);
    }
  }, [showOdemeModal]);

  // Fiyat değiştirme işlemleri
  const fiyatModalAc = (index) => {
    // Eğer toplam fiyatı düzenliyorsak
    if (index === 'toplam') {
      setSeciliUrunIndex('toplam');
      setYeniFiyat(hesaplamalar.genelToplam.toString());
    } else {
      // Eğer satır fiyatını düzenliyorsak
      setSeciliUrunIndex(index);
      setYeniFiyat(sepet[index].birimFiyat.toString());
    }
    setIlkFiyatTiklama(true);
    setShowFiyatModal(true);
  };
  
  const fiyatModalKapat = () => {
    setShowFiyatModal(false);
    setSeciliUrunIndex(null);
    setYeniFiyat('');
    // Modal kapandığında barkod alanına odaklan
    setTimeout(() => {
      barkodInputRef.current?.focus();
    }, 300);
  };
  
  const fiyatNumpadClick = (value) => {
    let yeniFiyatDeger;
    
    // Backspace tuşu için
    if (value === 'backspace') {
      const fiyatStr = yeniFiyat.toString();
      yeniFiyatDeger = fiyatStr.length > 0 ? 
        parseFloat(fiyatStr.slice(0, -1) || '0') : 0;
      
      // İlk tıklama durumunu korumak için
      setIlkFiyatTiklama(false);
    } 
    // Temizleme tuşu
    else if (value === 'clear') {
      yeniFiyatDeger = 0;
      
      // İlk tıklama durumunu sıfırla
      setIlkFiyatTiklama(true);
    }
    // Sayı tuşları
    else {
      // İlk tıklama ise mevcut değeri sil ve yeni rakamla başla
      if (ilkFiyatTiklama) {
        yeniFiyatDeger = value === '.' ? '0.' : value;
        setIlkFiyatTiklama(false);
      } else {
        const fiyatStr = yeniFiyat.toString();
        // Eğer fiyat 0 ise, yerine yeni rakamı koy
        if (fiyatStr === '0' && value !== '.') {
          yeniFiyatDeger = value;
        } else {
          yeniFiyatDeger = fiyatStr + value;
        }
      }
    }
    
    setYeniFiyat(yeniFiyatDeger);
  };
  
  const fiyatGuncelle = () => {
    if (seciliUrunIndex === null) return;
    
    const yeniFiyatDeger = parseFloat(yeniFiyat);
    if (isNaN(yeniFiyatDeger) || yeniFiyatDeger <= 0) {
      toast.error('Geçerli bir fiyat giriniz.');
      return;
    }
    
    // Toplam fiyatı düzenlerken
    if (seciliUrunIndex === 'toplam') {
      // Toplam tutar değiştiyse tüm ürünlerin fiyatını orantılı olarak güncelle
      const oranFarki = yeniFiyatDeger / hesaplamalar.genelToplam;
      
      if (Math.abs(oranFarki - 1) < 0.001) {
        toast.info('Fiyat değişmedi.');
        fiyatModalKapat();
          return;
        }
        
      const yeniSepet = sepet.map(item => ({
        ...item,
        birimFiyat: item.birimFiyat * oranFarki
      }));
      setSepet(yeniSepet);
      toast.success('Toplam tutar güncellendi.');
    } else {
      // Ürün fiyatını düzenlerken
      const yeniSepet = [...sepet];
      yeniSepet[seciliUrunIndex].birimFiyat = yeniFiyatDeger;
      setSepet(yeniSepet);
      toast.success('Ürün fiyatı güncellendi.');
    }
    
    fiyatModalKapat();
  };

  // Bekleyen sepetler için işlevler
  const beklemeyeAlModalAc = () => {
    if (sepet.length === 0) {
      toast.warning('Bekletmek için önce sepete ürün ekleyin.');
      return;
    }
    setBekleyenSepetAdi('');
    setShowBeklemeyeAlModal(true);
  };
  
  const beklemeyeAlModalKapat = () => {
    setShowBeklemeyeAlModal(false);
    // Modal kapandığında barkod alanına odaklan
    setTimeout(() => {
      barkodInputRef.current?.focus();
    }, 300);
  };
  
  const sepetiKaydet = () => {
    if (sepet.length === 0) {
      toast.warning('Boş sepet kaydedilemez!');
      return;
    }
    
    if (!bekleyenSepetAdi.trim()) {
      toast.warning('Lütfen sepet için bir isim girin.');
      return;
    }
    
    const kaydedilecekSepet = {
      id: Date.now().toString(),
      ad: bekleyenSepetAdi,
      sepet: [...sepet],
      olusturmaTarihi: new Date().toISOString(),
      toplamTutar: hesaplamalar.genelToplam
    };
    
    setBekleyenSepetler([...bekleyenSepetler, kaydedilecekSepet]);
        setSepet([]);
    toast.success(`"${bekleyenSepetAdi}" sepeti kaydedildi.`);
    beklemeyeAlModalKapat();
  };
  
  const bekleyenSepetleriGosterModalAc = () => {
    if (bekleyenSepetler.length === 0) {
      toast.info('Bekleyen sepet bulunmamaktadır.');
      return;
    }
    
    setSecilenBekleyenSepet(null);
    setShowBekleyenSepetlerModal(true);
  };
  
  const bekleyenSepetleriGosterModalKapat = () => {
    setShowBekleyenSepetlerModal(false);
    setSecilenBekleyenSepet(null);
    // Modal kapandığında barkod alanına odaklan
    setTimeout(() => {
      barkodInputRef.current?.focus();
    }, 300);
  };
  
  const bekleyenSepetiSec = (index) => {
    setSecilenBekleyenSepet(index);
  };
  
  const bekleyenSepetiYukle = () => {
    if (secilenBekleyenSepet === null) {
      toast.warning('Lütfen bir sepet seçin.');
      return;
    }
    
    // Mevcut sepet dolu ise uyarı ver
    if (sepet.length > 0) {
      if (!window.confirm('Mevcut sepet silinecek ve seçilen bekleyen sepet yüklenecektir. Onaylıyor musunuz?')) {
        return;
      }
    }
    
    const secilenSepet = bekleyenSepetler[secilenBekleyenSepet];
    setSepet([...secilenSepet.sepet]);
    
    // Yüklenen sepeti bekleyen sepetlerden çıkar
    const yeniBekleyenSepetler = bekleyenSepetler.filter((_, i) => i !== secilenBekleyenSepet);
    setBekleyenSepetler(yeniBekleyenSepetler);
    
    toast.success(`"${secilenSepet.ad}" sepeti yüklendi.`);
    bekleyenSepetleriGosterModalKapat();
  };
  
  const bekleyenSepetiSil = (index) => {
    if (window.confirm('Bu sepeti silmek istediğinizden emin misiniz?')) {
      const silinecekSepet = bekleyenSepetler[index];
      const yeniBekleyenSepetler = bekleyenSepetler.filter((_, i) => i !== index);
      setBekleyenSepetler(yeniBekleyenSepetler);
      
      if (yeniBekleyenSepetler.length === 0) {
        bekleyenSepetleriGosterModalKapat();
      } else if (secilenBekleyenSepet === index) {
        setSecilenBekleyenSepet(null);
      }
      
      toast.success(`"${silinecekSepet.ad}" sepeti silindi.`);
    }
  };

  // Bekleyen sepetler için state'ler
  const [showBeklemeyeAlModal, setShowBeklemeyeAlModal] = useState(false);
  const [showBekleyenSepetlerModal, setShowBekleyenSepetlerModal] = useState(false);
  const [bekleyenSepetler, setBekleyenSepetler] = useState([]);
  const [bekleyenSepetAdi, setBekleyenSepetAdi] = useState('');
  const [secilenBekleyenSepet, setSecilenBekleyenSepet] = useState(null);

  // Bekletme modalı açıldığında sepet adı alanına odaklanma
  useEffect(() => {
    if (showBeklemeyeAlModal && sepetAdiInputRef.current) {
      setTimeout(() => {
        sepetAdiInputRef.current.focus();
      }, 300);
    }
  }, [showBeklemeyeAlModal]);

  return (
    <Container fluid className="mt-1">
      <div className="satis-container" style={styles.satisContainer}>
        {/* Sol Taraf - Sepet (yer değiştirildi) */}
        <div className="sepet-container" style={styles.sepetContainer}>
          {/* Sepet özeti - üste taşındı */}
          <div className="sepet-ozet" style={styles.sepetOzet}>
            <div className="d-flex justify-content-between mb-2">
              <span>Ara Toplam:</span>
              <span>{hesaplamalar.araToplam.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>KDV Toplam:</span>
              <span>{hesaplamalar.kdvToplam.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 align-items-center">
              <h5>Genel Toplam:</h5>
              <div className="d-flex align-items-center">
                <h5 className="mb-0">{hesaplamalar.genelToplam.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  className="ms-2" 
                  onClick={() => fiyatModalAc('toplam')}
                  title="Toplam Tutarı Düzenle"
                >
                  <FaEdit />
                </Button>
              </div>
            </div>
            
            <div className="d-grid gap-2">
              <Button 
                variant="success" 
                size="lg" 
                onClick={odemeModalAc} 
                disabled={sepet.length === 0}
              >
                <FaMoneyBill className="me-2" /> Ödeme Al
              </Button>
              <Button 
                variant="outline-danger" 
                onClick={sepetiTemizle} 
                disabled={sepet.length === 0}
              >
                <FaTrash className="me-2" /> Sepeti Temizle
              </Button>
                          </div>
        </div>
        
          {/* Sepetteki ürünler - aşağıya taşındı */}
          <div className="sepet-urunler" style={styles.sepetUrunler}>
            {sepet.length === 0 ? (
              <p className="text-center">Sepet boş</p>
            ) : (
              <Table responsive>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Fiyat</th>
                    <th>Miktar</th>
                    <th>Toplam</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sepet.map((item, index) => {
                    // KDV oranı tanımsızsa 0 kabul et
                    const kdvOrani = item.kdvOrani || 0;
                    // Birim fiyat KDV dahil olduğundan, KDV hariç fiyatı hesapla
                    const birimFiyatHaricKDV = kdvOrani > 0 ? item.birimFiyat / (1 + (kdvOrani / 100)) : item.birimFiyat;
                    const birimKdvTutari = kdvOrani > 0 ? item.birimFiyat - birimFiyatHaricKDV : 0;
                    
                    // Toplam tutarlar
                    const araToplam = birimFiyatHaricKDV * item.miktar;
                    const kdvTutari = birimKdvTutari * item.miktar;
                    const satirToplam = item.birimFiyat * item.miktar; // KDV dahil toplam
                    
                    return (
                      <tr key={index} className="sepet-satir" style={{ cursor: 'pointer' }}>
                        <td onClick={() => fiyatModalAc(index)}>
                          <div>
                            <div>{item.ad}</div>
                            <small className="text-muted">{item.barkod}</small>
                          </div>
                        </td>
                        <td onClick={() => fiyatModalAc(index)}>
                          <div className="d-flex align-items-center">
                          {item.birimFiyat.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="ms-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                fiyatModalAc(index);
                              }}
                            >
                              <FaEdit />
                            </Button>
                          </div>
                          <small className="text-muted">KDV: %{kdvOrani}</small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button 
                              variant="outline-secondary" 
                              size="sm" 
                              onClick={() => miktarAzalt(index)}
                            >
                              <FaMinus />
                            </Button>
                            <span className="mx-2">{item.miktar}</span>
                            <Button 
                              variant="outline-secondary" 
                              size="sm" 
                              onClick={() => miktarArtir(index)}
                            >
                              <FaPlus />
                            </Button>
                          </div>
                        </td>
                        <td onClick={() => fiyatModalAc(index)}>
                          {satirToplam.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => urunCikar(index)}
                              title="Satırı Sil"
                          >
                            <FaTrash />
                          </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>
          </div>
          
        {/* Sağ Taraf - Ürünler ve Arama (yer değiştirildi) */}
        <div className="urun-container" style={styles.urunContainer}>
          <Form onSubmit={urunAraVeEkle} className="mb-3">
            <div className="d-flex align-items-center">
              <div className="d-flex me-2">
                <Button 
                  variant="warning"
                  className="me-2"
                  onClick={beklemeyeAlModalAc}
                  title="Sepeti Beklet"
                >
                  <FaPause className="me-1" /> Beklet
                </Button>
                <Button 
                  variant="info"
                  onClick={bekleyenSepetleriGosterModalAc}
                  title="Bekleyen Sepeti Çağır"
                >
                  <FaShoppingCart className="me-1" /> Çağır
                </Button>
              </div>
              <div className="flex-grow-1">
                <Form.Group className="mb-0">
                  <Form.Label className="fw-bold small mb-1">Barkod ile Ürün Ekle</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      placeholder="Barkod okutun..."
                      className="barkod-input"
                      value={barkod}
                      onChange={handleBarkodChange}
                      ref={barkodInputRef}
                      disabled={yukleniyor}
                    />
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="ms-2" 
                      disabled={yukleniyor || !barkod.trim()}
                    >
                      <FaBarcode className="me-1" /> Ekle
                    </Button>
                  </div>
                </Form.Group>
              </div>
            </div>
          </Form>
          
          <Card className="mb-4" style={{ height: 'calc(100% - 80px)' }}>
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
              <div className="fw-bold">Kategoriler ve Ürünler</div>
              <Form.Check 
                type="switch"
                id="vitrin-switch"
                label="Sadece Vitrin"
                checked={sadecVitrin}
                onChange={(e) => setSadecVitrin(e.target.checked)}
              />
            </Card.Header>
            <Card.Body className="p-0" style={{ overflow: 'hidden', height: 'calc(100% - 55px)' }}>
              {/* Kategori ve Alt Kategori Seçimi */}
              <div className="kategori-secim" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Ana Kategori Seçimi */}
                <div className="kategori-liste border-bottom" style={styles.kategoriListe}>
                  <div className="kategori-baslik bg-primary text-white p-2">
                    <FaTags className="me-2" /> Ana Kategoriler
                  </div>
                  <Nav variant="pills" className="flex-row flex-nowrap overflow-auto p-2">
                    <Nav.Item>
                      <Nav.Link 
                        active={secilenKategoriId === null} 
                        onClick={() => handleKategoriChange(null)}
                        className="text-nowrap"
                      >
                        Tümü
                      </Nav.Link>
                    </Nav.Item>
                    {kategoriler.map(kategori => (
                      <Nav.Item key={kategori.id}>
                        <Nav.Link 
                          active={secilenKategoriId === kategori.id} 
                          onClick={() => handleKategoriChange(kategori.id)}
                          className="text-nowrap"
                        >
                          {kategori.ad}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                </div>
                
                {/* Alt Kategori Seçimi - Sadece Ana Kategori Seçiliyse Göster */}
                {secilenKategoriId && (
                  <div className="alt-kategori-liste border-bottom" style={styles.altKategoriListe}>
                    <div className="kategori-baslik bg-info text-white p-2">
                      <FaLayerGroup className="me-2" /> Alt Kategoriler
                    </div>
                    <Nav variant="pills" className="flex-row flex-nowrap overflow-auto p-2">
                      <Nav.Item>
                        <Nav.Link 
                          active={secilenAltKategoriId === null} 
                          onClick={() => handleAltKategoriChange(null)}
                          className="text-nowrap"
                        >
                          Tümü
                        </Nav.Link>
                      </Nav.Item>
                      {altKategoriler.map(altKategori => (
                        <Nav.Item key={altKategori.id}>
                          <Nav.Link 
                            active={secilenAltKategoriId === altKategori.id} 
                            onClick={() => handleAltKategoriChange(altKategori.id)}
                            className="text-nowrap"
                          >
                            {altKategori.ad}
                          </Nav.Link>
                        </Nav.Item>
                      ))}
                    </Nav>
                  </div>
                )}
                
                {/* Ürün Listesi */}
                <div className="urun-liste p-3" style={styles.urunListe}>
                  {yukleniyor ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                      </div>
                    </div>
                  ) : filtrelenmisUrunler.length === 0 ? (
                    <div className="alert alert-info">
                      {secilenKategoriId 
                        ? secilenAltKategoriId 
                          ? 'Bu alt kategoride ürün bulunmuyor.' 
                          : 'Bu kategoride ürün bulunmuyor.'
                        : 'Henüz ürün bulunmamaktadır.'}
                    </div>
                  ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                      {filtrelenmisUrunler.map(urun => (
                        <div key={urun.id} className="col">
                          <Card 
                            className={`h-100 ${urun.vitrin ? 'border-primary' : ''}`} 
                            onClick={() => hizliUrunEkle(urun)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Card.Body>
                              <h6>{urun.ad} {urun.vitrin && <span className="badge bg-primary">Vitrin</span>}</h6>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  <FaBarcode className="me-1" /> {urun.barkod}
                                </small>
                                <span className="badge bg-primary">
                                  {parseFloat(urun.fiyat).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mt-2">
                                <small className="text-muted">Stok: {urun.stokMiktari} {urun.birim}</small>
                                <small className="text-muted">KDV: %{urun.kdvOrani}</small>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
      
      {/* Ödeme Modal */}
      <Modal show={showOdemeModal} onHide={odemeModalKapat} backdrop="static" keyboard={false} size="lg" className="odeme-modal">
        <Modal.Body className="pt-3 position-relative">
          <button 
            type="button" 
            className="btn-close position-absolute" 
            style={{ top: "8px", right: "15px", zIndex: "1050" }} 
            onClick={odemeModalKapat}
            aria-label="Kapat"
          />
          <Form>
            {/* Toplam Tutar - En üstte */}
            <div className="alert alert-primary mb-3 py-2 pr-4">
              <div className="d-flex justify-content-between align-items-center fs-4">
                <strong>Toplam Tutar:</strong>
                <strong style={{ marginRight: "20px" }}>{hesaplamalar.genelToplam.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</strong>
              </div>
            </div>
            
            {/* Butonlar - İkinci sırada */}
            <div className="d-flex gap-2 mb-3">
              <Button 
                variant="success" 
                size="md"
                className="flex-grow-1 py-2"
                onClick={satisiTamamla}
                disabled={parcaliOdeme && Math.abs(seciliOdemeTipleri.reduce((sum, odeme) => sum + (parseFloat(odeme.tutar) || 0), 0) - hesaplamalar.genelToplam) > 0.01}
              >
                {parcaliOdeme ? (
                  <>Tahsil Et</>
                ) : odemeYontemi === 'Nakit' ? (
                  <><FaMoneyBill className="me-1" /> Nakit Ödeme Al</>
                ) : (
                  <><FaCreditCard className="me-1" /> Kartla Ödeme Al</>
                )}
              </Button>
              <Button variant="secondary" size="md" onClick={odemeModalKapat}>
                İptal
              </Button>
            </div>
            
            <hr className="my-2" />
            
            {/* Ödeme Yöntemi - Butonların altında */}
            {!parcaliOdeme && (
              <Form.Group className="mb-2">
                <Form.Label className="mb-1 small">Ödeme Yöntemi</Form.Label>
                <div className="d-flex gap-2">
              <Button 
                    variant={odemeYontemi === 'Nakit' ? 'primary' : 'outline-primary'}
                    className={`w-50 py-2 odeme-buton ${odemeYontemi === 'Nakit' ? 'active' : ''}`}
                    onClick={() => setOdemeYontemi('Nakit')}
                  >
                    <FaMoneyBill className="me-1" /> Nakit
                  </Button>
                  <Button
                    variant={odemeYontemi === 'Kredi Kartı' ? 'primary' : 'outline-primary'}
                    className={`w-50 py-2 odeme-buton ${odemeYontemi === 'Kredi Kartı' ? 'active' : ''}`}
                    onClick={() => setOdemeYontemi('Kredi Kartı')}
                  >
                    <FaCreditCard className="me-1" /> Kredi Kartı
              </Button>
            </div>
              </Form.Group>
            )}
            
            {/* Ödenen Tutar ve Para Üstü - Ödeme yönteminin altında */}
            {!parcaliOdeme && odemeYontemi === 'Nakit' && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label className="mb-1 small">Ödenen Tutar (₺)</Form.Label>
                  <Form.Control
                    type="text"
                    value={odenenTutar}
                    onChange={handleOdenenTutarChange}
                    min={hesaplamalar.genelToplam}
                    step="0.01"
                    className="form-control-lg"
                    onFocus={handleInputFocus}
                    ref={odenenTutarInputRef}
                  />
                  
                  {/* Sayısal Tuş Takımı */}
                  <div className="numpad-container mt-3">
                    <div className="numpad-row">
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('7')}>7</Button>
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('8')}>8</Button>
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('9')}>9</Button>
          </div>
                    <div className="numpad-row">
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('4')}>4</Button>
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('5')}>5</Button>
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('6')}>6</Button>
        </div>
                    <div className="numpad-row">
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('1')}>1</Button>
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('2')}>2</Button>
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('3')}>3</Button>
      </div>
                    <div className="numpad-row">
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('0')}>0</Button>
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('.')}>.</Button>
                      <Button variant="light" className="numpad-btn" onClick={() => handleNumpadClick('backspace')}>
                        <FaBackspace />
                      </Button>
                    </div>
                    <div className="numpad-row">
                      <Button 
                        variant="primary" 
                        className="numpad-btn w-100" 
                        onClick={() => {
                          setOdenenTutar(hesaplamalar.genelToplam);
                          setIlkNumpadTiklama(true);
                        }}
                      >
                        Tam Tutar
                      </Button>
                    </div>
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-2">
                  <Form.Label className="mb-1 small">Para Üstü</Form.Label>
                  <Form.Control
                    type="text"
                    value={paraUstu.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    readOnly
                    className="form-control-lg"
                  />
                </Form.Group>
              </>
            )}
            
            {/* Müşteri Bilgileri - Sadece ad alanı */}
            <Form.Group className="mb-2">
              <Form.Label className="mb-1 small">Müşteri Bilgileri (Opsiyonel)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Müşteri Adı"
                className="form-control-lg"
                value={musteri.ad}
                onChange={(e) => setMusteri({ ...musteri, ad: e.target.value })}
              />
            </Form.Group>
            
            <hr className="my-2" />
            
            {/* Parçalı Ödeme - En alta taşındı */}
            <Form.Group className="mb-3">
              <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded">
                <div>
                  <h6 className="mb-0">Parçalı Ödeme</h6>
                  <small className="text-muted">
                    Farklı ödeme tipleriyle bölerek tahsil edin
                  </small>
                </div>
                <Form.Check
                  type="switch"
                  id="parcali-odeme-switch"
                  checked={parcaliOdeme}
                  onChange={(e) => setParcaliOdeme(e.target.checked)}
                  className="form-switch-lg"
                />
              </div>
            </Form.Group>
            
            {parcaliOdeme && (
              <>
                {/* Parçalı Ödeme Tablosu */}
                <Table className="mb-3">
                  <thead>
                    <tr>
                      <th>Ödeme Tipi</th>
                      <th>Tutar</th>
                      <th style={{ width: "80px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {seciliOdemeTipleri.map((odeme, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Select
                            value={odeme.odemeTipiId}
                            onChange={(e) => handleOdemeTipiChange(index, e.target.value)}
                            className="form-select-lg"
                          >
                            {odemeTipleri.map(tip => (
                              <option key={tip.id} value={tip.id}>{tip.ad}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={odeme.tutar}
                            step="0.01"
                            onChange={(e) => handleOdemeTutariChange(index, e.target.value)}
                            className="form-control-lg"
                          />
                        </td>
                        <td>
                          {index === 0 ? (
                            <Button
                              variant="success"
                              size="lg"
                              onClick={odemeTipiEkle}
                              className="w-100"
                            >
                              <FaPlus />
                            </Button>
                          ) : (
                            <Button
                              variant="danger"
                              size="lg"
                              onClick={() => odemeTipiKaldir(index)}
                              className="w-100"
                            >
                              <FaTrash />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>Toplam:</th>
                      <th>
                        {seciliOdemeTipleri.reduce((sum, odeme) => sum + (parseFloat(odeme.tutar) || 0), 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </th>
                      <th></th>
                    </tr>
                    <tr>
                      <th>Genel Toplam:</th>
                      <th>
                        {hesaplamalar.genelToplam.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </th>
                      <th></th>
                    </tr>
                  </tfoot>
                </Table>
                <div className="alert alert-info">
                  Toplam ödeme tutarı ({seciliOdemeTipleri.reduce((sum, odeme) => sum + (parseFloat(odeme.tutar) || 0), 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })})
                  {Math.abs(seciliOdemeTipleri.reduce((sum, odeme) => sum + (parseFloat(odeme.tutar) || 0), 0) - hesaplamalar.genelToplam) > 0.01 ? (
                    <strong className="text-danger"> genel toplam ile eşleşmiyor!</strong>
                  ) : (
                    <strong className="text-success"> genel toplam ile eşleşiyor.</strong>
                  )}
                </div>
              </>
            )}
          </Form>
        </Modal.Body>
      </Modal>

      {/* Fiyat Değiştirme Modal */}
      <Modal show={showFiyatModal} onHide={fiyatModalKapat} backdrop="static" keyboard={false} size="sm" className="fiyat-modal">
        <Modal.Body className="pt-3 position-relative">
          <button 
            type="button" 
            className="btn-close position-absolute" 
            style={{ top: "8px", right: "10px", zIndex: "1050" }} 
            onClick={fiyatModalKapat}
            aria-label="Kapat"
          />
          <Form>
            {/* Ürün Adı */}
            {seciliUrunIndex !== null && sepet[seciliUrunIndex] && (
              <div className="alert alert-info mb-2 py-1">
                <small className="fw-bold">{sepet[seciliUrunIndex].ad}</small>
              </div>
            )}
            
            {/* Fiyat Input */}
            <Form.Group className="mb-2">
              <Form.Label className="mb-1 small">Yeni Fiyat (₺)</Form.Label>
                      <Form.Control
                        type="text"
                value={yeniFiyat}
                onChange={(e) => setYeniFiyat(e.target.value)}
                className="form-control-lg text-center fw-bold"
                onFocus={(e) => {
                  e.target.select();
                  setIlkFiyatTiklama(true);
                }}
                autoFocus
                      />
                    </Form.Group>
            
            {/* Sayısal Tuş Takımı */}
            <div className="numpad-container mt-2">
              <div className="numpad-row">
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('7')}>7</Button>
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('8')}>8</Button>
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('9')}>9</Button>
              </div>
              <div className="numpad-row">
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('4')}>4</Button>
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('5')}>5</Button>
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('6')}>6</Button>
              </div>
              <div className="numpad-row">
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('1')}>1</Button>
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('2')}>2</Button>
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('3')}>3</Button>
              </div>
              <div className="numpad-row">
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('0')}>0</Button>
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('.')}>.</Button>
                <Button variant="light" className="numpad-btn" onClick={() => fiyatNumpadClick('backspace')}>
                  <FaBackspace />
                </Button>
              </div>
              <div className="numpad-row mt-2">
                <Button 
                  variant="success" 
                  className="numpad-btn w-100" 
                  onClick={fiyatGuncelle}
                >
                  <FaCheck className="me-1" /> Onayla
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Bekletme Modal */}
      <Modal show={showBeklemeyeAlModal} onHide={beklemeyeAlModalKapat} backdrop="static" keyboard={false} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Sepeti Beklet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Sepet Adı</Form.Label>
              <Form.Control
                type="text"
                placeholder="Örn: Ahmet Bey, Masa 5, vb."
                value={bekleyenSepetAdi}
                onChange={(e) => setBekleyenSepetAdi(e.target.value)}
                ref={sepetAdiInputRef}
                autoFocus
              />
            </Form.Group>
            <div className="alert alert-info">
              <small>Toplam Tutar: {hesaplamalar.genelToplam.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</small>
              <br />
              <small>Ürün Sayısı: {sepet.length}</small>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={beklemeyeAlModalKapat}>
            İptal
          </Button>
          <Button variant="primary" onClick={sepetiKaydet} disabled={!bekleyenSepetAdi.trim()}>
            <FaPause className="me-1" /> Beklet
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Bekleyen Sepetler Modal */}
      <Modal show={showBekleyenSepetlerModal} onHide={bekleyenSepetleriGosterModalKapat} backdrop="static" keyboard={false} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Bekleyen Sepetler</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex mb-3">
            <Form.Control
              type="text"
              placeholder="Sepet ara..."
              onChange={(e) => {
                // Buraya arama işlevi eklenebilir
              }}
              className="me-2"
            />
            <Button variant="outline-primary">
              <FaSearch />
            </Button>
          </div>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Sepet Adı</th>
                  <th>Tutar</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {bekleyenSepetler.map((sepet, index) => (
                  <tr 
                    key={sepet.id} 
                    onClick={() => bekleyenSepetiSec(index)}
                    className={secilenBekleyenSepet === index ? 'table-primary' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{sepet.ad}</td>
                    <td>{sepet.toplamTutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                    <td>
          <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          bekleyenSepetiSil(index);
                        }}
                        title="Sepeti Sil"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {bekleyenSepetler.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-3">
                      Bekleyen sepet bulunmamaktadır.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={bekleyenSepetleriGosterModalKapat}>
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={bekleyenSepetiYukle}
            disabled={secilenBekleyenSepet === null}
          >
            <FaShoppingCart className="me-1" /> Sepeti Yükle
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SatisEkrani;