// frontend/components/medecin/DisponibilitesMedecin.jsx
import React, { useEffect, useState } from 'react';
import './DisponibilitesMedecin.css';
import {
  getHorairesTravail,
  updateHoraireJour,
  deleteHoraireJour
} from '../../services/disponibiliteService';

const joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const DisponibilitesMedecin = ({ medecinId, token }) => {
  const [horaires, setHoraires] = useState({});
  const [editJour, setEditJour] = useState(null);
  const [form, setForm] = useState({ heure_debut: '', heure_fin: '', duree_creneau: 30 });

  // Charger les horaires à l’ouverture
  useEffect(() => {
    if (medecinId) {
      getHorairesTravail(medecinId, token).then((res) => {
        const obj = {};
        res.forEach(h => obj[h.jour_semaine] = h);
        setHoraires(obj);
      });
    }
  }, [medecinId, token]);

  const handleEdit = (jour) => {
    setEditJour(jour);
    const h = horaires[jour] || {};
    setForm({
      heure_debut: h.heure_debut || '08:00',
      heure_fin: h.heure_fin || '12:00',
      duree_creneau: h.duree_creneau || 30
    });
  };

  const handleSave = async () => {
    await updateHoraireJour(editJour, form, token);
    const updated = await getHorairesTravail(medecinId, token);
    const obj = {};
    updated.forEach(h => obj[h.jour_semaine] = h);
    setHoraires(obj);
    setEditJour(null);
  };

  const handleDelete = async (jour) => {
    const id = horaires[jour]?.id;
    if (id && window.confirm('Supprimer ce créneau ?')) {
      await deleteHoraireJour(id, token);
      const updated = await getHorairesTravail(medecinId, token);
      const obj = {};
      updated.forEach(h => obj[h.jour_semaine] = h);
      setHoraires(obj);
    }
  };

  return (
    <div className="disponibilites-container">
      <h2>🗓️ Disponibilités hebdomadaires</h2>
      <table className="horaire-table">
        <thead>
          <tr>
            <th>Jour</th>
            <th>Heure début</th>
            <th>Heure fin</th>
            <th>Durée créneau</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {joursSemaine.map((jour) => {
            const h = horaires[jour];
            const isEditing = editJour === jour;
            return (
              <tr key={jour}>
                <td>{jour.charAt(0).toUpperCase() + jour.slice(1)}</td>
                {isEditing ? (
                  <>
                    <td>
                      <input
                        type="time"
                        value={form.heure_debut}
                        onChange={(e) => setForm({ ...form, heure_debut: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={form.heure_fin}
                        onChange={(e) => setForm({ ...form, heure_fin: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={5}
                        step={5}
                        value={form.duree_creneau}
                        onChange={(e) => setForm({ ...form, duree_creneau: parseInt(e.target.value) })}
                      />
                    </td>
                    <td>
                      <button onClick={handleSave}>💾 Enregistrer</button>
                      <button onClick={() => setEditJour(null)}>❌ Annuler</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{h?.heure_debut || '-'}</td>
                    <td>{h?.heure_fin || '-'}</td>
                    <td>{h?.duree_creneau ? `${h.duree_creneau} min` : '-'}</td>
                    <td>
                      <button onClick={() => handleEdit(jour)}>✏ Modifier</button>
                      {h && <button onClick={() => handleDelete(jour)}>🗑 Supprimer</button>}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DisponibilitesMedecin;
