import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPatients } from '../../services/traitantService';
import './MesPatients.css';

export default function MesPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyPatients();
        setPatients(data);
      } catch (err) {
        console.error('MesPatients:', err);
        setError('Impossible de charger vos patients.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="loader">Chargement…</div>;
  if (error)   return <div className="error">{error}</div>;

  return (
    <div className="mes-patients-page">
      <h1>Mes patients</h1>
      {patients.length === 0 ? (
        <p className="empty">Aucun patient n’a encore accepté votre demande.</p>
      ) : (
        <div className="patients-grid">
          {patients.map(p => (
            <div key={p.id} className="patient-card">
              <div className="patient-info">
                <h2>{p.prenom} {p.nom}</h2>
                <p>📧 {p.email}</p>
                <p>🎂 {new Date(p.date_naissance).toLocaleDateString()}</p>
              </div>
              <button
                className="btn-vaccins"
                onClick={() => navigate(`/vaccinations/${p.id}`)}
              >
                💉 Voir vaccinations
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
