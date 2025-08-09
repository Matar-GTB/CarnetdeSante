import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, showNavbar = true, showFooter = true }) => {
  const location = useLocation();
  
  // Ne pas afficher la navbar sur les pages de dashboard ou si elle est spécifiée comme masquée
  const isDashboardPage = location.pathname === '/dashboard' || location.pathname.includes('/dashboard');
  const showNav = showNavbar && !isDashboardPage;
  
  return (
    <div className="layout">
      {showNav && <Navbar navbarId="layout-navbar" />}
      <main className="layout-main">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
