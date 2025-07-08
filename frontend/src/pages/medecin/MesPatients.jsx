import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MesPatients.css';
import axios from 'axios';

const MesPatients = () => {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/medecins/mes-patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(res.data || []);
      } catch (err) {
        setError("Erreur lors du chargement des patients.");
      }
    };

    fetchPatients();
  }, []);

  const handleVoirVaccins = (id) => {
    navigate(`/vaccinations/${id}`);
  };

  return (
    <div className="mes-patients-page">
      <h2>👨‍⚕️ Mes Patients</h2>
      {error && <p className="error">{error}</p>}
      {patients.length === 0 ? (
        <p>Aucun patient trouvé.</p>
      ) : (
        <ul className="patient-list">
          {patients.map((patient) => (
            <li key={patient.id} className="patient-card">
              <strong>{patient.prenom} {patient.nom}</strong><br />
              📧 {patient.email} <br />
              📅 Né le : {patient.date_naissance}
              <br />
              <button onClick={() => handleVoirVaccins(patient.id)}>💉 Voir vaccinations</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MesPatients;
