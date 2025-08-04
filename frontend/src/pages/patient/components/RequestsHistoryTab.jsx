import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import traitantService from '../../../services/traitantService';

const RequestsHistoryTab = ({ 
  requests, 
  medecins,
  onSwitchToSearch, 
  onRefresh,
  onCancelRequest,
  onRetryRequest
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [newRequestMessage, setNewRequestMessage] = useState('');
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);

  const handleSearchMedecins = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await traitantService.getAllMedecins();
      if (response) {
        const filtered = response.filter(medecin =>
          `${medecin.prenom} ${medecin.nom}`.toLowerCase().includes(query.toLowerCase()) ||
          (medecin.specialite || '').toLowerCase().includes(query.toLowerCase()) ||
          (medecin.etablissements || '').toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendNewRequest = async () => {
    if (!selectedMedecin) return;

    try {
      setSendingRequest(true);
      const payload = {
        medecin_id: selectedMedecin.id,
        message: newRequestMessage.trim()
      };
      
      await traitantService.requestTraitant(payload);
      
      // Réinitialiser le modal
      setShowNewRequestModal(false);
      setSelectedMedecin(null);
      setNewRequestMessage('');
      setSearchQuery('');
      setSearchResults([]);
      
      // Rafraîchir les demandes
      await onRefresh();
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleCancelRequestLocal = async (request) => {
    console.log('Demande à annuler:', request);
    console.log('ID du médecin:', request.medecin?.id);
    console.log('Données du médecin:', request.medecin);
    setRequestToCancel(request);
    setShowConfirmModal(true);
  };

  const confirmCancelRequest = async () => {
    try {
      console.log('Confirmation annulation pour:', requestToCancel);
      console.log('ID de la demande:', requestToCancel?.id);
      if (requestToCancel?.id) {
        await onCancelRequest(requestToCancel.id);
        setShowConfirmModal(false);
        setRequestToCancel(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
    }
  };

  const handleRetryRequestLocal = async (originalRequest) => {
    if (!originalRequest.medecin?.id) {
        console.error('ID du médecin non trouvé');
        return;
    }

    const doctorData = {
        medecin_id: originalRequest.medecin.id,
        message: `Nouvelle demande suite au refus précédent.`
    };

    try {
        await onRetryRequest(doctorData);
    } catch (error) {
        console.error('Erreur lors de la nouvelle demande:', error);
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
        return <span className="badge badge--pending">⏳ En attente</span>;
      case 'accepte':
        return <span className="badge badge--success">✅ Acceptée</span>;
      case 'refuse':
        return <span className="badge badge--danger">❌ Refusée</span>;
      default:
        return <span className="badge badge--neutral">❓ Inconnu</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = getFilteredRequests();
  const pendingCount = requests.filter(req => req.statut === 'en_attente').length;
  const acceptedCount = requests.filter(req => req.statut === 'accepte').length;
  const rejectedCount = requests.filter(req => req.statut === 'refuse').length;

  return (
    <div className="requests-history-tab">
      <div className="tab-header">
        <h2>📋 Mes Demandes de Médecin Traitant</h2>
        <p>Suivez l'état de toutes vos demandes de médecin traitant</p>
      </div>

      {/* Statistiques */}
      <div className="requests-stats">
        <div className="stat-card">
          <div className="stat-number">{requests.length}</div>
          <div className="stat-label">Total des demandes</div>
        </div>
        <div className="stat-card stat-card--pending">
          <div className="stat-number">{pendingCount}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-number">{acceptedCount}</div>
          <div className="stat-label">Acceptées</div>
        </div>
        <div className="stat-card stat-card--danger">
          <div className="stat-number">{rejectedCount}</div>
          <div className="stat-label">Refusées</div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="quick-actions">
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="btn btn--primary"
        >
          ➕ Nouvelle demande
        </button>
        <button
          onClick={onSwitchToSearch}
          className="btn btn--secondary"
        >
          🔍 Rechercher des médecins
        </button>
      </div>

      {/* Filtres */}
      <div className="filters-section">
        <div className="filters-container">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`}
          >
            Toutes ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`filter-btn ${filter === 'pending' ? 'filter-btn--active' : ''}`}
          >
            En attente ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`filter-btn ${filter === 'accepted' ? 'filter-btn--active' : ''}`}
          >
            Acceptées ({acceptedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`filter-btn ${filter === 'rejected' ? 'filter-btn--active' : ''}`}
          >
            Refusées ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="requests-content">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">📝</span>
            <h3>
              {filter === 'pending' ? 'Aucune demande en attente' :
               filter === 'accepted' ? 'Aucune demande acceptée' :
               filter === 'rejected' ? 'Aucune demande refusée' :
               'Aucune demande envoyée'}
            </h3>
            <p>
              {requests.length === 0 ? 
                'Vous n\'avez pas encore envoyé de demande de médecin traitant.' :
                'Aucune demande ne correspond à ce filtre.'
              }
            </p>
            {requests.length === 0 && (
              <div className="empty-state__actions">
                <button
                  onClick={() => setShowNewRequestModal(true)}
                  className="btn btn--primary"
                >
                  🔍 Trouver un médecin traitant
                </button>
                <button
                  onClick={onSwitchToSearch}
                  className="btn btn--secondary"
                >
                  📋 Parcourir les médecins
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map(request => (
              <div key={request.id} className={`request-card request-card--${request.statut}`}>
                <div className="request-header">
                  <div className="medecin-info">
                    <div className="medecin-avatar">
                      <img
                        src={request.medecin?.photo_profil || '/images/avatar.png'}
                        alt={`Dr ${request.medecin?.prenom} ${request.medecin?.nom}`}
                        onError={(e) => { e.target.src = '/images/avatar.png'; }}
                      />
                    </div>
                    <div className="medecin-details">
                      <h3>Dr. {request.medecin?.nom || ''} {request.medecin?.prenom || ''}</h3>
                      <div className="medecin-meta">
                        <span>{request.medecin?.specialite || 'Spécialité non renseignée'}</span>
                        {request.medecin?.etablissements && (
                          <span>• {request.medecin.etablissements}</span>
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
                    Demande envoyée le {formatDate(request.date_creation)}
                  </div>
                  
                  {request.message_demande && (
                    <div className="request-message">
                      <h4>Votre message :</h4>
                      <p>"{request.message_demande}"</p>
                    </div>
                  )}
                  
                  {request.date_mise_a_jour && request.date_mise_a_jour !== request.date_creation && (
                    <div className="response-date">
                      <span className="date-icon">📅</span>
                      Réponse reçue le {formatDate(request.date_mise_a_jour)}
                    </div>
                  )}
                  
                  {request.statut === 'refuse' && request.message_reponse && (
                    <div className="reject-reason">
                      <h4>Raison du refus :</h4>
                      <p>{request.message_reponse}</p>
                    </div>
                  )}

                  {request.statut === 'accepte' && request.message_reponse && (
                    <div className="accept-message">
                      <h4>Message du médecin :</h4>
                      <p>{request.message_reponse}</p>
                    </div>
                  )}
                </div>

                <div className="request-actions">
                  {request.statut === 'en_attente' ? (
                    <div className="pending-actions">
                      <button
                        onClick={() => request.medecin?.id && navigate(`/doctors/${request.medecin.id}/public`)}
                        className="btn btn--secondary btn--small"
                        disabled={!request.medecin?.id}
                      >
                        👁️ Voir le profil
                      </button>
                      <button
                        onClick={() => handleCancelRequestLocal(request)}
                        className="btn btn--danger btn--small"
                      >
                        ❌ Annuler
                      </button>
                    </div>
                  ) : request.statut === 'accepte' ? (
                    <div className="accepted-actions">
                      <div className="success-message">
                        🎉 Félicitations ! Dr. {request.medecin?.nom || ''} {request.medecin?.prenom || ''} est maintenant votre médecin traitant.
                      </div>
                      <div className="action-buttons">
                        <button
                          onClick={() => request.medecin?.id && navigate(`/doctors/${request.medecin.id}/public`)}
                          className="btn btn--secondary btn--small"
                          disabled={!request.medecin?.id}
                        >
                          👁️ Voir mon médecin traitant
                        </button>
                        <button
                          onClick={() => request.medecin?.id && navigate(`/appointments/with/${request.medecin.id}`)}
                          className="btn btn--primary btn--small"
                          disabled={!request.medecin?.id}
                        >
                          📅 Prendre rendez-vous
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rejected-actions">
                      <button
                        onClick={() => request.medecin?.id && navigate(`/doctors/${request.medecin.id}/public`)}
                        className="btn btn--secondary btn--small"
                        disabled={!request.medecin?.id}
                      >
                        👁️ Voir le profil
                        </button>
                        <button
                        onClick={() => handleRetryRequestLocal(request)}
                        className="btn btn--success btn--small"
                        disabled={!request.medecin?.id}
                      >
                        🔄 Refaire une demande
                      </button>
                      <button
                        onClick={onSwitchToSearch}
                        className="btn btn--primary btn--small"
                      >
                        🔍 Chercher un autre médecin
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal pour nouvelle demande */}
      {showNewRequestModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--large">
            <div className="modal-header">
              <h3>Nouvelle demande de médecin traitant</h3>
              <button
                onClick={() => {
                  setShowNewRequestModal(false);
                  setSelectedMedecin(null);
                  setNewRequestMessage('');
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {!selectedMedecin ? (
                <div className="search-section">
                  <h4>Rechercher un médecin</h4>
                  <div className="search-input-group">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearchMedecins(e.target.value);
                      }}
                      placeholder="Nom, spécialité, ville..."
                      className="search-input"
                    />
                    {searchLoading && <div className="search-loading">🔍</div>}
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map(medecin => (
                        <div
                          key={medecin.id}
                          onClick={() => setSelectedMedecin(medecin)}
                          className="search-result-item"
                        >
                          <div className="result-avatar">
                            <img
                              src={medecin.photo_profil || '/images/avatar.png'}
                              alt={`Dr ${medecin.prenom} ${medecin.nom}`}
                              onError={(e) => { e.target.src = '/images/avatar.png'; }}
                            />
                          </div>
                          <div className="result-info">
                            <strong>Dr. {medecin.prenom} {medecin.nom}</strong>
                            <div className="result-meta">
                              {medecin.specialite || 'Spécialité non renseignée'}
                              {medecin.etablissements && ` • ${medecin.etablissements}`}
                            </div>
                            {medecin.adresse && (
                              <div className="result-location">📍 {medecin.adresse}</div>
                            )}
                          </div>
                          <div className="result-action">
                            Sélectionner →
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="selected-medecin-section">
                  <h4>Médecin sélectionné</h4>
                  <div className="selected-medecin">
                    <div className="selected-avatar">
                      <img
                        src={selectedMedecin.photo_profil || '/images/avatar.png'}
                        alt={`Dr ${selectedMedecin.prenom} ${selectedMedecin.nom}`}
                        onError={(e) => { e.target.src = '/images/avatar.png'; }}
                      />
                    </div>
                    <div className="selected-info">
                      <strong>Dr. {selectedMedecin.prenom} {selectedMedecin.nom}</strong>
                      <div>{selectedMedecin.specialite || 'Spécialité non renseignée'}</div>
                      {selectedMedecin.etablissements && <div>{selectedMedecin.etablissements}</div>}
                    </div>
                    <button
                      onClick={() => setSelectedMedecin(null)}
                      className="btn btn--secondary btn--small"
                    >
                      Changer
                    </button>
                  </div>
                  
                  <div className="message-section">
                    <label htmlFor="request-message">Message (optionnel)</label>
                    <textarea
                      id="request-message"
                      value={newRequestMessage}
                      onChange={(e) => setNewRequestMessage(e.target.value)}
                      rows="4"
                      placeholder="Expliquez pourquoi vous souhaitez ce médecin comme traitant..."
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowNewRequestModal(false);
                  setSelectedMedecin(null);
                  setNewRequestMessage('');
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="btn btn--secondary"
              >
                Annuler
              </button>
              {selectedMedecin && (
                <button
                  onClick={handleSendNewRequest}
                  disabled={sendingRequest}
                  className="btn btn--primary"
                >
                  {sendingRequest ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation d'annulation */}
      {showConfirmModal && requestToCancel && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--small">
            <div className="modal-header">
              <h3>Confirmer l'annulation</h3>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setRequestToCancel(null);
                }}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>
                Êtes-vous sûr de vouloir annuler votre demande pour le <strong>Dr. {requestToCancel.medecin?.nom || ''} {requestToCancel.medecin?.prenom || ''}</strong> ?
              </p>
              <p className="warning-text">
                ⚠️ Cette action est irréversible.
              </p>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setRequestToCancel(null);
                }}
                className="btn btn--secondary"
              >
                Annuler
              </button>
              <button
                onClick={confirmCancelRequest}
                className="btn btn--danger"
              >
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsHistoryTab;
