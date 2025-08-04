import React from 'react';
import './MedicalSection.css';

const MedicalSection = ({ 
  profileData, 
  handleInputChange, 
  editMode = false 
}) => {
  return (
    <div className="medical-section">
      <h3>Informations Médicales</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="groupe_sanguin">Groupe Sanguin</label>
          <select
            id="groupe_sanguin"
            value={profileData.groupe_sanguin || ''}
            onChange={(e) => handleInputChange('groupe_sanguin', e.target.value)}
            disabled={!editMode}
          >
            <option value="">Non renseigné</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="poids">Poids (kg)</label>
          <input
            type="number"
            id="poids"
            value={profileData.poids || ''}
            onChange={(e) => handleInputChange('poids', e.target.value)}
            disabled={!editMode}
            placeholder="Ex: 70.5"
            min="0"
            max="500"
            step="0.1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="taille">Taille (cm)</label>
          <input
            type="number"
            id="taille"
            value={profileData.taille || ''}
            onChange={(e) => handleInputChange('taille', e.target.value)}
            disabled={!editMode}
            placeholder="Ex: 175.5"
            min="0"
            max="300"
            step="0.1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="allergies">Allergies</label>
          <textarea
            id="allergies"
            value={profileData.allergies || ''}
            onChange={(e) => handleInputChange('allergies', e.target.value)}
            disabled={!editMode}
            rows="3"
            placeholder="Listez vos allergies connues..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="antecedents_medicaux">Antécédents Médicaux</label>
          <textarea
            id="antecedents_medicaux"
            value={profileData.antecedents_medicaux || ''}
            onChange={(e) => handleInputChange('antecedents_medicaux', e.target.value)}
            disabled={!editMode}
            rows="4"
            placeholder="Décrivez vos antécédents médicaux..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="traitements_actuels">Traitements Actuels</label>
          <textarea
            id="traitements_actuels"
            value={profileData.traitements_actuels || ''}
            onChange={(e) => handleInputChange('traitements_actuels', e.target.value)}
            disabled={!editMode}
            rows="3"
            placeholder="Listez vos traitements en cours..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="electrophorese">Électrophorèse</label>
          <textarea
            id="electrophorese"
            value={profileData.electrophorese || ''}
            onChange={(e) => handleInputChange('electrophorese', e.target.value)}
            disabled={!editMode}
            rows="3"
            placeholder="Résultats d'électrophorèse..."
          />
        </div>
      </div>
    </div>
  );
};

export default MedicalSection;
