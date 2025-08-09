// frontend/src/pages/RappelsPage.jsx - VERSION OBSOLÈTE
// ⚠️ CE FICHIER EST OBSOLÈTE ET A ÉTÉ REMPLACÉ PAR frontend/src/pages/rappels/RappelsPage.jsx ⚠️
// Conserver temporairement ce fichier pour référence, mais il sera supprimé dans une future mise à jour

import React from 'react';
import { Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const RappelsPage = () => {
  const navigate = useNavigate();
  
  // Rediriger vers la nouvelle version
  useEffect(() => {
    navigate('/rappels');
  }, [navigate]);
  
  return (
    <Container className="py-4">
      <Alert variant="warning">
        <strong>Page obsolète</strong> - Redirection vers la nouvelle interface des rappels...
      </Alert>
    </Container>
  );
};

export default RappelsPage;
