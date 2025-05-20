import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPercentage, FaSave } from 'react-icons/fa';

const FiyatGuncelleme = () => {
  // State tanımlamaları
  const [kategoriler, setKategoriler] = useState([]);
  const [altKategoriler, setAltKategoriler] = useState([]);
  const [secilenKategoriId, setSecilenKategoriId] = useState('');
  const [secilenAltKategoriId, setSecilenAltKategoriId] = useState('');
  const [yuzdeDegisim, setYuzdeDegisim] = useState('');
  const [yukleniyorKategoriler, setYukleniyorKategoriler] = useState(false);
  const [yukleniyorAltKategoriler, setYukleniyorAltKategoriler] = useState(false);
  const [guncellemeYapiliyor, setGuncellemeYapiliyor] = useState(false);
  const [etkilenenUrunSayisi, setEtkilenenUrunSayisi] = useState(0);
  const [basarili, setBasarili] = useState(false);
  
  // Kategorileri getir
  useEffect(() => {
    const kategorileriGetir = async () => {
      try {
        setYukleniyorKategoriler(true);
        const response = await axios.get('/api/kategoriler');
        setKategoriler(response.data);
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
        const response = await axios.get(`/api/kategoriler/${secilenKategoriId}/alt-kategoriler`);
        setAltKategoriler(response.data);
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
  
  // Yüzde değişim girişi
  const handleYuzdeDegisimChange = (e) => {
    // Sadece sayısal veya nokta karakterine izin ver
    const value = e.target.value;
    if (value === '' || /^[-+]?\d*\.?\d*$/.test(value)) {
      setYuzdeDegisim(value);
    }
  };
  
  // Fiyat güncelleme işlemi
  const fiyatlariGuncelle = async () => {
    if (!secilenKategoriId) {
      toast.warning('Lütfen bir kategori seçin.');
      return;
    }
    
    if (yuzdeDegisim === '') {
      toast.warning('Lütfen bir yüzde değişim oranı girin.');
      return;
    }
    
    const yuzdeDegisimFloat = parseFloat(yuzdeDegisim);
    
    if (isNaN(yuzdeDegisimFloat)) {
      toast.warning('Geçerli bir yüzde değişim oranı girin.');
      return;
    }
    
    try {
      setGuncellemeYapiliyor(true);
      setBasarili(false);
      
      // API isteği için parametreler
      const params = {
        kategoriId: secilenKategoriId,
        yuzdeDegisim: yuzdeDegisimFloat
      };
      
      // Alt kategori seçildiyse onu da ekle
      if (secilenAltKategoriId) {
        params.altKategoriId = secilenAltKategoriId;
      }
      
      // Güncelleme işlemi için API isteği
      const response = await axios.post('/api/urunler/fiyat-guncelle', params);
      
      setEtkilenenUrunSayisi(response.data.etkilenenUrunSayisi || 0);
      setBasarili(true);
      
      toast.success(`Fiyatlar başarıyla güncellendi. ${response.data.etkilenenUrunSayisi || 0} adet ürün güncellendi.`);
    } catch (error) {
      console.error('Fiyat güncellerken hata:', error);
      toast.error(error.response?.data?.hata || 'Fiyat güncelleme işlemi sırasında bir hata oluştu.');
    } finally {
      setGuncellemeYapiliyor(false);
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
                        />
                        <span className="input-group-text">%</span>
                      </div>
                      <Form.Text className="text-muted">
                        Pozitif değer fiyat artışı, negatif değer fiyat indirimi yapacaktır.
                      </Form.Text>
                    </Form.Group>
                  </Col>
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
                    disabled={guncellemeYapiliyor || !secilenKategoriId || yuzdeDegisim === ''}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FiyatGuncelleme; 