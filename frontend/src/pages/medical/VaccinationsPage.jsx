import React, { useEffect, useState } from 'react';
import { getTokenPayload } from '../../utils/tokenUtils';
import VaccinationList from '../../components/medical/VaccinationList';
import VaccinationForm from '../../components/medical/VaccinationForm';
import { useNavigate, useParams } from 'react-router-dom';
import './VaccinationsPage.css';

const VaccinationsPage = () => {
  const [role, setRole] = useState('');
  const navigate = useNavigate();
const { patientId } = useParams();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const payload = getTokenPayload(token);
    if (payload?.role) {
      setRole(payload.role);
    }
  }, []);

  return (
    <div className="vaccinations-page">
      <button onClick={() => navigate('/dashboard')} className="btn-retour">⬅ Retour</button>
      {patientId && (
  <button onClick={() => navigate('/patients')} className="btn-retour">
    ⬅ Retour à mes patients
  </button>
)}

      <h2>💉 Suivi Vaccinal</h2>
      <p>Consultez vos vaccins ou ajoutez-en un nouveau.</p>

      {role === 'patient' && <VaccinationForm />}
      {role === 'medecin' && <p>Affichage des vaccins d’un patient autorisé</p>}
      
      <VaccinationList role={role} patientId={patientId} />
    </div>
  );
};

export default VaccinationsPage;
