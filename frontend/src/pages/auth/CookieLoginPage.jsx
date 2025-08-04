// frontend/src/pages/auth/CookieLoginPage.jsx
import React from 'react';
import CookieLoginForm from '../../components/auth/CookieLoginForm';
import '../../components/auth/Login.css';

const CookieLoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Connexion Sécurisée</h1>
        <h2 className="highlight">avec cookies HttpOnly.</h2>
        <p className="quote">
          "Une authentification moderne et sécurisée. Vos tokens sont protégés dans des cookies HttpOnly, inaccessibles au JavaScript malveillant."
        </p>
        <p className="author">— Sécurité renforcée</p>
        
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          <h4>🔒 Avantages des cookies HttpOnly :</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>✅ Protection contre les attaques XSS</li>
            <li>✅ Gestion automatique des tokens</li>
            <li>✅ Renouvellement transparent</li>
            <li>✅ Déconnexion sécurisée</li>
          </ul>
        </div>
      </div>
      <div className="login-right">
        <CookieLoginForm />
      </div>
    </div>
  );
};

export default CookieLoginPage;
