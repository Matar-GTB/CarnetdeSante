import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PartagePage = () => {
  const [partages, setPartages] = useState([]);

  const fetchPartages = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/sharing/my-doctors', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPartages(res.data.doctors || []);
  };

  const revokeAccess = async (medecinId) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/sharing/${medecinId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchPartages();
  };

  useEffect(() => {
    fetchPartages();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🔒 Accès autorisés à vos documents</h2>
      {partages.length === 0 ? (
        <p>Aucun médecin autorisé pour l’instant.</p>
      ) : (
        <ul>
          {partages.map((m) => (
            <li key={m.id} style={{ margin: '1rem 0' }}>
              <strong>{m.prenom} {m.nom}</strong> — {m.specialite}
              <button onClick={() => revokeAccess(m.id)} style={{ marginLeft: '1rem' }}>
                ❌ Révoquer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PartagePage;
