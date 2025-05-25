import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab, ButtonGroup, ToggleButton, Badge } from 'react-bootstrap';
import { FaPercentage, FaSave, FaSearch, FaBoxOpen, FaLiraSign, FaKeyboard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const FiyatGuncelleme = () => {
  // State tanımlamaları
  const [kategoriler, setKategoriler] = useState([]);
  const [altKategoriler, setAltKategoriler] = useState([]);
  const [secilenKategoriId, setSecilenKategoriId] = useState('');
  const [secilenAltKategoriId, setSecilenAltKategoriId] = useState('');
  const [yuzdeDegisim, setYuzdeDegisim] = useState('');
  const [tutarDegisim, setTutarDegisim] = useState('');
  const [yukleniyorKategoriler, setYukleniyorKategoriler] = useState(false);
  const [yukleniyorAltKategoriler, setYukleniyorAltKategoriler] = useState(false);
  const [guncellemeYapiliyor, setGuncellemeYapiliyor] = useState(false);
  const [etkilenenUrunSayisi, setEtkilenenUrunSayisi] = useState(0);
  const [basarili, setBasarili] = useState(false);
  const [guncellemeTipi, setGuncellemeTipi] = useState('yuzde'); // 'yuzde' veya 'tutar'
  
  // Ürün adına göre güncelleme için state'ler
  const [urunAdi, setUrunAdi] = useState('');
  const [urunAdiYuzdeDegisim, setUrunAdiYuzdeDegisim] = useState('');
  const [urunAdiTutarDegisim, setUrunAdiTutarDegisim] = useState('');
  const [urunAdiGuncellemeTipi, setUrunAdiGuncellemeTipi] = useState('yuzde'); // 'yuzde' veya 'tutar'
  const [urunAdiBulundu, setUrunAdiBulundu] = useState(0);
  const [urunAdiGuncellemeYapiliyor, setUrunAdiGuncellemeYapiliyor] = useState(false);
  const [urunAdiBasarili, setUrunAdiBasarili] = useState(false);
  
  // Tab için state
  const [activeTab, setActiveTab] = useState('kategori');
  
  // Klavye için state ve ref tanımlamaları
  const [klavyeGoster, setKlavyeGoster] = useState(false); // Başlangıçta klavye gizli
  const [aktifInput, setAktifInput] = useState('');
  const klavyeRef = useRef(null);
  
  // Kategorileri getir
  useEffect(() => {
    const kategorileriGetir = async () => {
      try {
        setYukleniyorKategoriler(true);
        const kategorilerResponse = await api.get('kategoriler');
        setKategoriler(kategorilerResponse.data);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
        toast.error('Kategoriler yüklenirken bir hata oluştu.');
      } finally {
        setYukleniyorKategoriler(false);
      }
    };
    
    kategorileriGetir();
  }, []);
  
  // Kategori seçilince alt kategorileri getir
  useEffect(() => {
    const altKategorileriGetir = async () => {
      if (!secilenKategoriId) {
        setAltKategoriler([]);
        return;
      }
      
      try {
        setYukleniyorAltKategoriler(true);
        const altKategorilerResponse = await api.get(`kategoriler/${secilenKategoriId}/alt-kategoriler`);
        setAltKategoriler(altKategorilerResponse.data);
      } catch (error) {
        console.error('Alt kategoriler yüklenirken hata:', error);
        toast.error('Alt kategoriler yüklenirken bir hata oluştu.');
      } finally {
        setYukleniyorAltKategoriler(false);
      }
    };
    
    altKategorileriGetir();
  }, [secilenKategoriId]);
  
  // Kategori değişikliği
  const handleKategoriChange = (e) => {
    const yeniKategoriId = e.target.value;
    setSecilenKategoriId(yeniKategoriId);
    setSecilenAltKategoriId(''); // Alt kategori seçimini sıfırla
  };
  
  // Alt kategori değişikliği
  const handleAltKategoriChange = (e) => {
    setSecilenAltKategoriId(e.target.value);
  };
  
  // Ürün adı değişikliği
  const handleUrunAdiChange = (e) => {
    setUrunAdi(e.target.value);
  };
  
  // Yüzde değişim girişi
  const handleYuzdeDegisimChange = (e) => {
    // Sadece sayısal veya nokta karakterine izin ver
    const value = e.target.value;
    if (value === '' || /^[-+]?\d*\.?\d*$/.test(value)) {
      setYuzdeDegisim(value);
    }
  };
  
  // Tutar değişim girişi
  const handleTutarDegisimChange = (e) => {
    // Sadece sayısal veya nokta karakterine izin ver
    const value = e.target.value;
    if (value === '' || /^[-+]?\d*\.?\d*$/.test(value)) {
      setTutarDegisim(value);
    }
  };
  
  // Ürün adı için yüzde değişim girişi
  const handleUrunAdiYuzdeDegisimChange = (e) => {
    // Sadece sayısal veya nokta karakterine izin ver
    const value = e.target.value;
    if (value === '' || /^[-+]?\d*\.?\d*$/.test(value)) {
      setUrunAdiYuzdeDegisim(value);
    }
  };
  
  // Ürün adı için tutar değişim girişi
  const handleUrunAdiTutarDegisimChange = (e) => {
    // Sadece sayısal veya nokta karakterine izin ver
    const value = e.target.value;
    if (value === '' || /^[-+]?\d*\.?\d*$/.test(value)) {
      setUrunAdiTutarDegisim(value);
    }
  };
  
  // Klavye için input değişikliği
  const handleInputFocus = (inputName) => {
    setAktifInput(inputName);
    setKlavyeGoster(true); // Input'a tıklandığında klavyeyi göster
  };

  // Klavyeden tuş basıldığında
  const onKeyPress = (button) => {
    // Backspace tuşuna basıldıysa
    if (button === "{bksp}") {
      onKeyPressBackspace();
      return;
    }

    // Kategori sekmesi için
    if (aktifInput === 'yuzdeDegisim') {
      if (!isNaN(button) || button === '-' || button === '.') {
        setYuzdeDegisim(yuzdeDegisim + button);
      }
    } else if (aktifInput === 'tutarDegisim') {
      if (!isNaN(button) || button === '-' || button === '.') {
        setTutarDegisim(tutarDegisim + button);
      }
    }
    // Ürün adı sekmesi için
    else if (aktifInput === 'urunAdi') {
      setUrunAdi(urunAdi + button);
    } else if (aktifInput === 'urunAdiYuzdeDegisim') {
      if (!isNaN(button) || button === '-' || button === '.') {
        setUrunAdiYuzdeDegisim(urunAdiYuzdeDegisim + button);
      }
    } else if (aktifInput === 'urunAdiTutarDegisim') {
      if (!isNaN(button) || button === '-' || button === '.') {
        setUrunAdiTutarDegisim(urunAdiTutarDegisim + button);
      }
    }
  };

  // Klavyeden silme tuşu
  const onKeyPressBackspace = () => {
    if (aktifInput === 'yuzdeDegisim') {
      setYuzdeDegisim(yuzdeDegisim.slice(0, -1));
    } else if (aktifInput === 'tutarDegisim') {
      setTutarDegisim(tutarDegisim.slice(0, -1));
    } else if (aktifInput === 'urunAdi') {
      setUrunAdi(urunAdi.slice(0, -1));
    } else if (aktifInput === 'urunAdiYuzdeDegisim') {
      setUrunAdiYuzdeDegisim(urunAdiYuzdeDegisim.slice(0, -1));
    } else if (aktifInput === 'urunAdiTutarDegisim') {
      setUrunAdiTutarDegisim(urunAdiTutarDegisim.slice(0, -1));
    }
  };

  // Klavyeyi kapat
  const klavyeyiKapat = () => {
    setKlavyeGoster(false);
    setAktifInput('');
  };

  // Sayfa alanına dokunulduğunda klavyeyi kapat
  const handlePageTouch = (e) => {
    // Eğer tıklanan alan bir input, klavye tuşu veya klavyenin kendisi değilse klavyeyi kapat
    if (!e.target.closest('input') && !e.target.closest('.hg-button') && !e.target.closest('.simple-keyboard')) {
      klavyeyiKapat();
    }
  };

  // Sayfa tıklamalarını dinle
  useEffect(() => {
    document.addEventListener('click', handlePageTouch);
    return () => {
      document.removeEventListener('click', handlePageTouch);
    };
  }, []);
  
  // Kategoriye göre fiyat güncelleme işlemi
  const fiyatlariGuncelle = async () => {
    if (!secilenKategoriId) {
      toast.warning('Lütfen bir kategori seçin.');
      return;
    }
    
    if (guncellemeTipi === 'yuzde' && yuzdeDegisim === '') {
      toast.warning('Lütfen bir yüzde değişim oranı girin.');
      return;
    }
    
    if (guncellemeTipi === 'tutar' && tutarDegisim === '') {
      toast.warning('Lütfen bir tutar girin.');
      return;
    }
    
    const yuzdeDegisimFloat = guncellemeTipi === 'yuzde' ? parseFloat(yuzdeDegisim) : null;
    const tutarDegisimFloat = guncellemeTipi === 'tutar' ? parseFloat(tutarDegisim) : null;
    
    if ((guncellemeTipi === 'yuzde' && isNaN(yuzdeDegisimFloat)) || 
        (guncellemeTipi === 'tutar' && isNaN(tutarDegisimFloat))) {
      toast.warning('Geçerli bir değer girin.');
      return;
    }
    
    try {
      setGuncellemeYapiliyor(true);
      setBasarili(false);
      
      // API isteği için parametreler
      const params = {
        kategoriId: secilenKategoriId,
        guncellemeTipi: guncellemeTipi
      };
      
      // Alt kategori seçildiyse onu da ekle
      if (secilenAltKategoriId) {
        params.altKategoriId = secilenAltKategoriId;
      }
      
      // Güncelleme tipine göre parametre ekle
      if (guncellemeTipi === 'yuzde') {
        params.yuzdeDegisim = yuzdeDegisimFloat;
      } else {
        params.tutarDegisim = tutarDegisimFloat;
      }
      
      console.log('Gönderilen parametreler:', params);
      
      // Güncelleme işlemi için API isteği
      const fiyatResponse = await api.post('urunler/fiyat-guncelle', params);
      
      setEtkilenenUrunSayisi(fiyatResponse.data.etkilenenUrunSayisi || 0);
      setBasarili(true);
      
      const mesajEki = guncellemeTipi === 'yuzde' ? 
        `%${yuzdeDegisimFloat} oranında` : 
        `${tutarDegisimFloat > 0 ? '+' : ''}${tutarDegisimFloat} ₺ tutarında`;
      
      toast.success(`Fiyatlar başarıyla ${mesajEki} güncellendi. ${fiyatResponse.data.etkilenenUrunSayisi || 0} adet ürün güncellendi.`);
    } catch (error) {
      console.error('Fiyat güncellerken hata:', error);
      toast.error(error.response?.data?.hata || 'Fiyat güncelleme işlemi sırasında bir hata oluştu.');
    } finally {
      setGuncellemeYapiliyor(false);
    }
  };
  
  // Ürün adına göre fiyat güncelleme işlemi
  const urunAdiFiyatlariGuncelle = async () => {
    if (!urunAdi.trim()) {
      toast.warning('Lütfen bir ürün adı girin.');
      return;
    }
    
    if (urunAdiGuncellemeTipi === 'yuzde' && urunAdiYuzdeDegisim === '') {
      toast.warning('Lütfen bir yüzde değişim oranı girin.');
      return;
    }
    
    if (urunAdiGuncellemeTipi === 'tutar' && urunAdiTutarDegisim === '') {
      toast.warning('Lütfen bir tutar girin.');
      return;
    }
    
    const yuzdeDegisimFloat = urunAdiGuncellemeTipi === 'yuzde' ? parseFloat(urunAdiYuzdeDegisim) : null;
    const tutarDegisimFloat = urunAdiGuncellemeTipi === 'tutar' ? parseFloat(urunAdiTutarDegisim) : null;
    
    if ((urunAdiGuncellemeTipi === 'yuzde' && isNaN(yuzdeDegisimFloat)) || 
        (urunAdiGuncellemeTipi === 'tutar' && isNaN(tutarDegisimFloat))) {
      toast.warning('Geçerli bir değer girin.');
      return;
    }
    
    try {
      setUrunAdiGuncellemeYapiliyor(true);
      setUrunAdiBasarili(false);
      
      // API isteği için parametreler
      const params = {
        urunAdi: urunAdi.trim(),
        guncellemeTipi: urunAdiGuncellemeTipi
      };
      
      // Güncelleme tipine göre parametre ekle
      if (urunAdiGuncellemeTipi === 'yuzde') {
        params.yuzdeDegisim = yuzdeDegisimFloat;
      } else {
        params.tutarDegisim = tutarDegisimFloat;
      }
      
      console.log('Gönderilen parametreler:', params);
      
      // Güncelleme işlemi için API isteği
      const fiyatResponse = await api.post('urunler/fiyat-guncelle-urun-adi', params);
      
      setUrunAdiBulundu(fiyatResponse.data.etkilenenUrunSayisi || 0);
      setUrunAdiBasarili(true);
      
      const mesajEki = urunAdiGuncellemeTipi === 'yuzde' ? 
        `%${yuzdeDegisimFloat} oranında` : 
        `${tutarDegisimFloat > 0 ? '+' : ''}${tutarDegisimFloat} ₺ tutarında`;
      
      toast.success(`İsme göre fiyatlar başarıyla ${mesajEki} güncellendi. ${fiyatResponse.data.etkilenenUrunSayisi || 0} adet ürün güncellendi.`);
    } catch (error) {
      console.error('İsme göre fiyat güncellerken hata:', error);
      toast.error(error.response?.data?.hata || 'İsme göre fiyat güncelleme işlemi sırasında bir hata oluştu.');
    } finally {
      setUrunAdiGuncellemeYapiliyor(false);
    }
  };
  
  return (
    <Container fluid className="mt-3">
      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">
              <FaPercentage className="me-2" /> Toplu Fiyat Güncelleme
            </Card.Header>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                id="fiyat-guncelleme-tabs"
                className="mb-4"
              >
                <Tab eventKey="kategori" title="Kategoriye Göre Güncelleme">
                  <Form>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Ana Kategori</Form.Label>
                          <Form.Select 
                            value={secilenKategoriId}
                            onChange={handleKategoriChange}
                            disabled={yukleniyorKategoriler || guncellemeYapiliyor}
                          >
                            <option value="">-- Kategori Seçin --</option>
                            {kategoriler.map(kategori => (
                              <option key={kategori.id} value={kategori.id}>
                                {kategori.ad}
                              </option>
                            ))}
                          </Form.Select>
                          {yukleniyorKategoriler && <small className="text-muted">Yükleniyor...</small>}
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Alt Kategori (Opsiyonel)</Form.Label>
                          <Form.Select 
                            value={secilenAltKategoriId}
                            onChange={handleAltKategoriChange}
                            disabled={!secilenKategoriId || yukleniyorAltKategoriler || guncellemeYapiliyor}
                          >
                            <option value="">-- Tümü --</option>
                            {altKategoriler.map(altKategori => (
                              <option key={altKategori.id} value={altKategori.id}>
                                {altKategori.ad}
                              </option>
                            ))}
                          </Form.Select>
                          {yukleniyorAltKategoriler && <small className="text-muted">Yükleniyor...</small>}
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row className="mb-4">
                      <Col md={12} className="mb-3">
                        <div className="d-flex align-items-center">
                          <span className="me-3">Güncelleme Tipi:</span>
                          <ButtonGroup>
                            <ToggleButton
                              id="kategori-yuzde-radio"
                              type="radio"
                              variant={guncellemeTipi === 'yuzde' ? 'primary' : 'outline-primary'}
                              name="kategori-guncelleme-tipi"
                              value="yuzde"
                              checked={guncellemeTipi === 'yuzde'}
                              onChange={(e) => setGuncellemeTipi(e.currentTarget.value)}
                              disabled={guncellemeYapiliyor}
                            >
                              <FaPercentage className="me-1" /> Yüzde
                            </ToggleButton>
                            <ToggleButton
                              id="kategori-tutar-radio"
                              type="radio"
                              variant={guncellemeTipi === 'tutar' ? 'primary' : 'outline-primary'}
                              name="kategori-guncelleme-tipi"
                              value="tutar"
                              checked={guncellemeTipi === 'tutar'}
                              onChange={(e) => setGuncellemeTipi(e.currentTarget.value)}
                              disabled={guncellemeYapiliyor}
                            >
                              <FaLiraSign className="me-1" /> Tutar
                            </ToggleButton>
                          </ButtonGroup>
                        </div>
                      </Col>
                      
                      {guncellemeTipi === 'yuzde' ? (
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Yüzde Oranı (%)</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type="text"
                                value={yuzdeDegisim}
                                onChange={handleYuzdeDegisimChange}
                                placeholder="Örn: 5 (Artış için), -3 (Azalış için)"
                                disabled={guncellemeYapiliyor}
                                onFocus={() => handleInputFocus('yuzdeDegisim')}
                              />
                              <span className="input-group-text">%</span>
                            </div>
                            <Form.Text className="text-muted">
                              Pozitif değer fiyat artışı, negatif değer fiyat indirimi yapacaktır.
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      ) : (
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Tutar (₺)</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type="text"
                                value={tutarDegisim}
                                onChange={handleTutarDegisimChange}
                                placeholder="Örn: 5 (Artış için), -3 (Azalış için)"
                                disabled={guncellemeYapiliyor}
                                onFocus={() => handleInputFocus('tutarDegisim')}
                              />
                              <span className="input-group-text">₺</span>
                            </div>
                            <Form.Text className="text-muted">
                              Pozitif değer fiyata eklenecek, negatif değer fiyattan çıkarılacaktır.
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      )}
                    </Row>
                    
                    {basarili && (
                      <Alert variant="success" className="mb-4">
                        Fiyat güncelleme işlemi başarıyla tamamlandı! {etkilenenUrunSayisi} adet ürünün fiyatı güncellendi.
                      </Alert>
                    )}
                    
                    <div className="d-flex justify-content-end">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={fiyatlariGuncelle}
                        disabled={guncellemeYapiliyor || 
                          !secilenKategoriId || 
                          (guncellemeTipi === 'yuzde' && yuzdeDegisim === '') ||
                          (guncellemeTipi === 'tutar' && tutarDegisim === '')}
                      >
                        {guncellemeYapiliyor ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Güncelleniyor...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" /> Fiyatları Güncelle
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Tab>
                
                <Tab eventKey="urunAdi" title="Ürün Adına Göre Güncelleme">
                  <Form>
                    <Row className="mb-3">
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label>Ürün Adında Geçen Metin</Form.Label>
                          <Form.Control 
                            type="text"
                            value={urunAdi}
                            onChange={handleUrunAdiChange}
                            placeholder="Örn: HARIBO"
                            disabled={urunAdiGuncellemeYapiliyor}
                            onFocus={() => handleInputFocus('urunAdi')}
                          />
                          <Form.Text className="text-muted">
                            Bu metni içeren tüm ürünlerin fiyatları güncellenecektir.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row className="mb-4">
                      <Col md={12} className="mb-3">
                        <div className="d-flex align-items-center">
                          <span className="me-3">Güncelleme Tipi:</span>
                          <ButtonGroup>
                            <ToggleButton
                              id="urun-adi-yuzde-radio"
                              type="radio"
                              variant={urunAdiGuncellemeTipi === 'yuzde' ? 'primary' : 'outline-primary'}
                              name="urun-adi-guncelleme-tipi"
                              value="yuzde"
                              checked={urunAdiGuncellemeTipi === 'yuzde'}
                              onChange={(e) => setUrunAdiGuncellemeTipi(e.currentTarget.value)}
                              disabled={urunAdiGuncellemeYapiliyor}
                            >
                              <FaPercentage className="me-1" /> Yüzde
                            </ToggleButton>
                            <ToggleButton
                              id="urun-adi-tutar-radio"
                              type="radio"
                              variant={urunAdiGuncellemeTipi === 'tutar' ? 'primary' : 'outline-primary'}
                              name="urun-adi-guncelleme-tipi"
                              value="tutar"
                              checked={urunAdiGuncellemeTipi === 'tutar'}
                              onChange={(e) => setUrunAdiGuncellemeTipi(e.currentTarget.value)}
                              disabled={urunAdiGuncellemeYapiliyor}
                            >
                              <FaLiraSign className="me-1" /> Tutar
                            </ToggleButton>
                          </ButtonGroup>
                        </div>
                      </Col>
                      
                      {urunAdiGuncellemeTipi === 'yuzde' ? (
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Yüzde Oranı (%)</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type="text"
                                value={urunAdiYuzdeDegisim}
                                onChange={handleUrunAdiYuzdeDegisimChange}
                                placeholder="Örn: 5 (Artış için), -3 (Azalış için)"
                                disabled={urunAdiGuncellemeYapiliyor}
                                onFocus={() => handleInputFocus('urunAdiYuzdeDegisim')}
                              />
                              <span className="input-group-text">%</span>
                            </div>
                            <Form.Text className="text-muted">
                              Pozitif değer fiyat artışı, negatif değer fiyat indirimi yapacaktır.
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      ) : (
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Tutar (₺)</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type="text"
                                value={urunAdiTutarDegisim}
                                onChange={handleUrunAdiTutarDegisimChange}
                                placeholder="Örn: 5 (Artış için), -3 (Azalış için)"
                                disabled={urunAdiGuncellemeYapiliyor}
                                onFocus={() => handleInputFocus('urunAdiTutarDegisim')}
                              />
                              <span className="input-group-text">₺</span>
                            </div>
                            <Form.Text className="text-muted">
                              Pozitif değer fiyata eklenecek, negatif değer fiyattan çıkarılacaktır.
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      )}
                    </Row>
                    
                    {urunAdiBasarili && (
                      <Alert variant="success" className="mb-4">
                        <FaBoxOpen className="me-2" /> 
                        Adında "<strong>{urunAdi}</strong>" geçen {urunAdiBulundu} adet ürünün fiyatı başarıyla güncellendi!
                      </Alert>
                    )}
                    
                    <div className="d-flex justify-content-end">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={urunAdiFiyatlariGuncelle}
                        disabled={urunAdiGuncellemeYapiliyor || 
                          !urunAdi.trim() || 
                          (urunAdiGuncellemeTipi === 'yuzde' && urunAdiYuzdeDegisim === '') ||
                          (urunAdiGuncellemeTipi === 'tutar' && urunAdiTutarDegisim === '')}
                      >
                        {urunAdiGuncellemeYapiliyor ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Güncelleniyor...
                          </>
                        ) : (
                          <>
                            <FaSearch className="me-2" /> Bul ve Fiyatları Güncelle
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sabit Sanal Klavye */}
      {klavyeGoster && (
        <div className="sanal-klavye-container" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1050,
          background: '#f8f9fa',
          padding: '10px',
          boxShadow: '0px -2px 5px rgba(0,0,0,0.1)'
        }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span><FaKeyboard className="me-2" /> Sanal Klavye</span>
            <div className="d-flex align-items-center">
              {aktifInput && <Badge bg="primary" className="me-2">Aktif Alan: {aktifInput}</Badge>}
              <Button 
                variant="outline-secondary" 
                size="sm"
                className="me-2"
                onClick={klavyeyiKapat}
              >
                Klavyeyi Kapat
              </Button>
            </div>
          </div>
          
          <Keyboard
            keyboardRef={r => (klavyeRef.current = r)}
            layoutName={aktifInput === 'urunAdi' ? 'default' : 'numeric'}
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
                ". - 0 {bksp}"
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

      {/* Sayfanın en altında klavye için ek boşluk - sadece klavye görünürken ekle */}
      {klavyeGoster && <div style={{height: '250px'}}></div>}
    </Container>
  );
};

export default FiyatGuncelleme; 