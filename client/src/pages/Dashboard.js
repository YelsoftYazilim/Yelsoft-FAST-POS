import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaBoxOpen, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import axios from 'axios';

const Dashboard = () => {
  const [ozet, setOzet] = useState({
    toplamUrun: 0,
    toplamSatis: 0,
    bugunSatisTutar: 0,
    aylikCiro: 0
  });
  const [sonSatislar, setSonSatislar] = useState([]);
  const [stokDurumu, setStokDurumu] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ürün verilerini getir
        const urunlerRes = await axios.get('/api/urunler');
        const urunler = urunlerRes.data;
        
        // Satış verilerini getir
        const satislarRes = await axios.get('/api/satislar');
        const satislar = satislarRes.data;
        
        // Bugünün satışlarını filtrele
        const bugun = new Date();
        bugun.setHours(0, 0, 0, 0);
        
        const bugunSatislar = satislar.filter(satis => {
          const satisZamani = new Date(satis.tarih);
          return satisZamani >= bugun && satis.odemeDurumu !== 'İptal Edildi';
        });
        
        // Bugünkü toplam satış tutarını hesapla
        const bugunSatisTutar = bugunSatislar.reduce((toplam, satis) => toplam + satis.toplamTutar, 0);
        
        // Aylık satışları filtrele
        const ayBaslangic = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
        const aylikSatislar = satislar.filter(satis => {
          const satisZamani = new Date(satis.tarih);
          return satisZamani >= ayBaslangic && satis.odemeDurumu !== 'İptal Edildi';
        });
        
        // Aylık ciroyu hesapla
        const aylikCiro = aylikSatislar.reduce((toplam, satis) => toplam + satis.toplamTutar, 0);
        
        // Son 10 satışı al (iptal edilmeyenler)
        const gecerliSatislar = satislar
          .filter(s => s.odemeDurumu !== 'İptal Edildi')
          .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
          .slice(0, 10);
        
        // Stok durumunu hazırla
        const stokDurumuListesi = urunler
          .sort((a, b) => a.stokMiktari - b.stokMiktari) // Stok miktarına göre sırala (azdan çoğa)
          .slice(0, 10); // İlk 10 ürünü al
          
        setOzet({
          toplamUrun: urunler.length,
          toplamSatis: satislar.filter(s => s.odemeDurumu !== 'İptal Edildi').length,
          bugunSatisTutar,
          aylikCiro
        });
        
        setSonSatislar(gecerliSatislar);
        setStokDurumu(stokDurumuListesi);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        // Hata durumunda boş veriler göster
        setOzet({
          toplamUrun: 0,
          toplamSatis: 0,
          bugunSatisTutar: 0,
          aylikCiro: 0
        });
        setSonSatislar([]);
        setStokDurumu([]);
      }
    };
    
    fetchData();
  }, []);

  // Tarih formatlama fonksiyonu
  const formatTarih = (tarihStr) => {
    const tarih = new Date(tarihStr);
    return tarih.toLocaleDateString('tr-TR') + ' ' + tarih.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});
  };

  return (
    <Container fluid>
      <h1 className="mb-4">Ana Sayfa</h1>
      
      <Row>
        <Col md={3} sm={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Toplam Ürün</h6>
                  <h3>{ozet.toplamUrun}</h3>
                </div>
                <FaBoxOpen size={40} className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Toplam Satış</h6>
                  <h3>{ozet.toplamSatis}</h3>
                </div>
                <FaShoppingCart size={40} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Bugünkü Satış</h6>
                  <h3>{ozet.bugunSatisTutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h3>
                </div>
                <FaChartLine size={40} className="text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Aylık Ciro</h6>
                  <h3>{ozet.aylikCiro.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h3>
                </div>
                <FaMoneyBillWave size={40} className="text-danger" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body>
              <h5 className="mb-3">Son Satışlar</h5>
              {sonSatislar.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Tutar</th>
                      <th>Ödeme Tipi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sonSatislar.map((satis) => (
                      <tr key={satis.id}>
                        <td>{formatTarih(satis.tarih)}</td>
                        <td>{satis.toplamTutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                        <td>{satis.odemeYontemi}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">Henüz satış verisi bulunmamaktadır.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body>
              <h5 className="mb-3">Stok Durumu</h5>
              {stokDurumu.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Ürün</th>
                      <th>Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stokDurumu.map((urun) => (
                      <tr key={urun.id}>
                        <td>{urun.ad}</td>
                        <td>
                          <Badge bg={urun.stokMiktari <= 5 ? 'danger' : 'success'}>
                            {urun.stokMiktari}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">Henüz ürün verisi bulunmamaktadır.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;