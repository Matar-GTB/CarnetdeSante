// src/pages/DisponibilitesPage.jsx
import React from 'react';
import DisponibilitesMedecin from '../../components/medecin/DisponibilitesMedecin';
import IndisponibilitesMedecin from '../../components/medecin/IndisponibilitesMedecin';
import '../../components/medecin/DisponibilitesMedecin.css';
import '../../components/medecin/IndisponibilitesMedecin.css';

const DisponibilitesPage = () => {
  return (
    <div className="disponibilites-page">
      <h2>Mes disponibilités</h2>
      <DisponibilitesMedecin />
      <h2>Mes indisponibilités</h2>
      <IndisponibilitesMedecin />
    </div>
  );
};

export default DisponibilitesPage;
