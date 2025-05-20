import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBarcode } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const UrunYonetimi = () => {
  // State tanımlamaları
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  const [aramaMetni, setAramaMetni] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [seciliUrun, setSeciliUrun] = useState(null);
  const [kategoriler, setKategoriler] = useState([]);
  const [altKategoriler, setAltKategoriler] = useState([]);
  const [secilenKategoriId, setSecilenKategoriId] = useState('');
  
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

  // Ürünleri getir
  const urunleriGetir = async () => {
    setYukleniyor(true);
    try {
      const response = await axios.get('/api/urunler');
      setUrunler(response.data);
      setHata(null);
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
      const response = await axios.get('/api/kategoriler');
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
      const response = await axios.get(`/api/kategoriler/${kategoriId}/alt-kategoriler`);
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
    if (!formData.barkod || !formData.ad || !formData.fiyat || !formData.kdvOrani) {
      toast.warning('Lütfen zorunlu alanları doldurun.');
      return;
    }
    
    try {
      if (duzenlemeModu && seciliUrun) {
        // Ürün güncelleme - Backend'de id alanını kullanıyoruz
        await axios.put(`/api/urunler/${seciliUrun.id}`, formData);
        toast.success('Ürün başarıyla güncellendi.');
      } else {
        // Yeni ürün ekleme
        await axios.post('/api/urunler', formData);
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
        await axios.delete(`/api/urunler/${urunId}`);
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

  // Arama işlemi
  const aramaYap = async () => {
    if (!aramaMetni.trim()) {
      urunleriGetir();
      return;
    }
    
    setYukleniyor(true);
    try {
      const response = await axios.get(`/api/urunler/ara?q=${aramaMetni}`);
      setUrunler(response.data);
    } catch (error) {
      console.error('Arama hatası:', error);
      toast.error('Arama yapılırken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  // Enter tuşuna basıldığında arama yap
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      aramaYap();
    }
  };

  // Filtrelenmiş ürünleri göster
  const filtrelenmisUrunler = urunler;

  return (
    <Container fluid>
      <h1 className="mb-4">Ürün Yönetimi</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  placeholder="Ürün adı, barkod veya kategori ara..."
                  value={aramaMetni}
                  onChange={(e) => setAramaMetni(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button variant="outline-secondary" onClick={aramaYap}>
                  <FaSearch /> Ara
                </Button>
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <Button variant="primary" onClick={modalAc}>
                <FaPlus /> Yeni Ürün Ekle
              </Button>
            </Col>
          </Row>
          
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
                  <th>KDV</th>
                  <th>Stok</th>
                  <th>İşlemler</th>
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
                    <td>%{urun.kdvOrani}</td>
                    <td>{urun.stokMiktari} {urun.birim}</td>
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
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Barkod <span className="text-danger">*</span></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      name="barkod"
                      value={formData.barkod}
                      onChange={handleChange}
                      required
                    />
                    <Button variant="outline-secondary">
                      <FaBarcode />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ürün Adı <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="ad"
                    value={formData.ad}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kategori</Form.Label>
                  <Form.Select
                    name="kategoriId"
                    value={formData.kategoriId}
                    onChange={handleChange}
                  >
                    <option value="">Kategori Seçin</option>
                    {kategoriler.map(kategori => (
                      <option key={kategori.id} value={kategori.id}>
                        {kategori.ad}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Alt Kategori</Form.Label>
                  <Form.Select
                    name="altKategoriId"
                    value={formData.altKategoriId}
                    onChange={handleChange}
                    disabled={!formData.kategoriId}
                  >
                    <option value="">Alt Kategori Seçin</option>
                    {altKategoriler.map(altKategori => (
                      <option key={altKategori.id} value={altKategori.id}>
                        {altKategori.ad}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fiyat <span className="text-danger">*</span></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="fiyat"
                      value={formData.fiyat}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup.Text>₺</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>KDV Oranı <span className="text-danger">*</span></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      name="kdvOrani"
                      value={formData.kdvOrani}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stok Miktarı</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      step="1"
                      min="0"
                      name="stokMiktari"
                      value={formData.stokMiktari}
                      onChange={handleChange}
                    />
                    <Form.Select
                      name="birim"
                      value={formData.birim}
                      onChange={handleChange}
                      style={{ flex: '0 0 auto', width: 'auto' }}
                    >
                      <option value="Adet">Adet</option>
                      <option value="Kg">Kg</option>
                      <option value="Lt">Lt</option>
                      <option value="Paket">Paket</option>
                      <option value="Kutu">Kutu</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Vitrinde Göster"
                name="vitrin"
                checked={formData.vitrin}
                onChange={(e) => setFormData({...formData, vitrin: e.target.checked})}
              />
            </Form.Group>
            
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
    </Container>
  );
};

export default UrunYonetimi;