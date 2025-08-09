// frontend/src/pages/auth/VerifyEmailPage.jsx
import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

/**
 * Page pour vérifier l'email via le token envoyé par email
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de vérification manquant');
        return;
      }
      
      try {
        const response = await axios.get(`/api/verifications/email/verify/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email vérifié avec succès');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Erreur lors de la vérification de l\'email');
      }
    };
    
    verifyEmail();
  }, [token]);
  
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body className="p-4 text-center">
          <h2>Vérification de votre adresse email</h2>
          
          {status === 'pending' && (
            <div className="my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Vérification en cours...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="my-4">
              <div className="verification-icon success mb-4">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
              </div>
              <Alert variant="success">
                {message}
              </Alert>
              <p className="mt-3">Votre compte est maintenant activé. Vous pouvez vous connecter.</p>
              <Link to="/auth/login">
                <Button variant="primary" className="mt-3">Se connecter</Button>
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div className="my-4">
              <div className="verification-icon error mb-4">
                <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '3rem' }}></i>
              </div>
              <Alert variant="danger">
                {message}
              </Alert>
              <p className="mt-3">Impossible de vérifier votre email. Le lien peut être expiré ou invalide.</p>
              <Link to="/auth/login">
                <Button variant="outline-secondary" className="mt-3">Retour à la connexion</Button>
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyEmailPage;
