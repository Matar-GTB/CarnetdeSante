import React, { useState, useEffect, useContext } from 'react';
import { createAppointment, getCreneauxDisponibles } from '../../services/appointmentService';
import { getTokenPayload } from '../../utils/tokenUtils';
import { AuthContext } from '../../contexts/AuthContext'; 
import './RendezVousUniqueMedecin.css';

export default function RendezVousUniqueMedecin({ medecin }) {
  const [date, setDate] = useState('');
  const [creneaux, setCreneaux] = useState([]);
  const [heure, setHeure] = useState('');
  const { token } = useContext(AuthContext);
  const userId = getTokenPayload(token)?.userId;
  const [duree, setDuree] = useState(30);
  useEffect(() => {
    if (date) {
    getCreneauxDisponibles(medecin.id, date)
      .then(res => {
        setCreneaux(Array.isArray(res) ? res : []);
        setDuree(res.duree);
      })
      .catch(() => setCreneaux([]));
  }
  }, [date, medecin.id]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!heure) return alert('Choisissez un créneau');
    // Il te faut la durée du créneau (récupérable du backend, ou dans l’API des créneaux)
    const heureFin = addMinutes(heure, duree); // À améliorer : 30min dynamique
    await createAppointment({
      patient_id: userId,
      medecin_id: medecin.id,
      date_rendezvous: date,
      heure_debut: heure,
      heure_fin: heureFin,
      type_rendezvous: 'consultation',
      notes: ''
    });
    alert('Demande envoyée !');
    setDate(''); setHeure('');
  };

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <h3>Prendre RDV avec Dr {medecin.prenom} {medecin.nom}</h3>
      <input
        type="date"
        value={date}
        onChange={e => { setDate(e.target.value); setHeure(''); }}
        required
      />
      {/* Affichage des créneaux disponibles */}
      {Array.isArray(creneaux) && creneaux.length > 0 ? (
        <div className="creneaux-grille">
          {creneaux.map((c, i) => (
            <button
              type="button"
              key={i}
              className={c === heure ? 'selected' : ''}
              onClick={() => setHeure(c)}
            >
              {c}
            </button>
          ))}
        </div>
      ) : date && <p>Aucun créneau disponible ce jour.</p>}
      <button type="submit" disabled={!heure}>Valider la demande</button>
    </form>
  );
}

// Utilitaire JS
function addMinutes(time, minsToAdd) {
  const [h, m] = time.split(':');
  const date = new Date(0, 0, 0, h, m);
  date.setMinutes(date.getMinutes() + minsToAdd);
  return date.toTimeString().slice(0, 5);
}
