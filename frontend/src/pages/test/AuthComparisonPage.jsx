// frontend/src/pages/test/AuthComparisonPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CookieAuthContext } from '../../contexts/CookieAuthContext';
import './AuthComparisonPage.css';

const AuthComparisonPage = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('localStorage');
  
  // Contextes d'authentification
  const localStorageAuth = useContext(AuthContext);
  const cookieAuth = useContext(CookieAuthContext);

  const authMethods = {
    localStorage: {
      title: 'LocalStorage + JWT',
      description: 'Méthode traditionnelle avec stockage côté client',
      auth: localStorageAuth,
      loginPath: '/auth/login',
      security: 'Modérée',
      pros: [
        'Simple à implémenter',
        'Compatible avec tous les navigateurs',
        'Contrôle total côté client'
      ],
      cons: [
        'Vulnérable aux attaques XSS',
        'Gestion manuelle des tokens',
        'Pas de protection automatique'
      ]
    },
    cookies: {
      title: 'Cookies HttpOnly',
      description: 'Méthode moderne et sécurisée',
      auth: cookieAuth,
      loginPath: '/auth/cookie-login',
      security: 'Élevée',
      pros: [
        'Protection contre XSS',
        'Gestion automatique des tokens',
        'Renouvellement transparent',
        'Sécurité renforcée'
      ],
      cons: [
        'Plus complexe à configurer',
        'Nécessite CORS avec credentials',
        'Configuration serveur spécifique'
      ]
    }
  };

  const currentMethod = authMethods[selectedMethod];
  const currentAuth = currentMethod.auth;

  return (
    <div className="auth-comparison-page">
      <div className="comparison-header">
        <h1>🔐 Comparaison des Méthodes d'Authentification</h1>
        <p>Explorez les différences entre localStorage et cookies HttpOnly</p>
      </div>

      <div className="method-selector">
        <button 
          className={`method-btn ${selectedMethod === 'localStorage' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('localStorage')}
        >
          📱 LocalStorage
        </button>
        <button 
          className={`method-btn ${selectedMethod === 'cookies' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('cookies')}
        >
          🍪 Cookies HttpOnly
        </button>
      </div>

      <div className="comparison-content">
        <div className="method-details">
          <h2>{currentMethod.title}</h2>
          <p className="method-description">{currentMethod.description}</p>
          
          <div className="security-level">
            <span className="label">Niveau de sécurité :</span>
            <span className={`security-badge ${currentMethod.security.toLowerCase()}`}>
              {currentMethod.security}
            </span>
          </div>

          <div className="status-section">
            <h3>État actuel</h3>
            <div className="status-info">
              <div className="status-item">
                <span className="status-label">Connecté :</span>
                <span className={`status-value ${currentAuth.isAuthenticated ? 'positive' : 'negative'}`}>
                  {currentAuth.isAuthenticated ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              {currentAuth.user && (
                <>
                  <div className="status-item">
                    <span className="status-label">Utilisateur :</span>
                    <span className="status-value">
                      {currentAuth.user.prenom} {currentAuth.user.nom}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Rôle :</span>
                    <span className="status-value">{currentAuth.user.role}</span>
                  </div>
                </>
              )}
              {currentAuth.isLoading && (
                <div className="status-item">
                  <span className="status-value loading">⏳ Chargement...</span>
                </div>
              )}
            </div>
          </div>

          <div className="pros-cons">
            <div className="pros">
              <h4>✅ Avantages</h4>
              <ul>
                {currentMethod.pros.map((pro, index) => (
                  <li key={index}>{pro}</li>
                ))}
              </ul>
            </div>
            <div className="cons">
              <h4>❌ Inconvénients</h4>
              <ul>
                {currentMethod.cons.map((con, index) => (
                  <li key={index}>{con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="action-section">
          <h3>Actions disponibles</h3>
          <div className="action-buttons">
            {!currentAuth.isAuthenticated ? (
              <button 
                className="action-btn login-btn"
                onClick={() => navigate(currentMethod.loginPath)}
              >
                Se connecter avec {currentMethod.title}
              </button>
            ) : (
              <button 
                className="action-btn logout-btn"
                onClick={currentAuth.logout}
              >
                Se déconnecter
              </button>
            )}
            
            <button 
              className="action-btn dashboard-btn"
              onClick={() => navigate('/dashboard')}
              disabled={!currentAuth.isAuthenticated}
            >
              Accéder au Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="comparison-footer">
        <div className="recommendation">
          <h3>💡 Recommandation</h3>
          <p>
            Pour une sécurité maximale en production, utilisez les <strong>cookies HttpOnly</strong>. 
            Ils offrent une protection automatique contre les principales vulnérabilités web.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthComparisonPage;
