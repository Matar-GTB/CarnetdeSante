import React from 'react';
import './Dashboard.css';
import UserMenu from './UserMenu'; // menu déroulant de l'utilisateur

export default function Dashboard({ user, setPage }) {
  // Fonction de navigation interne (à personnaliser plus tard)
  const onNavigate = (target) => {
    alert(`🔜 Redirection vers : ${target}`);
    // Tu pourras ici appeler setPage(target) quand les pages seront prêtes
  };

  return (
    <div className="dashboard">
      {/* En-tête avec UserMenu */}
      <header className="dashboard-header">
        <h1>Hello {user?.firstname || 'Utilisateur'} 👋</h1>
        <UserMenu user={user} onLogout={() => setPage('login')} onNavigate={onNavigate} />
      </header>

      {/* Contenu centré */}
      <div className="dashboard-main">
        {/* 📄 Derniers documents */}
        <section className="dashboard-section documents-recents">
          <h2>Derniers documents disponibles</h2>
          <div className="document-cards">
            <div className="doc-card">
              <h3>Quittance</h3>
              <p>Votre document "Quittance juillet 2025" est disponible</p>
            </div>
            <div className="doc-card">
              <h3>Avis d’échéance</h3>
              <p>Votre document "Avis d’échéance juillet 2025" est disponible</p>
            </div>
            <div className="doc-card">
              <h3>Quittance</h3>
              <p>Votre document "Quittance juin 2025" est disponible</p>
            </div>
          </div>
        </section>

        {/* 📁 Documents du bail */}
        <section className="dashboard-section bail-docs">
          <h2>Documents du bail</h2>
          <ul className="bail-list">
            <li onClick={() => onNavigate('quittances')}>Quittances & avis d’échéance</li>
            <li onClick={() => onNavigate('attestations')}>Attestations & justificatifs</li>
            <li onClick={() => onNavigate('etat-des-lieux')}>États des lieux & bail</li>
          </ul>
          <button className="btn-purple" onClick={() => onNavigate('mes-documents')}>
            Voir tous les documents
          </button>
        </section>

        {/* 🛠 Espace support */}
        <section className="dashboard-section support-box">
          <h2>Espace support</h2>
          <p>OQORO est à votre écoute 👂</p>
          <p>
            Si vous avez un problème ou une question, contactez-nous en précisant la nature de
            votre demande.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-purple" onClick={() => onNavigate('support')}>
              Accéder à mon espace support →
            </button>
            <button className="btn-purple" onClick={() => onNavigate('faire-demande')}>
              Faire une demande →
            </button>
          </div>
        </section>

        {/* 🤝 Partenaires */}
        <section className="dashboard-section partenaires">
          <h2>Partenaires</h2>
          <div className="partenaire-card">
            <img src="/lovys.png" alt="Lovys" />
            <p>Lovys, assurance habitation</p>
          </div>
        </section>
      </div>
    </div>
  );
}
