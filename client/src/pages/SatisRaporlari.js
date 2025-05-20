import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert } from 'react-bootstrap';
import { FaSearch, FaFileExport, FaPrint, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const SatisRaporlari = () => {
  // State tanımlamaları
  const [satislar, setSatislar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [ozet, setOzet] = useState({
    toplamSatisSayisi: 0,
    toplamSatisTutari: 0,
    toplamKdvTutari: 0
  });
  
  // Tarih filtreleri
  const [tarihFiltresi, setTarihFiltresi] = useState({
    baslangic: new Date().toISOString().split('T')[0], // Bugün
    bitis: new Date().toISOString().split('T')[0] // Bugün
  });

  // Sayfa yüklendiğinde bugünün satışlarını getir
  useEffect(() => {
    satislariGetir();
  }, []);

  // Tarih değişikliklerini işle
  const handleTarihChange = (e) => {
    const { name, value } = e.target;
    setTarihFiltresi({
      ...tarihFiltresi,
      [name]: value
    });
  };

  // Satışları getir
  const satislariGetir = async () => {
    setYukleniyor(true);
    try {
      const { baslangic, bitis } = tarihFiltresi;
      const response = await axios.get(`/api/satislar/rapor/tarih?baslangic=${baslangic}&bitis=${bitis}`);
      
      setSatislar(response.data.satislar);
      // API'den gelen veriyi doğru şekilde eşleştir
      setOzet({
        toplamSatisSayisi: response.data.rapor.toplamSatisSayisi,
        toplamSatisTutari: response.data.rapor.toplamCiro, 
        toplamKdvTutari: response.data.satislar.reduce((toplam, satis) => toplam + (satis.kdvToplam || 0), 0)
      });
      setHata(null);
    } catch (error) {
      console.error('Satışları getirme hatası:', error);
      setHata('Satış verileri yüklenirken bir hata oluştu.');
      toast.error('Satış verileri yüklenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  // Raporu yazdır
  const raporuYazdir = () => {
    window.print();
  };

  // Raporu dışa aktar (CSV)
  const raporuDisaAktar = () => {
    if (satislar.length === 0) {
      toast.warning('Dışa aktarılacak veri bulunamadı.');
      return;
    }
    
    try {
      // CSV başlıkları
      let csvContent = "Fiş No,Tarih,Ürün Sayısı,Ara Toplam,KDV Toplam,Genel Toplam,Ödeme Yöntemi\n";
      
      // Satış verilerini CSV formatına dönüştür
      satislar.forEach(satis => {
        const satisZamani = new Date(satis.tarih).toLocaleString('tr-TR');
        const urunSayisi = satis.urunler.length;
        const araToplam = satis.araToplam ? satis.araToplam.toFixed(2) : '0.00';
        const kdvToplam = satis.kdvToplam ? satis.kdvToplam.toFixed(2) : '0.00';
        const genelToplam = satis.toplamTutar ? satis.toplamTutar.toFixed(2) : '0.00';
        
        csvContent += `"${satis.fisNo || ''}","${satisZamani}",${urunSayisi},${araToplam},${kdvToplam},${genelToplam},"${satis.odemeYontemi}"\n`;
      });
      
      // CSV dosyasını indir
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `satis_raporu_${tarihFiltresi.baslangic}_${tarihFiltresi.bitis}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Rapor başarıyla dışa aktarıldı.');
    } catch (error) {
      console.error('Dışa aktarma hatası:', error);
      toast.error('Rapor dışa aktarılırken bir hata oluştu.');
    }
  };

  return (
    <Container fluid>
      <h1 className="mb-4">Satış Raporları</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Başlangıç Tarihi</Form.Label>
                  <Form.Control
                    type="date"
                    name="baslangic"
                    value={tarihFiltresi.baslangic}
                    onChange={handleTarihChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Bitiş Tarihi</Form.Label>
                  <Form.Control
                    type="date"
                    name="bitis"
                    value={tarihFiltresi.bitis}
                    onChange={handleTarihChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <div className="d-flex gap-2">
                  <Button variant="primary" onClick={satislariGetir}>
                    <FaSearch className="me-1" /> Filtrele
                  </Button>
                  <Button variant="outline-secondary" onClick={raporuDisaAktar}>
                    <FaFileExport className="me-1" /> Dışa Aktar
                  </Button>
                  <Button variant="outline-secondary" onClick={raporuYazdir}>
                    <FaPrint className="me-1" /> Yazdır
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Toplam Satış Sayısı</h6>
                  <h3>{ozet.toplamSatisSayisi}</h3>
                </div>
                <FaChartBar size={40} className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Toplam KDV Tutarı</h6>
                  <h3>{ozet.toplamKdvTutari.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h3>
                </div>
                <FaChartBar size={40} className="text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Toplam Satış Tutarı</h6>
                  <h3>{ozet.toplamSatisTutari.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h3>
                </div>
                <FaChartBar size={40} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Card.Body>
          <h5 className="mb-3">Satış Listesi</h5>
          
          {yukleniyor ? (
            <div className="text-center py-4">
              <p>Yükleniyor...</p>
            </div>
          ) : hata ? (
            <Alert variant="danger">{hata}</Alert>
          ) : satislar.length === 0 ? (
            <Alert variant="info">Seçilen tarih aralığında satış bulunamadı.</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Fiş No</th>
                    <th>Tarih</th>
                    <th>Ürünler</th>
                    <th>Ara Toplam</th>
                    <th>KDV Toplam</th>
                    <th>Genel Toplam</th>
                    <th>Ödeme Yöntemi</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {satislar.map((satis) => (
                    <tr key={satis.id}>
                      <td>{satis.fisNo || '-'}</td>
                      <td>{new Date(satis.tarih).toLocaleString('tr-TR')}</td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {satis.urunler.map((urun, index) => (
                            <li key={index}>
                              {urun.urunAdi || urun.urunId} x {urun.adet || urun.miktar}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>{(satis.araToplam || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                      <td>{(satis.kdvToplam || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                      <td>{satis.toplamTutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                      <td>{satis.odemeYontemi}</td>
                      <td>
                        <span className={`badge ${satis.odemeDurumu === 'Ödendi' ? 'bg-success' : satis.odemeDurumu === 'İptal Edildi' ? 'bg-danger' : 'bg-warning'}`}>
                          {satis.odemeDurumu || 'Ödendi'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SatisRaporlari;