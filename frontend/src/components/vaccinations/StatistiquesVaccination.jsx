import React from 'react';

const StatistiquesVaccination = ({ vaccins = [] }) => {
  const stats = {
    total: vaccins.length,
    complets: vaccins.filter(v => v.statut === 'complet').length,
    enAttente: vaccins.filter(v => v.statut === 'en_attente').length,
    obligatoires: vaccins.filter(v => v.categorie === 'obligatoire').length,
    recommandes: vaccins.filter(v => v.categorie === 'recommande').length,
    rappelsProches: vaccins.filter(v => {
      if (!v.date_rappel) return false;
      const diffJours = (new Date(v.date_rappel) - new Date()) / (1000 * 3600 * 24);
      return diffJours >= 0 && diffJours <= 30;
    }).length
  };

  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-number">{stats.total}</div>
        <div className="stat-label">Vaccins totaux</div>
      </div>
      <div className="stat-card">
        <div className="stat-number" style={{color: '#388e3c'}}>
          {stats.complets}
        </div>
        <div className="stat-label">Vaccins complets</div>
      </div>
      <div className="stat-card">
        <div className="stat-number" style={{color: '#1976D2'}}>
          {stats.obligatoires}
        </div>
        <div className="stat-label">Obligatoires</div>
      </div>
      <div className="stat-card">
        <div className="stat-number" style={{color: '#fbc02d'}}>
          {stats.rappelsProches}
        </div>
        <div className="stat-label">Rappels à venir</div>
      </div>
    </div>
  );
};

export default StatistiquesVaccination;
