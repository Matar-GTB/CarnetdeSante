import React, { useState, useEffect, useCallback } from 'react';
import './PersonalProfile.css';
import { getUserProfile, updateUserProfileWithPhoto, API_BASE_URL } from '../../services/profileService';

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

  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [initialData, setInitialData] = useState(form);
  const [editMode, setEditMode] = useState(false);

  const loadUserProfile = useCallback(async () => {
    try {
      const user = await getUserProfile(token);
      const personalData = {
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        email: user?.email || '',
        telephone: user?.telephone || '',
        sexe: user?.sexe || '',
        date_naissance: user?.date_naissance || '',
        adresse: user?.adresse || ''
      };
      setForm(personalData);
      setInitialData(personalData);

      const photoURL = user?.photo_profil
        ? `${API_BASE_URL}${user.photo_profil}`
        : '/default-avatar.png';
      setPreviewUrl(photoURL);
    } catch (err) {
      console.error('Erreur chargement profil personnel :', err.response?.data || err.message);
    }
  }, [token]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setForm(initialData);
    setPhotoFile(null);
    setEditMode(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      await updateUserProfileWithPhoto(token, formData);
      alert('✅ Informations personnelles mises à jour');
      setInitialData(form); // Met à jour les données de référence
      setEditMode(false);   // Quitte le mode édition
    } catch (err) {
      alert('❌ Erreur lors de la mise à jour');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <form className="personal-profile" onSubmit={handleSubmit}>
      <div className="personal-header">
        <img src={previewUrl || '/default-avatar.png'} alt="Avatar" className="avatar-header" />
        <div className="header-details">
          <h2>{form.prenom} {form.nom}</h2>
          <p>Profil personnel</p>
        </div>
      </div>

      <div className="photo-section">
        <label>Photo de profil
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={!editMode}
          />
        </label>
        {previewUrl && <img src={previewUrl} alt="Prévisualisation" className="avatar-preview" />}
      </div>

      <label>Nom
        <input type="text" name="nom" value={form.nom} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Prénom
        <input type="text" name="prenom" value={form.prenom} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Email
        <input type="email" name="email" value={form.email} readOnly />
      </label>

      <label>Téléphone
        <input type="text" name="telephone" value={form.telephone} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Sexe
        <select name="sexe" value={form.sexe} onChange={handleChange} disabled={!editMode}>
          <option value="">-- Sélectionner --</option>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>
      </label>

      <label>Date de naissance
        <input type="date" name="date_naissance" value={form.date_naissance} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Adresse
        <input type="text" name="adresse" value={form.adresse} onChange={handleChange} disabled={!editMode} />
      </label>

      {!editMode ? (
        <div className="button-group">
          <button type="button" onClick={() => setEditMode(true)}>Modifier</button>
        </div>
      ) : (
        <div className="button-group">
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={handleCancel}>Annuler</button>
        </div>
      )}
    </form>
  );
};

export default PersonalProfile;
