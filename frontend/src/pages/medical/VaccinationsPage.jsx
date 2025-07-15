import React, { useEffect, useState } from 'react';
import { getTokenPayload } from '../../utils/tokenUtils';
import { getVaccinations, addVaccination } from '../../services/vaccinationService';
import VaccinationList from '../../components/medical/VaccinationList';
import VaccinationForm from '../../components/medical/VaccinationForm';
import { useNavigate, useParams } from 'react-router-dom';
import './VaccinationsPage.css';

const VaccinationsPage = () => {
  const [role, setRole] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);      // ← changera à chaque ajout
  const navigate = useNavigate();
  const { patientId } = useParams();

  // 1️⃣ Récupération du rôle
  useEffect(() => {
    const token = localStorage.getItem('token');
    const payload = getTokenPayload(token);
    if (payload?.role) setRole(payload.role);
  }, []);

  // 2️⃣ Callback qu’on passe au formulaire
  const handleAddSuccess = async (vaccinData) => {
    try {
      await addVaccination(vaccinData);
      // Incrémente pour forcer le remount/re-fetch de VaccinationList
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Erreur ajout vaccin :', err);
    }
  };

  return (
    <div className="vaccinations-page">
      <button onClick={() => navigate('/dashboard')} className="btn-retour">
        ⬅ Retour
      </button>
      {patientId && (
        <button onClick={() => navigate('/patients')} className="btn-retour">
          ⬅ Retour à mes patients
        </button>
      )}

      <h2>Suivi Vaccinal</h2>
      <p>Consultez vos vaccins ou ajoutez-en un nouveau.</p>

      {/* Formulaire ne s’affiche que pour les patients */}
      {role === 'patient' && (
        <VaccinationForm onAddSuccess={handleAddSuccess} />
      )}

      {/* La clé change à chaque ajout → remonte/le ré-initialise */}
      <VaccinationList
        key={refreshKey}
        role={role}
        patientId={patientId}
      />
    </div>
  );
};

export default VaccinationsPage;
