// components/profile/EmergencyProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import profileService from '../../services/profileService';
import './EmergencyProfile.css';

const EmergencyProfile = () => {
  const { patientId, emergencyToken } = useParams();
  const location = useLocation();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessInfo, setAccessInfo] = useState({
    accessedAt: null,
    accessedBy: null,
    accessReason: ''
  });

  useEffect(() => {
    const loadEmergencyProfile = async () => {
      try {
        setLoading(true);
        
        // Vérifier le token d'urgence
        const response = await profileService.getEmergencyProfile(patientId, emergencyToken);
        
        if (response.success) {
          setPatient(response.data.patient);
          setAccessInfo(response.data.accessInfo);
          setAccessGranted(true);
          
          // Enregistrer l'accès d'urgence
          await profileService.logEmergencyAccess(patientId, emergencyToken, {
            accessedAt: new Date().toISOString(),
            ipAddress: 'unknown', // À implémenter côté backend
            userAgent: navigator.userAgent
          });
        } else {
          setError(response.message || 'Accès d\'urgence refusé');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil d\'urgence:', err);
        setError('Erreur de chargement du profil d\'urgence');
      } finally {
        setLoading(false);
      }
    };

    if (patientId && emergencyToken) {
      loadEmergencyProfile();
    } else {
      setError('Paramètres d\'accès manquants');
      setLoading(false);
    }
  }, [patientId, emergencyToken]);

  const handleEmergencyCall = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="emergency-profile">
        <div className="emergency-header">
          <div className="emergency-title">
            <span className="emergency-icon">🚨</span>
            <h1>Profil d'Urgence Médicale</h1>
          </div>
        </div>
        
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Vérification des accès d'urgence...</p>
        </div>
      </div>
    );
  }

  if (error || !accessGranted) {
    return (
      <div className="emergency-profile">
        <div className="emergency-header error">
          <div className="emergency-title">
            <span className="emergency-icon">⛔</span>
            <h1>Accès Refusé</h1>
          </div>
        </div>
        
        <div className="error-container">
          <div className="error-message">
            <h2>Impossible d'accéder au profil d'urgence</h2>
            <p>{error}</p>
            
            <div className="error-help">
              <h3>Que faire ?</h3>
              <ul>
                <li>Vérifiez le lien d'accès d'urgence</li>
                <li>Contactez directement les services d'urgence : <strong>15</strong> (SAMU)</li>
                <li>En cas d'urgence absolue, appelez le <strong>112</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-profile">
      {/* En-tête d'urgence */}
      <div className="emergency-header">
        <div className="emergency-title">
          <span className="emergency-icon">🚨</span>
          <h1>Profil d'Urgence Médicale</h1>
        </div>
        
        <div className="emergency-warning">
          <p>
            <strong>⚠️ Accès d'urgence autorisé</strong> - 
            Ce profil contient des informations médicales critiques.
            Respectez la confidentialité médicale.
          </p>
        </div>
      </div>

      {/* Informations du patient */}
      <div className="patient-identity-emergency">
        <h2>
          <span className="section-icon">👤</span>
          Identité du Patient
        </h2>
        
        <div className="identity-grid">
          <div className="identity-item">
            <label>Nom complet</label>
            <strong>{patient.nom} {patient.prenom}</strong>
          </div>
          
          {patient.date_naissance && (
            <div className="identity-item">
              <label>Date de naissance</label>
              <strong>{formatDate(patient.date_naissance)}</strong>
            </div>
          )}
          
          {patient.numero_secu && (
            <div className="identity-item">
              <label>Numéro de sécurité sociale</label>
              <strong>{patient.numero_secu}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Informations médicales critiques */}
      <div className="critical-medical-info">
        <h2>
          <span className="section-icon">🩺</span>
          Informations Médicales Critiques
        </h2>
        
        <div className="critical-grid">
          {/* Groupe sanguin */}
          {patient.groupe_sanguin && (
            <div className="critical-item blood-type">
              <div className="critical-header">
                <span className="critical-icon">🩸</span>
                <strong>Groupe Sanguin</strong>
              </div>
              <div className="critical-value">{patient.groupe_sanguin}</div>
            </div>
          )}
          
          {/* Allergies */}
          {patient.allergies && (
            <div className="critical-item allergies">
              <div className="critical-header">
                <span className="critical-icon">⚠️</span>
                <strong>Allergies</strong>
              </div>
              <div className="critical-value">{patient.allergies}</div>
            </div>
          )}
          
          {/* Antécédents critiques */}
          {patient.antecedents_medicaux && (
            <div className="critical-item medical-history">
              <div className="critical-header">
                <span className="critical-icon">📋</span>
                <strong>Antécédents Médicaux</strong>
              </div>
              <div className="critical-value">{patient.antecedents_medicaux}</div>
            </div>
          )}
          
          {/* Traitements actuels */}
          {patient.traitements_actuels && (
            <div className="critical-item treatments">
              <div className="critical-header">
                <span className="critical-icon">💊</span>
                <strong>Traitements en Cours</strong>
              </div>
              <div className="critical-value">{patient.traitements_actuels}</div>
            </div>
          )}
        </div>
      </div>

      {/* Contacts d'urgence */}
      <div className="emergency-contacts">
        <h2>
          <span className="section-icon">📞</span>
          Contacts d'Urgence
        </h2>
        
        <div className="contacts-grid">
          {/* Contact d'urgence principal */}
          {patient.contact_urgence && (
            <div className="contact-card primary">
              <div className="contact-header">
                <span className="contact-icon">🚨</span>
                <strong>Contact Principal</strong>
              </div>
              
              <div className="contact-info">
                {patient.personne_urgence && (
                  <div className="contact-name">{patient.personne_urgence}</div>
                )}
                <div className="contact-phone">
                  <a 
                    href={`tel:${patient.contact_urgence}`}
                    className="phone-link"
                    onClick={() => handleEmergencyCall(patient.contact_urgence)}
                  >
                    📱 {patient.contact_urgence}
                  </a>
                </div>
              </div>
              
              <button
                className="call-button emergency"
                onClick={() => handleEmergencyCall(patient.contact_urgence)}
              >
                📞 Appeler Maintenant
              </button>
            </div>
          )}
          
          {/* Téléphone personnel */}
          {patient.telephone && (
            <div className="contact-card secondary">
              <div className="contact-header">
                <span className="contact-icon">📱</span>
                <strong>Patient</strong>
              </div>
              
              <div className="contact-info">
                <div className="contact-phone">
                  <a 
                    href={`tel:${patient.telephone}`}
                    className="phone-link"
                  >
                    📱 {patient.telephone}
                  </a>
                </div>
              </div>
              
              <button
                className="call-button secondary"
                onClick={() => handleEmergencyCall(patient.telephone)}
              >
                📞 Appeler Patient
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Médecin traitant */}
      {patient.medecin_traitant && (
        <div className="treating-doctor">
          <h2>
            <span className="section-icon">👨‍⚕️</span>
            Médecin Traitant
          </h2>
          
          <div className="doctor-card">
            <div className="doctor-info">
              <strong>Dr. {patient.medecin_traitant.nom} {patient.medecin_traitant.prenom}</strong>
              {patient.medecin_traitant.specialite && (
                <div className="doctor-specialty">{patient.medecin_traitant.specialite}</div>
              )}
              {patient.medecin_traitant.telephone && (
                <div className="doctor-phone">
                  <a 
                    href={`tel:${patient.medecin_traitant.telephone}`}
                    className="phone-link"
                  >
                    📱 {patient.medecin_traitant.telephone}
                  </a>
                </div>
              )}
            </div>
            
            {patient.medecin_traitant.telephone && (
              <button
                className="call-button doctor"
                onClick={() => handleEmergencyCall(patient.medecin_traitant.telephone)}
              >
                📞 Contacter Médecin
              </button>
            )}
          </div>
        </div>
      )}

      {/* Services d'urgence */}
      <div className="emergency-services">
        <h2>
          <span className="section-icon">🚑</span>
          Services d'Urgence
        </h2>
        
        <div className="services-grid">
          <div className="service-card samu">
            <div className="service-header">
              <span className="service-icon">🚑</span>
              <strong>SAMU</strong>
            </div>
            <div className="service-number">15</div>
            <button
              className="call-button samu"
              onClick={() => handleEmergencyCall('15')}
            >
              📞 Appeler le 15
            </button>
          </div>
          
          <div className="service-card pompiers">
            <div className="service-header">
              <span className="service-icon">🚒</span>
              <strong>Pompiers</strong>
            </div>
            <div className="service-number">18</div>
            <button
              className="call-button pompiers"
              onClick={() => handleEmergencyCall('18')}
            >
              📞 Appeler le 18
            </button>
          </div>
          
          <div className="service-card europeen">
            <div className="service-header">
              <span className="service-icon">🆘</span>
              <strong>Urgence EU</strong>
            </div>
            <div className="service-number">112</div>
            <button
              className="call-button europeen"
              onClick={() => handleEmergencyCall('112')}
            >
              📞 Appeler le 112
            </button>
          </div>
        </div>
      </div>

      {/* Footer avec informations d'accès */}
      <div className="emergency-footer">
        <div className="access-info">
          <p>
            <strong>Accès autorisé le :</strong> {new Date().toLocaleString('fr-FR')}
          </p>
          <p>
            <small>
              Cet accès d'urgence est enregistré et tracé pour des raisons de sécurité.
              Les informations affichées sont limitées aux données essentielles en cas d'urgence médicale.
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyProfile;
