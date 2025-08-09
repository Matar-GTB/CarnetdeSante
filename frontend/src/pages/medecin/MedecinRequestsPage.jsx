// pages/medecin/MedecinRequestsPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import traitantService from '../../services/traitantService';
import './MedecinRequestsPage.css';
import { FaInbox, FaSyncAlt, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaCalendarAlt, FaEye } from 'react-icons/fa';

const MedecinRequestsPage = () => {
  const { user } = useContext(AuthContext);
  
  const [requests, setRequests] = useState([]);
  const [acceptedPatients, setAcceptedPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
  const [processingRequest, setProcessingRequest] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadRequests = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        console.log('🔄 Rafraîchissement des demandes en cours...');
      } else {
        setLoading(true);
        console.log('📥 Chargement initial des demandes...');
      }
      
      if (user && user.id) {
        // Récupérer toutes les demandes (en_attente, refuse)
        const data = await traitantService.getDemandesPourMedecin();
        setRequests(data || []);
        // Récupérer les patients acceptés pour l'onglet Acceptées
        const patients = await traitantService.getMyPatients();
        setAcceptedPatients(patients || []);
        setLastRefresh(new Date());
      } else {
        console.warn('⚠️ Utilisateur non connecté - impossible de charger les demandes');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des demandes:', error);
      // En case d'erreur, on garde les anciennes données
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRequests();

    // Actualisation automatique toutes les 5 secondes
    const interval = setInterval(() => {
      console.log('🔄 Actualisation automatique des demandes médecin...');
      loadRequests(true);
    }, 5000);

    // Actualisation quand la page redevient visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible - Actualisation des demandes');
        loadRequests(true);
      }
    };

    // Écouter les changements de visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Nettoyage du timer et des événements quand le composant se démonte
    return () => {
      console.log('🧹 Nettoyage de l\'intervalle d\'actualisation');
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadRequests]);

  const handleAcceptRequest = async (requestId) => {
    try {
      setProcessingRequest(requestId);
      
      await traitantService.repondreDemandeTraitant(requestId, 'accepte');
      
      // Actualiser la liste après l'action
      await loadRequests(true);
      
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      alert('Erreur lors de l\'acceptation de la demande');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId, reason = '') => {
    try {
      setProcessingRequest(requestId);
      
      await traitantService.repondreDemandeTraitant(requestId, 'refuse', reason);
      
      // Actualiser la liste après l'action
      await loadRequests(true);
      
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      alert('Erreur lors du refus de la demande');
    } finally {
      setProcessingRequest(null);
    }
  };

  // Affichage selon le filtre
  const getFilteredRequests = () => {
    switch (filter) {
      case 'pending':
        return requests.filter(req => req.statut === 'en_attente');
      case 'accepted':
        // On retourne la liste des patients acceptés (comme dans Mes Patients)
        return acceptedPatients;
      case 'rejected':
        return requests.filter(req => req.statut === 'refuse');
      default:
        return requests;
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'en_attente':
        return <span className="status-badge pending"><FaHourglassHalf style={{marginRight:4}} />En attente</span>;
      case 'accepte':
        return <span className="status-badge accepted"><FaCheckCircle style={{marginRight:4}} />Acceptée</span>;
      case 'refuse':
        return <span className="status-badge rejected"><FaTimesCircle style={{marginRight:4}} />Refusée</span>;
      default:
        return <span className="status-badge unknown"><FaQuestionCircle style={{marginRight:4}} />Inconnu</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filteredRequests = getFilteredRequests();
  const pendingCount = requests.filter(req => req.statut === 'en_attente').length;

  if (loading) {
    return (
      <div className="medecin-requests-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des demandes...</p>
      </div>
    );
  }

  return (
    <div className="medecin-requests-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <span className="header-icon"><FaInbox /></span>
            Demandes de Patients
          </h1>
          <div className="header-right">
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{requests.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item pending">
                <span className="stat-number">{pendingCount}</span>
                <span className="stat-label">En attente</span>
              </div>
            </div>
            <div className="header-actions">
              <div className="refresh-info">
                <div className="last-refresh">
                  Dernière mise à jour : {lastRefresh.toLocaleTimeString('fr-FR')}
                </div>
                <div className="auto-refresh-indicator">
                  <FaSyncAlt style={{marginRight:4}} />Actualisation auto toutes les 5s
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters-section">
        <div className="filters-container">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            Toutes ({requests.length + acceptedPatients.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          >
            En attente ({requests.filter(req => req.statut === 'en_attente').length})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
          >
            Acceptées ({acceptedPatients.length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          >
            Refusées ({requests.filter(req => req.statut === 'refuse').length})
          </button>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="requests-content">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><FaInbox size={28} /></span>
            <h3>
              {filter === 'pending' ? 'Aucune demande en attente' :
               filter === 'accepted' ? 'Aucun patient accepté' :
               filter === 'rejected' ? 'Aucune demande refusée' :
               'Aucune demande reçue'}
            </h3>
            <p>
              {filter === 'pending' ? 
                'Vous n\'avez pas de nouvelles demandes de patients.' :
                filter === 'accepted' ?
                'Aucun patient n\'a encore accepté votre demande.' :
                'Les demandes apparaîtront ici dès que vous en recevrez.'
              }
            </p>
          </div>
        ) : (
          <div className="requests-grid">
            {filter === 'accepted' ? (
              // Affichage patients acceptés (comme Mes Patients)
              filteredRequests.map(patient => (
                <div key={patient.id} className="request-card accepte">
                  <div className="request-header">
                    <div className="patient-info">
                      <div className="patient-avatar">
                        {patient.photo_profil ? (
                          <img src={patient.photo_profil} alt="Profil" className="avatar-img" />
                        ) : (
                          <span>{(patient.prenom || 'P').charAt(0)}{(patient.nom || 'N').charAt(0)}</span>
                        )}
                      </div>
                      <div className="patient-details">
                        <h3>{patient.prenom} {patient.nom}</h3>
                        <div className="patient-meta">
                          <span>{calculateAge(patient.date_naissance)} ans</span>
                          <span>•</span><span>{patient.sexe === 'M' ? 'Homme' : 'Femme'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="request-status">
                      <span className="status-badge accepted"><FaCheckCircle style={{marginRight:4}} />Acceptée</span>
                    </div>
                  </div>
                  <div className="request-body">
                    <div className="request-actions">
                      <button className="btn-view-patient">
                        <FaEye style={{marginRight:4}} />Voir le patient
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Affichage demandes classiques (en_attente, refuse)
              filteredRequests.map(request => (
                <div key={request.id} className={`request-card ${request.statut}`}>
                  <div className="request-header">
                    <div className="patient-info">
                      <div className="patient-avatar">
                        {request.Patient?.prenom?.charAt(0) || '?'}{request.Patient?.nom?.charAt(0) || '?'}
                      </div>
                      <div className="patient-details">
                        <h3>{request.Patient?.prenom} {request.Patient?.nom}</h3>
                        <div className="patient-meta">
                          {calculateAge(request.Patient?.date_naissance) && (
                            <span>{calculateAge(request.Patient?.date_naissance)} ans</span>
                          )}
                          {request.Patient?.adresse && (
                            <span>• {request.Patient.adresse}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="request-status">
                      {getStatusBadge(request.statut)}
                    </div>
                  </div>
                  <div className="request-body">
                    <div className="request-date">
                      <span className="date-icon"><FaCalendarAlt /></span>
                      Demande reçue le {formatDate(request.date_creation)}
                    </div>
                    {request.message_demande && (
                      <div className="request-message">
                        <h4>Message du patient :</h4>
                        <p>"{request.message_demande}"</p>
                      </div>
                    )}
                    {request.Patient?.antecedents_medicaux && (
                      <div className="medical-info">
                        <h4>Antécédents médicaux :</h4>
                        <p>{request.Patient.antecedents_medicaux}</p>
                      </div>
                    )}
                    {request.Patient?.allergies && (
                      <div className="medical-info">
                        <h4>Allergies :</h4>
                        <p>{request.Patient.allergies}</p>
                      </div>
                    )}
                  </div>
                  <div className="request-actions">
                    {request.statut === 'en_attente' ? (
                      <div className="pending-actions">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="btn-accept"
                        >
                          {processingRequest === request.id ? '⏳' : '✅'} Accepter
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Raison du refus (optionnel):');
                            if (reason !== null) {
                              handleRejectRequest(request.id, reason);
                            }
                          }}
                          disabled={processingRequest === request.id}
                          className="btn-reject"
                        >
                          {processingRequest === request.id ? '⏳' : '❌'} Refuser
                        </button>
                      </div>
                    ) : (
                      <div className="completed-actions">
                        <div className="response-date">
                          Répondu le {formatDate(request.date_reponse)}
                        </div>
                        {request.statut === 'refuse' && request.raison_refus && (
                          <div className="reject-reason">
                            <strong>Raison :</strong> {request.raison_refus}
                          </div>
                        )}
                        {request.statut === 'accepte' && (
                          <button className="btn-view-patient">
                            <FaEye style={{marginRight:4}} />Voir le patient
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedecinRequestsPage;
