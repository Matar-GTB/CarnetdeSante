// components/profile/sections/DisponibiliteSection.jsx
import React, { useState, useEffect } from 'react';
import disponibiliteService from '../../../services/disponibiliteService';
import './DisponibiliteSection.css';

const DisponibiliteSection = ({ editMode }) => {
  const [editHoraires, setEditHoraires] = useState(false);
  const [horaires, setHoraires] = useState([]);
  const [indisponibilites, setIndisponibilites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddIndispo, setShowAddIndispo] = useState(false);
  const [newIndispo, setNewIndispo] = useState({
    date_debut: '',
    date_fin: '',
    heure_debut: '00:00',
    heure_fin: '23:59',
    motif: ''
  });

  const joursSemai = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  useEffect(() => {
    loadDisponibilites();
  }, []);

  const loadDisponibilites = async () => {
    setLoading(true);
    try {
      // Charger les horaires de travail
      const horairesRes = await disponibiliteService.getHorairesTravail();
      if (Array.isArray(horairesRes)) {
        setHoraires(horairesRes);
      }

      // Charger les indisponibilités
      const indisposRes = await disponibiliteService.getIndisponibilites();
      if (Array.isArray(indisposRes)) {
        setIndisponibilites(indisposRes);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHoraireChange = async (jour, field, value) => {
    if (!editMode) return;

    const horaire = horaires.find(h => h.jour_semaine === jour) || {
      jour_semaine: jour,
      heure_debut: '08:00',
      heure_fin: '18:00',
      duree_creneau: 30
    };

    const updatedHoraire = { ...horaire, [field]: value };

    try {
      await disponibiliteService.updateHoraireJour(jour, {
        heure_debut: updatedHoraire.heure_debut,
        heure_fin: updatedHoraire.heure_fin,
        duree_creneau: updatedHoraire.duree_creneau
      });

      setHoraires(prev => {
        const filtered = prev.filter(h => h.jour_semaine !== jour);
        return [...filtered, updatedHoraire];
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'horaire:', error);
    }
  };

  const handleRemoveJour = async (jour) => {
    if (!editMode) return;

    const horaire = horaires.find(h => h.jour_semaine === jour);
    if (horaire && horaire.id) {
      try {
        await disponibiliteService.deleteHoraireJour(jour);
        setHoraires(prev => prev.filter(h => h.jour_semaine !== jour));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'horaire:', error);
      }
    }
  };

  const handleAddIndisponibilite = async () => {
    if (!editMode) return;

    // Validation : date et heure cohérentes
    if (!newIndispo.date_debut || !newIndispo.date_fin) {
      alert('Veuillez renseigner les dates de début et de fin.');
      return;
    }
    if (
      newIndispo.date_debut === newIndispo.date_fin &&
      newIndispo.heure_debut >= newIndispo.heure_fin
    ) {
      alert('L\'heure de début doit être avant l\'heure de fin pour un créneau.');
      return;
    }

    try {
      // Si l'utilisateur veut bloquer toute la journée, on laisse 00:00-23:59
      // Sinon, on bloque le créneau indiqué
      const indispoPayload = {
        ...newIndispo,
        heure_debut: newIndispo.heure_debut || '00:00',
        heure_fin: newIndispo.heure_fin || '23:59',
      };
      const newIndispoData = await disponibiliteService.createIndisponibilite(indispoPayload);
      setIndisponibilites(prev => [...prev, newIndispoData]);
      setNewIndispo({
        date_debut: '',
        date_fin: '',
        heure_debut: '00:00',
        heure_fin: '23:59',
        motif: ''
      });
      setShowAddIndispo(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'indisponibilité:', error);
    }
  };

  const handleRemoveIndisponibilite = async (id) => {
    if (!editMode) return;

    try {
      await disponibiliteService.deleteIndisponibilite(id);
      setIndisponibilites(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'indisponibilité:', error);
    }
  };

  const getHoraireForJour = (jour) => {
    return horaires.find(h => h.jour_semaine === jour) || null;
  };

  if (loading) {
    return <div className="loading">Chargement des disponibilités...</div>;
  }

  return (
    <div className="disponibilite-section">
      {/* Section Horaires de travail */}
      <div className="horaires-section">
        <h3>
          <span className="section-icon">📅</span>
          Horaires de travail hebdomadaires
        </h3>
        {editMode && (
          <button
            type="button"
            className={editHoraires ? "btn-cancel" : "btn-edit"}
            style={{marginBottom:8}}
            onClick={() => setEditHoraires(e => !e)}
          >
            {editHoraires ? "Terminer l'édition" : "Modifier les horaires"}
          </button>
        )}
        <div className="horaires-grid">
          {joursSemai.map(jour => {
            const horaire = getHoraireForJour(jour);
            const isActive = !!horaire;
            return (
              <div key={jour} className={`jour-card ${isActive ? 'active' : 'inactive'}`}>
                <div className="jour-header">
                  <span className="jour-name">{jour.charAt(0).toUpperCase() + jour.slice(1)}</span>
                  {editMode && editHoraires && (
                    <button
                      type="button"
                      className={`btn-toggle ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (isActive) {
                          handleRemoveJour(jour);
                        } else {
                          handleHoraireChange(jour, 'heure_debut', '08:00');
                        }
                      }}
                    >
                      {isActive ? '✕' : '＋'}
                    </button>
                  )}
                </div>
                {isActive && (
                  <div className="horaire-inputs">
                    <div className="time-input-group">
                      <label>Début</label>
                      <input
                        type="time"
                        value={horaire.heure_debut || '08:00'}
                        onChange={(e) => handleHoraireChange(jour, 'heure_debut', e.target.value)}
                        disabled={!(editMode && editHoraires)}
                      />
                    </div>
                    <div className="time-input-group">
                      <label>Fin</label>
                      <input
                        type="time"
                        value={horaire.heure_fin || '18:00'}
                        onChange={(e) => handleHoraireChange(jour, 'heure_fin', e.target.value)}
                        disabled={!(editMode && editHoraires)}
                      />
                    </div>
                    <div className="duration-input-group">
                      <label>Créneaux (min)</label>
                      <select
                        value={horaire.duree_creneau || 30}
                        onChange={(e) => handleHoraireChange(jour, 'duree_creneau', parseInt(e.target.value))}
                        disabled={!(editMode && editHoraires)}
                      >
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>
                  </div>
                )}
                {!isActive && (
                  <div className="jour-inactive">
                    <span>Jour de repos</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Indisponibilités */}
      <div className="indisponibilites-section">
        <div className="section-header">
          <h3>
            <span className="section-icon">🚫</span>
            Absences et Indisponibilités
          </h3>
          {editMode && (
            <button
              type="button"
              className="btn-add"
              onClick={() => setShowAddIndispo(true)}
            >
              ＋ Ajouter une absence
            </button>
          )}
        </div>

        {/* Formulaire d'ajout d'indisponibilité */}
        {showAddIndispo && editMode && (
          <div className="add-indispo-form">
            <div className="form-help">
              <strong>Exemple :</strong> Pour bloquer le créneau du <u>6 août 2025 de 14h30 à 15h00</u> :<br/>
              <span>- Date de début : <b>2025-08-06</b></span><br/>
              <span>- Date de fin : <b>2025-08-06</b></span><br/>
              <span>- Heure de début : <b>14:30</b></span><br/>
              <span>- Heure de fin : <b>15:00</b></span><br/>
              <span>- Ne cochez pas "Bloquer toute la journée"</span>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Date de début *</label>
                <input
                  type="date"
                  value={newIndispo.date_debut}
                  onChange={(e) => setNewIndispo(prev => ({ ...prev, date_debut: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Date de fin *</label>
                <input
                  type="date"
                  value={newIndispo.date_fin}
                  onChange={(e) => setNewIndispo(prev => ({ ...prev, date_fin: e.target.value }))}
                  min={newIndispo.date_debut || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Heure de début</label>
                <input
                  type="time"
                  value={newIndispo.heure_debut}
                  onChange={(e) => setNewIndispo(prev => ({ ...prev, heure_debut: e.target.value }))}
                  min="00:00"
                  max="23:59"
                  step="900"
                />
              </div>
              <div className="form-group">
                <label>Heure de fin</label>
                <input
                  type="time"
                  value={newIndispo.heure_fin}
                  onChange={(e) => setNewIndispo(prev => ({ ...prev, heure_fin: e.target.value }))}
                  min="00:00"
                  max="23:59"
                  step="900"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newIndispo.heure_debut === '00:00' && newIndispo.heure_fin === '23:59'}
                    onChange={e => {
                      if (e.target.checked) {
                        setNewIndispo(prev => ({ ...prev, heure_debut: '00:00', heure_fin: '23:59' }));
                      }
                    }}
                  />
                  Bloquer toute la journée
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Motif de l'absence</label>
              <input
                type="text"
                value={newIndispo.motif}
                onChange={(e) => setNewIndispo(prev => ({ ...prev, motif: e.target.value }))}
                placeholder="Congés, formation, urgence familiale..."
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowAddIndispo(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn-save"
                onClick={handleAddIndisponibilite}
                disabled={!newIndispo.date_debut || !newIndispo.date_fin}
              >
                Ajouter
              </button>
            </div>
          </div>
        )}

        {/* Liste des indisponibilités */}
        <div className="indispos-list">
          {indisponibilites.length > 0 ? (
            indisponibilites.map(indispo => (
              <div key={indispo.id} className="indispo-card">
                <div className="indispo-info">
                  <div className="indispo-dates">
                    <strong>
                      {new Date(indispo.date_debut).toLocaleDateString('fr-FR')}
                      {indispo.date_debut !== indispo.date_fin && 
                        ` - ${new Date(indispo.date_fin).toLocaleDateString('fr-FR')}`
                      }
                    </strong>
                  </div>
                  <div className="indispo-time">
                    {indispo.heure_debut !== '00:00' || indispo.heure_fin !== '23:59' ? (
                      `${indispo.heure_debut} - ${indispo.heure_fin}`
                    ) : (
                      'Toute la journée'
                    )}
                  </div>
                  {indispo.motif && (
                    <div className="indispo-motif">
                      <em>{indispo.motif}</em>
                    </div>
                  )}
                </div>
                {editMode && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveIndisponibilite(indispo.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📅</span>
              <p>Aucune indisponibilité programmée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisponibiliteSection;
