// pages/medecin/MedecinRequestsPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import traitantService from '../../services/traitantService';
import './MedecinRequestsPage.css';

const MedecinRequestsPage = () => {
  const { user } = useContext(AuthContext);
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
  const [processingRequest, setProcessingRequest] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadRequests = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
        console.log('🔄 Rafraîchissement des demandes en cours...');
      } else {
        setLoading(true);
        console.log('📥 Chargement initial des demandes...');
      }
      
      if (user && user.id) {
        const data = await traitantService.getDemandesPourMedecin();
        console.log(`✅ ${data?.length || 0} demande(s) récupérée(s)`);
        setRequests(data || []);
        setLastRefresh(new Date());
      } else {
        console.warn('⚠️ Utilisateur non connecté - impossible de charger les demandes');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des demandes:', error);
      // En case d'erreur, on garde les anciennes données
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadRequests();

    // Actualisation automatique plus fréquente (toutes les 10 secondes)
    const interval = setInterval(() => {
      console.log('🔄 Actualisation automatique des demandes médecin...');
      loadRequests(true);
    }, 10000); // Réduit de 30s à 10s pour plus de réactivité

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

  const getFilteredRequests = () => {
    switch (filter) {
      case 'pending':
        return requests.filter(req => req.statut === 'en_attente');
      case 'accepted':
        return requests.filter(req => req.statut === 'accepte');
      case 'rejected':
        return requests.filter(req => req.statut === 'refuse');
      default:
        return requests;
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'en_attente':
        return <span className="status-badge pending">⏳ En attente</span>;
      case 'accepte':
        return <span className="status-badge accepted">✅ Acceptée</span>;
      case 'refuse':
        return <span className="status-badge rejected">❌ Refusée</span>;
      default:
        return <span className="status-badge unknown">❓ Inconnu</span>;
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
            <span className="header-icon">📨</span>
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
              <button 
                onClick={() => loadRequests(true)}
                disabled={refreshing}
                className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                title="Actualiser les demandes manuellement"
              >
                <span className="refresh-icon">🔄</span>
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
              <div className="refresh-info">
                <div className="last-refresh">
                  Dernière mise à jour : {lastRefresh.toLocaleTimeString('fr-FR')}
                </div>
                <div className="auto-refresh-indicator">
                  🔄 Actualisation auto toutes les 10s
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
            Toutes ({requests.length})
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
            Acceptées ({requests.filter(req => req.statut === 'accepte').length})
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
            <span className="empty-icon">📫</span>
            <h3>
              {filter === 'pending' ? 'Aucune demande en attente' :
               filter === 'accepted' ? 'Aucune demande acceptée' :
               filter === 'rejected' ? 'Aucune demande refusée' :
               'Aucune demande reçue'}
            </h3>
            <p>
              {filter === 'pending' ? 
                'Vous n\'avez pas de nouvelles demandes de patients.' :
                'Les demandes apparaîtront ici dès que vous en recevrez.'
              }
            </p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map(request => (
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
                    <span className="date-icon">📅</span>
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
                          👁️ Voir le patient
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedecinRequestsPage;
