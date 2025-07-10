import React, { useState, useEffect } from 'react';
import './PatientProfile.css';
import { getUserProfile, updateUserProfile } from '../../services/profileService';
import { getTokenPayload } from '../../utils/tokenUtils';

const PatientProfile = ({ token }) => {
  const payload = getTokenPayload(token);

  const [form, setForm] = useState({
    groupe_sanguin: '',
    allergies: '',
    antecedents_medicaux: ''
  });

  const [initialData, setInitialData] = useState(form);
  const [authorized, setAuthorized] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (payload?.role !== 'patient') {
      setAuthorized(false);
      return;
    }

    getUserProfile(token)
      .then(user => {
        const medData = {
          groupe_sanguin: user?.groupe_sanguin || '',
          allergies: user?.allergies || '',
          antecedents_medicaux: user?.antecedents_medicaux || ''
        };
        setForm(medData);
        setInitialData(medData);
      })
      .catch(err => {
        console.error('Erreur chargement données patient :', err.response?.data || err.message);
      });
  }, [token, payload]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCancel = () => {
    setForm(initialData);
    setEditMode(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateUserProfile(token, form);
      alert("Données médicales mises à jour");
      setInitialData(form);
      setEditMode(false);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
      console.error(err.response?.data || err.message);
    }
  };

  if (!authorized) {
    return <p className="unauthorized">Accès réservé aux patients.</p>;
  }

  return (
    <form className="patient-profile" onSubmit={handleSubmit}>
      <h3>Données médicales (patient)</h3>

      <label>Groupe sanguin
        <select
          name="groupe_sanguin"
          value={form.groupe_sanguin}
          onChange={handleChange}
          disabled={!editMode}
        >
          <option value="">-- Sélectionner --</option>
          <option value="A+">A+</option>
          <option value="A-">A−</option>
          <option value="B+">B+</option>
          <option value="B-">B−</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB−</option>
          <option value="O+">O+</option>
          <option value="O-">O−</option>
        </select>
      </label>

      <label>Allergies
        <textarea
          name="allergies"
          value={form.allergies}
          onChange={handleChange}
          disabled={!editMode}
        />
      </label>

      <label>Antécédents médicaux
        <textarea
          name="antecedents_medicaux"
          value={form.antecedents_medicaux}
          onChange={handleChange}
          disabled={!editMode}
        />
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

export default PatientProfile;
