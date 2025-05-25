import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge, InputGroup, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaLayerGroup, FaTags, FaArrowRight, FaKeyboard } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

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

  // Sanal klavye için state'ler
  const [klavyeGoster, setKlavyeGoster] = useState(false);
  const [aktifInput, setAktifInput] = useState('');
  const klavyeRef = useRef(null);
  
  // Klavye için input değişikliği
  const handleInputFocus = (inputName, defaultValue = '') => {
    setAktifInput(inputName);
    setKlavyeGoster(true);
  };

  // Klavyeden tuş basıldığında
  const onKeyPress = (button) => {
    console.log("Basılan tuş:", button);
    
    // Backspace tuşuna basıldıysa
    if (button === "{bksp}") {
      onKeyPressBackspace();
      return;
    }
    
    if (aktifInput === 'kategoriAd') {
      setYeniKategori({...yeniKategori, ad: yeniKategori.ad + button});
    } else if (aktifInput === 'kategoriAciklama') {
      setYeniKategori({...yeniKategori, aciklama: yeniKategori.aciklama + button});
    } else if (aktifInput === 'altKategoriAd') {
      setYeniAltKategori({...yeniAltKategori, ad: yeniAltKategori.ad + button});
    } else if (aktifInput === 'altKategoriAciklama') {
      setYeniAltKategori({...yeniAltKategori, aciklama: yeniAltKategori.aciklama + button});
    }
  };
  
  // Klavyeden silme tuşu
  const onKeyPressBackspace = () => {
    if (aktifInput === 'kategoriAd') {
      setYeniKategori({...yeniKategori, ad: yeniKategori.ad.slice(0, -1)});
    } else if (aktifInput === 'kategoriAciklama') {
      setYeniKategori({...yeniKategori, aciklama: yeniKategori.aciklama.slice(0, -1)});
    } else if (aktifInput === 'altKategoriAd') {
      setYeniAltKategori({...yeniAltKategori, ad: yeniAltKategori.ad.slice(0, -1)});
    } else if (aktifInput === 'altKategoriAciklama') {
      setYeniAltKategori({...yeniAltKategori, aciklama: yeniAltKategori.aciklama.slice(0, -1)});
    }
  };

  // Klavye için değişiklik
  const onChange = (input) => {
    if (aktifInput === 'kategoriAd') {
      setYeniKategori({...yeniKategori, ad: input});
    } else if (aktifInput === 'kategoriAciklama') {
      setYeniKategori({...yeniKategori, aciklama: input});
    } else if (aktifInput === 'altKategoriAd') {
      setYeniAltKategori({...yeniAltKategori, ad: input});
    } else if (aktifInput === 'altKategoriAciklama') {
      setYeniAltKategori({...yeniAltKategori, aciklama: input});
    }
  };
  
  // Kategorileri yükle
  const kategorileriYukle = async () => {
    try {
      setYukleniyor(true);
      const res = await api.get('kategoriler');
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
      let url = 'kategoriler/alt-kategori/tumu';
      if (kategoriId) {
        url = `kategoriler/${kategoriId}/alt-kategoriler`;
      }
      const res = await api.get(url);
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
        res = await api.put(`kategoriler/${secilenKategori.id}`, yeniKategori);
        setBasarili('Kategori başarıyla güncellendi');
      } else {
        res = await api.post('kategoriler', yeniKategori);
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
      await api.delete(`kategoriler/${kategoriId}`);
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
        res = await api.put(`kategoriler/alt-kategori/${secilenAltKategori.id}`, yeniAltKategori);
        setBasarili('Alt kategori başarıyla güncellendi');
      } else {
        res = await api.post('kategoriler/alt-kategori', yeniAltKategori);
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
      await api.delete(`kategoriler/alt-kategori/${altKategoriId}`);
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
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <FaTags className="me-2" /> Ana Kategoriler
            </Card.Header>
            <Card.Body>
              <Form className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Kategori Adı *</Form.Label>
                  <Form.Control
                    type="text"
                    value={yeniKategori.ad}
                    onChange={(e) => setYeniKategori({ ...yeniKategori, ad: e.target.value })}
                    onFocus={() => handleInputFocus('kategoriAd')}
                    placeholder="Kategori adı"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Açıklama</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={yeniKategori.aciklama}
                    onChange={(e) => setYeniKategori({ ...yeniKategori, aciklama: e.target.value })}
                    onFocus={() => handleInputFocus('kategoriAciklama')}
                    placeholder="Açıklama (isteğe bağlı)"
                  />
                </Form.Group>
                
                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() => formuTemizle('kategori')}
                  >
                    İptal
                  </Button>
                  <Button
                    variant="primary"
                    onClick={kategoriEkle}
                    disabled={yukleniyor}
                  >
                    {yukleniyor ? 'Kaydediliyor...' : duzenlemeModu ? 'Güncelle' : 'Ekle'}
                  </Button>
                </div>
              </Form>
              
              <hr />
              
              <ListGroup>
                {kategoriler.length === 0 ? (
                  <Alert variant="info">Henüz kategori bulunmuyor.</Alert>
                ) : (
                  kategoriler.map(kategori => (
                    <ListGroup.Item
                      key={kategori.id}
                      action
                      active={secilenKategori && secilenKategori.id === kategori.id}
                      onClick={() => kategoriSec(kategori)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div>{kategori.ad}</div>
                        {kategori.aciklama && <small className="text-muted">{kategori.aciklama}</small>}
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
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
                  ))
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-info text-white">
              <FaLayerGroup className="me-2" /> Alt Kategoriler
            </Card.Header>
            <Card.Body>
              <Form className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Ana Kategori *</Form.Label>
                  <Form.Select
                    value={yeniAltKategori.kategoriId}
                    onChange={(e) => setYeniAltKategori({ ...yeniAltKategori, kategoriId: e.target.value })}
                  >
                    <option value="">-- Kategori Seçin --</option>
                    {kategoriler.map(kategori => (
                      <option key={kategori.id} value={kategori.id}>{kategori.ad}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Alt Kategori Adı *</Form.Label>
                  <Form.Control
                    type="text"
                    value={yeniAltKategori.ad}
                    onChange={(e) => setYeniAltKategori({ ...yeniAltKategori, ad: e.target.value })}
                    onFocus={() => handleInputFocus('altKategoriAd')}
                    placeholder="Alt kategori adı"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Açıklama</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={yeniAltKategori.aciklama}
                    onChange={(e) => setYeniAltKategori({ ...yeniAltKategori, aciklama: e.target.value })}
                    onFocus={() => handleInputFocus('altKategoriAciklama')}
                    placeholder="Açıklama (isteğe bağlı)"
                  />
                </Form.Group>
                
                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() => formuTemizle('altKategori')}
                  >
                    İptal
                  </Button>
                  <Button
                    variant="info"
                    onClick={altKategoriEkle}
                    disabled={yukleniyor}
                  >
                    {yukleniyor ? 'Kaydediliyor...' : altKategoriDuzenlemeModu ? 'Güncelle' : 'Ekle'}
                  </Button>
                </div>
              </Form>
              
              <hr />
              
              <ListGroup>
                {secilenKategori ? (
                  altKategoriler.filter(alt => alt.kategoriId === secilenKategori.id).length === 0 ? (
                    <Alert variant="info">Bu kategoriye ait alt kategori bulunmuyor.</Alert>
                  ) : (
                    altKategoriler
                      .filter(alt => alt.kategoriId === secilenKategori.id)
                      .map(altKat => (
                        <ListGroup.Item
                          key={altKat.id}
                          action
                          active={secilenAltKategori && secilenAltKategori.id === altKat.id}
                          onClick={() => setSecilenAltKategori(altKat)}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div>{altKat.ad}</div>
                            {altKat.aciklama && <small className="text-muted">{altKat.aciklama}</small>}
                          </div>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={(e) => altKategoriDuzenle(altKat, e)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={(e) => altKategoriSil(altKat.id, e)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))
                  )
                ) : (
                  <Alert variant="warning">Alt kategorileri görmek için bir kategori seçin.</Alert>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {klavyeGoster && (
        <Card style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1050,
          width: '100%',
          maxWidth: '100%',
          margin: 0,
          borderRadius: '0'
        }}>
          <Card.Header className="d-flex justify-content-between align-items-center bg-dark text-white py-2">
            <span><FaKeyboard className="me-2" /> Sanal Klavye</span>
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={() => setKlavyeGoster(false)}
            >
              Kapat
            </Button>
          </Card.Header>
          <Card.Body className="py-2">
            <Keyboard
              keyboardRef={r => (klavyeRef.current = r)}
              layoutName="default"
              layout={{
                default: [
                  "1 2 3 4 5 6 7 8 9 0 {bksp}",
                  "Q W E R T Y U I O P Ğ Ü",
                  "A S D F G H J K L Ş İ",
                  "Z X C V B N M Ö Ç ."
                ]
              }}
              onKeyPress={onKeyPress}
              onChange={onChange}
              display={{
                '{bksp}': '⌫ Sil'
              }}
              buttonTheme={[
                {
                  class: "hg-red",
                  buttons: "{bksp}"
                }
              ]}
              theme="hg-theme-default hg-layout-default myTheme"
              buttonAttributes={{
                style: {
                  fontSize: '1.2rem',
                  padding: '15px 5px',
                  minWidth: '40px',
                  height: '50px'
                }
              }}
            />
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default KategoriYonetimi; 