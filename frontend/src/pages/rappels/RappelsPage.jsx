// src/pages/rappels/RappelsPage.jsx
import React, { useEffect, useState } from 'react';
import { getRappelsApi, supprimerRappelApi } from '../../services/rappelService';
import { useNavigate } from 'react-router-dom';
import './RappelsPage.css';

const RappelsPage = () => {
  const [rappels, setRappels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRappels();
  }, []);

  const fetchRappels = async () => {
    setLoading(true);
    try {
      const data = await getRappelsApi();
      setRappels(data);
    } catch (err) {
      setMessage('❌ Erreur lors du chargement des rappels.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
  try {
    await supprimerRappelApi(id);
    setRappels(prev => prev.filter(r => r.id !== id));
    setMessage('✅ Rappel supprimé avec succès.');
  } catch (err) {
    setMessage('❌ Échec de la suppression.');
  }
};


  if (loading) return <p className="loading">Chargement des rappels...</p>;

  return (
    <div className="rappels-page">
      <button className="btn-retour" onClick={() => navigate('/dashboard')}>⬅ Retour</button>

      <h2>📅 Mes Rappels</h2>
      {message && <p className="message">{message}</p>}

      <button className="btn-ajouter" onClick={() => navigate('/rappels/create')}>➕ Nouveau Rappel</button>

      {!rappels.length ? (
        <p>Aucun rappel programmé.</p>
      ) : (
        rappels.map(rappel => (
          <div key={rappel.id} className="rappel-card">
            <h4>{rappel.type_rappel}</h4>
            <p><strong>Détails :</strong> {JSON.stringify(rappel.details)}</p>
            <p><strong>Récurrence :</strong> {rappel.recurrence}</p>
            <p><strong>Canaux :</strong> {Object.entries(rappel.canaux).filter(([_, v]) => v).map(([k]) => k).join(', ')}</p>
            <button className="btn-delete" onClick={() => handleDelete(rappel.id)}>❌ Supprimer</button>
          </div>
        ))
      )}
    </div>
  );
};

export default RappelsPage;
