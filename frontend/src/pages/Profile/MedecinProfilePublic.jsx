// pages/Profile/MedecinProfilePublic.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMedecinPublicProfile } from '../../services/traitantService';
import { requestTraitant } from '../../services/traitantService';
import './MedecinProfilePublic.css';

// Composants optimisés avec React.memo
const InfoCard = React.memo(({ icon, title, content, onClick }) => (
  <div className="info-card" onClick={onClick}>
    <div className="info-header">
      <span className="info-icon" aria-hidden="true">{icon}</span>
      <strong>{title}</strong>
    </div>
    <div className="info-content">
      {content}
    </div>
  </div>
));

const ServiceItem = React.memo(({ icon, name, available, status }) => (
  <div 
    className={`service-item ${available ? 'available' : 'unavailable'}`}
    role="listitem"
    aria-label={`Service ${name}: ${status}`}
  >
    <span className="service-icon" aria-hidden="true">{icon}</span>
    <span className="service-name">{name}</span>
    <span className="service-status">{status}</span>
  </div>
));

const NotificationBanner = React.memo(({ message, onClose }) => (
  <div 
    className="notification-banner"
    role="alert"
    aria-live="polite"
  >
    <div className="notification-content">
      <span className="notification-icon" aria-hidden="true">ℹ️</span>
      <p>{message}</p>
      <button
        onClick={onClose}
        className="notification-close"
        aria-label="Fermer la notification"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  </div>
));

const MedecinProfilePublic = () => {
  const { medecinId } = useParams();
  const navigate = useNavigate();
  
  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  const canViewField = (field) => {
    if (!medecin?.visibilite) return true; // Par défaut public si pas de paramètres
    const visibility = medecin.visibilite[field];
    const isPatient = medecin.viewer_is_patient || false;
    return !visibility || 
           visibility === 'public' || 
           (visibility === 'patients' && isPatient);
  };

  useEffect(() => {
    const loadMedecinPublicProfile = async () => {
      try {
        setLoading(true);
        
        const response = await getMedecinPublicProfile(medecinId);
        
        if (response.success) {
          setMedecin(response.data);
        } else {
          setError(response.message || 'Médecin non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil public:', err);
        setError('Erreur de chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    if (medecinId) {
      loadMedecinPublicProfile();
    }
  }, [medecinId]);

  const handleSendRequest = async () => {
    try {
      setSendingRequest(true);
      
      const response = await requestTraitant({
        medecin_id: medecinId,
        message: requestMessage
      });
      
      if (response.success) {
        setShowRequestModal(false);
        setRequestMessage('');
        // Afficher un message de succès
        alert('Demande envoyée avec succès !');
      } else {
        alert('Erreur lors de l\'envoi de la demande');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      alert('Erreur lors de l\'envoi de la demande');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleScheduleAppointment = () => {
    // Rediriger vers la page de prise de rendez-vous
    navigate(`/appointment/book/${medecinId}`);
  };



  if (loading) {
    return (
      <div className="medecin-public-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error || !medecin) {
    return (
      <div className="medecin-public-error">
        <div className="error-container">
          <span className="error-icon">❌</span>
          <h2>Profil non accessible</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate('/doctors')}
            className="btn-back"
          >
            ← Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medecin-profile-public">
      {/* Header du profil */}
      <div className="profile-header">
        <div className="header-background"></div>
        <div className="header-content">
          <div className="doctor-main-info">
            <div className="doctor-avatar">
              <span className="avatar-icon">👨‍⚕️</span>
            </div>
            <div className="doctor-details">
              <h1>Dr. {medecin.prenom} {medecin.nom}</h1>
              <div className="doctor-speciality">{medecin.specialite}</div>
              {medecin.sous_specialites && (
                <div className="doctor-subspecialty">{medecin.sous_specialites}</div>
              )}
              <div className="doctor-etablissement">
                <span className="etablissement-icon">🏥</span>
                {medecin.etablissement}
              </div>
            </div>
          </div>
          
          <div className="profile-actions">
            {medecin.accepte_nouveaux_patients && medecin.visibilite?.accepte_nouveaux_patients !== 'private' && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn-request-traitant"
              >
                👨‍⚕️ Demande de médecin traitant
              </button>
            )}
            <button
              onClick={handleScheduleAppointment}
              className="btn-schedule"
            >
              📅 Prendre rendez-vous
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="profile-content">
        
        {/* À propos */}
        {medecin.bio && (
          <div className="section about-section">
            <h2>
              <span className="section-icon">📝</span>
              À propos
            </h2>
            <div className="bio-content">
              <p>{medecin.bio}</p>
            </div>
          </div>
        )}

        {/* Informations pratiques */}
        <div className="section practical-info">
          <h2>
            <span className="section-icon">ℹ️</span>
            Informations pratiques
          </h2>
          
          <div className="info-grid">
            {canViewField('adresse_cabinet') && (
              <div className="info-card">
                <div className="info-header">
                  <span className="info-icon">📍</span>
                  <strong>Adresse</strong>
                </div>
                <div className="info-content">
                  {medecin.adresse_cabinet || 'Non renseignée'}
                </div>
              </div>
            )}
            
            {canViewField('telephone_cabinet') && (
              <div className="info-card">
                <div className="info-header">
                  <span className="info-icon">📞</span>
                  <strong>Téléphone</strong>
                </div>
                <div className="info-content">
                  {medecin.telephone_cabinet ? (
                    <a href={`tel:${medecin.telephone_cabinet}`}>
                      {medecin.telephone_cabinet}
                    </a>
                  ) : (
                    'Non renseigné'
                  )}
                </div>
              </div>
            )}
            
            {canViewField('duree_consultation') && (
              <div className="info-card">
                <div className="info-header">
                  <span className="info-icon">⏰</span>
                  <strong>Durée consultation</strong>
                </div>
                <div className="info-content">
                  {medecin.duree_consultation} minutes
                </div>
              </div>
            )}
            
            {canViewField('horaires_consultation') && (
              <div className="info-card">
                <div className="info-header">
                  <span className="info-icon">🗓️</span>
                  <strong>Horaires de consultation</strong>
                </div>
                <div className="info-content horaires-list">
                  {medecin.horaires_consultation ? (
                    typeof medecin.horaires_consultation === 'string' ? (
                      <p>{medecin.horaires_consultation}</p>
                    ) : (
                      Object.entries(medecin.horaires_consultation).map(([jour, heures]) => (
                        <div key={jour} className="horaire-item">
                          <span className="jour">{jour}</span>
                          <span className="heures">{heures}</span>
                        </div>
                      ))
                    )
                  ) : (
                    <p className="no-horaires">Horaires non renseignés</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        {canViewField('services') && (
          <div className="section services-section">
            <h2>
              <span className="section-icon">🩺</span>
              Services proposés
            </h2>
          
          <div className="services-grid">
            <div className={`service-item ${medecin.accepte_nouveaux_patients ? 'available' : 'unavailable'}`}>
              <span className="service-icon">👥</span>
              <span className="service-name">Nouveaux patients</span>
              <span className="service-status">
                {medecin.accepte_nouveaux_patients ? '✅ Acceptés' : '❌ Non acceptés'}
              </span>
            </div>
            
            <div className={`service-item ${medecin.consultations_urgence ? 'available' : 'unavailable'}`}>
              <span className="service-icon">🚨</span>
              <span className="service-name">Urgences</span>
              <span className="service-status">
                {medecin.consultations_urgence ? '✅ Disponible' : '❌ Non disponible'}
              </span>
            </div>
            
            <div className={`service-item ${medecin.teleconsultation ? 'available' : 'unavailable'}`}>
              <span className="service-icon">💻</span>
              <span className="service-name">Téléconsultation</span>
              <span className="service-status">
                {medecin.teleconsultation ? '✅ Proposée' : '❌ Non proposée'}
              </span>
            </div>
          </div>
        </div>
        )}

        {/* Formations et certifications */}
        {(medecin.formations || medecin.certifications) && (
          <div className="section qualifications-section">
            <h2>
              <span className="section-icon">🎓</span>
              Formations et certifications
            </h2>
            
            <div className="qualifications-content">
              {medecin.formations && (
                <div className="qualification-block">
                  <h3>Formations</h3>
                  <p>{medecin.formations}</p>
                </div>
              )}
              
              {medecin.certifications && (
                <div className="qualification-block">
                  <h3>Certifications</h3>
                  <p>{medecin.certifications}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disponibilités */}
        {canViewField('disponibilites') && medecin.disponibilites && (
          <div className="section availability-section">
            <h2>
              <span className="section-icon">📅</span>
              Disponibilités
            </h2>
            <div className="availability-grid">
              {Object.entries(medecin.disponibilites).map(([jour, horaires]) => (
                <div key={jour} className="day-card">
                  <div className="day-header">{jour}</div>
                  <div className="day-hours">
                    {horaires.length > 0 ? (
                      horaires.map((plage, index) => (
                        <div key={index} className="time-slot">
                          {plage.debut} - {plage.fin}
                        </div>
                      ))
                    ) : (
                      <div className="no-slots">Indisponible</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Langues parlées */}
        {medecin.langues_parlees && canViewField('langues_parlees') && (
          <div className="section languages-section">
            <h2>
              <span className="section-icon">🌍</span>
              Langues parlées
            </h2>
            <div className="languages-list">
              {medecin.langues_parlees.split(',').map((langue, index) => (
                <span key={index} className="language-tag">
                  {langue.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Avis patients (si activés) */}
        {medecin.afficher_avis && medecin.avis && medecin.avis.length > 0 && (
          <div className="section reviews-section">
            <h2>
              <span className="section-icon">⭐</span>
              Avis patients
            </h2>
            
            <div className="reviews-summary">
              <div className="average-rating">
                <span className="rating-number">{medecin.note_moyenne.toFixed(1)}</span>
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`star ${i < Math.round(medecin.note_moyenne) ? 'filled' : ''}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="reviews-count">({medecin.avis.length} avis)</span>
              </div>
            </div>
            
            <div className="reviews-list">
              {medecin.avis.slice(0, 3).map((avis, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`star ${i < avis.note ? 'filled' : ''}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="review-date">
                      {new Date(avis.date_creation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="review-comment">{avis.commentaire}</p>
                  <div className="review-author">Patient anonyme</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de demande de médecin traitant */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Demande de médecin traitant</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>
                Vous souhaitez faire une demande pour que Dr. {medecin.nom} 
                devienne votre médecin traitant ?
              </p>
              
              <div className="form-group">
                <label htmlFor="request-message">Message (optionnel)</label>
                <textarea
                  id="request-message"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows="4"
                  placeholder="Expliquez brièvement pourquoi vous souhaitez ce médecin comme traitant..."
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => setShowRequestModal(false)}
                className="btn-cancel"
              >
                Annuler
              </button>
              <button
                onClick={handleSendRequest}
                disabled={sendingRequest}
                className="btn-confirm"
              >
                {sendingRequest ? 'Envoi...' : 'Envoyer la demande'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedecinProfilePublic;
