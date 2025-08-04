import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// URL de base pour les images
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SearchDoctorsTab = ({ 
  medecins, 
  requests, 
  onRequestTraitant, 
  onSwitchToRequests, 
  onRefresh 
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('nom');
  const [viewMode, setViewMode] = useState('grid');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const cardRefs = useRef({});

  // Filtrage et tri des médecins avec useMemo pour les performances
  const filteredAndSortedMedecins = useMemo(() => {
    let filtered = medecins;
    
    // Filtrage par recherche
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      filtered = filtered.filter(m => {
        if (!m) return false;
        const nom = `${m.prenom || ''} ${m.nom || ''}`.toLowerCase();
        const specialite = (m.specialite || '').toLowerCase();
        const etablissement = (m.etablissements || '').toLowerCase();
        
        return nom.includes(query) || 
               specialite.includes(query) || 
               etablissement.includes(query);
      });
    }
    
    // Filtrage par spécialité
    if (selectedSpecialty) {
      filtered = filtered.filter(m => m.specialite === selectedSpecialty);
    }
    
    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nom':
          return `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`);
        case 'specialite':
          return (a.specialite || '').localeCompare(b.specialite || '');
        case 'etablissement':
          return (a.etablissements || '').localeCompare(b.etablissements || '');
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [medecins, search, selectedSpecialty, sortBy]);

  // Extraction des spécialités uniques
  const specialties = useMemo(() => {
    const specs = medecins
      .map(m => m.specialite)
      .filter(s => s && s.trim())
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .sort();
    return specs;
  }, [medecins]);

  // Vérification si une demande existe déjà
  const getRequestForDoctor = (doctorId) => {
    return requests.find(r => r.medecin_id === doctorId);
  };

  // Fonction utilitaire pour le statut des demandes
  const getRequestStatusText = (status) => {
    switch (status) {
      case 'en_attente': return '⏳ En attente';
      case 'accepte': return '✅ Accepté';
      case 'refuse': return '❌ Refusé';
      default: return '📤 Demandé';
    }
  };

  const handleProfileClick = (doctorId) => {
    navigate(`/doctors/${doctorId}/public`);
  };

  const handleSuggestionClick = (doctorId) => {
    setHighlightId(doctorId);
    setShowSuggestions(false);
    setTimeout(() => {
      if (cardRefs.current[doctorId]) {
        cardRefs.current[doctorId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleRequest = async (doctor) => {
    if (!doctor?.id) return;
    
    setSubmittingId(doctor.id);
    
    try {
      await onRequestTraitant({ 
        medecin_id: doctor.id, 
        message: '' 
      });
      
    } catch (error) {
      console.error('❌ Erreur envoi demande:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  // Composant de carte médecin
  const DoctorCard = ({ doctor, isRequesting, hasRequested, requestStatus }) => {
    const cardClass = `doctor-card ${hasRequested ? 'doctor-card--requested' : ''}`;
    
    return (
      <div className={cardClass}>
        <div className="doctor-card__header">
          <div className="doctor-card__avatar-container">
            <img
              src={
                doctor.photo_profil && doctor.photo_profil.startsWith('/uploads')
                  ? `${API_BASE_URL}${doctor.photo_profil}`
                  : doctor.photo_profil && doctor.photo_profil.startsWith('http')
                    ? doctor.photo_profil
                    : "/images/avatar.png"
              }
              alt={`Dr ${doctor.prenom} ${doctor.nom}`}
              className="doctor-card__avatar"
              onError={(e) => {
                e.target.src = "/images/avatar.png";
              }}
            />
          </div>
          
          <div className="doctor-card__info">
            <div className="doctor-card__name-container">
              <h3 
                className="doctor-card__name"
                onClick={() => handleProfileClick(doctor.id)}
              >
                Dr. {doctor.nom || ''} {doctor.prenom || ''}
              </h3>
            </div>
            <p className="doctor-card__specialty">
              🩺 {doctor.specialite || 'Spécialité non renseignée'}
            </p>
            <p className="doctor-card__establishment">
              🏥 {doctor.etablissements || 'Établissement non renseigné'}
            </p>
            {doctor.adresse && (
              <p className="doctor-card__address">
                📍 {doctor.adresse}
              </p>
            )}
          </div>
        </div>
        
        <div className="doctor-card__actions">
          <button
            className="btn btn--secondary btn--icon"
            onClick={() => handleProfileClick(doctor.id)}
          >
            👤 Voir profil
          </button>
          
          <button
            className={`btn btn--primary ${hasRequested ? 'btn--success' : ''}`}
            onClick={() => handleRequest(doctor)}
            disabled={isRequesting || hasRequested}
          >
            {isRequesting && '⏳ En cours...'}
            {!isRequesting && !hasRequested && '➕ Demander comme traitant'}
            {!isRequesting && hasRequested && getRequestStatusText(requestStatus)}
          </button>
        </div>
      </div>
    );
  };

  // Composant de barre de recherche
  const SearchBar = () => (
    <div className="search-container">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher par nom, spécialité ou établissement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          autoComplete="off"
        />
        {search && (
          <button 
            className="search-clear"
            onClick={() => setSearch('')}
          >
            ✕
          </button>
        )}
      </div>
      
      {search && (
        <div className="search-info">
          📝 Recherche en temps réel • {filteredAndSortedMedecins.length} résultat{filteredAndSortedMedecins.length > 1 ? 's' : ''}
        </div>
      )}
      
      {showSuggestions && filteredAndSortedMedecins.length > 0 && (
        <div className="search-suggestions">
          {filteredAndSortedMedecins.slice(0, 5).map(doctor => (
            <div
              key={doctor.id}
              className="search-suggestion"
              onMouseDown={() => handleSuggestionClick(doctor.id)}
            >
              <img
                src={
                  doctor.photo_profil && doctor.photo_profil.startsWith('/uploads')
                    ? `${API_BASE_URL}${doctor.photo_profil}`
                    : doctor.photo_profil && doctor.photo_profil.startsWith('http')
                      ? doctor.photo_profil
                      : "/images/avatar.png"
                }
                alt={`Dr ${doctor.prenom} ${doctor.nom}`}
                className="search-suggestion__avatar"
                onError={(e) => {
                  e.target.src = "/images/avatar.png";
                }}
              />
              <div className="search-suggestion__info">
                <strong>Dr {doctor.nom} {doctor.prenom}</strong>
                <div className="search-suggestion__details">
                  <span className="specialty">{doctor.specialite || 'Spécialité non renseignée'}</span>
                  <span className="establishment">{doctor.etablissements || 'Établissement non renseigné'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="search-doctors-tab">
      <div className="tab-header">
        <h2>🔍 Rechercher un Médecin</h2>
        <p>Trouvez le médecin parfait parmi notre réseau de professionnels</p>
      </div>

      {/* Barre de recherche */}
      <SearchBar />

      {/* Filtres et options */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="specialty-filter">Spécialité :</label>
            <select
              id="specialty-filter"
              className="filter-select"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="">Toutes les spécialités</option>
              {specialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-filter">Trier par :</label>
            <select
              id="sort-filter"
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="nom">Nom</option>
              <option value="specialite">Spécialité</option>
              <option value="etablissement">Établissement</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Affichage :</label>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'view-btn--active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞ Grille
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'view-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                ☰ Liste
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="results-section">
        {filteredAndSortedMedecins.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            {search.trim() || selectedSpecialty ? (
              <>
                <h3>Aucun résultat trouvé</h3>
                <p>Aucun médecin ne correspond à vos critères de recherche.</p>
                <div className="empty-state__actions">
                  {search && (
                    <button 
                      className="btn btn--secondary"
                      onClick={() => setSearch('')}
                    >
                      🔄 Effacer la recherche
                    </button>
                  )}
                  {selectedSpecialty && (
                    <button 
                      className="btn btn--secondary"
                      onClick={() => setSelectedSpecialty('')}
                    >
                      🗂 Toutes les spécialités
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3>Aucun médecin disponible</h3>
                <p>Il n'y a actuellement aucun médecin dans notre réseau.</p>
                <button 
                  className="btn btn--primary"
                  onClick={onRefresh}
                >
                  🔄 Actualiser
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="results-header">
              <h3>{filteredAndSortedMedecins.length} médecin{filteredAndSortedMedecins.length > 1 ? 's' : ''} trouvé{filteredAndSortedMedecins.length > 1 ? 's' : ''}</h3>
              <p>Cliquez sur "Demander comme traitant" pour envoyer une demande</p>
            </div>
            
            <div className={`doctors-container doctors-container--${viewMode}`}>
              {filteredAndSortedMedecins.map(doctor => {
                const existingRequest = getRequestForDoctor(doctor.id);
                return (
                  <div
                    key={doctor.id}
                    ref={el => cardRefs.current[doctor.id] = el}
                    className={highlightId === doctor.id ? 'highlight-item' : ''}
                  >
                    <DoctorCard
                      doctor={doctor}
                      isRequesting={submittingId === doctor.id}
                      hasRequested={!!existingRequest}
                      requestStatus={existingRequest?.statut}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Action rapide */}
      {requests.length > 0 && (
        <div className="quick-action">
          <button
            className="btn btn--outline"
            onClick={onSwitchToRequests}
          >
            📋 Voir mes demandes en cours ({requests.filter(r => r.statut === 'en_attente').length})
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchDoctorsTab;
