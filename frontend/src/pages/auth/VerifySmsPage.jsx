// frontend/src/pages/auth/VerifySmsPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const VerifySmsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId');
  const phoneNumber = searchParams.get('phone');
  
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Gérer le compte à rebours
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(count => count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Formater le temps restant
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Envoyer un nouveau code
  const handleResendCode = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await axios.post('/api/verifications/phone/send', { userId });
      setMessage('Un nouveau code a été envoyé à votre numéro de téléphone.');
      setCountdown(120); // 2 minutes avant de pouvoir renvoyer un code
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };
  
  // Vérifier le code OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      setMessage('Veuillez saisir un code valide.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post('/api/verifications/phone/verify', {
        userId,
        code: otp
      });
      
      setStatus('success');
      setMessage(response.data.message || 'Numéro de téléphone vérifié avec succès !');
      
      // Redirection après un court délai
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <i className="bi bi-phone fs-1 text-primary"></i>
            <h2 className="mt-3">Vérification par SMS</h2>
          </div>
          
          <Alert variant="info">
            <p>Un code de vérification a été envoyé par SMS au numéro <strong>{phoneNumber}</strong>.</p>
            <p>Veuillez saisir ce code ci-dessous pour vérifier votre compte.</p>
          </Alert>
          
          {message && (
            <Alert variant={status === 'error' ? 'danger' : 'success'} className="my-3">
              {message}
            </Alert>
          )}
          
          <Form onSubmit={handleVerify}>
            <Form.Group className="mb-3 mt-4">
              <Form.Label>Code de vérification</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le code reçu par SMS"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center fs-4 letter-spacing-2"
                disabled={status === 'success' || loading}
                required
              />
            </Form.Group>
            
            <div className="d-grid gap-2 mt-4">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={status === 'success' || loading}
              >
                {loading ? 'Vérification...' : 'Vérifier mon numéro'}
              </Button>
            </div>
          </Form>
          
          <div className="mt-4 text-center">
            <p>Vous n'avez pas reçu de code ?</p>
            <Button
              variant="link"
              onClick={handleResendCode}
              disabled={countdown > 0 || status === 'success' || loading}
            >
              {countdown > 0 
                ? `Renvoyer le code dans ${formatCountdown()}` 
                : 'Renvoyer le code'}
            </Button>
          </div>
          
          <div className="mt-4 pt-3 border-top">
            <h5>Vous préférez vérifier par email ?</h5>
            <p>Si vous rencontrez des problèmes avec la vérification par SMS, vous pouvez opter pour une vérification par email à la place.</p>
            <Link to="/auth/verification-options">
              <Button variant="outline-primary" size="sm">
                Options de vérification
              </Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifySmsPage;
