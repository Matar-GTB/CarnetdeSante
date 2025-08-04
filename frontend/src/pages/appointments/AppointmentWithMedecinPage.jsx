// src/pages/appointments/AppointmentWithMedecinPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import AppointmentBooking from '../../components/appointments/AppointmentBooking';
import Loader from '../../components/ui/Loader';

export default function AppointmentWithMedecinPage() {
  const { medecinId } = useParams();
  const navigate = useNavigate();
  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMedecin = async () => {
      try {
        setLoading(true);
        const response = await profileService.getMedecinPublicProfile(medecinId);
        setMedecin(response.data);
      } catch (err) {
        console.error('Erreur chargement médecin:', err);
        setError('Médecin introuvable');
      } finally {
        setLoading(false);
      }
    };

    if (medecinId) {
      loadMedecin();
    }
  }, [medecinId]);

  const handleSuccess = () => {
    // Redirection vers la liste des RDV avec message de succès
    navigate('/appointments', { 
      state: { 
        message: '✅ Rendez-vous confirmé ! Vous recevrez une confirmation par email.' 
      } 
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader message="Chargement du profil médecin..." />
      </div>
    );
  }

  if (error || !medecin) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Erreur</h2>
        <p>{error || 'Médecin introuvable'}</p>
        <button onClick={() => navigate(-1)}>← Retour</button>
      </div>
    );
  }

  return (
    <div>
      <AppointmentBooking 
        medecin={medecin} 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
