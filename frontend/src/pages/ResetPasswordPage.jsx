// ⚠️ À IMPLÉMENTER DANS L'APPLICATION : Ajouter cette route dans App.js
// Exemple: <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import PasswordReset from '../components/auth/PasswordReset';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    // Rediriger vers la page de connexion après 3 secondes
    setTimeout(() => {
      navigate('/auth/login');
    }, 3000);
  };
  
  return (
    <Container className="py-5">
      <Row>
        <Col md={8} lg={6} className="mx-auto">
          <PasswordReset token={token} onSuccess={handleSuccess} />
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordPage;
