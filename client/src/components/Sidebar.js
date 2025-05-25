import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBoxOpen, FaShoppingCart, FaChartBar, FaCreditCard, FaTags, FaBars, FaPercentage } from 'react-icons/fa';

const Sidebar = ({ onToggle }) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  
  // Aktif menü öğesini belirle
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  const toggleSidebar = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (onToggle) {
      onToggle(!newExpanded); // collapsed durumunu üst bileşene bildirir
    }
  };
  
  // Sayfa yüklendiğinde collapsed durumunu bildir
  useEffect(() => {
    if (onToggle) {
      onToggle(!expanded);
    }
  }, []);
  
  return (
    <div className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <FaBars />
      </div>
      
      <ul className="sidebar-menu">
        <li className={isActive('/')}>
          <Link to="/">
            <span className="icon"><FaHome /></span>
            <span className="text">Ana Sayfa</span>
          </Link>
        </li>
        <li className={isActive('/urunler')}>
          <Link to="/urunler">
            <span className="icon"><FaBoxOpen /></span>
            <span className="text">Ürün Yönetimi</span>
          </Link>
        </li>
        <li className={isActive('/kategoriler')}>
          <Link to="/kategoriler">
            <span className="icon"><FaTags /></span>
            <span className="text">Kategoriler</span>
          </Link>
        </li>
        <li className={isActive('/satis')}>
          <Link to="/satis">
            <span className="icon"><FaShoppingCart /></span>
            <span className="text">Satış Ekranı</span>
          </Link>
        </li>
        <li className={isActive('/raporlar')}>
          <Link to="/raporlar">
            <span className="icon"><FaChartBar /></span>
            <span className="text">Satış Raporları</span>
          </Link>
        </li>
        <li className={isActive('/odeme-tipleri')}>
          <Link to="/odeme-tipleri">
            <span className="icon"><FaCreditCard /></span>
            <span className="text">Ödeme Tipleri</span>
          </Link>
        </li>
        <li className={isActive('/fiyat-guncelleme')}>
          <Link to="/fiyat-guncelleme">
            <span className="icon"><FaPercentage /></span>
            <span className="text">Fiyat Güncelleme</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;