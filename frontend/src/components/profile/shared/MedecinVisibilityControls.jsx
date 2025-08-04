// components/profile/shared/MedecinVisibilityControls.jsx
import React from 'react';
import './VisibilityControls.css';

const MedecinVisibilityControls = ({ 
  fieldsVisibility = {}, 
  onVisibilityChange, 
  editMode = false,
  globalSettings = {},
  onGlobalChange
}) => {
  
  // Niveaux de visibilité adaptés pour les médecins
  const visibilityLevels = [
    { 
      value: 'private', 
      label: '🔒 Privé', 
      description: 'Visible par vous uniquement',
      color: '#e74c3c'
    },
    { 
      value: 'patients', 
      label: '👥 Patients', 
      description: 'Visible par vos patients',
      color: '#3498db'
    },
    { 
      value: 'confreres', 
      label: '👨‍⚕️ Confrères', 
      description: 'Visible par les autres médecins',
      color: '#27ae60'
    },
    { 
      value: 'public', 
      label: '🌍 Public', 
      description: 'Visible publiquement',
      color: '#95a5a6'
    }
  ];

  // Champs spécifiques aux médecins avec leur catégorie
  const fieldCategories = {
    'Informations personnelles': {
      icon: '👤',
      fields: {
        nom: { label: 'Nom de famille', recommended: 'public' },
        prenom: { label: 'Prénom', recommended: 'public' },
        email: { label: 'Adresse email', recommended: 'patients' },
        telephone: { label: 'Téléphone personnel', recommended: 'private' },
        photo_profil: { label: 'Photo de profil', recommended: 'public' }
      }
    },
    'Informations professionnelles': {
      icon: '🏥',
      fields: {
        numero_ordre: { label: 'Numéro d\'ordre', recommended: 'public' },
        specialite: { label: 'Spécialité', recommended: 'public' },
        etablissement: { label: 'Établissement', recommended: 'public' },
        adresse_cabinet: { label: 'Adresse du cabinet', recommended: 'public' },
        telephone_cabinet: { label: 'Téléphone cabinet', recommended: 'public' }
      }
    },
    'Présentation professionnelle': {
      icon: '📝',
      fields: {
        bio: { label: 'Biographie professionnelle', recommended: 'public' },
        formations: { label: 'Formations et diplômes', recommended: 'public' },
        experience: { label: 'Expérience professionnelle', recommended: 'public' },
        langues_parlees: { label: 'Langues parlées', recommended: 'public' }
      }
    },
    'Services et disponibilités': {
      icon: '📅',
      fields: {
        horaires_consultation: { label: 'Horaires de consultation', recommended: 'public' },
        duree_consultation: { label: 'Durée de consultation', recommended: 'public' },
        accepte_nouveaux_patients: { label: 'Accepte nouveaux patients', recommended: 'public' },
        consultations_urgence: { label: 'Consultations d\'urgence', recommended: 'public' }
      }
    }
  };

  const handleVisibilityChange = (field, level) => {
    if (onVisibilityChange) {
      onVisibilityChange(field, level);
    }
  };

  const handleGlobalSettingChange = (setting, value) => {
    if (onGlobalChange) {
      onGlobalChange(setting, value);
    }
  };

  const getVisibilityLevel = (field) => {
    return fieldsVisibility[field] || 'private';
  };

  const getLevelInfo = (level) => {
    return visibilityLevels.find(l => l.value === level) || visibilityLevels[0];
  };

  // Actions rapides adaptées aux médecins
  const setAllToLevel = (level) => {
    const updates = {};
    Object.keys(fieldCategories).forEach(categoryKey => {
      const category = fieldCategories[categoryKey];
      Object.keys(category.fields).forEach(field => {
        updates[field] = level;
      });
    });
    
    if (onVisibilityChange) {
      Object.entries(updates).forEach(([field, newLevel]) => {
        onVisibilityChange(field, newLevel);
      });
    }
  };

  // Configuration recommandée pour médecins
  const setRecommendedVisibility = () => {
    const updates = {};
    Object.keys(fieldCategories).forEach(categoryKey => {
      const category = fieldCategories[categoryKey];
      Object.keys(category.fields).forEach(field => {
        const fieldInfo = category.fields[field];
        updates[field] = fieldInfo.recommended;
      });
    });
    
    if (onVisibilityChange) {
      Object.entries(updates).forEach(([field, newLevel]) => {
        onVisibilityChange(field, newLevel);
      });
    }
  };

  return (
    <div className="visibility-controls-section">
      <h3>
        <span className="section-icon">🔐</span>
        Contrôle de la visibilité du profil médecin
      </h3>

      <div className="visibility-explanation">
        <p>
          Gérez qui peut voir vos informations professionnelles et personnelles. 
          En tant que médecin, vous pouvez contrôler la visibilité de vos données pour vos patients, confrères et le public.
        </p>
      </div>

      {/* Paramètres globaux spécifiques aux médecins */}
      <div className="global-settings">
        <h4>Paramètres généraux du profil médecin</h4>
        <div className="global-controls">
          <label className="checkbox-control">
            <input 
              type="checkbox"
              checked={globalSettings.profil_visible_patients || false}
              onChange={(e) => handleGlobalSettingChange('profil_visible_patients', e.target.checked)}
              disabled={!editMode}
            />
            <span className="checkmark"></span>
            <div className="control-text">
              <strong>Profil visible aux patients</strong>
              <small>Permet à vos patients de consulter votre profil complet</small>
            </div>
          </label>

          <label className="checkbox-control">
            <input 
              type="checkbox"
              checked={globalSettings.autoriser_demandes_rdv || false}
              onChange={(e) => handleGlobalSettingChange('autoriser_demandes_rdv', e.target.checked)}
              disabled={!editMode}
            />
            <span className="checkmark"></span>
            <div className="control-text">
              <strong>Autoriser les demandes de RDV</strong>
              <small>Permet aux patients de demander des rendez-vous en ligne</small>
            </div>
          </label>

          <label className="checkbox-control">
            <input 
              type="checkbox"
              checked={globalSettings.notifications_actives || false}
              onChange={(e) => handleGlobalSettingChange('notifications_actives', e.target.checked)}
              disabled={!editMode}
            />
            <span className="checkmark"></span>
            <div className="control-text">
              <strong>Notifications actives</strong>
              <small>Recevoir des notifications pour les demandes de RDV et messages</small>
            </div>
          </label>

          <label className="checkbox-control">
            <input 
              type="checkbox"
              checked={globalSettings.partage_avec_confreres || false}
              onChange={(e) => handleGlobalSettingChange('partage_avec_confreres', e.target.checked)}
              disabled={!editMode}
            />
            <span className="checkmark"></span>
            <div className="control-text">
              <strong>Partage avec les confrères</strong>
              <small>Permet aux autres médecins de voir certaines informations professionnelles</small>
            </div>
          </label>
        </div>
      </div>

      {/* Contrôles par champ */}
      <div className="field-visibility-controls">
        <h4>Visibilité par champ</h4>
        
        {Object.entries(fieldCategories).map(([categoryName, category]) => (
          <div key={categoryName} className="field-category">
            <h5>
              <span className="category-icon">{category.icon}</span>
              {categoryName}
            </h5>
            
            <div className="fields-grid">
              {Object.entries(category.fields).map(([fieldKey, fieldInfo]) => {
                const currentLevel = getVisibilityLevel(fieldKey);
                const levelInfo = getLevelInfo(currentLevel);
                const isRecommended = currentLevel === fieldInfo.recommended;
                
                return (
                  <div key={fieldKey} className="field-control">
                    <div className="field-header">
                      <span className="field-label">{fieldInfo.label}</span>
                      {isRecommended && <span className="recommended-badge">Recommandé</span>}
                    </div>
                    
                    <div className="visibility-selector">
                      <div className="current-level" style={{ borderColor: levelInfo.color }}>
                        <span className="level-icon">{levelInfo.label}</span>
                        <span className="level-description">{levelInfo.description}</span>
                      </div>
                      
                      <select 
                        value={currentLevel}
                        onChange={(e) => handleVisibilityChange(fieldKey, e.target.value)}
                        disabled={!editMode}
                        className="level-select"
                      >
                        {visibilityLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label} - {level.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="visibility-legend">
        <h4>Légende des niveaux</h4>
        <div className="legend-grid">
          {visibilityLevels.map(level => (
            <div key={level.value} className="legend-item" style={{ borderColor: level.color }}>
              <strong>{level.label}</strong>
              <small>{level.description}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides spécifiques aux médecins */}
      <div className="quick-actions">
        <h4>Actions rapides</h4>
        <div className="quick-buttons">
          <button 
            className="quick-btn recommended"
            onClick={setRecommendedVisibility}
            disabled={!editMode}
          >
            ⭐ Configuration recommandée
          </button>
          <button 
            className="quick-btn"
            onClick={() => setAllToLevel('public')}
            disabled={!editMode}
          >
            🌍 Profil entièrement public
          </button>
          <button 
            className="quick-btn"
            onClick={() => setAllToLevel('patients')}
            disabled={!editMode}
          >
            👥 Visible aux patients uniquement
          </button>
          <button 
            className="quick-btn"
            onClick={() => setAllToLevel('private')}
            disabled={!editMode}
          >
            🔒 Tout en privé
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedecinVisibilityControls;
