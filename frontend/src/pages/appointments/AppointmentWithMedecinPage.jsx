// src/pages/appointments/AppointmentWithMedecinPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicDoctorProfile } from '../../services/profileService';
import RendezVousUniqueMedecin from '../../components/appointments/RendezVousUniqueMedecin';

export default function AppointmentWithMedecinPage() {
  const { medecinId } = useParams();
  const [medecin, setMedecin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getPublicDoctorProfile(medecinId).then(data => setMedecin(data.data));
  }, [medecinId]);

  if (!medecin) return <div>Chargement…</div>;

  return (
    <div>
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Retour
      </button>
      <RendezVousUniqueMedecin medecin={medecin} />
    </div>
  );
}
