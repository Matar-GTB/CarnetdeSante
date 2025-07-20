import React, { useState, useEffect } from 'react';
import './MedecinProfile.css';
import { getUserProfile, updateUserProfile } from '../../services/profileService';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const MedecinProfile = () => {
  const { token, role } = useContext(AuthContext);



  const [form, setForm] = useState({
    specialite: '',
    etablissements: '',
    diplome: '',
    parcours_professionnel: '',
    langues: '',
    moyens_paiement: '',
    description: '',
    accepte_nouveaux_patients: false,
    accepte_non_traitants: false,
    horaires_travail: '',
    accessibilite: ''
  });

  const [initialData, setInitialData] = useState(form);
  const [authorized, setAuthorized] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (role !== 'medecin') {
      setAuthorized(false);
      return;
    }

    getUserProfile(token)
      .then(user => {
        
        const medecinData = {
          specialite: user?.specialite || '',
          etablissements: user?.etablissements || '',
          diplome: user?.diplome || '',
          parcours_professionnel: user?.parcours_professionnel || '',
          langues: user?.langues || '',
          moyens_paiement: user?.moyens_paiement || '',
          description: user?.description || '',
          accepte_nouveaux_patients: !!user?.accepte_nouveaux_patients,
          accepte_non_traitants: !!user?.accepte_non_traitants,
          horaires_travail: user?.horaires_travail || '',
          accessibilite: user?.accessibilite || ''
        };
        setForm(medecinData);
        setInitialData(medecinData);
      })
      .catch(err => {
        console.error('Erreur chargement données médecin :', err.response?.data || err.message);
      });
  }, [token, role]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCancel = () => {
    setForm(initialData);
    setEditMode(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateUserProfile(token, form);
      alert("Profil médecin mis à jour");
      setInitialData(form);
      setEditMode(false);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
      console.error(err.response?.data || err.message);
    }
  };

  if (!authorized) {
    return <p className="unauthorized">Accès réservé aux médecins.</p>;
  }

  return (
    <form className="medecin-profile" onSubmit={handleSubmit}>
      <h3>Profil professionnel du médecin</h3>

      <label>Spécialité
        <input type="text" name="specialite" value={form.specialite} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Établissements
        <input type="text" name="etablissements" value={form.etablissements} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Diplôme
        <input type="text" name="diplome" value={form.diplome} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Parcours professionnel
        <textarea name="parcours_professionnel" value={form.parcours_professionnel} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Langues parlées
        <input type="text" name="langues" value={form.langues} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Moyens de paiement acceptés
        <input type="text" name="moyens_paiement" value={form.moyens_paiement} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Description
        <textarea name="description" value={form.description} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>
        <input
          type="checkbox"
          name="accepte_nouveaux_patients"
          checked={form.accepte_nouveaux_patients}
          onChange={handleChange}
          disabled={!editMode}
        />
        Accepte de nouveaux patients
      </label>

      <label>
        <input
          type="checkbox"
          name="accepte_non_traitants"
          checked={form.accepte_non_traitants}
          onChange={handleChange}
          disabled={!editMode}
        />
        Accepte les patients non traitants
      </label>

      <label>Horaires de travail
        <input type="text" name="horaires_travail" value={form.horaires_travail} onChange={handleChange} disabled={!editMode} />
      </label>

      <label>Accessibilité
        <textarea name="accessibilite" value={form.accessibilite} onChange={handleChange} disabled={!editMode} />
      </label>

      {!editMode ? (
        <div className="button-group">
          <button
           type="button"
           onClick={() => setEditMode(true)}
         >
          Modifier
         </button>
        </div>
      ) : (
        <div className="button-group">
          <button type="submit">Enregistrer</button>
          <button
          type="button"
           onClick={handleCancel}
         >
           Annuler
         </button>
        </div>
      )}
    </form>
  );
};

export default MedecinProfile;
