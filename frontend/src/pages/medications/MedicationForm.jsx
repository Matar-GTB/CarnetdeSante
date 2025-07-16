// src/pages/medicaments/MedicationForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MedicationForm.css';
import { addMedicationApi } from '../../services/medicationService';

const MedicationForm = () => {
  const [form, setForm] = useState({
    nom_medicament: '',
    dose: '',
    frequence: '',
    heure_prise: '',
    date_debut: '',
    date_fin: '',
    rappel: true
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMedicationApi(form);
      setMessage('✅ Médicament enregistré.');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setMessage('❌ Erreur enregistrement.');
      console.error(error);
    }
  };

  return (
    <div className="medication-form-container">
      <button className="btn-retour" onClick={() => navigate('/dashboard')}>⬅ Retour</button>
      <h2>💊 Ajouter un médicament</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="medication-form">
        <label>Nom du médicament
          <input type="text" name="nom_medicament" value={form.nom_medicament} onChange={handleChange} required />
        </label>

        <label>Dosage (ex: 500mg)
          <input type="text" name="dose" value={form.dose} onChange={handleChange} />
        </label>

        <label>Fréquence (ex: 2 fois par jour)
          <input type="text" name="frequence" value={form.frequence} onChange={handleChange} />
        </label>

        <label>Heure de prise
          <input type="time" name="heure_prise" value={form.heure_prise} onChange={handleChange} />
        </label>

        <label>Date de début
          <input type="date" name="date_debut" value={form.date_debut} onChange={handleChange} required />
        </label>

        <label>Date de fin (optionnel)
          <input type="date" name="date_fin" value={form.date_fin} onChange={handleChange} />
        </label>

        <label>
          <input type="checkbox" name="rappel" checked={form.rappel} onChange={handleChange} />
          Activer les rappels ?
        </label>

        <button type="submit">💾 Enregistrer</button>
      </form>
    </div>
  );
};

export default MedicationForm;
