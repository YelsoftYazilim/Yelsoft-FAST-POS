import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Bileşenleri içe aktar
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UrunYonetimi from './pages/UrunYonetimi';
import SatisEkrani from './pages/SatisEkrani';
import SatisRaporlari from './pages/SatisRaporlari';
import OdemeTipleri from './pages/OdemeTipleri';
import KategoriYonetimi from './pages/KategoriYonetimi';
import FiyatGuncelleme from './pages/FiyatGuncelleme';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Sidebar onToggle={handleSidebarToggle} />
        <div 
          className="content-area"
          style={{ marginLeft: sidebarCollapsed ? '0' : '0' }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/urunler" element={<UrunYonetimi />} />
            <Route path="/satis" element={<SatisEkrani />} />
            <Route path="/raporlar" element={<SatisRaporlari />} />
            <Route path="/odeme-tipleri" element={<OdemeTipleri />} />
            <Route path="/kategoriler" element={<KategoriYonetimi />} />
            <Route path="/fiyat-guncelleme" element={<FiyatGuncelleme />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;