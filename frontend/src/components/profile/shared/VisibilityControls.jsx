// components/profile/shared/VisibilityControls.jsx
import React from 'react';
import './VisibilityControls.css';

const VisibilityControls = ({ 
  fieldsVisibility = {}, 
  onVisibilityChange, 
  disabled = false,
  globalSettings = {},
  onGlobalChange
}) => {
  
  // Niveaux de visibilité modernes
  const visibilityLevels = [
    { 
      value: 'private', 
      label: '🔒 Privé', 
      description: 'Visible par vous uniquement',
      color: '#e74c3c'
    },
    { 
      value: 'emergency', 
      label: '🚨 Urgence', 
      description: 'Visible en cas d\'urgence médicale',
      color: '#f39c12'
    },
    { 
      value: 'traitant', 
      label: '👨‍⚕️ Médecin traitant', 
      description: 'Visible par vos médecins traitants',
      color: '#3498db'
    },
    { 
      value: 'medecin-only', 
      label: '🩺 Médecins autorisés', 
      description: 'Visible par tous les médecins autorisés',
      color: '#27ae60'
    },
    { 
      value: 'public', 
      label: '🌍 Public', 
      description: 'Visible publiquement (déconseillé)',
      color: '#95a5a6'
    }
  ];

  // Champs avec leur catégorie et importance
  const fieldCategories = {
    'Informations personnelles': {
      icon: '👤',
      fields: {
        nom: { label: 'Nom de famille', critical: false },
        prenom: { label: 'Prénom', critical: false },
        email: { label: 'Adresse email', critical: false },
        telephone: { label: 'Téléphone', critical: false },
        date_naissance: { label: 'Date de naissance', critical: false },
        adresse: { label: 'Adresse postale', critical: false }
      }
    },
    'Informations médicales': {
      icon: '🏥',
      fields: {
        groupe_sanguin: { label: 'Groupe sanguin', critical: true },
        allergies: { label: 'Allergies', critical: true },
        antecedents_medicaux: { label: 'Antécédents médicaux', critical: true },
        traitements_actuels: { label: 'Traitements en cours', critical: true }
      }
    },
    'Contacts d\'urgence': {
      icon: '🚨',
      fields: {
        contact_urgence: { label: 'Contact d\'urgence', critical: true },
        personne_urgence: { label: 'Personne à contacter', critical: true }
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

  // Actions rapides
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

  return (
    <div className="visibility-controls-section">
      <h3>
        <span className="section-icon">🔐</span>
        Contrôle de la visibilité
      </h3>

      <div className="visibility-explanation">
        <p>
          Gérez qui peut voir vos informations personnelles et médicales. 
          Vous pouvez définir des niveaux de visibilité différents pour chaque champ.
        </p>
      </div>

      {/* Paramètres globaux */}
      <div className="global-settings">
        <h4>Paramètres généraux</h4>
        <div className="global-controls">
          <label className="checkbox-control">
            <input 
              type="checkbox"
              checked={globalSettings.donnees_visibles_medecins || false}
              onChange={(e) => handleGlobalSettingChange('donnees_visibles_medecins', e.target.checked)}
              disabled={disabled}
            />
            <span className="checkmark"></span>
            <div className="control-text">
              <strong>Données visibles aux médecins</strong>
              <small>Permet aux médecins autorisés de voir vos informations médicales</small>
            </div>
          </label>

          <label className="checkbox-control">
            <input 
              type="checkbox"
              checked={globalSettings.partage_urgences || false}
              onChange={(e) => handleGlobalSettingChange('partage_urgences', e.target.checked)}
              disabled={disabled}
            />
            <span className="checkmark"></span>
            <div className="control-text">
              <strong>Partage en cas d'urgence</strong>
              <small>Autorise l'accès aux informations critiques en cas d'urgence médicale</small>
            </div>
          </label>

          <label className="checkbox-control">
            <input 
              type="checkbox"
              checked={globalSettings.autoriser_recherche_medecins || false}
              onChange={(e) => handleGlobalSettingChange('autoriser_recherche_medecins', e.target.checked)}
              disabled={disabled}
            />
            <span className="checkmark"></span>
            <div className="control-text">
              <strong>Recherche par les médecins</strong>
              <small>Permet aux médecins de vous trouver dans leurs recherches</small>
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
                
                return (
                  <div key={fieldKey} className="field-control">
                    <div className="field-header">
                      <span className="field-label">{fieldInfo.label}</span>
                      {fieldInfo.critical && <span className="critical-badge">Critique</span>}
                    </div>
                    
                    <div className="visibility-selector">
                      <div className="current-level" style={{ borderColor: levelInfo.color }}>
                        <span className="level-icon">{levelInfo.label}</span>
                        <span className="level-description">{levelInfo.description}</span>
                      </div>
                      
                      <select 
                        value={currentLevel}
                        onChange={(e) => handleVisibilityChange(fieldKey, e.target.value)}
                        disabled={disabled}
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

      {/* Actions rapides */}
      <div className="quick-actions">
        <h4>Actions rapides</h4>
        <div className="quick-buttons">
          <button 
            className="quick-btn"
            onClick={() => setAllToLevel('private')}
            disabled={disabled}
          >
            🔒 Tout en privé
          </button>
          <button 
            className="quick-btn"
            onClick={() => setAllToLevel('traitant')}
            disabled={disabled}
          >
            👨‍⚕️ Visible aux traitants
          </button>
          <button 
            className="quick-btn"
            onClick={() => setAllToLevel('emergency')}
            disabled={disabled}
          >
            🚨 Urgences uniquement
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisibilityControls;