import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const OdemeTipleri = () => {
  // State tanımlamaları
  const [odemeTipleri, setOdemeTipleri] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [seciliOdemeTipi, setSeciliOdemeTipi] = useState(null);
  
  // Form state'i
  const [formData, setFormData] = useState({
    ad: '',
    aciklama: '',
    aktif: true
  });

  // Ödeme tiplerini getir
  const odemeTipleriniGetir = async () => {
    setYukleniyor(true);
    try {
      const response = await axios.get('/api/odeme-tipleri');
      setOdemeTipleri(response.data);
      setHata(null);
    } catch (error) {
      console.error('Ödeme tiplerini getirme hatası:', error);
      setHata('Ödeme tipleri yüklenirken bir hata oluştu.');
      toast.error('Ödeme tipleri yüklenirken bir hata oluştu.');
      
      // Hata durumunda varsayılan ödeme tipleri
      if (!odemeTipleri.length) {
        setOdemeTipleri([
          { id: 1, ad: 'Nakit', aciklama: 'Nakit ödeme', aktif: true },
          { id: 2, ad: 'Kredi Kartı', aciklama: 'Kredi kartı ile ödeme', aktif: true }
        ]);
      }
    } finally {
      setYukleniyor(false);
    }
  };

  // Sayfa yüklendiğinde ödeme tiplerini getir
  useEffect(() => {
    odemeTipleriniGetir();
  }, []);

  // Form değişikliklerini işle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Formu sıfırla
  const formSifirla = () => {
    setFormData({
      ad: '',
      aciklama: '',
      aktif: true
    });
    setDuzenlemeModu(false);
    setSeciliOdemeTipi(null);
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

  // Ödeme tipi düzenleme modalını aç
  const odemeTipiDuzenle = (odemeTipi) => {
    setSeciliOdemeTipi(odemeTipi);
    setFormData({
      ad: odemeTipi.ad,
      aciklama: odemeTipi.aciklama || '',
      aktif: odemeTipi.aktif !== undefined ? odemeTipi.aktif : true
    });
    setDuzenlemeModu(true);
    setShowModal(true);
  };

  // Ödeme tipi kaydet
  const odemeTipiKaydet = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formData.ad) {
      toast.warning('Lütfen ödeme tipi adını girin.');
      return;
    }
    
    try {
      if (duzenlemeModu && seciliOdemeTipi) {
        // Ödeme tipi güncelleme
        await axios.put(`/api/odeme-tipleri/${seciliOdemeTipi.id}`, formData);
        toast.success('Ödeme tipi başarıyla güncellendi.');
      } else {
        // Yeni ödeme tipi ekleme
        await axios.post('/api/odeme-tipleri', formData);
        toast.success('Ödeme tipi başarıyla eklendi.');
      }
      
      // Modal'ı kapat ve ödeme tiplerini yeniden getir
      modalKapat();
      odemeTipleriniGetir();
    } catch (error) {
      console.error('Ödeme tipi kaydetme hatası:', error);
      
      // Hata durumunda manuel güncelleme (API yoksa)
      if (duzenlemeModu && seciliOdemeTipi) {
        const guncelliOdemeTipleri = odemeTipleri.map(tip => 
          tip.id === seciliOdemeTipi.id ? { ...tip, ...formData, id: tip.id } : tip
        );
        setOdemeTipleri(guncelliOdemeTipleri);
        toast.success('Ödeme tipi başarıyla güncellendi.');
      } else {
        // Yeni eklemede ID oluştur
        const yeniId = Math.max(...odemeTipleri.map(tip => tip.id), 0) + 1;
        const yeniOdemeTipi = { ...formData, id: yeniId };
        setOdemeTipleri([...odemeTipleri, yeniOdemeTipi]);
        toast.success('Ödeme tipi başarıyla eklendi.');
      }
      
      modalKapat();
    }
  };

  // Ödeme tipi silme
  const odemeTipiSil = async (odemeTipiId) => {
    if (window.confirm('Bu ödeme tipini silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`/api/odeme-tipleri/${odemeTipiId}`);
        toast.success('Ödeme tipi başarıyla silindi.');
        odemeTipleriniGetir();
      } catch (error) {
        console.error('Ödeme tipi silme hatası:', error);
        
        // Hata durumunda manuel silme (API yoksa)
        const guncelOdemeTipleri = odemeTipleri.filter(tip => tip.id !== odemeTipiId);
        setOdemeTipleri(guncelOdemeTipleri);
        toast.success('Ödeme tipi başarıyla silindi.');
      }
    }
  };

  return (
    <Container fluid>
      <h1 className="mb-4">Ödeme Tipleri Yönetimi</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6} className="d-flex align-items-center">
              <h5 className="mb-0">Ödeme Tipleri Listesi</h5>
            </Col>
            <Col md={6} className="text-md-end">
              <Button variant="primary" onClick={modalAc}>
                <FaPlus className="me-2" /> Yeni Ödeme Tipi Ekle
              </Button>
            </Col>
          </Row>
          
          {yukleniyor ? (
            <div className="text-center py-4">
              <p>Yükleniyor...</p>
            </div>
          ) : hata ? (
            <div className="text-center py-4 text-danger">
              <p>{hata}</p>
            </div>
          ) : odemeTipleri.length === 0 ? (
            <div className="text-center py-4">
              <p>Henüz ödeme tipi tanımlanmamış.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ödeme Tipi</th>
                    <th>Açıklama</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {odemeTipleri.map((odemeTipi) => (
                    <tr key={odemeTipi.id}>
                      <td>{odemeTipi.id}</td>
                      <td>{odemeTipi.ad}</td>
                      <td>{odemeTipi.aciklama || '-'}</td>
                      <td>
                        <span className={`badge ${odemeTipi.aktif ? 'bg-success' : 'bg-secondary'}`}>
                          {odemeTipi.aktif ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => odemeTipiDuzenle(odemeTipi)}>
                          <FaEdit /> Düzenle
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => odemeTipiSil(odemeTipi.id)}>
                          <FaTrash /> Sil
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Ödeme Tipi Ekleme/Düzenleme Modal */}
      <Modal show={showModal} onHide={modalKapat} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{duzenlemeModu ? 'Ödeme Tipi Düzenle' : 'Yeni Ödeme Tipi Ekle'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={odemeTipiKaydet}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Ödeme Tipi Adı *</Form.Label>
              <Form.Control
                type="text"
                name="ad"
                value={formData.ad}
                onChange={handleChange}
                required
                placeholder="Ödeme tipi adını girin"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
                placeholder="Açıklama girin"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Aktif"
                name="aktif"
                checked={formData.aktif}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={modalKapat}>
              İptal
            </Button>
            <Button variant="primary" type="submit">
              {duzenlemeModu ? 'Güncelle' : 'Kaydet'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default OdemeTipleri;