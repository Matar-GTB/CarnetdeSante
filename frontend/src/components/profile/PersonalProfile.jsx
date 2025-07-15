import React, { useState, useEffect, useCallback } from 'react';
import './PersonalProfile.css';
import {
  getUserProfile,
  updateUserProfileWithPhoto,
  API_BASE_URL
} from '../../services/profileService';

const PersonalProfile = ({ token }) => {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sexe: '',
    date_naissance: '',
    adresse: ''
  });
  const [initialData, setInitialData] = useState({});
  const [initialPhoto, setInitialPhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState('/default-avatar.png');
  const [photoFile, setPhotoFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Charger les données utilisateur
  const fetchProfile = useCallback(async () => {
    try {
      const user = await getUserProfile(token);
      const data = {
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        sexe: user.sexe || '',
        date_naissance: user.date_naissance || '',
        adresse: user.adresse || ''
      };
      setForm(data);
      setInitialData(data);
      
      const photoUrl = user.photo_profil 
        ? `${API_BASE_URL}${user.photo_profil}` 
        : '/default-avatar.png';
      
      setPhotoPreview(photoUrl);
      setInitialPhoto(photoUrl);
    } catch (err) {
      console.error('Erreur chargement profil :', err);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Vérifier les changements seulement en mode édition
  useEffect(() => {
    if (editMode) {
      const formChanged = Object.keys(initialData).some(
        key => form[key] !== initialData[key]
      );
      const photoChanged = photoFile !== null;
      setHasChanges(formChanged || photoChanged);
    }
  }, [form, photoFile, editMode, initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setForm(initialData);
    setPhotoFile(null);
    setPhotoPreview(initialPhoto);
    setEditMode(false);
    setHasChanges(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
   if (!hasChanges) {
    alert("Aucune modification n'a été effectuée");
      setEditMode(false);
     return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      if (photoFile) formData.append('photo', photoFile);

      await updateUserProfileWithPhoto(token, formData);
      alert('✅ Informations mises à jour');
      
      // Recharger les données après mise à jour
      await fetchProfile();
      setEditMode(false);
      setHasChanges(false);
    } catch (err) {
      console.error('Erreur mise à jour :', err);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  return (
    <form className="personal-profile" onSubmit={handleSubmit}>
      <div className="personal-header">
        <img src={photoPreview} alt="Avatar" className="avatar-header" />
        <div className="header-details">
          <h2>{form.prenom} {form.nom}</h2>
          <p>Profil personnel</p>
        </div>
      </div>

      <div className="photo-section">
        <label>
          Photo de profil
          <input 
            type="file" 
            accept="image/*" 
            disabled={!editMode} 
            onChange={handlePhotoChange} 
          />
        </label>
        {photoPreview && (
          <img src={photoPreview} alt="Prévisualisation" className="avatar-preview" />
        )}
      </div>

      <label>Nom
        <input name="nom" value={form.nom} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Prénom
        <input name="prenom" value={form.prenom} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Email
        <input name="email" value={form.email} disabled />
      </label>

      <label>Téléphone
        <input name="telephone" value={form.telephone} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Sexe
        <select name="sexe" value={form.sexe} onChange={handleChange} disabled={!editMode}>
          <option value="">-- Sélectionner --</option>
          <option value="homme">Masculin</option>
          <option value="femme">Féminin</option>
          <option value="autre">Autre</option>
        </select>
      </label>

      <label>Date de naissance
        <input 
          type="date" 
          name="date_naissance" 
          value={form.date_naissance} 
          onChange={handleChange} 
          disabled={!editMode} 
        />
      </label>

      <label>Adresse
        <input name="adresse" value={form.adresse} onChange={handleChange} disabled={!editMode} />
      </label>

      {!editMode ? (
        <div className="button-group">
          <button type="button" onClick={handleEdit}>Modifier</button>
        </div>
      ) : (
        <div className="button-group">
          <button type="submit" disabled={!hasChanges}>Enregistrer</button>
          <button type="button" onClick={handleCancel}>Annuler</button>
        </div>
      )}
    </form>
  );
};

export default PersonalProfile;