import React, { useState } from 'react';
import './VaccinationForm.css';

const VaccinationForm = ({ onAddSuccess }) => {
  const [nomVaccin, setNomVaccin] = useState('');
  const [dateAdministration, setDateAdministration] = useState('');
  const [dateRappel, setDateRappel] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomVaccin || !dateAdministration) {
      setMessage("⚠️ Le nom du vaccin et la date de vaccination sont obligatoires.");
      return;
    }

    try {
      await onAddSuccess({
        nom_vaccin:          nomVaccin,
        date_administration: dateAdministration,
        date_rappel:         dateRappel,
        notes
      });
      setMessage("✅ Vaccin ajouté avec succès !");
      // réinitialisation des champs
      setNomVaccin('');
      setDateAdministration('');
      setDateRappel('');
      setNotes('');
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
        onChange={e => setNomVaccin(e.target.value)}
        placeholder="Ex : Pfizer, AstraZeneca"
      />

      <label>Date de vaccination *</label>
      <input
        type="date"
        value={dateAdministration}
        onChange={e => setDateAdministration(e.target.value)}
      />

      <label>Date de rappel (optionnelle)</label>
      <input
        type="date"
        value={dateRappel}
        onChange={e => setDateRappel(e.target.value)}
      />

      <label>Notes (optionnel)</label>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Ajoutez vos observations…"
      />

      <button type="submit">Enregistrer</button>
    </form>
  );
};

export default VaccinationForm;
