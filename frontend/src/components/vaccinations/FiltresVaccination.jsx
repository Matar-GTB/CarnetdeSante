import React from 'react';

const FiltresVaccination = ({ filtres, onChange }) => {
  return (
    <div className="filtres-avances">
      <h4>🔍 Filtres avancés</h4>
      <div className="filtres-grid">
        <div className="filtre-groupe">
          <label>Catégorie</label>
          <select 
            value={filtres.categorie}
            onChange={e => onChange({...filtres, categorie: e.target.value})}
            className="form-control"
          >
            <option value="">Toutes</option>
            <option value="obligatoire">Obligatoires</option>
            <option value="recommande">Recommandés</option>
          </select>
        </div>

        <div className="filtre-groupe">
          <label>Statut</label>
          <select 
            value={filtres.statut}
            onChange={e => onChange({...filtres, statut: e.target.value})}
            className="form-control"
          >
            <option value="">Tous</option>
            <option value="complet">Complets</option>
            <option value="en_attente">En attente</option>
            <option value="incomplet">Incomplets</option>
          </select>
        </div>

        <div className="filtre-groupe">
          <label>Période</label>
          <select 
            value={filtres.periode}
            onChange={e => onChange({...filtres, periode: e.target.value})}
            className="form-control"
          >
            <option value="">Toute la période</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
        </div>

        <div className="filtre-groupe">
          <label>Rappels</label>
          <select 
            value={filtres.rappels}
            onChange={e => onChange({...filtres, rappels: e.target.value})}
            className="form-control"
          >
            <option value="">Tous</option>
            <option value="proches">Rappels proches</option>
            <option value="passes">Rappels passés</option>
            <option value="futurs">Rappels futurs</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltresVaccination;
