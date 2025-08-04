// src/components/debug/AuthDebugPanel.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { debugAuthStatus, testAuthentication } from '../../services/debugAuth';
import { getMedicationsApi } from '../../services/medicationService';

const AuthDebugPanel = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestAuth = async () => {
    setLoading(true);
    try {
      const result = await testAuthentication();
      setDebugInfo({
        type: 'test',
        success: result,
        message: result ? 'Authentification OK' : 'Authentification échouée'
      });
    } catch (error) {
      setDebugInfo({
        type: 'error',
        success: false,
        message: error.message
      });
    }
    setLoading(false);
  };

  const handleTestMedications = async () => {
    setLoading(true);
    try {
      const medications = await getMedicationsApi();
      setDebugInfo({
        type: 'medications',
        success: true,
        data: medications,
        message: `${medications.length} médicament(s) récupéré(s)`
      });
    } catch (error) {
      setDebugInfo({
        type: 'error',
        success: false,
        message: `Erreur API: ${error.response?.data?.error || error.message}`
      });
    }
    setLoading(false);
  };

  const handleDebugStatus = async () => {
    setLoading(true);
    const result = await debugAuthStatus();
    setDebugInfo({
      type: 'status',
      ...result
    });
    setLoading(false);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f8f9fa', 
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1rem',
      maxWidth: '400px',
      zIndex: 9999,
      fontSize: '0.9rem'
    }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>🔧 Debug Auth</h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>État Auth Context:</strong>
        <div>Authentifié: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Utilisateur: {user ? `${user.role} - ${user.email}` : 'Aucun'}</div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button 
          onClick={handleDebugStatus}
          disabled={loading}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
        >
          Statut Auth
        </button>
        <button 
          onClick={handleTestAuth}
          disabled={loading}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
        >
          Test Complet
        </button>
        <button 
          onClick={handleTestMedications}
          disabled={loading}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
        >
          Test Medications
        </button>
      </div>

      {loading && <div>⏳ Test en cours...</div>}

      {debugInfo && (
        <div style={{ 
          background: debugInfo.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${debugInfo.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          padding: '0.5rem',
          marginTop: '0.5rem'
        }}>
          <div><strong>Type:</strong> {debugInfo.type}</div>
          <div><strong>Message:</strong> {debugInfo.message}</div>
          {debugInfo.error && (
            <div><strong>Erreur:</strong> {JSON.stringify(debugInfo.error)}</div>
          )}
          {debugInfo.data && (
            <div><strong>Données:</strong> {JSON.stringify(debugInfo.data, null, 2)}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthDebugPanel;
