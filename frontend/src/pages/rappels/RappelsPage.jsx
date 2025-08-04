// src/pages/rappels/RappelsPage.jsx - Version Fusionnée et Améliorée
import React, { useEffect, useState, useContext } from 'react';
import { getRappelsApi, supprimerRappelApi, getHistoriqueRappelsApi, supprimerRappelsMultiplesApi } from '../../services/rappelService';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './RappelsPage.css';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr');

const RappelsPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [rappels, setRappels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const [activeTab, setActiveTab] = useState('mes-rappels');
  const [historiqueList, setHistoriqueList] = useState([]);
  const [selectAllHistoric, setSelectAllHistoric] = useState(false);
  const [selectedHistoricIds, setSelectedHistoricIds] = useState([]);
  const [innerTab, setInnerTab] = useState('médicament');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // Vérification des permissions
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth/login');
      return;
    }
    
    if (user.role !== 'patient') {
      navigate('/dashboard');
      return;
    }
    
    fetchRappels();
  }, [isAuthenticated, user, navigate]);

  // Gestion des messages avec fade
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setMessage('');
          setFadeOut(false);
        }, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchRappels = async () => {
    setLoading(true);
    try {
      const data = await getRappelsApi();
      setRappels(data);
    } catch (err) {
      setMessage('❌ Erreur lors du chargement des rappels.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorique = async () => {
    setLoading(true);
    try {
      const data = await getHistoriqueRappelsApi();
      setHistoriqueList(data);
    } catch (err) {
      setMessage('❌ Erreur lors du chargement de l\'historique.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supprimerRappelApi(id);
      setRappels(prev => prev.filter(r => r.id !== id));
      setMessage('✅ Rappel supprimé avec succès.');
    } catch (err) {
      setMessage('❌ Échec de la suppression.');
    }
  };

  const handleDeleteHistoric = async (ids) => {
    try {
      await supprimerRappelsMultiplesApi(ids);
      setHistoriqueList(prev => prev.filter(r => !ids.includes(r.id)));
      setSelectedHistoricIds([]);
      setSelectAllHistoric(false);
      setMessage('✅ Suppression effectuée.');
    } catch (err) {
      setMessage('❌ Échec de la suppression.');
    }
  };

  // Gestion des onglets
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'historique') {
      setSelectAllHistoric(false);
      setSelectedHistoricIds([]);
      fetchHistorique();
    }
  };

  // Gestion de la sélection des historiques
  const handleSelectAllHistoric = () => {
    if (selectAllHistoric) {
      setSelectedHistoricIds([]);
    } else {
      setSelectedHistoricIds(historiqueList.map(rdv => rdv.id));
    }
    setSelectAllHistoric(!selectAllHistoric);
  };

  const handleSelectHistoric = (id) => {
    if (selectedHistoricIds.includes(id)) {
      setSelectedHistoricIds(selectedHistoricIds.filter(i => i !== id));
    } else {
      setSelectedHistoricIds([...selectedHistoricIds, id]);
    }
  };

  const getFilteredRappels = () => {
    let filtered = rappels.filter(r => r.type_rappel === innerTab);
    
    if (filter === 'today') {
      const today = dayjs().format('YYYY-MM-DD');
      filtered = filtered.filter(r => {
        const details = typeof r.details === 'string' ? JSON.parse(r.details || '{}') : r.details || {};
        return dayjs(details.date_heure).format('YYYY-MM-DD') === today;
      });
    } else if (filter === 'week') {
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');
      filtered = filtered.filter(r => {
        const details = typeof r.details === 'string' ? JSON.parse(r.details || '{}') : r.details || {};
        const rappelDate = dayjs(details.date_heure);
        return rappelDate.isAfter(startOfWeek) && rappelDate.isBefore(endOfWeek);
      });
    }
    
    return filtered;
  };

  const getRappelStats = () => {
    const medicaments = rappels.filter(r => r.type_rappel === 'médicament').length;
    const vaccinations = rappels.filter(r => ['vaccination', 'rappel vaccinal'].includes(r.type_rappel)).length;
    const rendezvous = rappels.filter(r => r.type_rappel === 'rendezvous').length;
    
    const today = dayjs().format('YYYY-MM-DD');
    const todayRappels = rappels.filter(r => {
      const details = typeof r.details === 'string' ? JSON.parse(r.details || '{}') : r.details || {};
      return dayjs(details.date_heure).format('YYYY-MM-DD') === today;
    }).length;

    return { medicaments, vaccinations, rendezvous, todayRappels, total: rappels.length };
  };

  const stats = getRappelStats();
  const filteredRappels = getFilteredRappels();

  if (loading) {
    return (
      <div className="rappels-page loading">
        <div className="loading-spinner"></div>
        <p>Chargement de vos rappels...</p>
      </div>
    );
  }

  return (
    <div className="rappels-page">
      {/* En-tête */}
      <div className="page-header">
        <button className="btn-retour" onClick={() => navigate('/dashboard')}>
          ⬅ Retour
        </button>
        <div className="header-content">
          <h1>📅 Mes Rappels</h1>
          <p>Gérez vos rappels de santé</p>
        </div>
        <button className="btn-ajouter" onClick={() => navigate('/rappels/create')}>
          ➕ Nouveau Rappel
        </button>
      </div>

      {/* Messages d'état */}
      {message && (
        <div className={`message ${fadeOut ? 'fade-out' : ''}`}>
          {message}
        </div>
      )}

      {/* Statistiques */}
      <div className="rappels-stats">
        <h3>📊 Vos rappels</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item highlight">
            <span className="stat-number">{stats.todayRappels}</span>
            <span className="stat-label">Aujourd'hui</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.medicaments}</span>
            <span className="stat-label">Médicaments</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.vaccinations}</span>
            <span className="stat-label">Vaccinations</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.rendezvous}</span>
            <span className="stat-label">Rendez-vous</span>
          </div>
        </div>
      </div>

      {/* Onglets principaux */}
      <div className="main-tabs">
        <button
          className={`tab-btn ${activeTab === 'mes-rappels' ? 'active' : ''}`}
          onClick={() => handleTabChange('mes-rappels')}
        >
          📋 Mes Rappels
        </button>
        <button
          className={`tab-btn ${activeTab === 'historique' ? 'active' : ''}`}
          onClick={() => handleTabChange('historique')}
        >
          🕓 Historique
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'mes-rappels' && (
        <div className="mes-rappels-content">
          {/* Sous-onglets */}
          <div className="sub-tabs">
            <button
              className={`sub-tab ${innerTab === 'médicament' ? 'active' : ''}`}
              onClick={() => setInnerTab('médicament')}
            >
              💊 Médicaments ({stats.medicaments})
            </button>
            <button
              className={`sub-tab ${innerTab === 'vaccination' ? 'active' : ''}`}
              onClick={() => setInnerTab('vaccination')}
            >
              💉 Vaccinations ({stats.vaccinations})
            </button>
            <button
              className={`sub-tab ${innerTab === 'rendezvous' ? 'active' : ''}`}
              onClick={() => setInnerTab('rendezvous')}
            >
              📅 Rendez-vous ({stats.rendezvous})
            </button>
          </div>

          {/* Filtres */}
          <div className="filter-section">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tous
              </button>
              <button 
                className={`filter-tab ${filter === 'today' ? 'active' : ''}`}
                onClick={() => setFilter('today')}
              >
                Aujourd'hui
              </button>
              <button 
                className={`filter-tab ${filter === 'week' ? 'active' : ''}`}
                onClick={() => setFilter('week')}
              >
                Cette semaine
              </button>
            </div>
          </div>

          {/* Contenu des rappels */}
          {innerTab === 'médicament' && (
            <div className="rappel-section">
              {filteredRappels.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">�</div>
                  <h3>Aucun rappel de médicament</h3>
                  <p>Créez votre premier rappel de prise de médicament</p>
                  <button className="empty-action-btn" onClick={() => navigate('/rappels/create')}>
                    Créer un rappel
                  </button>
                </div>
              ) : (
                filteredRappels.map(rappel => {
                  const details = typeof rappel.details === 'string' ? JSON.parse(rappel.details) : rappel.details;
                  return (
                    <div key={rappel.id} className="rappel-card medicament">
                      <div className="rappel-header">
                        <h4>💊 {details.nom_medicament || 'Médicament'}</h4>
                        <span className="rappel-type">Médicament</span>
                      </div>
                      <div className="rappel-details">
                        <p><strong>💊 Dosage :</strong> {details.dosage || 'Non défini'}</p>
                        <p><strong>⏰ Heure :</strong> {details.heure_prise || 'Non spécifiée'}</p>
                        <p><strong>📅 Date :</strong> {details.date_heure ? dayjs(details.date_heure).format('DD/MM/YYYY HH:mm') : 'Non définie'}</p>
                        <p><strong>🔄 Récurrence :</strong> {rappel.recurrence || 'Ponctuel'}</p>
                        <p><strong>📲 Canaux :</strong> {
                          details.canaux
                            ? Object.entries(details.canaux).filter(([, v]) => v).map(([k]) => k).join(', ')
                            : 'Non défini'
                        }</p>
                      </div>
                      <div className="rappel-actions">
                        <button className="btn-delete" onClick={() => handleDelete(rappel.id)}>
                          🗑 Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {innerTab === 'vaccination' && (
  <div className="rappel-section">
    <h3 className="rappel-date-title">💉 Vaccination & Rappels vaccinaux</h3>

    {rappels
      // on garde tous les rappels “vaccination” ou “rappel vaccinal”
      .filter(r => ['vaccination','rappel vaccinal'].includes(r.type_rappel))
      .map(rappel => {
        const details = typeof rappel.details === 'string'
          ? JSON.parse(rappel.details)
          : rappel.details || {};

        // On distingue en fonction du type
        const isRappel = rappel.type_rappel === 'rappel vaccinal';
        const titreBloc = isRappel ? '🔔 Rappel vaccinal' : '💉 Vaccination';

        // champs
        const nom  = details.nom_vaccin    || details.vaccin     || 'Non défini';
        const date = details.date_heure    || details.date       || rappel.date_heure || '';
        const can  = details.canaux
          ? details.canaux
          : (typeof rappel.canaux === 'string'
             ? JSON.parse(rappel.canaux)
             : rappel.canaux || {});

        return (
          <div key={rappel.id} className="rappel-card">
            <h4>{titreBloc}</h4>

            <p>
              <strong>Nom du vaccin :</strong> {nom}
            </p>

            <p>
              <strong>Date :</strong>{' '}
              {date
                ? dayjs(date).format('DD/MM/YYYY HH:mm')
                : 'Non définie'}
            </p>

            <p>
              <strong>Canaux :</strong>{' '}
              {Object.entries(can)
                .filter(([, on]) => on)
                .map(([k]) => k)
                .join(', ') || 'Non défini'}
            </p>

            <button
              className="btn-delete"
              onClick={() => handleDelete(rappel.id)}
            >
              ❌ Supprimer
            </button>
          </div>
        );
    })}
  </div>
)}


          {innerTab === 'rendezvous' && (
  <div className="rappel-section">
    <h3 className="rappel-date-title">📅 Rendez-vous</h3>
    {rappels.filter(r => r.type_rappel === 'rendezvous').map(rappel => {
      const details = typeof rappel.details === 'string' ? JSON.parse(rappel.details) : rappel.details;
      return (
        <div key={rappel.id} className="rappel-card">
          <h4>Rendez-vous</h4>
          <p><strong>Médecin :</strong> {details.nom_medecin ? `Dr ${details.nom_medecin}` : 'Non défini'}</p>
          <p><strong>Date :</strong> {details.date || (details.date_heure ? dayjs(details.date_heure).format('DD/MM/YYYY') : 'Non définie')}</p>
          <p><strong>Heure :</strong> {details.heure || (details.date_heure ? dayjs(details.date_heure).format('HH:mm') : 'Non définie')}</p>
          <p><strong>Type :</strong> {details.type || 'Non défini'}</p>
          <p><strong>Récurrence :</strong> Aucune</p>
          <p><strong>Canaux :</strong> {
            details.canaux
              ? Object.entries(details.canaux).filter(([, v]) => v).map(([k]) => k).join(', ')
              : 'Non défini'
          }</p>
          <button className="btn-delete" onClick={() => handleDelete(rappel.id)}>❌ Supprimer</button>
        </div>
      );
    })}
  </div>
)}

          {rappels.filter(r => r.type_rappel === innerTab).length === 0 && (
            <p>Aucun rappel pour cette catégorie.</p>
          )}
        </div>
      )}

      {activeTab === 'historique' && (
        <div className="historique-rdv">
          <h2>🕓 Rendez-vous passés</h2>
          {historiqueList.length > 0 && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="checkbox"
                checked={selectAllHistoric}
                onChange={handleSelectAllHistoric}
                id="select-all-historic"
              />
              <label htmlFor="select-all-historic" style={{ cursor: 'pointer' }}>Tout sélectionner</label>
              {selectedHistoricIds.length > 0 && (
                <button
                  className="cancel-btn"
                  style={{ background: '#f44336', color: '#fff', borderColor: '#f44336' }}
                  onClick={() => handleDeleteHistoric(selectedHistoricIds)}
                >
                  Supprimer la sélection
                </button>
              )}
            </div>
          )}
          {historiqueList.map(rdv => (
            <div key={rdv.id} className="rdv-item" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                checked={selectedHistoricIds.includes(rdv.id)}
                onChange={() => handleSelectHistoric(rdv.id)}
              />
              <p style={{ flex: 1 }}>
                <strong>{rdv.nom_medecin}</strong> — {rdv.date_rendezvous} à {rdv.heure_debut} ({rdv.statut})
              </p>
              <button
                className="cancel-btn"
                style={{ background: '#f44336', color: '#fff', borderColor: '#f44336' }}
                onClick={() => handleDeleteHistoric([rdv.id])}
              >
                Supprimer
              </button>
            </div>
          ))}
          {historiqueList.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', marginTop: 24 }}>Aucun rendez-vous dans l’historique.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RappelsPage;
