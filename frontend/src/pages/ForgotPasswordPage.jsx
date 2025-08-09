// frontend/src/pages/ForgotPasswordPage.jsx
// ⚠️ À IMPLÉMENTER DANS L'APPLICATION : Ajouter cette route dans App.js
// Exemple: <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PasswordResetRequest from '../components/auth/PasswordResetRequest';

const ForgotPasswordPage = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col md={8} lg={6} className="mx-auto">
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Mot de passe oublié</Card.Title>
              
              <PasswordResetRequest />
              
              <div className="text-center mt-4">
                <Link to="/auth/login">Retour à la connexion</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPasswordPage;
