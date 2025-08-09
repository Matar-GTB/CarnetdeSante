import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientPublicProfile } from '../../services/profileService';
import './PatientProfilePublic.css';
import { 
  FaArrowLeft, FaMapMarkerAlt, FaEnvelope, FaPhone, 
  FaShieldAlt, FaInfoCircle, FaBirthdayCake, 
  FaIdCard, FaHeartbeat, FaCheck, FaTimes,
  FaShareAlt, FaCopy, FaLock, FaExclamationTriangle
} from 'react-icons/fa';

/**
 * Composant de profil public d'un patient
 * Affiche les informations publiques d'un patient selon ses paramètres de confidentialité
 */
const PatientProfilePublic = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  // États
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareTooltip, setShareTooltip] = useState(false);
  
  // Fonction pour formater une date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      console.error('Erreur de formatage de date:', e);
      return dateString;
    }
  };
  
  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (dateString) => {
    if (!dateString) return null;
    
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      
      // Si l'anniversaire n'est pas encore passé cette année
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (e) {
      console.error('Erreur de calcul d\'âge:', e);
      return null;
    }
  };

  // Chargement du profil patient
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

  // Charger le profil au montage du composant et à chaque changement d'ID
  useEffect(() => {
    loadPatientProfile();
  }, [patientId, loadPatientProfile]);

  // Gestionnaires d'événements
  const handleRetry = () => {
    loadPatientProfile();
  };

  const handleBack = () => {
    navigate(-1);
  };
  
  // Fonction pour partager le profil
  const handleShare = () => {
    try {
      // Copier l'URL actuelle dans le presse-papiers
      navigator.clipboard.writeText(window.location.href);
      setShareTooltip(true);
      
      // Masquer le tooltip après 3 secondes
      setTimeout(() => {
        setShareTooltip(false);
      }, 3000);
    } catch (err) {
      console.error('Erreur lors du partage:', err);
    }
  };

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <div className="patient-public-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-pulse"></div>
          <p>Chargement du profil patient...</p>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="patient-public-error">
        <div className="error-container">
          <span className="error-icon">
            {error.type === 'error' ? <FaLock /> : <FaExclamationTriangle />}
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
              <FaArrowLeft /> Retour
            </button>
            <button onClick={handleRetry} className="btn-retry">
              <FaCheck /> Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vérification que le patient existe
  if (!patient) {
    return (
      <div className="patient-public-error">
        <div className="error-container">
          <span className="error-icon">❓</span>
          <h2>Patient non trouvé</h2>
          <p>Impossible de trouver le profil demandé.</p>
          <button onClick={handleBack} className="btn-back">
            <FaArrowLeft /> Retour
          </button>
        </div>
      </div>
    );
  }

  // Affichage du profil
  return (
    <div className="patient-profile-public">
      <button className="back-button" onClick={handleBack}>
        <FaArrowLeft /> Retour
      </button>
      
      <button className="share-button" onClick={handleShare}>
        <FaShareAlt /> {shareTooltip ? "Lien copié!" : "Partager"}
      </button>
      
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
              {patient.adresse && (
                <div className="patient-location">
                  <FaMapMarkerAlt className="location-icon" />
                  {patient.adresse}
                </div>
              )}
              
              {patient.date_naissance && (
                <div className="patient-age">
                  <FaBirthdayCake style={{marginRight: '5px'}} />
                  {formatDate(patient.date_naissance)}
                  {calculateAge(patient.date_naissance) && (
                    <span className="age-indicator">
                      {` (${calculateAge(patient.date_naissance)} ans)`}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="profile-content">
        {/* Section d'informations de contact */}
        {(patient.email || patient.telephone || patient.adresse) && (
          <section className="info-section">
            <h2 className="section-title">
              <FaInfoCircle className="section-icon" />
              Informations de contact
            </h2>
            <div className="info-grid">
              {patient.email && (
                <div className="info-card">
                  <div className="info-icon">
                    <FaEnvelope />
                  </div>
                  <div className="info-details">
                    <h3>Email</h3>
                    <p>{patient.email}</p>
                  </div>
                </div>
              )}
              
              {patient.telephone && (
                <div className="info-card">
                  <div className="info-icon">
                    <FaPhone />
                  </div>
                  <div className="info-details">
                    <h3>Téléphone</h3>
                    <p>{patient.telephone}</p>
                  </div>
                </div>
              )}
              
              {patient.adresse && (
                <div className="info-card">
                  <div className="info-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="info-details">
                    <h3>Adresse</h3>
                    <p>{patient.adresse}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Section d'informations médicales publiques */}
        {(patient.groupe_sanguin || patient.allergies) && (
          <section className="info-section">
            <h2 className="section-title">
              <FaHeartbeat className="section-icon" />
              Informations médicales publiques
            </h2>
            <div className="info-grid">
              {patient.groupe_sanguin && (
                <div className="info-card">
                  <div className="info-icon">
                    <FaHeartbeat />
                  </div>
                  <div className="info-details">
                    <h3>Groupe sanguin</h3>
                    <p>{patient.groupe_sanguin}</p>
                  </div>
                </div>
              )}
              
              {patient.allergies && (
                <div className="info-card">
                  <div className="info-icon">
                    <FaTimes />
                  </div>
                  <div className="info-details">
                    <h3>Allergies</h3>
                    <p>{patient.allergies || "Aucune allergie déclarée"}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Section de personne à contacter en cas d'urgence */}
        {patient.personne_urgence && patient.contact_urgence && (
          <section className="info-section">
            <h2 className="section-title">
              <FaIdCard className="section-icon" />
              Contact d'urgence
            </h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">
                  <FaPhone />
                </div>
                <div className="info-details">
                  <h3>{patient.personne_urgence}</h3>
                  <p>{patient.contact_urgence}</p>
                </div>
              </div>
            </div>
          </section>
        )}
          
        {/* Avis de confidentialité */}
        <section className="privacy-section">
          <div className="privacy-notice">
            <FaShieldAlt className="notice-icon" />
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
