import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';

// Dosyanın başına viewport meta tag'i kontrol eden bir etki ekleyelim
useEffect(() => {
  // Viewport meta tag'ini bul veya oluştur
  let viewportTag = document.querySelector('meta[name="viewport"]');
  if (!viewportTag) {
    viewportTag = document.createElement('meta');
    viewportTag.name = 'viewport';
    document.head.appendChild(viewportTag);
  }
  
  // Sanal klavyeyi kontrol eden özellikleri ekle
  viewportTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, height=device-height, viewport-fit=cover';
  
  // Sayfanın kaydırılabilir olması için body stil kontrolü
  document.body.style.height = '100%';
  document.body.style.position = 'relative';
  
  return () => {
    // Component unmount olduğunda orijinal viewport ayarına dön
    viewportTag.content = 'width=device-width, initial-scale=1.0';
  };
}, []);

// Klavyeyi kapatmak için genel bir fonksiyon ekleyelim
const closeKeyboard = () => {
  // Aktif olan herhangi bir element varsa odağı kaldır
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

// Form alanlarındaki input elementleri
<Form.Control
  type="text"
  placeholder="Kategori adı"
  className="mb-2"
  value={yeniKategori.ad || ""}
  onChange={(e) => setYeniKategori({...yeniKategori, ad: e.target.value})}
  required
  // Mobile uyumlu klavye özellikleri
  inputMode="text"
  enterKeyHint="done"
  onFocus={(e) => {
    // Input odaklandığında sayfayı alta kaydır
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 300);
  }}
/>

// Açıklama alanı
<Form.Control
  as="textarea"
  rows={3}
  placeholder="Açıklama (isteğe bağlı)"
  className="mb-3"
  value={yeniKategori.aciklama || ""}
  onChange={(e) => setYeniKategori({...yeniKategori, aciklama: e.target.value})}
  // Mobile uyumlu klavye özellikleri
  enterKeyHint="done"
  onFocus={(e) => {
    // Input odaklandığında sayfayı alta kaydır
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 300);
  }}
/>

// Alt kategori adı
<Form.Control
  type="text"
  placeholder="Alt kategori adı"
  className="mb-2"
  value={yeniAltKategori.ad || ""}
  onChange={(e) => setYeniAltKategori({...yeniAltKategori, ad: e.target.value})}
  required
  // Mobile uyumlu klavye özellikleri
  inputMode="text"
  enterKeyHint="done"
  onFocus={(e) => {
    // Input odaklandığında sayfayı alta kaydır
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 300);
  }}
/>

// Açıklama alanı
<Form.Control
  as="textarea"
  rows={3}
  placeholder="Açıklama (isteğe bağlı)"
  className="mb-3"
  value={yeniAltKategori.aciklama || ""}
  onChange={(e) => setYeniAltKategori({...yeniAltKategori, aciklama: e.target.value})}
  // Mobile uyumlu klavye özellikleri
  enterKeyHint="done"
  onFocus={(e) => {
    // Input odaklandığında sayfayı alta kaydır
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 300);
  }}
/>

// Form sonlarına boşluk ekleyelim - klavye açıldığında görünürlük için
<div style={{height: "300px"}}></div> 