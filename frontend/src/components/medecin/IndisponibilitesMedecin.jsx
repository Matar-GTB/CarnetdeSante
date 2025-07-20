// IndisponibilitesMedecin.jsx
import React, { useEffect, useState } from 'react';
import {
  getIndisponibilites,
  createIndisponibilite,
  deleteIndisponibilite
} from '../../services/disponibiliteService';
import './DisponibilitesMedecin.css';

const IndisponibilitesMedecin = () => {
  const [indispos, setIndispos] = useState([]);
  const [form, setForm] = useState({
    date_debut: '',
    date_fin: '',
    heure_debut: '',
    heure_fin: '',
    motif: ''
  });

  useEffect(() => {
    fetchIndispos();
  }, []);

  const fetchIndispos = async () => {
    try {
      const data = await getIndisponibilites();
      setIndispos(data);
    } catch (error) {
      console.error('Erreur indisponibilités', error);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createIndisponibilite(form);
      setForm({ date_debut: '', date_fin: '', heure_debut: '', heure_fin: '', motif: '' });
      fetchIndispos();
    } catch (err) {
      alert("Erreur ajout indisponibilité");
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Supprimer cette indisponibilité ?')) return;
    await deleteIndisponibilite(id);
    fetchIndispos();
  };

  return (
    <div className="dispo-section">
      <h3>Indisponibilités ponctuelles</h3>
      <form onSubmit={handleSubmit} className="dispo-form">
        <input type="date" value={form.date_debut} onChange={e => setForm({ ...form, date_debut: e.target.value })} required />
        <input type="date" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })} required />
        <input type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })} required />
        <input type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })} required />
        <input type="text" placeholder="Motif (facultatif)" value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} />
        <button type="submit">Ajouter</button>
      </form>

      <ul className="dispo-list">
        {indispos.map(ind => (
          <li key={ind.id}>
            📅 {ind.date_debut} ➜ {ind.date_fin} ({ind.heure_debut} - {ind.heure_fin}) {ind.motif && `– ${ind.motif}`}
            <button onClick={() => handleDelete(ind.id)}>🗑</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IndisponibilitesMedecin;
