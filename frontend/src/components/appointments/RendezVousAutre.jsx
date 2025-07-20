// src/components/appointments/RendezVousAutre.jsx
import React, { useState, useEffect, useRef } from 'react';
import './RendezVousAutre.css';
import { getMedecinsDisponibles, createAppointment } from '../../services/appointmentService';
import { getTokenPayload } from '../../utils/tokenUtils';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function RendezVousAutre() {
  const [allDocs, setAllDocs]         = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery]             = useState('');
  const [selected, setSelected]       = useState(null);
  const [formData, setFormData]       = useState({ date: '', heure: '' });
  const [showList, setShowList]       = useState(false);
  const wrapperRef = useRef(null);
  const { token } = useContext(AuthContext);

  // Chargement des médecins
  useEffect(() => {
    getMedecinsDisponibles().then(setAllDocs);
  }, []);

  // Fermer la liste au clic extérieur
  useEffect(() => {
    const onClick = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Mettre à jour les suggestions
  useEffect(() => {
    if (!query) {
      setSuggestions(allDocs.slice(0, 5));
    } else {
      const q = query.toLowerCase();
      setSuggestions(
        allDocs.filter(m =>
          `${m.prenom} ${m.nom}`.toLowerCase().includes(q)
          || (m.specialite    || '').toLowerCase().includes(q)
          || (m.etablissements|| '').toLowerCase().includes(q)
        ).slice(0, 7)
      );
    }
  }, [query, allDocs]);

  // Récupérer l’ID du patient
  const userId = getTokenPayload(token)?.userId;

  const handleSelect = doc => {
    setSelected(doc);
    setQuery(`${doc.prenom} ${doc.nom}`);
    setShowList(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selected || !formData.date || !formData.heure) return;
    await createAppointment({
      patient_id:      userId,
      medecin_id:      selected.id,
      date_rendezvous: formData.date,
      heure_debut:     formData.heure,
      heure_fin:       formData.heure,
      type_rendezvous: 'consultation',
      notes:           ''
    });
    alert('Demande envoyée !');
    setSelected(null);
    setQuery('');
    setFormData({ date: '', heure: '' });
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <label htmlFor="doc-search">Rechercher un médecin</label>
      <input
        id="doc-search"
        type="text"
        value={query}
        placeholder="Nom, spécialité ou établissement…"
        onChange={e => {
          setQuery(e.target.value);
          setShowList(true);
          setSelected(null);
        }}
        onFocus={() => setShowList(true)}
      />

      {showList && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map(doc => (
            <li
              key={doc.id}
              onClick={() => handleSelect(doc)}
              className="suggestion-item"
            >
              <strong>{doc.prenom} {doc.nom}</strong><br/>
              <small>{doc.specialite} — {doc.etablissements}</small>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <form className="appointment-form" onSubmit={handleSubmit}>
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <input
            type="time"
            value={formData.heure}
            onChange={e => setFormData({ ...formData, heure: e.target.value })}
            required
          />
          <button type="submit">Prendre rendez-vous</button>
        </form>
      )}
    </div>
  );
}
