import React, { useEffect, useState, useCallback } from 'react';
import './VaccinationList.css';
import { getVaccinations, deleteVaccination } from '../../services/vaccinationService';

const VaccinationList = ({ role, patientId }) => {
  const [vaccins, setVaccins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVaccins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVaccinations(patientId);
      setVaccins(data);
    } catch {
      setError("Erreur lors du chargement des vaccins.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchVaccins();
  }, [fetchVaccins]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce vaccin ?")) return;
    try {
      await deleteVaccination(id);
      setVaccins(prev => prev.filter(v => v.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const isReminderSoon = dateStr => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffDays = (date - now) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 30;
  };

  if (loading) return <p>Chargement des vaccins...</p>;
  if (error)   return <p className="error">{error}</p>;
  if (!vaccins.length) return <p>Aucun vaccin enregistré.</p>;

  return (
    <div className="vaccination-list">
      {vaccins.map(v => (
        <div key={v.id} className="vaccin-card">
          <h4>{v.nom_vaccin}</h4>
          <p>Date : {v.date_administration}</p>
          {v.date_rappel && (
            <p style={{ color: isReminderSoon(v.date_rappel) ? 'red' : 'black' }}>
              Rappel : {v.date_rappel}
            </p>
          )}
          {role === 'patient' && (
            <button
              onClick={() => handleDelete(v.id)}
              className="btn-supprimer"
            >
              ❌ Supprimer
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default VaccinationList;
