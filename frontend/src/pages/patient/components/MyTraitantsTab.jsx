import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCrown, 
  FaUserMd, 
  FaSearch, 
  FaTimes, 
  FaEye, 
  FaCalendarAlt, 
  FaTrashAlt, 
  FaSync, 
  FaExclamationTriangle 
} from 'react-icons/fa';

const MyTraitantsTab = ({ 
  traitants, 
  onRemoveTraitant, 
  onSetPrincipal, 
  onSwitchToSearch, 
  onRefresh 
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTraitant, setSelectedTraitant] = useState(null);
  const [showTraitantModal, setShowTraitantModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [traitantToRemove, setTraitantToRemove] = useState(null);

  // Filtrage des médecins traitants
  const filteredTraitants = traitants.filter(traitant => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      `${traitant.prenom} ${traitant.nom}`.toLowerCase().includes(searchLower) ||
      (traitant.specialite || '').toLowerCase().includes(searchLower) ||
      (traitant.email || '').toLowerCase().includes(searchLower)
    );
  });

  const handleViewTraitant = (traitant) => {
    setSelectedTraitant(traitant);
    setShowTraitantModal(true);
  };

  const handleRemoveTraitant = (traitant) => {
    setTraitantToRemove(traitant);
    setShowRemoveModal(true);
  };

 const confirmRemoveTraitant = async () => {
  if (!traitantToRemove || !traitantToRemove.id) {
    console.warn("❌ Aucun médecin traitant sélectionné pour suppression.");
    return;
  }

  try {
    // Appel à la fonction fournie via props
    await onRemoveTraitant(traitantToRemove.id);

    // Réinitialiser l’état
    setShowRemoveModal(false);
    setTraitantToRemove(null);

    // Optionnel : toast ou alerte
    console.log("✅ Médecin traitant supprimé avec succès.");
    // toast.success("Médecin traitant supprimé avec succès !");
  } catch (error) {
    console.error("Erreur lors de la suppression du médecin traitant :", error);
    // toast.error("Erreur lors de la suppression du médecin traitant.");
  }
};

  const handleSetPrincipal = async (traitantId) => {
    await onSetPrincipal(traitantId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Séparation des médecins traitants (principal vs autres)
  const traitantPrincipal = filteredTraitants.find(t => t.is_traitant_principal);
  const autresTraitants = filteredTraitants.filter(t => !t.is_traitant_principal);

  return (
    <div className="my-traitants-tab">
      <div className="tab-header">
        <h2><FaCrown /> Mes Médecins Traitants</h2>
        <p>Gérez vos relations avec vos médecins traitants actuels</p>
      </div>

      {/* Barre de recherche */}
      {traitants.length > 0 && (
        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon"><FaSearch /></span>
            <input
              type="text"
              placeholder="Rechercher parmi vos médecins traitants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {traitants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><FaUserMd /></div>
          <h3>Aucun médecin traitant</h3>
          <p>Vous n'avez pas encore de médecin traitant déclaré.</p>
          <div className="empty-state__actions">
            <button 
              className="btn btn--primary"
              onClick={onSwitchToSearch}
            >
              <FaSearch /> Rechercher un médecin traitant
            </button>
          </div>
        </div>
      ) : filteredTraitants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><FaSearch /></div>
          <h3>Aucun résultat trouvé</h3>
          <p>Aucun médecin traitant ne correspond à votre recherche.</p>
          <button 
            className="btn btn--secondary"
            onClick={() => setSearchTerm('')}
          >
            <FaSync /> Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="traitants-content">
          {/* Médecin traitant principal */}
          {traitantPrincipal && (
            <section className="principal-section">
              <h3 className="section-title">
                <span className="section-icon"><FaCrown /></span>
                Médecin Traitant Principal
              </h3>
              
              <div className="traitant-card traitant-card--principal">
                <div className="traitant-header">
                  <div className="traitant-avatar">
                    <img
                      src={traitantPrincipal.photo_profil || '/images/avatar.png'}
                      alt={`Dr ${traitantPrincipal.prenom} ${traitantPrincipal.nom}`}
                      onError={(e) => { e.target.src = '/images/avatar.png'; }}
                    />
                  </div>
                  
                  <div className="traitant-info">
                    <h4>Dr. {traitantPrincipal.prenom || ''} {traitantPrincipal.nom || ''}</h4>
                    <p className="traitant-specialty">{traitantPrincipal.specialite || 'Médecin généraliste'}</p>
                  </div>
                </div>
                
                <div className="traitant-actions">
                  <button
                    onClick={() => handleViewTraitant(traitantPrincipal)}
                    className="btn btn--secondary"
                  >
                    <FaEye /> Voir détails
                  </button>
                  <button
                    onClick={() => navigate(`/appointments/new?doctorId=${traitantPrincipal.id}`)}
                    className="btn btn--primary"
                  >
                    <FaCalendarAlt /> Prendre RDV
                  </button>
                  <button
                    onClick={() => handleRemoveTraitant(traitantPrincipal)}
                    className="btn btn--danger"
                  >
                    <FaTrashAlt /> Supprimer
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Autres médecins traitants */}
          {autresTraitants.length > 0 && (
            <section className="autres-section">
              <h3 className="section-title">
                <span className="section-icon"><FaUserMd /></span>
                Autres Médecins Traitants ({autresTraitants.length})
              </h3>
              
              <div className="traitants-grid">
                {autresTraitants.map(traitant => (
                  <div key={traitant.id} className="traitant-card">
                    <div className="traitant-header">
                      <div className="traitant-avatar">
                        <img
                          src={traitant.photo_profil || '/images/avatar.png'}
                          alt={`Dr ${traitant.prenom} ${traitant.nom}`}
                          onError={(e) => { e.target.src = '/images/avatar.png'; }}
                        />
                      </div>
                      
                      <div className="traitant-info">
                        <h4>Dr. {traitant.prenom || ''} {traitant.nom || ''}</h4>
                        <p className="traitant-specialty">{traitant.specialite || 'Médecin généraliste'}</p>
                      </div>
                    </div>
                    
                    <div className="traitant-actions">
                      <button
                        onClick={() => handleViewTraitant(traitant)}
                        className="btn btn--secondary btn--small"
                      >
                        <FaEye /> Détails
                      </button>
                      <button
                        onClick={() => navigate(`/appointments/new?doctorId=${traitant.id}`)}
                        className="btn btn--primary btn--small"
                      >
                        <FaCalendarAlt /> RDV
                      </button>
                      <button
                        onClick={() => handleSetPrincipal(traitant.id)}
                        className="btn btn--outline btn--small"
                        title="Définir comme médecin traitant principal"
                      >
                        <FaCrown /> Principal
                      </button>
                      <button
                        onClick={() => handleRemoveTraitant(traitant)}
                        className="btn btn--danger btn--small"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modal de détails du médecin */}
      {showTraitantModal && selectedTraitant && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Détails du médecin traitant</h3>
              <button
                onClick={() => setShowTraitantModal(false)}
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="doctor-details">
                <div className="doctor-avatar-large">
                  <img
                    src={selectedTraitant.photo_profil || '/images/avatar.png'}
                    alt={`Dr ${selectedTraitant.prenom} ${selectedTraitant.nom}`}
                    onError={(e) => { e.target.src = '/images/avatar.png'; }}
                  />
                </div>
                
                <div className="doctor-info-detailed">
                  <h4>Dr {selectedTraitant.prenom} {selectedTraitant.nom}</h4>
                  <p><strong>Spécialité :</strong> {selectedTraitant.specialite || 'Non renseignée'}</p>
                  <p><strong>Établissement :</strong> {selectedTraitant.etablissements || 'Non renseigné'}</p>
                  <p><strong>Email :</strong> {selectedTraitant.email || 'Non renseigné'}</p>
                  <p><strong>Téléphone :</strong> {selectedTraitant.telephone || 'Non renseigné'}</p>
                  <p><strong>Adresse :</strong> {selectedTraitant.adresse || 'Non renseignée'}</p>
                  <p><strong>Relation établie le :</strong> {formatDate(selectedTraitant.date_creation)}</p>
                  {selectedTraitant.is_traitant_principal && (
                    <p><strong>Statut :</strong> <span className="badge badge--principal"><FaCrown /> Médecin traitant principal</span></p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => setShowTraitantModal(false)}
                className="btn btn--secondary"
              >
                Fermer
              </button>
              <button
                onClick={() => navigate(`/doctors/${selectedTraitant.id}/public`)}
                className="btn btn--primary"
              >
                <FaEye /> Voir profil public
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showRemoveModal && traitantToRemove && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--small">
            <div className="modal-header">
              <h3>Confirmer la suppression</h3>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer <strong>Dr {traitantToRemove.prenom} {traitantToRemove.nom}</strong> 
                de votre liste de médecins traitants ?
              </p>
              <p className="warning-text">
                <FaExclamationTriangle /> Cette action est irréversible. Vous devrez renvoyer une demande pour rétablir cette relation.
              </p>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="btn btn--secondary"
              >
                Annuler
              </button>
              <button
                onClick={confirmRemoveTraitant}
                className="btn btn--danger"
              >
                <FaTrashAlt /> Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTraitantsTab;
