import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientPublicProfile } from '../../services/profileService';
import './PatientProfilePublic.css';

const PatientProfilePublic = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadPatientProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement du profil patient:', patientId);
      const response = await getPatientPublicProfile(patientId);
      
      if (response.success && response.data) {
        console.log('✅ Profil chargé avec succès:', response.data);
        setPatient(response.data);
      } else {
        console.error('❌ Erreur:', response.message);
        setError({
          message: response.message || 'Impossible de charger le profil',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('❌ Erreur technique:', err);
      setError({
        message: 'Une erreur technique est survenue',
        type: 'technical'
      });
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPatientProfile();
  }, [patientId, loadPatientProfile]);

  const handleRetry = () => {
    loadPatientProfile();
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="patient-public-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-public-error">
        <div className="error-container">
          <span className="error-icon">
            {error.type === 'error' ? '🔒' : '⚠️'}
          </span>
          
          <h2>
            {error.type === 'error' ? 'Profil non accessible' : 'Erreur technique'}
          </h2>
          
          <p className="error-message">{error.message}</p>
          
          <div className="error-info">
            <p>
              {error.type === 'error'
                ? "Ce profil n'est pas accessible publiquement ou n'existe pas."
                : "Un problème technique empêche l'affichage de ce profil."}
            </p>
          </div>

          <div className="error-help">
            <p>Suggestions :</p>
            <ul>
              <li>Vérifiez que l'URL est correcte</li>
              <li>Assurez-vous d'avoir les permissions nécessaires</li>
              <li>Essayez de recharger la page</li>
            </ul>
          </div>

          <div className="error-actions">
            <button onClick={handleBack} className="btn-back">
              Retour
            </button>
            <button onClick={handleRetry} className="btn-retry">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-public-error">
        <div className="error-container">
          <span className="error-icon">❓</span>
          <h2>Patient non trouvé</h2>
          <p>Impossible de trouver le profil demandé.</p>
          <button onClick={handleBack} className="btn-back">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-profile-public">
      <header className="profile-header">
        <div className="header-background"></div>
        <div className="header-content">
          <div className="patient-main-info">
            <div className="patient-avatar">
              {patient.photo_profil ? (
                <img 
                  src={patient.photo_profil} 
                  alt={`${patient.prenom} ${patient.nom}`}
                />
              ) : (
                <span>
                  {patient.prenom?.[0] || ''}
                  {patient.nom?.[0] || ''}
                </span>
              )}
            </div>
            
            <div className="patient-details">
              <h1>{patient.prenom} {patient.nom}</h1>
              {patient.ville && (
                <div className="patient-location">
                  <span className="location-icon">📍</span>
                  {patient.ville}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="profile-content">
        <section className="info-section">
          <h2>Informations de base</h2>
          <div className="info-grid">
            {patient.email_public && (
              <div className="info-card">
                <span className="info-icon">📧</span>
                <div className="info-details">
                  <h3>Email</h3>
                  <p>{patient.email}</p>
                </div>
              </div>
            )}
            
            {patient.telephone_public && (
              <div className="info-card">
                <span className="info-icon">📱</span>
                <div className="info-details">
                  <h3>Téléphone</h3>
                  <p>{patient.telephone}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="privacy-section">
          <div className="privacy-notice">
            <span className="notice-icon">🔒</span>
            <p>
              Les informations affichées sur cette page sont limitées pour protéger 
              la confidentialité du patient. Seules les informations explicitement 
              marquées comme publiques sont visibles.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientProfilePublic;
