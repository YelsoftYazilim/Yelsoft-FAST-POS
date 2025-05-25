import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Modal, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const GrupYonetimi = () => {
  // Ana Grup State'leri
  const [anaGruplar, setAnaGruplar] = useState([]);
  const [yeniAnaGrup, setYeniAnaGrup] = useState({ ad: '', aciklama: '' });
  const [duzenleAnaGrup, setDuzenleAnaGrup] = useState(null);
  const [showAnaGrupModal, setShowAnaGrupModal] = useState(false);

  // Alt Grup State'leri
  const [altGruplar, setAltGruplar] = useState([]);
  const [yeniAltGrup, setYeniAltGrup] = useState({ ad: '', anaGrupId: '', aciklama: '' });
  const [duzenleAltGrup, setDuzenleAltGrup] = useState(null);
  const [showAltGrupModal, setShowAltGrupModal] = useState(false);

  // Hata ve Başarı Mesajları
  const [hata, setHata] = useState('');
  const [basari, setBasari] = useState('');

  // Ana Grupları Getir
  const anaGruplariGetir = async () => {
    try {
      const res = await axios.get('/api/ana-gruplar');
      setAnaGruplar(res.data);
    } catch (err) {
      setHata('Ana gruplar yüklenirken bir hata oluştu.');
      console.error(err);
    }
  };

  // Alt Grupları Getir
  const altGruplariGetir = async () => {
    try {
      const res = await axios.get('/api/alt-gruplar');
      setAltGruplar(res.data);
    } catch (err) {
      setHata('Alt gruplar yüklenirken bir hata oluştu.');
      console.error(err);
    }
  };

  // Sayfa Yüklendiğinde Verileri Getir
  useEffect(() => {
    anaGruplariGetir();
    altGruplariGetir();
  }, []);

  // Ana Grup Ekle
  const anaGrupEkle = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!yeniAnaGrup.ad) {
      setHata('Ana grup adı zorunludur');
      return;
    }
    
    try {
      const res = await axios.post('/api/ana-gruplar', yeniAnaGrup);
      console.log('Ana grup ekleme yanıtı:', res.data);
      setYeniAnaGrup({ ad: '', aciklama: '' });
      setShowAnaGrupModal(false);
      anaGruplariGetir();
      setBasari('Ana grup başarıyla eklendi.');
      setTimeout(() => setBasari(''), 3000);
    } catch (err) {
      console.error('Ana grup ekleme hatası:', err);
      setHata(err.response?.data?.hata || 'Ana grup eklenirken bir hata oluştu.');
    }
  };

  // Ana Grup Güncelle
  const anaGrupGuncelle = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/ana-gruplar/${duzenleAnaGrup._id}`, duzenleAnaGrup);
      setDuzenleAnaGrup(null);
      setShowAnaGrupModal(false);
      anaGruplariGetir();
      setBasari('Ana grup başarıyla güncellendi.');
      setTimeout(() => setBasari(''), 3000);
    } catch (err) {
      setHata('Ana grup güncellenirken bir hata oluştu.');
      console.error(err);
    }
  };

  // Ana Grup Sil
  const anaGrupSil = async (id) => {
    if (window.confirm('Bu ana grubu silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`/api/ana-gruplar/${id}`);
        anaGruplariGetir();
        altGruplariGetir(); // İlişkili alt grupları da güncelle
        setBasari('Ana grup başarıyla silindi.');
        setTimeout(() => setBasari(''), 3000);
      } catch (err) {
        setHata('Ana grup silinirken bir hata oluştu. İlişkili alt gruplar olabilir.');
        console.error(err);
      }
    }
  };

  // Alt Grup Ekle
  const altGrupEkle = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/alt-gruplar', yeniAltGrup);
      setYeniAltGrup({ ad: '', anaGrupId: '', aciklama: '' });
      setShowAltGrupModal(false);
      altGruplariGetir();
      setBasari('Alt grup başarıyla eklendi.');
      setTimeout(() => setBasari(''), 3000);
    } catch (err) {
      setHata('Alt grup eklenirken bir hata oluştu.');
      console.error(err);
    }
  };

  // Alt Grup Güncelle
  const altGrupGuncelle = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/alt-gruplar/${duzenleAltGrup._id}`, duzenleAltGrup);
      setDuzenleAltGrup(null);
      setShowAltGrupModal(false);
      altGruplariGetir();
      setBasari('Alt grup başarıyla güncellendi.');
      setTimeout(() => setBasari(''), 3000);
    } catch (err) {
      setHata('Alt grup güncellenirken bir hata oluştu.');
      console.error(err);
    }
  };

  // Alt Grup Sil
  const altGrupSil = async (id) => {
    if (window.confirm('Bu alt grubu silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`/api/alt-gruplar/${id}`);
        altGruplariGetir();
        setBasari('Alt grup başarıyla silindi.');
        setTimeout(() => setBasari(''), 3000);
      } catch (err) {
        setHata('Alt grup silinirken bir hata oluştu.');
        console.error(err);
      }
    }
  };

  return (
    <Container fluid className="mt-3">
      <h2 className="mb-4">Grup Yönetimi</h2>
      
      {hata && <Alert variant="danger">{hata}</Alert>}
      {basari && <Alert variant="success">{basari}</Alert>}
      
      <Row>
        {/* Ana Grup Yönetimi */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Ana Gruplar</h5>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => {
                  setYeniAnaGrup({ ad: '', aciklama: '' });
                  setDuzenleAnaGrup(null);
                  setShowAnaGrupModal(true);
                }}
              >
                <FaPlus /> Yeni Ana Grup
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ana Grup Adı</th>
                    <th>Açıklama</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {anaGruplar.map((grup, index) => (
                    <tr key={grup._id}>
                      <td>{index + 1}</td>
                      <td>{grup.ad}</td>
                      <td>{grup.aciklama}</td>
                      <td>
                        <Button 
                          variant="warning" 
                          size="sm" 
                          className="me-2"
                          onClick={() => {
                            setDuzenleAnaGrup(grup);
                            setShowAnaGrupModal(true);
                          }}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => anaGrupSil(grup._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Alt Grup Yönetimi */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Alt Gruplar</h5>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => {
                  setYeniAltGrup({ ad: '', anaGrupId: '', aciklama: '' });
                  setDuzenleAltGrup(null);
                  setShowAltGrupModal(true);
                }}
                disabled={anaGruplar.length === 0}
              >
                <FaPlus /> Yeni Alt Grup
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Alt Grup Adı</th>
                    <th>Ana Grup</th>
                    <th>Açıklama</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {altGruplar.map((grup, index) => (
                    <tr key={grup._id}>
                      <td>{index + 1}</td>
                      <td>{grup.ad}</td>
                      <td>{grup.anaGrupId?.ad || 'Bilinmiyor'}</td>
                      <td>{grup.aciklama}</td>
                      <td>
                        <Button 
                          variant="warning" 
                          size="sm" 
                          className="me-2"
                          onClick={() => {
                            setDuzenleAltGrup(grup);
                            setShowAltGrupModal(true);
                          }}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => altGrupSil(grup._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Ana Grup Modal */}
      <Modal show={showAnaGrupModal} onHide={() => setShowAnaGrupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{duzenleAnaGrup ? 'Ana Grup Düzenle' : 'Yeni Ana Grup Ekle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={duzenleAnaGrup ? anaGrupGuncelle : anaGrupEkle}>
            <Form.Group className="mb-3">
              <Form.Label>Ana Grup Adı</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ana grup adını girin" 
                value={duzenleAnaGrup ? duzenleAnaGrup.ad : yeniAnaGrup.ad}
                onChange={(e) => {
                  if (duzenleAnaGrup) {
                    setDuzenleAnaGrup({...duzenleAnaGrup, ad: e.target.value});
                  } else {
                    setYeniAnaGrup({...yeniAnaGrup, ad: e.target.value});
                  }
                }}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Açıklama girin (isteğe bağlı)" 
                value={duzenleAnaGrup ? duzenleAnaGrup.aciklama : yeniAnaGrup.aciklama}
                onChange={(e) => {
                  if (duzenleAnaGrup) {
                    setDuzenleAnaGrup({...duzenleAnaGrup, aciklama: e.target.value});
                  } else {
                    setYeniAnaGrup({...yeniAnaGrup, aciklama: e.target.value});
                  }
                }}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {duzenleAnaGrup ? 'Güncelle' : 'Ekle'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Alt Grup Modal */}
      <Modal show={showAltGrupModal} onHide={() => setShowAltGrupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{duzenleAltGrup ? 'Alt Grup Düzenle' : 'Yeni Alt Grup Ekle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={duzenleAltGrup ? altGrupGuncelle : altGrupEkle}>
            <Form.Group className="mb-3">
              <Form.Label>Ana Grup</Form.Label>
              <Form.Select 
                value={duzenleAltGrup ? duzenleAltGrup.anaGrupId : yeniAltGrup.anaGrupId}
                onChange={(e) => {
                  if (duzenleAltGrup) {
                    setDuzenleAltGrup({...duzenleAltGrup, anaGrupId: e.target.value});
                  } else {
                    setYeniAltGrup({...yeniAltGrup, anaGrupId: e.target.value});
                  }
                }}
                required
              >
                <option value="">Ana Grup Seçin</option>
                {anaGruplar.map(grup => (
                  <option key={grup._id} value={grup._id}>{grup.ad}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Alt Grup Adı</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Alt grup adını girin" 
                value={duzenleAltGrup ? duzenleAltGrup.ad : yeniAltGrup.ad}
                onChange={(e) => {
                  if (duzenleAltGrup) {
                    setDuzenleAltGrup({...duzenleAltGrup, ad: e.target.value});
                  } else {
                    setYeniAltGrup({...yeniAltGrup, ad: e.target.value});
                  }
                }}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Açıklama girin (isteğe bağlı)" 
                value={duzenleAltGrup ? duzenleAltGrup.aciklama : yeniAltGrup.aciklama}
                onChange={(e) => {
                  if (duzenleAltGrup) {
                    setDuzenleAltGrup({...duzenleAltGrup, aciklama: e.target.value});
                  } else {
                    setYeniAltGrup({...yeniAltGrup, aciklama: e.target.value});
                  }
                }}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {duzenleAltGrup ? 'Güncelle' : 'Ekle'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default GrupYonetimi;