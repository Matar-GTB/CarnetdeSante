// frontend/src/secure-index.js - Point d'entrée sécurisé
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

// Import des applications
import App from './App';
import CookieApp from './CookieApp';

// Import des contextes
import { AuthProvider } from './contexts/AuthContext';
import { CookieAuthProvider } from './contexts/CookieAuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * 🔒 Récupération sécurisée du mode d'authentification
 * Le mode est déterminé UNIQUEMENT par le serveur
 */
const getSecureAuthMode = async () => {
  try {
    const response = await fetch('/api/auth/config', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const config = await response.json();
      return config.authMode || 'traditional';
    }
  } catch (error) {
    console.warn('🚨 Erreur lors de la récupération de la config auth:', error);
  }
  
  // Fallback sécurisé
  return 'traditional';
};

/**
 * 🛡️ Initialisation sécurisée de l'application
 */
const initializeSecureApp = async () => {
  // Affichage du loader de sécurité
  const loadingDiv = document.createElement('div');
  loadingDiv.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      flex-direction: column;
      gap: 1rem;
    ">
      <div style="font-size: 3rem;">🛡️</div>
      <div style="font-size: 1.2rem;">Initialisation sécurisée...</div>
      <div style="font-size: 0.9rem; opacity: 0.8;">Vérification de la configuration d'authentification</div>
    </div>
  `;
  
  document.body.appendChild(loadingDiv);
  
  try {
    // Récupérer le mode d'auth du serveur
    const authMode = await getSecureAuthMode();
    console.log(`🔒 Mode d'authentification sécurisé: ${authMode}`);
    
    // Supprimer le loader
    document.body.removeChild(loadingDiv);
    
    // Rendre l'application appropriée
    if (authMode === 'cookies' || authMode === 'dual') {
      // Mode Cookies HttpOnly ou Dual
      root.render(
        <React.StrictMode>
          <AuthProvider>
            <CookieAuthProvider>
              <BrowserRouter>
                <CookieApp />
              </BrowserRouter>
            </CookieAuthProvider>
          </AuthProvider>
        </React.StrictMode>
      );
    } else {
      // Mode Traditionnel (par défaut)
      root.render(
        <React.StrictMode>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </React.StrictMode>
      );
    }
    
    // Indicateur de mode en développement
    if (process.env.NODE_ENV === 'development') {
      const modeIndicator = document.createElement('div');
      modeIndicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: ${authMode === 'cookies' || authMode === 'dual' ? '#28a745' : '#007bff'};
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 10000;
        font-family: monospace;
      `;
      modeIndicator.textContent = `🔒 Mode Sécurisé: ${authMode.toUpperCase()}`;
      document.body.appendChild(modeIndicator);
    }
    
  } catch (error) {
    console.error('🚨 Erreur lors de l\'initialisation sécurisée:', error);
    
    // Fallback d'urgence
    document.body.removeChild(loadingDiv);
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </React.StrictMode>
    );
  }
};

// Initialiser l'application de manière sécurisée
initializeSecureApp();

reportWebVitals();
