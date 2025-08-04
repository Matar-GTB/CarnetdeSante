// src/pages/search/SearchMedecinsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllMedecins } from '../../services/traitantService';
import { searchDoctors } from '../../services/profileService';
import Loader from '../../components/ui/Loader';
import './SearchMedecinsPage.css';

const SearchMedecinsPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // États
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [medecins, setMedecins] = useState([]);
  const [filteredMedecins, setFilteredMedecins] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    specialite: '',
    localisation: '',
    langues: '',
    accepte_nouveaux: false,
    accessibilite: false
  });
  const [sortBy, setSortBy] = useState('pertinence'); // pertinence, proximite, note

  // Spécialités disponibles
  const specialites = [
    'Médecine générale',
    'Cardiologie',
    'Dermatologie',
    'Gynécologie',
    'Pédiatrie',
    'Psychiatrie',
    'Radiologie',
    'Chirurgie',
    'Ophtalmologie',
    'ORL',
    'Neurologie',
    'Endocrinologie'
  ];

  // Langues disponibles
  const langues = [
    'Français',
    'Anglais',
    'Espagnol',
    'Allemand',
    'Italien',
    'Arabe',
    'Chinois'
  ];

  useEffect(() => {
    loadMedecins();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [medecins, filters, sortBy]);

  const loadMedecins = async () => {
    try {
      setLoading(true);
      const data = await getAllMedecins();
      setMedecins(data);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = [...medecins];

    // Recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(medecin => 
        `${medecin.nom} ${medecin.prenom}`.toLowerCase().includes(searchLower) ||
        medecin.specialite?.toLowerCase().includes(searchLower) ||
        medecin.etablissements?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par spécialité
    if (filters.specialite) {
      filtered = filtered.filter(medecin => 
        medecin.specialite === filters.specialite
      );
    }

    // Filtre par localisation (simulation)
    if (filters.localisation) {
      filtered = filtered.filter(medecin => 
        medecin.adresse?.toLowerCase().includes(filters.localisation.toLowerCase())
      );
    }

    // Filtre par langues
    if (filters.langues) {
      filtered = filtered.filter(medecin => 
        medecin.langues?.includes(filters.langues)
      );
    }

    // Filtre nouveaux patients
    if (filters.accepte_nouveaux) {
      filtered = filtered.filter(medecin => 
        medecin.accepte_nouveaux_patients === true
      );
    }

    // Filtre accessibilité
    if (filters.accessibilite) {
      filtered = filtered.filter(medecin => 
        medecin.accessibilite && medecin.accessibilite.length > 0
      );
    }

    // Tri
    filtered = sortResults(filtered, sortBy);

    setFilteredMedecins(filtered);
  };

  const sortResults = (results, sortType) => {
    switch (sortType) {
      case 'proximite':
        // Tri par proximité (simulation)
        return results.sort(() => Math.random() - 0.5);
      
      case 'note':
        // Tri par note moyenne (simulation)
        return results.sort((a, b) => (b.note_moyenne || 0) - (a.note_moyenne || 0));
      
      case 'pertinence':
      default:
        // Tri par pertinence (par défaut)
        return results;
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      specialite: '',
      localisation: '',
      langues: '',
      accepte_nouveaux: false,
      accessibilite: false
    });
    setSortBy('pertinence');
  };

  const handlePrendreRdv = (medecinId) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    navigate(`/doctors/${medecinId}/appointment`);
  };

  const handleVoirProfil = (medecinId) => {
    navigate(`/doctors/${medecinId}/public`);
  };

  const handleDemanderTraitant = (medecinId) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    navigate(`/medecin-traitant/request/${medecinId}`);
  };

  const getProchainCreneau = (medecin) => {
    // Simulation du prochain créneau disponible
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('fr-FR');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  if (loading) {
    return <Loader message="Chargement des médecins..." />;
  }

  return (
    <div className="search-medecins-page">
      <div className="search-header">
        <h1>🔍 Trouvez votre médecin</h1>
        <p>Recherchez parmi {medecins.length} professionnels de santé</p>
      </div>

      {/* Filtres de recherche */}
      <div className="search-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label>Recherche</label>
            <input
              type="text"
              placeholder="Nom, spécialité, établissement..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Spécialité</label>
            <select
              value={filters.specialite}
              onChange={(e) => handleFilterChange('specialite', e.target.value)}
            >
              <option value="">Toutes les spécialités</option>
              {specialites.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Localisation</label>
            <input
              type="text"
              placeholder="Ville, code postal..."
              value={filters.localisation}
              onChange={(e) => handleFilterChange('localisation', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Langue</label>
            <select
              value={filters.langues}
              onChange={(e) => handleFilterChange('langues', e.target.value)}
            >
              <option value="">Toutes les langues</option>
              {langues.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={filters.accepte_nouveaux}
                onChange={(e) => handleFilterChange('accepte_nouveaux', e.target.checked)}
              />
              Accepte nouveaux patients
            </label>
          </div>

          <div className="filter-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={filters.accessibilite}
                onChange={(e) => handleFilterChange('accessibilite', e.target.checked)}
              />
              Accessible PMR
            </label>
          </div>

          <div className="filter-group">
            <label>Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="pertinence">Pertinence</option>
              <option value="proximite">Proximité</option>
              <option value="note">Note</option>
            </select>
          </div>

          <button className="reset-filters-btn" onClick={resetFilters}>
            🔄 Réinitialiser
          </button>
        </div>
      </div>

      {/* Résultats */}
      <div className="search-results">
        <div className="results-header">
          <h3>{filteredMedecins.length} résultat{filteredMedecins.length > 1 ? 's' : ''}</h3>
        </div>

        {filteredMedecins.length > 0 ? (
          <div className="medecins-grid">
            {filteredMedecins.map((medecin) => (
              <div key={medecin.id} className="medecin-card">
                <div className="medecin-header">
                  <div className="medecin-photo">
                    <img
                      src={medecin.photo_profil || '/images/avatar.png'}
                      alt={`Dr. ${medecin.nom}`}
                      onError={(e) => {
                        e.target.src = '/images/avatar.png';
                      }}
                    />
                  </div>
                  <div className="medecin-info">
                    <h4>Dr. {medecin.prenom} {medecin.nom}</h4>
                    <p className="specialite">{medecin.specialite}</p>
                    <div className="rating">
                      {renderStars(medecin.note_moyenne)}
                      <span className="rating-text">
                        ({medecin.note_moyenne || 0}/5)
                      </span>
                    </div>
                  </div>
                  <div className="medecin-status">
                    {medecin.accepte_nouveaux_patients && (
                      <span className="status-badge nouveaux">Nouveaux patients</span>
                    )}
                    {medecin.accepte_non_traitants && (
                      <span className="status-badge non-traitants">Sans référent</span>
                    )}
                  </div>
                </div>

                <div className="medecin-details">
                  {medecin.etablissements && (
                    <p className="etablissement">📍 {medecin.etablissements}</p>
                  )}
                  <p className="prochain-creneau">
                    📅 Prochain créneau: {getProchainCreneau(medecin)}
                  </p>
                  {medecin.langues && (
                    <p className="langues">🌐 {medecin.langues}</p>
                  )}
                  {medecin.accessibilite && (
                    <p className="accessibilite">♿ Accessible</p>
                  )}
                </div>

                <div className="medecin-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => handleVoirProfil(medecin.id)}
                  >
                    👁️ Voir profil
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => handlePrendreRdv(medecin.id)}
                  >
                    📅 Prendre RDV
                  </button>
                  {user?.role === 'patient' && (
                    <button
                      className="btn-outline"
                      onClick={() => handleDemanderTraitant(medecin.id)}
                    >
                      👨‍⚕️ Demander comme traitant
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Aucun médecin trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
            <button className="btn-primary" onClick={resetFilters}>
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMedecinsPage;
