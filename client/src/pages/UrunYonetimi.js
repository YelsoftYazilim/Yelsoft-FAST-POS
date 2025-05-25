import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, InputGroup, Dropdown, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBarcode, FaFilter, FaTimes, FaKeyboard } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const UrunYonetimi = () => {
  // State tanımlamaları
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [seciliUrun, setSeciliUrun] = useState(null);
  const [kategoriler, setKategoriler] = useState([]);
  const [altKategoriler, setAltKategoriler] = useState([]);
  const [secilenKategoriId, setSecilenKategoriId] = useState('');
  
  // Kolon filtreleri için state tanımlamaları
  const [filterBarkod, setFilterBarkod] = useState('');
  const [filterUrunAdi, setFilterUrunAdi] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterAltKategori, setFilterAltKategori] = useState('');
  const [filtreUygulanmis, setFiltreUygulanmis] = useState(false);
  const [aktifFiltre, setAktifFiltre] = useState(false); // Filtre işlemi aktif mi?
  const [tumKategoriler, setTumKategoriler] = useState([]);
  const [tumAltKategoriler, setTumAltKategoriler] = useState([]);
  
  // Fiyat aralığı filtreleri için state
  const [filterFiyatMin, setFilterFiyatMin] = useState('');
  const [filterFiyatMax, setFilterFiyatMax] = useState('');
  
  // Form state'i
  const [formData, setFormData] = useState({
    barkod: '',
    ad: '',
    fiyat: '',
    kdvOrani: '',
    stokMiktari: '',
    birim: 'Adet',
    kategoriId: '',
    altKategoriId: '',
    vitrin: false
  });

  // Sanal klavye için yeni state ve ref tanımlamaları
  const [klavyeGoster, setKlavyeGoster] = useState(false); // İlk başta kapalı
  const [aktifInput, setAktifInput] = useState('');
  const klavyeRef = useRef(null);
  
  // Viewport meta tag ayarlarında mobil klavye odaklanmasını optimize edelim
  useEffect(() => {
    // Viewport meta tag ayarlarını güncelle - mobil klavye için
    const viewportTag = document.querySelector('meta[name="viewport"]');
    if (viewportTag) {
      viewportTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, height=device-height';
    }
    
    // Input alanları için otomatik odaklanma davranışı ekle
    const setupInputFocus = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        // Input alanlarını bul
        const inputs = document.querySelectorAll('input, textarea');
        
        // Her inputa özel odaklanma davranışı ekle
        inputs.forEach(input => {
          input.addEventListener('focus', () => {
            // Sayfayı input alanına doğru kaydır
            setTimeout(() => {
              const rect = input.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              window.scrollTo({
                top: scrollTop + rect.top - 150,
                behavior: 'smooth'
              });
            }, 300);
          });
        });
      }
    };
    
    // Modal açıldığında input odaklama davranışını ayarla
    const setupModalInputs = () => {
      if (showModal) {
        setTimeout(setupInputFocus, 500);
      }
    };
    
    setupModalInputs();
    
    return () => {
      // Component unmount olduğunda viewport'u geri döndür
      if (viewportTag) {
        viewportTag.content = 'width=device-width, initial-scale=1.0';
      }
    };
  }, [showModal]); // showModal değiştiğinde bu effect'i yeniden çalıştır

  // Modal show/hide değişikliklerini izle ve klavyeyi kontrol et
  useEffect(() => {
    if (showModal) {
      // Modal açıldığında ilk alana odaklan
      setTimeout(() => {
        const barkodInput = document.querySelector('input[name="barkod"]');
        if (barkodInput) {
          barkodInput.focus();
        }
      }, 300);
    }
  }, [showModal]);

  // Ürünleri getir
  const urunleriGetir = async () => {
    setYukleniyor(true);
    try {
      const response = await api.get('urunler');
      setUrunler(response.data);
      setHata(null);
      
      // Kategorileri ve alt kategorileri çıkart
      const kategorilerSet = new Set();
      const altKategorilerSet = new Set();
      
      response.data.forEach(urun => {
        if (urun.kategoriAdi && urun.kategoriAdi !== '-') {
          kategorilerSet.add(urun.kategoriAdi);
        }
        if (urun.altKategoriAdi && urun.altKategoriAdi !== '-') {
          altKategorilerSet.add(urun.altKategoriAdi);
        }
      });
      
      setTumKategoriler([...kategorilerSet]);
      setTumAltKategoriler([...altKategorilerSet]);
      
    } catch (error) {
      console.error('Ürünleri getirme hatası:', error);
      setHata('Ürünler yüklenirken bir hata oluştu.');
      toast.error('Ürünler yüklenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  // Kategorileri getir
  const kategorileriGetir = async () => {
    try {
      const response = await api.get('kategoriler');
      setKategoriler(response.data);
    } catch (error) {
      console.error('Kategorileri getirme hatası:', error);
      toast.error('Kategoriler yüklenirken bir hata oluştu.');
    }
  };

  // Alt kategorileri getir
  const altKategorileriGetir = async (kategoriId) => {
    if (!kategoriId) {
      setAltKategoriler([]);
      return;
    }
    
    try {
      const response = await api.get(`kategoriler/${kategoriId}/alt-kategoriler`);
      setAltKategoriler(response.data);
    } catch (error) {
      console.error('Alt kategorileri getirme hatası:', error);
      toast.error('Alt kategoriler yüklenirken bir hata oluştu.');
    }
  };

  // Sayfa yüklendiğinde ürünleri ve kategorileri getir
  useEffect(() => {
    urunleriGetir();
    kategorileriGetir();
  }, []);

  // Kategori değiştiğinde alt kategorileri getir
  useEffect(() => {
    if (formData.kategoriId) {
      altKategorileriGetir(formData.kategoriId);
    } else {
      setAltKategoriler([]);
      setFormData({
        ...formData,
        altKategoriId: ''
      });
    }
  }, [formData.kategoriId]);

  // Form değişikliklerini işle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Formu sıfırla
  const formSifirla = () => {
    setFormData({
      barkod: '',
      ad: '',
      fiyat: '',
      kdvOrani: '',
      stokMiktari: '',
      birim: 'Adet',
      kategoriId: '',
      altKategoriId: '',
      vitrin: false
    });
    setDuzenlemeModu(false);
    setSeciliUrun(null);
    setAltKategoriler([]);
  };

  // Modal'ı aç
  const modalAc = () => {
    formSifirla();
    setShowModal(true);
  };

  // Modal'ı kapat
  const modalKapat = () => {
    setShowModal(false);
    formSifirla();
  };

  // Ürün düzenleme modalını aç
  const urunDuzenle = (urun) => {
    setSeciliUrun(urun);
    setFormData({
      barkod: urun.barkod,
      ad: urun.ad,
      fiyat: urun.fiyat,
      kdvOrani: urun.kdvOrani,
      stokMiktari: urun.stokMiktari,
      birim: urun.birim || 'Adet',
      kategoriId: urun.kategoriId || '',
      altKategoriId: urun.altKategoriId || '',
      vitrin: urun.vitrin || false
    });
    
    if (urun.kategoriId) {
      altKategorileriGetir(urun.kategoriId);
    }
    
    setDuzenlemeModu(true);
    setShowModal(true);
  };

  // Ürün kaydet
  const urunKaydet = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formData.barkod || !formData.ad || !formData.fiyat) {
      toast.warning('Lütfen zorunlu alanları doldurun.');
      return;
    }
    
    try {
      // KDV ve stok alanları için varsayılan değerler atayalım
      const gonderilecekVeri = {
        ...formData,
        kdvOrani: formData.kdvOrani || '0',  // KDV girilmezse 0 olarak ayarla
        stokMiktari: formData.stokMiktari || '0'  // Stok girilmezse 0 olarak ayarla
      };

      if (duzenlemeModu && seciliUrun) {
        // Ürün güncelleme - Backend'de id alanını kullanıyoruz
        await api.put(`urunler/${seciliUrun.id}`, gonderilecekVeri);
        toast.success('Ürün başarıyla güncellendi.');
      } else {
        // Yeni ürün ekleme
        await api.post('urunler', gonderilecekVeri);
        toast.success('Ürün başarıyla eklendi.');
      }
      
      // Modal'ı kapat ve ürünleri yeniden getir
      modalKapat();
      urunleriGetir();
    } catch (error) {
      console.error('Ürün kaydetme hatası:', error);
      toast.error(error.response?.data?.hata || 'Ürün kaydedilirken bir hata oluştu.');
    }
  };

  // Ürün silme
  const urunSil = async (urunId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        // Backend'de id alanını kullanıyoruz - Frontend ile tutarlılık sağlandı
        await api.delete(`urunler/${urunId}`);
        toast.success('Ürün başarıyla silindi.');
        urunleriGetir();
      } catch (error) {
        console.error('Ürün silme hatası:', error);
        toast.error('Ürün silinirken bir hata oluştu.');
        // Hata detayı göster
        if (error.response?.data?.hata) {
          toast.error(error.response.data.hata);
        }
      }
    }
  };

  // Filtre değişiklikleri için işleyici
  const handleFilterChange = (e, setterFunc) => {
    setterFunc(e.target.value);
    // Filtreleme işlemi yapılmayacak - sadece değer tutulacak
  };

  // Filtreyi Uygula butonu için işleyici
  const filtreleriUygula = () => {
    setAktifFiltre(true);
    setFiltreUygulanmis(
      filterBarkod !== '' || 
      filterUrunAdi !== '' || 
      filterKategori !== '' || 
      filterAltKategori !== '' ||
      filterFiyatMin !== '' ||
      filterFiyatMax !== ''
    );
  };
  
  // Tüm filtreleri temizle
  const filtreleriTemizle = () => {
    setFilterBarkod('');
    setFilterUrunAdi('');
    setFilterKategori('');
    setFilterAltKategori('');
    setFilterFiyatMin('');
    setFilterFiyatMax('');
    setFiltreUygulanmis(false);
    setAktifFiltre(false);
  };

  // Filtrelenmiş ürünleri göster
  const filtrelenmisUrunler = urunler.filter(urun => {
    // Aktif filtre yoksa tüm ürünleri göster
    if (!aktifFiltre) return true;
    
    const barkodUyusuyor = !filterBarkod || 
      urun.barkod.toLowerCase().includes(filterBarkod.toLowerCase());
    
    const urunAdiUyusuyor = !filterUrunAdi || 
      urun.ad.toLowerCase().includes(filterUrunAdi.toLowerCase());
    
    const kategoriUyusuyor = !filterKategori || 
      (urun.kategoriAdi && urun.kategoriAdi.toLowerCase().includes(filterKategori.toLowerCase()));
    
    const altKategoriUyusuyor = !filterAltKategori || 
      (urun.altKategoriAdi && urun.altKategoriAdi.toLowerCase().includes(filterAltKategori.toLowerCase()));
    
    // Fiyat aralığı kontrolü
    const fiyat = parseFloat(urun.fiyat);
    const fiyatMinUyusuyor = !filterFiyatMin || fiyat >= parseFloat(filterFiyatMin);
    const fiyatMaxUyusuyor = !filterFiyatMax || fiyat <= parseFloat(filterFiyatMax);

    return barkodUyusuyor && urunAdiUyusuyor && kategoriUyusuyor && altKategoriUyusuyor && fiyatMinUyusuyor && fiyatMaxUyusuyor;
  });

  // Klavye için input değişikliği - daha basit hale getirelim
  const handleInputFocus = (inputName) => {
    setAktifInput(inputName);
    setKlavyeGoster(true); // Inputa tıklanınca klavye açılsın
  };
  
  // Klavyeden tuş basıldığında
  const onKeyPress = (button) => {
    // Backspace tuşuna basıldıysa
    if (button === "{bksp}") {
      onKeyPressBackspace();
      return;
    }
    
    // Form alanları için
    if (aktifInput === 'barkod') {
      setFormData({...formData, barkod: formData.barkod + button});
    } else if (aktifInput === 'ad') {
      setFormData({...formData, ad: formData.ad + button});
    } else if (aktifInput === 'fiyat') {
      // Sayısal kontrol - fiyat alanı için sadece sayı ve nokta kabul et
      if (!isNaN(button) || button === '.') {
        // Eğer nokta varsa, ikinci noktayı engelle
        if (button === '.' && formData.fiyat.includes('.')) {
          return;
        }
        setFormData({...formData, fiyat: formData.fiyat + button});
      }
    } 
    // Filtre alanları için
    else if (aktifInput === 'filterBarkod') {
      setFilterBarkod(filterBarkod + button);
    } else if (aktifInput === 'filterUrunAdi') {
      setFilterUrunAdi(filterUrunAdi + button);
    } else if (aktifInput === 'filterKategori') {
      setFilterKategori(filterKategori + button);
    } else if (aktifInput === 'filterAltKategori') {
      setFilterAltKategori(filterAltKategori + button);
    } else if (aktifInput === 'filterFiyatMin') {
      // Sadece sayı ve nokta kabul et
      if (!isNaN(button) || button === '.') {
        if (button === '.' && filterFiyatMin.includes('.')) {
          return;
        }
        setFilterFiyatMin(filterFiyatMin + button);
      }
    } else if (aktifInput === 'filterFiyatMax') {
      if (!isNaN(button) || button === '.') {
        if (button === '.' && filterFiyatMax.includes('.')) {
          return;
        }
        setFilterFiyatMax(filterFiyatMax + button);
      }
    }
  };
  
  // Klavyeden silme tuşu
  const onKeyPressBackspace = () => {
    // Form alanları için
    if (aktifInput === 'barkod') {
      setFormData({...formData, barkod: formData.barkod.slice(0, -1)});
    } else if (aktifInput === 'ad') {
      setFormData({...formData, ad: formData.ad.slice(0, -1)});
    } else if (aktifInput === 'fiyat') {
      setFormData({...formData, fiyat: formData.fiyat.slice(0, -1)});
    }
    // Filtre alanları için
    else if (aktifInput === 'filterBarkod') {
      setFilterBarkod(filterBarkod.slice(0, -1));
    } else if (aktifInput === 'filterUrunAdi') {
      setFilterUrunAdi(filterUrunAdi.slice(0, -1));
    } else if (aktifInput === 'filterKategori') {
      setFilterKategori(filterKategori.slice(0, -1));
    } else if (aktifInput === 'filterAltKategori') {
      setFilterAltKategori(filterAltKategori.slice(0, -1));
    } else if (aktifInput === 'filterFiyatMin') {
      setFilterFiyatMin(filterFiyatMin.slice(0, -1));
    } else if (aktifInput === 'filterFiyatMax') {
      setFilterFiyatMax(filterFiyatMax.slice(0, -1));
    }
  };
  
  // Modal kapanınca klavyeyi gizle
  useEffect(() => {
    if (!showModal) {
      setKlavyeGoster(false);
    }
  }, [showModal]);
  
  // Sayfa alanına dokunulduğunda klavyeyi kapat
  const handlePageTouch = (e) => {
    // Eğer tıklanan alan bir form alanı değilse klavyeyi kapat
    if (!e.target.closest('input') && !e.target.closest('.hg-button') && !e.target.closest('.simple-keyboard')) {
      setKlavyeGoster(false);
    }
  };
  
  // Sayfa tıklamalarını dinle
  useEffect(() => {
    document.addEventListener('click', handlePageTouch);
    return () => {
      document.removeEventListener('click', handlePageTouch);
    };
  }, []);

  // Klavye input odaklanması - daha güçlü hale getirelim
  const setupInputFocusWithKeyboard = () => {
    // setTimeout içinde çalıştırarak DOM'un hazır olmasını sağlayalım
    setTimeout(() => {
      // Tüm filtreleme input alanlarını seçelim
      const filterInputs = document.querySelectorAll('th input[placeholder*="Ara"]');
      
      if (filterInputs && filterInputs.length > 0) {
        console.log(`${filterInputs.length} adet filtre input alanı bulundu`);
        
        // Her bir input alanı için focus event listener ekleyelim
        filterInputs.forEach(input => {
          // Önce eski listener'ları temizleyelim (çift çalıştırmayı önlemek için)
          input.removeEventListener('focus', inputFocusHandler);
          
          // Yeni listener ekleyelim
          input.addEventListener('focus', inputFocusHandler);
          
          // Touch olayları için de ekleyelim (mobil cihazlar için)
          input.removeEventListener('touchstart', inputFocusHandler);
          input.addEventListener('touchstart', inputFocusHandler);
        });
      } else {
        console.log('Filtre input alanları bulunamadı');
      }
    }, 500);
  };
  
  // Input focus handler fonksiyonu
  const inputFocusHandler = (e) => {
    // Hangi input'a odaklanıldığını belirle
    const input = e.target;
    const placeholder = input.placeholder || '';
    
    if (placeholder.includes('Barkod')) {
      handleInputFocus('filterBarkod');
    } else if (placeholder.includes('Ürün Adı')) {
      handleInputFocus('filterUrunAdi');
    } else if (placeholder.includes('Kategori')) {
      handleInputFocus('filterKategori');
    } else if (placeholder.includes('Alt Kategori')) {
      handleInputFocus('filterAltKategori');
    }
  };

  // Sayfa yüklendiğinde, filtreler değiştiğinde veya herhangi bir state güncellendiğinde klavye olaylarını ayarla
  useEffect(() => {
    setupInputFocusWithKeyboard();
  }, [urunler, filtreUygulanmis, filterBarkod, filterUrunAdi, filterKategori, filterAltKategori]);

  // Sanal klavye kullanımı için React olay dinleyicilerini ekleyelim
  useEffect(() => {
    // Sayfa ilk yüklendiğinde ve her render'da input olaylarını yeniden bağlayalım
    const inputElements = document.querySelectorAll('th input');
    
    if (inputElements && inputElements.length > 0) {
      inputElements.forEach(el => {
        // click olayı ekleyelim (dokunmatik için)
        el.addEventListener('click', () => {
          const placeholder = el.placeholder || '';
          
          if (placeholder.includes('Barkod')) {
            handleInputFocus('filterBarkod');
          } else if (placeholder.includes('Ürün Adı')) {
            handleInputFocus('filterUrunAdi');
          } else if (placeholder.includes('Kategori')) {
            handleInputFocus('filterKategori');
          } else if (placeholder.includes('Alt Kategori')) {
            handleInputFocus('filterAltKategori');
          }
        });
      });
    }
    
    return () => {
      // Component unmount olduğunda event listener'ları temizleyelim
      const cleanupInputs = document.querySelectorAll('th input');
      if (cleanupInputs && cleanupInputs.length > 0) {
        cleanupInputs.forEach(el => {
          el.removeEventListener('click', () => {});
        });
      }
    };
  }, []); // Sadece component mount olduğunda çalışsın

  return (
    <Container fluid>
      <h1 className="mb-4">Ürün Yönetimi</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={12} className="text-end">
              <Button variant="primary" onClick={modalAc}>
                <FaPlus /> Yeni Ürün Ekle
              </Button>
            </Col>
          </Row>
          
          {/* Aktif filtreler */}
          {filtreUygulanmis && (
            <div className="mb-3">
              <div className="d-flex align-items-center">
                <strong className="me-2">Aktif Filtreler:</strong>
                {filterBarkod && aktifFiltre && (
                  <Badge bg="info" className="me-2 py-2 px-3">
                    Barkod: {filterBarkod}
                    <FaTimes 
                      className="ms-2" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => {
                        setFilterBarkod('');
                        filtreleriUygula();
                      }}
                    />
                  </Badge>
                )}
                {filterUrunAdi && aktifFiltre && (
                  <Badge bg="info" className="me-2 py-2 px-3">
                    Ürün Adı: {filterUrunAdi}
                    <FaTimes 
                      className="ms-2" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => {
                        setFilterUrunAdi('');
                        filtreleriUygula();
                      }}
                    />
                  </Badge>
                )}
                {filterKategori && aktifFiltre && (
                  <Badge bg="info" className="me-2 py-2 px-3">
                    Kategori: {filterKategori} 
                    <FaTimes 
                      className="ms-2" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => {
                        setFilterKategori('');
                        filtreleriUygula();
                      }}
                    />
                  </Badge>
                )}
                {filterAltKategori && aktifFiltre && (
                  <Badge bg="info" className="me-2 py-2 px-3">
                    Alt Kategori: {filterAltKategori}
                    <FaTimes 
                      className="ms-2" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => {
                        setFilterAltKategori('');
                        filtreleriUygula();
                      }}
                    />
                  </Badge>
                )}
                {filterFiyatMin && aktifFiltre && (
                  <Badge bg="info" className="me-2 py-2 px-3">
                    Min Fiyat: {filterFiyatMin} ₺
                    <FaTimes 
                      className="ms-2" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => {
                        setFilterFiyatMin('');
                        filtreleriUygula();
                      }}
                    />
                  </Badge>
                )}
                {filterFiyatMax && aktifFiltre && (
                  <Badge bg="info" className="me-2 py-2 px-3">
                    Max Fiyat: {filterFiyatMax} ₺
                    <FaTimes 
                      className="ms-2" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => {
                        setFilterFiyatMax('');
                        filtreleriUygula();
                      }}
                    />
                  </Badge>
                )}
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={filtreleriTemizle}
                  className="ms-2"
                >
                  Tümünü Temizle
                </Button>
              </div>
            </div>
          )}
          
          {/* Filtre Uygula Butonu */}
          <div className="mb-3 d-flex">
            <Button 
              variant="success" 
              size="sm" 
              onClick={filtreleriUygula}
              className="me-2"
            >
              <FaFilter className="me-1" /> Filtreyi Uygula
            </Button>
            {aktifFiltre && (
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={filtreleriTemizle}
              >
                <FaTimes className="me-1" /> Temizle
              </Button>
            )}
          </div>
          
          {yukleniyor ? (
            <div className="text-center py-4">Yükleniyor...</div>
          ) : hata ? (
            <div className="alert alert-danger">{hata}</div>
          ) : filtrelenmisUrunler.length === 0 ? (
            <div className="alert alert-info">Hiç ürün bulunamadı.</div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Barkod</th>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Alt Kategori</th>
                  <th>Fiyat</th>
                  <th>İşlemler</th>
                </tr>
                <tr>
                  {/* Filtreleme satırı */}
                  <th>
                    <Form.Control
                      type="text"
                      placeholder="Barkod Ara..."
                      value={filterBarkod}
                      onChange={(e) => handleFilterChange(e, setFilterBarkod)}
                      onFocus={() => handleInputFocus('filterBarkod')}
                      onClick={() => handleInputFocus('filterBarkod')}
                      size="sm"
                      data-input-type="filterBarkod"
                    />
                  </th>
                  <th>
                    <Form.Control
                      type="text"
                      placeholder="Ürün Adı Ara..."
                      value={filterUrunAdi}
                      onChange={(e) => handleFilterChange(e, setFilterUrunAdi)}
                      onFocus={() => handleInputFocus('filterUrunAdi')}
                      onClick={() => handleInputFocus('filterUrunAdi')}
                      size="sm"
                      data-input-type="filterUrunAdi"
                    />
                  </th>
                  <th>
                    <Form.Control
                      type="text"
                      placeholder="Kategori Ara..."
                      value={filterKategori}
                      onChange={(e) => handleFilterChange(e, setFilterKategori)}
                      onFocus={() => handleInputFocus('filterKategori')}
                      onClick={() => handleInputFocus('filterKategori')}
                      size="sm"
                      data-input-type="filterKategori"
                    />
                  </th>
                  <th>
                    <Form.Control
                      type="text"
                      placeholder="Alt Kategori Ara..."
                      value={filterAltKategori}
                      onChange={(e) => handleFilterChange(e, setFilterAltKategori)}
                      onFocus={() => handleInputFocus('filterAltKategori')}
                      onClick={() => handleInputFocus('filterAltKategori')}
                      size="sm"
                      data-input-type="filterAltKategori"
                    />
                  </th>
                  <th>
                    <InputGroup size="sm">
                      <Form.Control
                        type="number"
                        placeholder="Min ₺"
                        value={filterFiyatMin}
                        onChange={(e) => handleFilterChange(e, setFilterFiyatMin)}
                        style={{ width: 70 }}
                        min={0}
                        onFocus={() => handleInputFocus('filterFiyatMin')}
                        onClick={() => handleInputFocus('filterFiyatMin')}
                        data-input-type="filterFiyatMin"
                      />
                      <Form.Control
                        type="number"
                        placeholder="Max ₺"
                        value={filterFiyatMax}
                        onChange={(e) => handleFilterChange(e, setFilterFiyatMax)}
                        style={{ width: 70 }}
                        min={0}
                        onFocus={() => handleInputFocus('filterFiyatMax')}
                        onClick={() => handleInputFocus('filterFiyatMax')}
                        data-input-type="filterFiyatMax"
                      />
                    </InputGroup>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrelenmisUrunler.map((urun) => (
                  <tr key={urun.id}>
                    <td>{urun.barkod}</td>
                    <td>{urun.ad}</td>
                    <td>{urun.kategoriAdi || '-'}</td>
                    <td>{urun.altKategoriAdi || '-'}</td>
                    <td>{parseFloat(urun.fiyat).toFixed(2)} ₺</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => urunDuzenle(urun)}>
                        <FaEdit /> Düzenle
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => urunSil(urun.id)}>
                        <FaTrash /> Sil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Ürün Ekleme/Düzenleme Modal */}
      <Modal show={showModal} onHide={modalKapat} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{duzenlemeModu ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={urunKaydet}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formBarkod" className="mb-3">
                  <Form.Label>Barkod *</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Barkod"
                      name="barkod"
                      value={formData.barkod}
                      onChange={handleChange}
                      required
                      inputMode="numeric"
                      enterKeyHint="next"
                      autoComplete="off"
                      autoCorrect="off"
                      onFocus={() => handleInputFocus('barkod')}
                    />
                    <Button variant="outline-secondary">
                      <FaBarcode />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formAd" className="mb-3">
                  <Form.Label>Ürün Adı *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ürün adı"
                    name="ad"
                    value={formData.ad}
                    onChange={handleChange}
                    required
                    inputMode="text"
                    enterKeyHint="next"
                    autoComplete="off"
                    autoCorrect="off"
                    onFocus={() => handleInputFocus('ad')}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formFiyat" className="mb-3">
                  <Form.Label>Fiyat *</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Fiyat"
                      name="fiyat"
                      value={formData.fiyat}
                      onChange={handleChange}
                      required
                      inputMode="decimal"
                      enterKeyHint="done"
                      autoComplete="off"
                      onFocus={() => handleInputFocus('fiyat')}
                    />
                    <InputGroup.Text>₺</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formKategori" className="mb-3">
                  <Form.Label>Kategori</Form.Label>
                  <Form.Select
                    name="kategoriId"
                    value={formData.kategoriId}
                    onChange={(e) => {
                      handleChange(e);
                      setSecilenKategoriId(e.target.value);
                    }}
                  >
                    <option value="">-- Kategori Seçin --</option>
                    {kategoriler.map(kategori => (
                      <option key={kategori.id} value={kategori.id}>
                        {kategori.ad}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formAltKategori" className="mb-3">
                  <Form.Label>Alt Kategori</Form.Label>
                  <Form.Select
                    name="altKategoriId"
                    value={formData.altKategoriId}
                    onChange={handleChange}
                    disabled={!formData.kategoriId}
                  >
                    <option value="">-- Alt Kategori Seçin --</option>
                    {altKategoriler.map(altKat => (
                      <option key={altKat.id} value={altKat.id}>
                        {altKat.ad}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Vitrin</Form.Label>
                  <div className="mt-2">
                    <Form.Check
                      type="checkbox"
                      label="Vitrinde Göster"
                      name="vitrin"
                      checked={formData.vitrin}
                      onChange={(e) => setFormData({...formData, vitrin: e.target.checked})}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            {/* Gizli form alanları - KDV oranı ve stok bilgileri */}
            <div style={{display: 'none'}}>
              <Form.Control
                type="number"
                name="kdvOrani"
                value={formData.kdvOrani}
                onChange={handleChange}
              />
              <Form.Control
                type="number"
                name="stokMiktari"
                value={formData.stokMiktari}
                onChange={handleChange}
              />
              <Form.Select
                name="birim"
                value={formData.birim}
                onChange={handleChange}
              >
                <option value="Adet">Adet</option>
              </Form.Select>
            </div>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={modalKapat}>
                İptal
              </Button>
              <Button variant="primary" type="submit">
                {duzenlemeModu ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Sabit Sanal Klavye - Her zaman görünür */}
      {klavyeGoster && (
        <div className="sanal-klavye-container" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2000,
          background: '#f8f9fa',
          padding: '10px',
          boxShadow: '0px -2px 5px rgba(0,0,0,0.1)'
        }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span><FaKeyboard className="me-2" /> Sanal Klavye</span>
            <div>
              {aktifInput && <Badge bg="primary" className="me-2">Aktif Alan: {aktifInput}</Badge>}
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => setKlavyeGoster(false)}
              >
                Kapat
              </Button>
            </div>
          </div>
          <Keyboard
            keyboardRef={r => (klavyeRef.current = r)}
            layoutName={['fiyat', 'filterFiyatMin', 'filterFiyatMax', 'filterBarkod'].includes(aktifInput) ? 'numeric' : 'default'}
            layout={{
              default: [
                "1 2 3 4 5 6 7 8 9 0 {bksp}",
                "Q W E R T Y U I O P Ğ Ü",
                "A S D F G H J K L Ş İ",
                "Z X C V B N M Ö Ç ."
              ],
              numeric: [
                "1 2 3",
                "4 5 6",
                "7 8 9",
                ". 0 {bksp}"
              ]
            }}
            onKeyPress={onKeyPress}
            display={{
              '{bksp}': '⌫'
            }}
            theme="hg-theme-default hg-layout-default myTheme"
            buttonAttributes={{
              style: {
                fontSize: '1.2rem',
                padding: '10px 8px',
                minWidth: '40px',
                height: '45px'
              }
            }}
          />
        </div>
      )}

      {/* Sayfanın en altında klavye için ek boşluk */}
      <div style={{height: '250px'}}></div>
    </Container>
  );
};

export default UrunYonetimi;