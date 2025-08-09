import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaTimes, 
  FaUserMd, 
  FaEye, 
  FaUserPlus, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaSync,
  FaClipboardList,
  FaFileAlt,
  FaThLarge,
  FaList
} from 'react-icons/fa';
import './SearchDoctorsTab.css';

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
        
        return nom.includes(query) || specialite.includes(query);
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
      case 'en_attente': return <><FaClock /> En attente</>;
      case 'accepte': return <><FaCheckCircle /> Accepté</>;
      case 'refuse': return <><FaTimesCircle /> Refusé</>;
      default: return <><FaFileAlt /> Demandé</>;
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

  // Composant de ligne médecin (format liste)
  const DoctorRow = ({ doctor, isRequesting, hasRequested, requestStatus }) => {
    const rowClass = `doctor-row ${hasRequested ? 'doctor-row--requested' : ''}`;
    
    return (
      <div className={rowClass}>
        <div className="doctor-row__avatar">
          <img
            src={
              doctor.photo_profil && doctor.photo_profil.startsWith('/uploads')
                ? `${API_BASE_URL}${doctor.photo_profil}`
                : doctor.photo_profil && doctor.photo_profil.startsWith('http')
                  ? doctor.photo_profil
                  : "/images/avatar.png"
            }
            alt={`Dr ${doctor.prenom} ${doctor.nom}`}
            className="doctor-row__avatar-img"
            onError={(e) => {
              e.target.src = "/images/avatar.png";
            }}
          />
        </div>
        
        <div className="doctor-row__info">
          <h3 
            className="doctor-row__name"
            onClick={() => handleProfileClick(doctor.id)}
          >
            Dr. {doctor.nom || ''} {doctor.prenom || ''}
          </h3>
          <p className="doctor-row__specialty">
            <FaUserMd /> {doctor.specialite || 'Spécialité non renseignée'}
          </p>
        </div>
        
        <div className="doctor-row__actions">
          <button
            className="btn btn--secondary btn--small"
            onClick={() => handleProfileClick(doctor.id)}
          >
            <FaEye /> Profil
          </button>
          
          <button
            className={`btn ${hasRequested ? 'btn--success' : 'btn--primary'} btn--small`}
            onClick={() => handleRequest(doctor)}
            disabled={isRequesting || hasRequested}
          >
            {isRequesting && <><FaClock /> En cours...</>}
            {!isRequesting && !hasRequested && <><FaUserPlus /> Demander</>}
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
        <span className="search-icon"><FaSearch /></span>
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher par nom ou spécialité..."
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
            <FaTimes />
          </button>
        )}
      </div>
      
      {search && (
        <div className="search-info">
          <FaFileAlt /> Recherche en temps réel • {filteredAndSortedMedecins.length} résultat{filteredAndSortedMedecins.length > 1 ? 's' : ''}
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
        <h2><FaSearch /> Rechercher un Médecin</h2>
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
            </select>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="results-section">
        {filteredAndSortedMedecins.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><FaSearch /></div>
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
                      <FaSync /> Effacer la recherche
                    </button>
                  )}
                  {selectedSpecialty && (
                    <button 
                      className="btn btn--secondary"
                      onClick={() => setSelectedSpecialty('')}
                    >
                      <FaList /> Toutes les spécialités
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
                  <FaSync /> Actualiser
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="results-header">
              <h3>{filteredAndSortedMedecins.length} médecin{filteredAndSortedMedecins.length > 1 ? 's' : ''} trouvé{filteredAndSortedMedecins.length > 1 ? 's' : ''}</h3>
              <p>Cliquez sur "Demander" pour envoyer une demande</p>
            </div>
            
            <div className="doctors-list">
              {filteredAndSortedMedecins.map(doctor => {
                const existingRequest = getRequestForDoctor(doctor.id);
                return (
                  <div
                    key={doctor.id}
                    ref={el => cardRefs.current[doctor.id] = el}
                    className={highlightId === doctor.id ? 'highlight-item' : ''}
                  >
                    <DoctorRow
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
            <FaClipboardList /> Voir mes demandes en cours ({requests.filter(r => r.statut === 'en_attente').length})
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchDoctorsTab;
