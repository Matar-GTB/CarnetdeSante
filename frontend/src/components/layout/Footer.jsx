import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-left">
        <h3>Carnet Santé Virtuel</h3>
        <p>© {new Date().getFullYear()} Tous droits réservés.</p>
      </div>
      
      <div className="footer-center">
        <p><a href="/politique-confidentialite">Politique de confidentialité</a></p>
        <p><a href="/conditions-utilisation">Conditions d’utilisation</a></p>
      </div>
      
      <div className="footer-right">
        <p>Contact : support@carnetsante.com</p>
        <p>Téléphone : +226 70 00 00 00</p>
      </div>
    </footer>
  );
};

export default Footer;
