// frontend/src/components/debug/AuthDebug.jsx
import React, { useContext } from 'react';
import { CookieAuthContext } from '../../contexts/CookieAuthContext';
import { checkAuthStatus } from '../../services/cookieAuthService';

const AuthDebug = () => {
  const { user, isAuthenticated, isLoading } = useContext(CookieAuthContext);

  const testAuthStatus = async () => {
    try {
      const result = await checkAuthStatus();
      console.log('🔍 Test checkAuthStatus:', result);
      alert(`Résultat: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('❌ Erreur checkAuthStatus:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '15px', 
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>🔍 Debug Auth State</h4>
      
      <div><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</div>
      <div><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</div>
      <div><strong>user:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</div>
      
      <button 
        onClick={testAuthStatus}
        style={{ 
          marginTop: '10px', 
          padding: '5px 10px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        Test Auth Status
      </button>
      
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
        <strong>Cookies:</strong><br/>
        {document.cookie || 'Aucun cookie'}
      </div>
    </div>
  );
};

export default AuthDebug;
