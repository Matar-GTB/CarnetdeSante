import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Page non trouvée</h1>
      <p>La page demandée n'existe pas.</p>
      <Link to="/auth/login">Retour à la connexion</Link>
    </div>
  );
}

export default NotFound;
