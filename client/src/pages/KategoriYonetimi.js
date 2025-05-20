import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge, InputGroup, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaLayerGroup, FaTags, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';

const KategoriYonetimi = () => {
  // State tanımları
  const [kategoriler, setKategoriler] = useState([]);
  const [altKategoriler, setAltKategoriler] = useState([]);
  const [secilenKategori, setSecilenKategori] = useState(null);
  const [secilenAltKategori, setSecilenAltKategori] = useState(null);
  
  const [yeniKategori, setYeniKategori] = useState({ ad: '', aciklama: '' });
  const [yeniAltKategori, setYeniAltKategori] = useState({ ad: '', kategoriId: '', aciklama: '' });
  
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [altKategoriDuzenlemeModu, setAltKategoriDuzenlemeModu] = useState(false);
  
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [basarili, setBasarili] = useState(null);
  
  // Kategorileri yükle
  const kategorileriYukle = async () => {
    try {
      setYukleniyor(true);
      const res = await axios.get('/api/kategoriler');
      setKategoriler(res.data);
      setHata(null);
    } catch (err) {
      console.error('Kategoriler yüklenirken hata:', err);
      setHata('Kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };
  
  // Alt kategorileri yükle
  const altKategorileriYukle = async (kategoriId = null) => {
    try {
      setYukleniyor(true);
      let url = '/api/kategoriler/alt-kategori/tumu';
      if (kategoriId) {
        url = `/api/kategoriler/${kategoriId}/alt-kategoriler`;
      }
      const res = await axios.get(url);
      setAltKategoriler(res.data);
      setHata(null);
    } catch (err) {
      console.error('Alt kategoriler yüklenirken hata:', err);
      setHata('Alt kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };
  
  // İlk yükleme
  useEffect(() => {
    kategorileriYukle();
    altKategorileriYukle();
  }, []);
  
  // Başarılı mesajını 3 saniye sonra kaldır
  useEffect(() => {
    if (basarili) {
      const timer = setTimeout(() => {
        setBasarili(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [basarili]);
  
  // Kategori seçme
  const kategoriSec = (kategori) => {
    setSecilenKategori(kategori);
    setYeniAltKategori({ ...yeniAltKategori, kategoriId: kategori.id });
    altKategorileriYukle(kategori.id);
  };
  
  // Kategori ekleme
  const kategoriEkle = async () => {
    try {
      if (!yeniKategori.ad) {
        setHata('Kategori adı boş olamaz');
        return;
      }
      
      setYukleniyor(true);
      let res;
      
      if (duzenlemeModu && secilenKategori) {
        res = await axios.put(`/api/kategoriler/${secilenKategori.id}`, yeniKategori);
        setBasarili('Kategori başarıyla güncellendi');
      } else {
        res = await axios.post('/api/kategoriler', yeniKategori);
        setBasarili('Kategori başarıyla eklendi');
      }
      
      setYeniKategori({ ad: '', aciklama: '' });
      setDuzenlemeModu(false);
      setSecilenKategori(null);
      kategorileriYukle();
    } catch (err) {
      console.error('Kategori eklerken/güncellerken hata:', err);
      setHata('Kategori eklenirken/güncellenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };
  
  // Kategori silme
  const kategoriSil = async (kategoriId) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      setYukleniyor(true);
      await axios.delete(`/api/kategoriler/${kategoriId}`);
      setBasarili('Kategori başarıyla silindi');
      kategorileriYukle();
      setSecilenKategori(null);
    } catch (err) {
      console.error('Kategori silerken hata:', err);
      if (err.response && err.response.status === 400) {
        setHata(err.response.data.mesaj);
      } else {
        setHata('Kategori silinirken bir hata oluştu.');
      }
    } finally {
      setYukleniyor(false);
    }
  };
  
  // Kategori düzenleme
  const kategoriDuzenle = (kategori, e) => {
    if (e) e.stopPropagation();
    setYeniKategori({ ad: kategori.ad, aciklama: kategori.aciklama });
    setSecilenKategori(kategori);
    setDuzenlemeModu(true);
  };
  
  // Alt kategori ekleme
  const altKategoriEkle = async () => {
    try {
      if (!yeniAltKategori.ad) {
        setHata('Alt kategori adı boş olamaz');
        return;
      }
      
      if (!yeniAltKategori.kategoriId) {
        setHata('Lütfen bir kategori seçin');
        return;
      }
      
      setYukleniyor(true);
      let res;
      
      if (altKategoriDuzenlemeModu && secilenAltKategori) {
        res = await axios.put(`/api/kategoriler/alt-kategori/${secilenAltKategori.id}`, yeniAltKategori);
        setBasarili('Alt kategori başarıyla güncellendi');
      } else {
        res = await axios.post('/api/kategoriler/alt-kategori', yeniAltKategori);
        setBasarili('Alt kategori başarıyla eklendi');
      }
      
      setYeniAltKategori({ ad: '', kategoriId: secilenKategori ? secilenKategori.id : '', aciklama: '' });
      setAltKategoriDuzenlemeModu(false);
      setSecilenAltKategori(null);
      
      if (secilenKategori) {
        altKategorileriYukle(secilenKategori.id);
      } else {
        altKategorileriYukle();
      }
    } catch (err) {
      console.error('Alt kategori eklerken/güncellerken hata:', err);
      setHata('Alt kategori eklenirken/güncellenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };
  
  // Alt kategori silme
  const altKategoriSil = async (altKategoriId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bu alt kategoriyi silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      setYukleniyor(true);
      await axios.delete(`/api/kategoriler/alt-kategori/${altKategoriId}`);
      setBasarili('Alt kategori başarıyla silindi');
      
      if (secilenKategori) {
        altKategorileriYukle(secilenKategori.id);
      } else {
        altKategorileriYukle();
      }
      
      setSecilenAltKategori(null);
    } catch (err) {
      console.error('Alt kategori silerken hata:', err);
      setHata('Alt kategori silinirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };
  
  // Alt kategori düzenleme
  const altKategoriDuzenle = (altKategori, e) => {
    if (e) e.stopPropagation();
    setYeniAltKategori({
      ad: altKategori.ad,
      kategoriId: altKategori.kategoriId,
      aciklama: altKategori.aciklama
    });
    setSecilenAltKategori(altKategori);
    setAltKategoriDuzenlemeModu(true);
  };
  
  // Formu temizle
  const formuTemizle = (tip) => {
    if (tip === 'kategori') {
      setYeniKategori({ ad: '', aciklama: '' });
      setDuzenlemeModu(false);
      setSecilenKategori(null);
    } else if (tip === 'altKategori') {
      setYeniAltKategori({
        ad: '',
        kategoriId: secilenKategori ? secilenKategori.id : '',
        aciklama: ''
      });
      setAltKategoriDuzenlemeModu(false);
      setSecilenAltKategori(null);
    }
    setHata(null);
  };
  
  return (
    <Container fluid className="mt-4">
      <h1 className="mb-4">
        <FaTags className="me-2" /> Kategori Yönetimi
      </h1>
      
      {hata && (
        <Alert variant="danger" onClose={() => setHata(null)} dismissible>
          <Alert.Heading>Hata!</Alert.Heading>
          <p>{hata}</p>
        </Alert>
      )}
      
      {basarili && (
        <Alert variant="success" onClose={() => setBasarili(null)} dismissible>
          <Alert.Heading>Başarılı!</Alert.Heading>
          <p>{basarili}</p>
        </Alert>
      )}
      
      <Row className="mb-4">
        {/* Ana Kategori Bölümü */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0"><FaTags className="me-2" /> Ana Kategoriler</h4>
            </Card.Header>
            <Card.Body>
              <Form className="mb-4">
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">{duzenlemeModu ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Kategori Adı <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={yeniKategori.ad}
                        onChange={(e) => setYeniKategori({ ...yeniKategori, ad: e.target.value })}
                        placeholder="Kategori adı"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Açıklama</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={yeniKategori.aciklama}
                        onChange={(e) => setYeniKategori({ ...yeniKategori, aciklama: e.target.value })}
                        placeholder="Açıklama (isteğe bağlı)"
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                      <Button 
                        variant="secondary" 
                        className="me-2" 
                        disabled={yukleniyor}
                        onClick={() => formuTemizle('kategori')}
                      >
                        İptal
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={kategoriEkle}
                        disabled={yukleniyor}
                      >
                        {yukleniyor ? 'İşleniyor...' : duzenlemeModu ? 'Güncelle' : 'Ekle'} <FaPlus className="ms-1" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Form>
              
              {yukleniyor ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                  </div>
                </div>
              ) : kategoriler.length === 0 ? (
                <Alert variant="info">Henüz hiç kategori bulunmuyor.</Alert>
              ) : (
                <ListGroup>
                  {kategoriler.map((kategori) => (
                    <ListGroup.Item
                      key={kategori.id}
                      action
                      active={secilenKategori && secilenKategori.id === kategori.id}
                      onClick={() => kategoriSec(kategori)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{kategori.ad}</strong>
                        {kategori.aciklama && <p className="mb-0 small text-muted">{kategori.aciklama}</p>}
                      </div>
                      <div>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={(e) => kategoriDuzenle(kategori, e)}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            kategoriSil(kategori.id);
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        {/* Alt Kategori Bölümü */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <h4 className="mb-0"><FaLayerGroup className="me-2" /> Alt Kategoriler</h4>
            </Card.Header>
            <Card.Body>
              <Form className="mb-4">
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">{altKategoriDuzenlemeModu ? 'Alt Kategori Düzenle' : 'Yeni Alt Kategori Ekle'}</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Ana Kategori <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        value={yeniAltKategori.kategoriId}
                        onChange={(e) => setYeniAltKategori({ ...yeniAltKategori, kategoriId: e.target.value })}
                      >
                        <option value="">-- Kategori Seçin --</option>
                        {kategoriler.map((kategori) => (
                          <option key={kategori.id} value={kategori.id}>
                            {kategori.ad}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Alt Kategori Adı <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={yeniAltKategori.ad}
                        onChange={(e) => setYeniAltKategori({ ...yeniAltKategori, ad: e.target.value })}
                        placeholder="Alt kategori adı"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Açıklama</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={yeniAltKategori.aciklama}
                        onChange={(e) => setYeniAltKategori({ ...yeniAltKategori, aciklama: e.target.value })}
                        placeholder="Açıklama (isteğe bağlı)"
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                      <Button 
                        variant="secondary" 
                        className="me-2"
                        disabled={yukleniyor}
                        onClick={() => formuTemizle('altKategori')}
                      >
                        İptal
                      </Button>
                      <Button 
                        variant="info" 
                        onClick={altKategoriEkle}
                        disabled={yukleniyor}
                      >
                        {yukleniyor ? 'İşleniyor...' : altKategoriDuzenlemeModu ? 'Güncelle' : 'Ekle'} <FaPlus className="ms-1" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Form>
              
              {secilenKategori && (
                <Alert variant="primary" className="d-flex align-items-center">
                  <div>
                    <strong>Seçili Kategori:</strong> {secilenKategori.ad}
                    <div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 text-decoration-none" 
                        onClick={() => {
                          setSecilenKategori(null);
                          altKategorileriYukle();
                        }}
                      >
                        Tüm Alt Kategorileri Göster
                      </Button>
                    </div>
                  </div>
                </Alert>
              )}
              
              {yukleniyor ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                  </div>
                </div>
              ) : altKategoriler.length === 0 ? (
                <Alert variant="info">
                  {secilenKategori ? 
                    `"${secilenKategori.ad}" kategorisine bağlı alt kategori bulunmuyor.` : 
                    'Henüz hiç alt kategori bulunmuyor.'}
                </Alert>
              ) : (
                <ListGroup>
                  {altKategoriler.map((altKategori) => (
                    <ListGroup.Item
                      key={altKategori.id}
                      action
                      active={secilenAltKategori && secilenAltKategori.id === altKategori.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{altKategori.ad}</strong>
                        {!secilenKategori && (
                          <Badge bg="primary" className="ms-2">
                            {kategoriler.find(k => k.id === parseInt(altKategori.kategoriId))?.ad || 'Kategori Yok'}
                          </Badge>
                        )}
                        {altKategori.aciklama && <p className="mb-0 small text-muted">{altKategori.aciklama}</p>}
                      </div>
                      <div>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={(e) => altKategoriDuzenle(altKategori, e)}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={(e) => altKategoriSil(altKategori.id, e)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default KategoriYonetimi; 