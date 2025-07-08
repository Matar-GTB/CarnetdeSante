import React, { useState } from 'react';
import './VaccinationForm.css';
import { addVaccination } from '../../services/vaccinationService';

const VaccinationForm = () => {
  const [nomVaccin, setNomVaccin] = useState('');
  const [dateVaccination, setDateVaccination] = useState('');
  const [dateRappel, setDateRappel] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomVaccin || !dateVaccination) {
      setMessage("⚠️ Le nom du vaccin et la date de vaccination sont obligatoires.");
      return;
    }

    try {
      await addVaccination({ nom_vaccin: nomVaccin, date_vaccination: dateVaccination, date_rappel: dateRappel });
      setMessage("✅ Vaccin ajouté avec succès !");
      setNomVaccin('');
      setDateVaccination('');
      setDateRappel('');
    } catch (err) {
      console.error(err);
      setMessage("❌ Une erreur est survenue.");
    }
  };

  return (
    <form className="vaccination-form" onSubmit={handleSubmit}>
      <h3>➕ Ajouter un vaccin</h3>
      {message && <p className="message">{message}</p>}

      <label>Nom du vaccin *</label>
      <input
        type="text"
        value={nomVaccin}
        onChange={(e) => setNomVaccin(e.target.value)}
        placeholder="Ex : Pfizer, AstraZeneca"
      />

      <label>Date de vaccination *</label>
      <input
        type="date"
        value={dateVaccination}
        onChange={(e) => setDateVaccination(e.target.value)}
      />

      <label>Date de rappel (optionnelle)</label>
      <input
        type="date"
        value={dateRappel}
        onChange={(e) => setDateRappel(e.target.value)}
      />

      <button type="submit">💾 Enregistrer</button>
    </form>
  );
};

export default VaccinationForm;
