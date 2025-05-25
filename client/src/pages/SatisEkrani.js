import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Modal, Nav } from 'react-bootstrap';
import { FaBarcode, FaPlus, FaMinus, FaTrash, FaMoneyBill, FaCreditCard, FaPrint, FaTags, FaLayerGroup, FaBackspace, FaEdit, FaCheck, FaPause, FaShoppingCart, FaSearch } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

// CSS stillerini güncelleyelim
const styles = {
  satisContainer: {
    display: 'flex',
    gap: '20px',
    height: 'calc(100vh - 80px)',
    overflow: 'hidden',
    marginTop: '10px'
  },
  urunContainer: {
    flex: '1 0 30%',
    maxWidth: '30%',
    minWidth: '30%',
    overflow: 'auto',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  sepetContainer: {
    flex: '1 0 35%',
    maxWidth: '35%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  vitrinContainer: {
    flex: '1 0 35%',
    maxWidth: '35%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto'
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
    minHeight: '40px'
  },
  altKategoriListe: {
    minHeight: '40px'
  },
  urunListe: {
    height: 'calc(100% - 80px)',
    overflow: 'auto'
  },
  barkodNumpad: {
    marginTop: '5px',
    marginBottom: '10px',
    width: '100%'
  },
  butonContainer: {
    display: 'flex',
    gap: '5px',
    width: '100%',
    marginBottom: '5px'
  },
  butonStyle: {
    flex: 1,
    padding: '5px',
    fontSize: '0.9rem'
  },
  compactForm: {
    marginBottom: '5px'
  },
  vitrinUrunlerContainer: {
    marginTop: '5px',
    marginBottom: '5px',
    height: 'calc(100% - 350px)',
    overflow: 'auto',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    padding: '5px',
    backgroundColor: '#f8f9fa'
  },
  vitrinUrunlerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '5px'
  },
  vitrinUrunCard: {
    padding: '5px',
    textAlign: 'center',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    height: '90px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  // Yeni mobil uyumlu stiller
  mobilBarkodForm: {
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: 100,
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  },
  mobilButtonBar: {
    position: 'sticky',
    top: '60px',
    background: 'white',
    zIndex: 100,
    paddingBottom: '10px',
    borderBottom: '1px solid #eee'
  },
  mobilNumpad: {
    position: 'sticky',
    top: '110px',
    background: 'white',
    zIndex: 99,
    paddingBottom: '10px',
    borderBottom: '1px solid #eee'
  },
  // Mobil cihazlar için yeni stiller
  mobilAyarlar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: '#fff',
    padding: '10px',
    boxShadow: '0px -2px 10px rgba(0,0,0,0.1)',
    maxHeight: '40vh',
    overflow: 'auto'
  },
  inputSpaceForKeyboard: {
    marginBottom: '40vh' // Sanal klavye için boşluk
  },
  klavyeKontrol: {
    position: 'fixed',
    bottom: '40vh',
    right: '10px',
    zIndex: 1001,
    padding: '8px 12px',
    borderRadius: '50%',
    background: '#007bff',
    color: '#fff',
    border: 'none'
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
  
  // Çarpı işareti sonrası girilecek miktar için state
  const [hizliMiktarGirisi, setHizliMiktarGirisi] = useState(false);
  
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
        const urunlerRes = await api.get('urunler');
        setUrunler(urunlerRes.data);
        
        // Kategorileri getir
        const kategorilerRes = await api.get('kategoriler');
        setKategoriler(kategorilerRes.data);
        
        // Ödeme tiplerini getir
        try {
          const odemeTipleriRes = await api.get('odeme-tipleri');
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
        const response = await api.get(`kategoriler/${secilenKategoriId}/alt-kategoriler`);
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
    // Eğer açık bir klavye varsa, aktif elemandan focus'u kaldır
    document.activeElement?.blur();
    
    // Kategori ID'sini güncelle
    setSecilenKategoriId(kategoriId);
  };
  
  // Alt kategori değişikliği
  const handleAltKategoriChange = (altKategoriId) => {
    // Eğer açık bir klavye varsa, aktif elemandan focus'u kaldır
    document.activeElement?.blur();
    
    // Alt kategori ID'sini güncelle
    setSecilenAltKategoriId(altKategoriId);
  };
  
  // Filtrelenmiş ürünleri hesapla
  const filtrelenmisUrunler = urunler.filter(urun => {
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

  // Sadece vitrin ürünlerini filtrele
  const vitrinUrunler = urunler.filter(urun => urun.vitrin === true);

  // Hızlı miktar kontrolü - barkod alanında X işareti ile miktarı kontrol eder
  const getMiktarFromBarkod = () => {
    let miktar = 1;
    
    if (barkod && barkod.includes('X')) {
      const parcalar = barkod.split('X');
      if (parcalar.length >= 1 && !isNaN(parcalar[0]) && parcalar[0].trim() !== '') {
        miktar = parseInt(parcalar[0], 10);
      }
    }
    
    return miktar;
  };

  // Barkod ile ürün ara ve sepete ekle
  const urunAraVeEkle = async (e) => {
    e.preventDefault();
    
    if (!barkod.trim()) {
      toast.warning('Lütfen bir barkod girin.');
      return;
    }
    
    try {
      // Barkodda "X" işareti olup olmadığını kontrol et
      let miktar = 1;
      let gercekBarkod = barkod;
      
      if (barkod.includes('X')) {
        const parcalar = barkod.split('X');
        if (parcalar.length === 2 && !isNaN(parcalar[0]) && parcalar[0].trim() !== '') {
          miktar = parseInt(parcalar[0], 10);
          gercekBarkod = parcalar[1];
        }
      }
      
      // Barkod ile ürün ara
      const response = await api.get(`urunler/barkod/${gercekBarkod}`);
      const urun = response.data;
      
      // Sepete ekle - belirlenen miktarla
      hizliUrunEkle(urun, miktar);
      
      // Başarılı ekleme
      toast.success(`${urun.ad} sepete ${miktar} adet eklendi.`);
      
      // Barkodu temizle ve odaklan
      setBarkod('');
      setHizliMiktarGirisi(false);
      barkodInputRef.current?.focus();
    } catch (error) {
      console.error('Barkod arama hatası:', error);
      toast.error('Ürün bulunamadı veya bir hata oluştu.');
      setBarkod('');
      setHizliMiktarGirisi(false);
      barkodInputRef.current?.focus();
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
  const hizliUrunEkle = async (urun, miktar = 1) => {
    // Stok kontrolü kaldırıldı
    
    // Sepette bu ürün var mı kontrol et
    const sepetIndex = sepet.findIndex(item => item.urunId.toString() === urun.id.toString());
    
    if (sepetIndex !== -1) {
      // Ürün sepette varsa miktarını artır
      const yeniSepet = [...sepet];
      yeniSepet[sepetIndex].miktar += miktar;
      setSepet(yeniSepet);
    } else {
      // Ürün sepette yoksa ekle
      setSepet([...sepet, {
        urunId: urun.id.toString(),
        barkod: urun.barkod,
        ad: urun.ad,
        birimFiyat: Number(parseFloat(urun.fiyat).toFixed(2)),
        kdvOrani: Number(urun.kdvOrani || 0),
        miktar: miktar,
        birim: urun.birim || 'Adet'
      }]);
    }
    
    toast.success(`${urun.ad} sepete ${miktar} adet eklendi.`);
    
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
          odemeTipiId: Number(odeme.odemeTipiId),
          odemeTipiAdi: odeme.odemeTipiAdi.toString(),
          tutar: Number(parseFloat(odeme.tutar).toFixed(2))
        }));
        
        // Satış verisini hazırla
        const satisVerisi = {
          fisNo: `FIS-${Date.now()}`,
          urunler: sepet.map(item => ({
            urunId: parseInt(item.urunId),
            miktar: Number(item.miktar),
            birimFiyat: Number(parseFloat(item.birimFiyat).toFixed(2))
          })),
          toplamTutar: Number(hesaplamalar.genelToplam.toFixed(2)),
          parcaliOdeme: true,
          odemeler: odemeBilgileri,
          odemeYontemi: 'Parçalı Ödeme',
          odemeDurumu: 'Ödendi',
          musteri: musteri.ad ? musteri : undefined
        };
        
        // Satışı kaydet
        console.log('Parçalı Ödeme - Gönderilen veri:', satisVerisi);
        try {
          const response = await api.post('satislar', satisVerisi);
          console.log('API yanıtı:', response);
          
          // Başarılı satış
          toast.success('Parçalı ödeme ile satış başarıyla tamamlandı!');
          
          // Sepeti temizle ve modalı kapat (eğer açıksa)
          setSepet([]);
          setMusteri({ ad: '', telefon: '' });
          if (showOdemeModal) {
            odemeModalKapat();
          }
        } catch (err) {
          console.error('API hatası:', err);
          toast.error(`Satış yapılamadı: ${err.message}`);
          throw err;
        }
      } else {
        // Standart ödeme - Satış verisini hazırla
        const satisVerisi = {
          fisNo: `FIS-${Date.now()}`,
          urunler: sepet.map(item => ({
            urunId: parseInt(item.urunId),
            miktar: Number(item.miktar),
            birimFiyat: Number(parseFloat(item.birimFiyat).toFixed(2))
          })),
          toplamTutar: Number(hesaplamalar.genelToplam.toFixed(2)),
          odemeYontemi: odemeYontemi.toString(),
          odemeDurumu: 'Ödendi',
          musteri: musteri.ad ? musteri : undefined
        };
        
        // Satışı kaydet
        console.log('Nakit/Standart Ödeme - Gönderilen veri:', satisVerisi);
        try {
          const response = await api.post('satislar', satisVerisi);
          console.log('API yanıtı:', response);
          
          // Başarılı satış
          toast.success('Satış başarıyla tamamlandı!');
          
          // Sepeti temizle ve modalı kapat (eğer açıksa)
          setSepet([]);
          setMusteri({ ad: '', telefon: '' });
          if (showOdemeModal) {
            odemeModalKapat();
          }
        } catch (err) {
          console.error('API hatası:', err);
          toast.error(`Satış yapılamadı: ${err.message}`);
          throw err;
        }
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
        birimFiyat: Number((item.birimFiyat * oranFarki).toFixed(2))
      }));
      setSepet(yeniSepet);
      toast.success('Toplam tutar güncellendi.');
    } else {
      // Ürün fiyatını düzenlerken
      const yeniSepet = [...sepet];
      yeniSepet[seciliUrunIndex].birimFiyat = Number(yeniFiyatDeger.toFixed(2));
      setSepet(yeniSepet);
      toast.success('Ürün fiyatı güncellendi.');
    }
    
    fiyatModalKapat();
  };

  // Bekletme Modal
  const beklemeyeAlModalAc = () => {
    if (sepet.length === 0) {
      toast.warning('Bekletmek için önce sepete ürün ekleyin.');
      return;
    }
    
    // Modal açmak yerine direkt sepeti beklet
    const otomatikSepetAdi = `Bekleyen Sepet ${new Date().toLocaleTimeString()}`;
    
    const kaydedilecekSepet = {
      id: Date.now().toString(),
      ad: otomatikSepetAdi,
      sepet: [...sepet],
      olusturmaTarihi: new Date().toISOString(),
      toplamTutar: hesaplamalar.genelToplam,
      urunSayisi: sepet.length // Ürün sayısını ekledim
    };
    
    setBekleyenSepetler([...bekleyenSepetler, kaydedilecekSepet]);
    setSepet([]);
    toast.success(`Sepet beklemeye alındı`);
    
    // Barkod alanına odaklan
    setTimeout(() => {
      barkodInputRef.current?.focus();
    }, 300);
  };
  
  // Bekleyen sepetler modalını aç
  const bekleyenSepetleriGosterModalAc = () => {
    if (bekleyenSepetler.length === 0) {
      toast.info('Bekleyen sepet bulunmamaktadır.');
      return;
    }
    
    setSecilenBekleyenSepet(null);
    setShowBekleyenSepetlerModal(true);
  };
  
  // Bekleyen sepetler modalını kapat
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
  const [showBekleyenSepetlerModal, setShowBekleyenSepetlerModal] = useState(false);
  const [bekleyenSepetler, setBekleyenSepetler] = useState([]);
  const [secilenBekleyenSepet, setSecilenBekleyenSepet] = useState(null);

  // Numpad tuşlarına basıldığında barkod alanına eklemek için yeni fonksiyon
  const barkodNumpadClick = (value) => {
    // Eğer X tuşuna basıldıysa, miktar girişi modunu aktif et
    if (value === 'clear') {
      if (!hizliMiktarGirisi) {
        // Eğer barkod alanında değer varsa ve sayıysa
        if (barkod && !isNaN(barkod)) {
          // X işareti ekle
          setBarkod(prev => prev + 'X');
          setHizliMiktarGirisi(true);
        } else {
          // Eğer barkod alanı boş veya sayı değilse, sadece temizle
          setBarkod('');
        }
      } else {
        // Zaten hızlı miktar girişi modundaysak, barkodu temizle
        setBarkod('');
        setHizliMiktarGirisi(false);
      }
    }
    // Eğer backspace tuşuna basıldıysa, son karakteri sil
    else if (value === 'backspace') {
      setBarkod(prev => {
        const newValue = prev.slice(0, -1);
        // Eğer X işareti silindiyse, miktar girişi modunu kapat
        if (prev.includes('X') && !newValue.includes('X')) {
          setHizliMiktarGirisi(false);
        }
        return newValue;
      });
    }
    // Sayı tuşları
    else {
      setBarkod(prev => prev + value);
    }
    
    // Barkod alanına odaklan
    setTimeout(() => {
      barkodInputRef.current?.focus();
    }, 100);
  };

  // Kategori seçimi tıklamalı işlevler için mobil uyumlu davranışlar ekleyelim
  const handleNavItemClick = (e, callback) => {
    // preventDefault kullanarak varsayılan davranışı engelliyoruz
    e.preventDefault();
    
    // Aktif olan input elemanlarından odağı kaldır
    document.activeElement?.blur();
    
    // İlgili kategori değişikliğini tetikle
    callback();
  };

  // Ürün kartları için tıklama güncelleme
  const handleUrunTikla = (urun) => {
    // Aktif fokus varsa kaldır (sanal klavyeyi gizlemeyi sağlar)
    document.activeElement?.blur();
    
    // Barkodda X işareti ile çarpan var mı kontrol et
    const miktar = getMiktarFromBarkod();
    hizliUrunEkle(urun, miktar);
    
    // İşlem sonrası X işareti ile girişi sıfırla
    if (miktar > 1) {
      setBarkod('');
      setHizliMiktarGirisi(false);
    }
  };

  // Dosyanın başına viewport meta tag'i kontrol eden bir etki ekleyelim
  useEffect(() => {
    // Viewport meta tag'ini bul veya oluştur
    let viewportTag = document.querySelector('meta[name="viewport"]');
    if (!viewportTag) {
      viewportTag = document.createElement('meta');
      viewportTag.name = 'viewport';
      document.head.appendChild(viewportTag);
    }
    
    // Sanal klavyeyi kontrol eden özellikleri ekle
    viewportTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, height=device-height, viewport-fit=cover';
    
    // Sayfanın kaydırılabilir olması için body stil kontrolü
    document.body.style.height = '100%';
    document.body.style.position = 'relative';
    
    return () => {
      // Component unmount olduğunda orijinal viewport ayarına dön
      viewportTag.content = 'width=device-width, initial-scale=1.0';
    };
  }, []);

  // Klavyeyi kapatmak için genel bir fonksiyon ekleyelim
  const closeKeyboard = () => {
    // Aktif olan herhangi bir element varsa odağı kaldır
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // Sayfaya dokunuşlarda klavyeyi kapatmak için fonksiyon
  const handlePageTouch = (e) => {
    // Eğer dokunulan element bir input veya select değilse klavyeyi kapat
    if (
      e.target instanceof HTMLElement && 
      !['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) &&
      !e.target.classList.contains('numpad-btn')
    ) {
      closeKeyboard();
    }
  };

  // Sayfa yüklendiğinde dokunma olayını ekleyelim
  useEffect(() => {
    document.addEventListener('touchstart', handlePageTouch);
    return () => {
      document.removeEventListener('touchstart', handlePageTouch);
    };
  }, []);

  // Komponent içinde, useEffect bölümüne ekleyin
  useEffect(() => {
    // Viewport meta tag ayarlarını güncelle
    const viewportTag = document.querySelector('meta[name="viewport"]');
    if (viewportTag) {
      viewportTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, height=device-height';
    }
    
    // Mobil cihaz kontrolü
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      // Tüm form alanlarını bir kere bul
      const inputs = document.querySelectorAll('input, textarea, select');
      
      // Odaklanma olayını değiştir
      inputs.forEach(input => {
        input.addEventListener('focus', function() {
          // Form elementinin pozisyonunu al
          const rect = this.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          // Elementi görünür alanın üstüne taşı (klavye açılmadan önce)
          window.scrollTo({
            top: scrollTop + rect.top - 100,
            behavior: 'smooth'
          });
        });
      });
      
      // Dokunma ile klavyeyi kapat
      document.addEventListener('touchstart', (e) => {
        if (e.target.tagName !== 'INPUT' && 
            e.target.tagName !== 'TEXTAREA' && 
            e.target.tagName !== 'SELECT' && 
            !e.target.closest('.numpad-container')) {
          // Aktif element varsa, odağı kaldır
          if (document.activeElement && 
              (document.activeElement.tagName === 'INPUT' || 
               document.activeElement.tagName === 'TEXTAREA' || 
               document.activeElement.tagName === 'SELECT')) {
            document.activeElement.blur();
          }
        }
      });
    }
    
    return () => {
      // Temizlik işlemi
      if (viewportTag) {
        viewportTag.content = 'width=device-width, initial-scale=1.0';
      }
    };
  }, []);

  // Barkod form güncelleme - inputMode ve enterKeyHint ekleme
  <Form.Control
    type="text"
    placeholder="Barkod okutun..."
    className="barkod-input"
    value={barkod}
    onChange={handleBarkodChange}
    ref={barkodInputRef}
    disabled={yukleniyor}
    style={{ flex: '1', height: '40px' }}
    inputMode="numeric" // Numerik klavye açılması için
    enterKeyHint="done" // Enter tuşu "done" olarak gösterilsin
  />

  // Kategori ekranı içinde yeni bir fonksiyon ekleyelim
  const handleKategoriInputFocus = (e) => {
    // Mobil cihaz kontrolü
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      // Önce aktif olan input'tan odağı kaldıralım (sanal klavye kapansın)
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      // Sonra sayfayı aşağı kaydıralım
      setTimeout(() => {
        window.scrollTo({ 
          top: document.body.scrollHeight, 
          behavior: 'smooth' 
        });
      }, 100);
    }
  };

  return (
    <Container fluid className="mt-1">
      <div className="satis-container" style={styles.satisContainer}>
        {/* Sol Taraf - Sepet (yer değiştirildi) */}
        <div className="sepet-container" style={styles.sepetContainer}>
          {/* Sepet özeti - üste taşındı */}
          <div className="sepet-ozet" style={styles.sepetOzet}>
            {/* Ara toplam ve KDV toplam kaldırıldı */}
            <div className="d-flex justify-content-between mb-3 align-items-center">
              <h4 className="mb-0">Genel Toplam:</h4>
              <div className="d-flex align-items-center">
                <h3 className="mb-0 fw-bold">{hesaplamalar.genelToplam.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h3>
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
                className="py-3 fw-bold"
                onClick={() => {
                  // Doğrudan nakit ödeme olarak satışı tamamla
                  setOdemeYontemi('Nakit');
                  satisiTamamla();
                }} 
                disabled={sepet.length === 0}
              >
                <FaMoneyBill className="me-2" /> ÖDEME AL
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
          {/* Barkod Form - Sticky/Fixed yapısı */}
          <div style={styles.mobilBarkodForm}>
            <Form onSubmit={urunAraVeEkle} className="mb-2">
              <div className="d-flex align-items-center">
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
                        style={{ flex: '1', height: '40px' }}
                        inputMode="numeric" // Numerik klavye açılması için
                        enterKeyHint="done" // Enter tuşu "done" olarak gösterilsin
                      />
                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="ms-2 barkod-btn" 
                        disabled={yukleniyor || !barkod.trim()}
                        style={{ flex: '0 0 80px', height: '40px' }}
                      >
                        <FaBarcode className="me-1" /> Ekle
                      </Button>
                    </div>
                  </Form.Group>
                </div>
              </div>
            </Form>
          </div>
          
          {/* Beklet ve Çağır butonları - Sticky/Fixed yapısı */}
          <div style={{...styles.butonContainer, ...styles.mobilButtonBar}}>
            <Button 
              variant="warning"
              className="w-100 py-1"
              onClick={beklemeyeAlModalAc}
              title="Sepeti Beklet"
              style={styles.butonStyle}
            >
              <FaPause className="me-1" /> Beklet
            </Button>
            <Button 
              variant="info"
              className="w-100 py-1"
              onClick={bekleyenSepetleriGosterModalAc}
              title="Bekleyen Sepeti Çağır"
              style={styles.butonStyle}
            >
              <FaShoppingCart className="me-1" /> Çağır
            </Button>
          </div>
          
          {/* Numpad - Sticky/Fixed yapısı */}
          <div className="numpad-container barkod-numpad" style={{...styles.barkodNumpad, ...styles.mobilNumpad}}>
            <h6 className="mb-2 text-muted small">Barkod Girişi</h6>
            <div className="numpad-row">
              <Button variant="light" className="numpad-btn" onClick={() => barkodNumpadClick('7')}>7</Button>
              <Button variant="light" className="numpad-btn" onClick={() => barkodNumpadClick('8')}>8</Button>
              <Button variant="light" className="numpad-btn" onClick={() => barkodNumpadClick('9')}>9</Button>
            </div>
            <div className="numpad-row">
              <Button variant="light" className="numpad-btn" onClick={() => barkodNumpadClick('4')}>4</Button>
              <Button variant="light" className="numpad-btn" onClick={() => barkodNumpadClick('5')}>5</Button>
              <Button variant="light" className="numpad-btn" onClick={() => barkodNumpadClick('6')}>6</Button>
            </div>
            <div className="numpad-row">
              <Button variant="light" className="numpad-btn" onClick={() => barkodNumpadClick('1')}>1</Button>
              <Button variant="light" className="numpad-btn" onClick={() => barkodNumpadClick('2')}>2</Button>
              <Button variant="light" className="numpad-btn" onClick={() => barkodNumpadClick('3')}>3</Button>
            </div>
            <div className="numpad-row">
              <Button variant="light" className="numpad-btn" onClick={() => barkodNumpadClick('0')}>0</Button>
              <Button variant="danger" className="numpad-btn" onClick={() => barkodNumpadClick('clear')}>X</Button>
              <Button variant="warning" className="numpad-btn" onClick={() => barkodNumpadClick('backspace')}>
                <FaBackspace />
              </Button>
            </div>
            <div className="numpad-row mt-1">
              <Button 
                variant="success" 
                className="numpad-btn w-100 py-1"
                onClick={(e) => urunAraVeEkle(e)}
              >
                <FaBarcode className="me-1" /> Ekle
              </Button>
            </div>
          </div>
          
          {/* Vitrin Ürünleri - Position değiştirildi */}
          <div style={styles.vitrinUrunlerContainer}>
            <h6 className="mb-2 text-muted small">Vitrin Ürünleri</h6>
            {yukleniyor ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Yükleniyor...</span>
                </div>
              </div>
            ) : vitrinUrunler.length === 0 ? (
              <div className="alert alert-info py-1 small">
                Vitrin ürünü bulunmuyor.
              </div>
            ) : (
              <div style={styles.vitrinUrunlerGrid}>
                {vitrinUrunler.map(urun => (
                  <div 
                    key={urun.id}
                    style={styles.vitrinUrunCard}
                    onClick={() => handleUrunTikla(urun)}
                  >
                    <div className="small fw-bold">{urun.ad.length > 10 ? urun.ad.substring(0, 9) + '...' : urun.ad}</div>
                    <span className="badge bg-primary small">
                      {parseFloat(urun.fiyat).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vitrin/Kategoriler - Sağa taşındı */}
        <div className="vitrin-container" style={styles.vitrinContainer}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
              <div className="fw-bold">Kategoriler ve Ürünler</div>
              {/* Vitrin filteresi kaldırıldı */}
            </Card.Header>
            <Card.Body className="p-0" style={{ overflow: 'hidden', height: 'calc(100% - 55px)' }}>
              {/* Kategori ve Alt Kategori Seçimi */}
              <div className="kategori-secim" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Ana Kategori Seçimi */}
                <div className="kategori-liste border-bottom" style={styles.kategoriListe}>
                  <div className="kategori-baslik bg-primary text-white p-2">
                    <FaTags className="me-2" /> Ana Kategoriler
                  </div>
                  
                  {/* Bu alan kategori seçimlerini içeriyor. 
                     Sanal klavye görünürlüğü için burada özel bir stil uygulayacağız */}
                  <div className="kategori-scroll-container" style={{
                    position: 'relative',
                    zIndex: 100
                  }}>
                    <Nav variant="pills" className="flex-row flex-nowrap overflow-auto p-2" onTouchStart={(e) => e.stopPropagation()}>
                      <Nav.Item>
                        <Nav.Link 
                          active={secilenKategoriId === null} 
                          onClick={(e) => {
                            e.preventDefault();
                            handleKategoriChange(null);
                            document.activeElement?.blur();
                            handleKategoriInputFocus(e); // Yeni fonksiyon ekledik
                          }}
                          className="text-nowrap"
                          tabIndex="-1"
                        >
                          Tümü
                        </Nav.Link>
                      </Nav.Item>
                      {kategoriler.map(kategori => (
                        <Nav.Item key={kategori.id}>
                          <Nav.Link 
                            active={secilenKategoriId === kategori.id} 
                            onClick={(e) => {
                              e.preventDefault();
                              handleKategoriChange(kategori.id);
                              document.activeElement?.blur();
                              handleKategoriInputFocus(e); // Yeni fonksiyon ekledik
                            }}
                            className="text-nowrap"
                            tabIndex="-1"
                          >
                            {kategori.ad}
                          </Nav.Link>
                        </Nav.Item>
                      ))}
                    </Nav>
                  </div>
                </div>
                
                {/* Alt Kategori Seçimi - Sadece Ana Kategori Seçiliyse Göster */}
                {secilenKategoriId && (
                  <div className="alt-kategori-liste border-bottom" style={styles.altKategoriListe}>
                    <div className="kategori-baslik bg-info text-white p-2">
                      <FaLayerGroup className="me-2" /> Alt Kategoriler
                    </div>
                    <Nav variant="pills" className="flex-row flex-nowrap overflow-auto p-2" onTouchStart={(e) => e.stopPropagation()}>
                      <Nav.Item>
                        <Nav.Link 
                          active={secilenAltKategoriId === null} 
                          onClick={(e) => {
                            e.preventDefault();
                            handleAltKategoriChange(null);
                            document.activeElement?.blur();
                            handleKategoriInputFocus(e); // Yeni fonksiyon ekledik
                          }}
                          className="text-nowrap"
                          tabIndex="-1"
                        >
                          Tümü
                        </Nav.Link>
                      </Nav.Item>
                      {altKategoriler.map(altKategori => (
                        <Nav.Item key={altKategori.id}>
                          <Nav.Link 
                            active={secilenAltKategoriId === altKategori.id} 
                            onClick={(e) => {
                              e.preventDefault();
                              handleAltKategoriChange(altKategori.id);
                              document.activeElement?.blur();
                              handleKategoriInputFocus(e); // Yeni fonksiyon ekledik
                            }}
                            className="text-nowrap"
                            tabIndex="-1"
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
                    <div className="row row-cols-1 row-cols-md-1 row-cols-lg-2 g-3">
                      {filtrelenmisUrunler.map(urun => (
                        <div key={urun.id} className="col">
                          <Card 
                            className={`h-100 ${urun.vitrin ? 'border-primary' : ''}`} 
                            onClick={() => handleUrunTikla(urun)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Card.Body>
                              <h6>{urun.ad} {urun.vitrin && <span className="badge bg-primary">Vitrin</span>}</h6>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  <FaBarcode className="me-1" /> {urun.barkod}
                                </small>
                                <span className="badge bg-primary fs-6">
                                  {parseFloat(urun.fiyat).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                </span>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Sayfanın alt kısmında klavye için ekstra boşluk */}
              <div className="keyboard-spacer" style={{ 
                height: '250px', 
                display: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'block' : 'none'
              }}></div>
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
                // autoFocus kaldırıldı
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
      
      {/* Bekleyen Sepetler Modal */}
      <Modal show={showBekleyenSepetlerModal} onHide={bekleyenSepetleriGosterModalKapat} backdrop="static" keyboard={false} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Bekleyen Sepetler</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Sepet Adı</th>
                  <th>Ürün Sayısı</th>
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
                    <td>{sepet.urunSayisi || sepet.sepet.length} ürün</td>
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
                    <td colSpan="4" className="text-center py-3">
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