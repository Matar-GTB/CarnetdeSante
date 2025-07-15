// src/pages/appointments/AppointmentsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AppointmentsPage.css';
import RendezVousTraitant from '../../components/appointments/RendezVousTraitant';
import RendezVousAutre    from '../../components/appointments/RendezVousAutre';

const AppointmentsPage = () => {
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="appointments-page">
      <h1 className="appointments-title">Prendre un rendez-vous</h1>

      {/*  
        1) si aucune section n’est active, bouton vers le dashboard  
        2) sinon, bouton vers le choix des sections  
      */}
      {!activeSection ? (
        <button
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          ← Retour
        </button>
      ) : (
        <button
          className="back-button"
          onClick={() => setActiveSection(null)}
        >
          ← Retour
        </button>
      )}

      {!activeSection ? (
        <div className="appointments-options">
          <div
            className="appointment-card card-traitant"
            onClick={() => setActiveSection('traitant')}
          >
            <h2>👨‍⚕️ Avec mon médecin traitant</h2>
            <p>Consultez vos médecins traitants et prenez rendez-vous rapidement.</p>
          </div>

          <div
            className="appointment-card card-autre"
            onClick={() => setActiveSection('autre')}
          >
            <h2>🌍 Avec un autre médecin</h2>
            <p>Recherchez un médecin disponible par spécialité, lieu, ou langue.</p>
          </div>
        </div>
      ) : activeSection === 'traitant' ? (
        <RendezVousTraitant />
      ) : (
        <RendezVousAutre />
      )}
    </div>
  );
};

export default AppointmentsPage;
