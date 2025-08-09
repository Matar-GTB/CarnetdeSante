// frontend/src/pages/auth/VerificationPendingPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { resendVerificationCode } from '../../services/authService';

/**
 * Page affichée après l'inscription pour indiquer que l'email de vérification a été envoyé
 * avec un code de vérification
 */
const VerificationPendingPage = () => {
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const location = useLocation();
  const email = location.state?.email || '';
  
  // Rediriger vers la page de saisie du code si l'email est disponible
  useEffect(() => {
    if (email) {
      navigate('/auth/verify-code', { state: { email } });
    }
  }, [email, navigate]);
  
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
  
  const handleResendEmail = async () => {
    setResending(true);
    setMessage(null);
    
    try {
      await resendVerificationCode(email);
      setMessage({ 
        type: 'success', 
        content: 'Un nouveau code de vérification a été envoyé. Veuillez vérifier votre boîte de réception.' 
      });
      // Définir un délai de 2 minutes avant de pouvoir renvoyer un code
      setCountdown(120);
      
      // Rediriger vers la page de saisie du code
      navigate('/auth/verify-code', { state: { email } });
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        content: error.message || 'Erreur lors de l\'envoi du code. Veuillez réessayer.' 
      });
    } finally {
      setResending(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <i className="bi bi-envelope-check fs-1 text-primary"></i>
            <h2 className="mt-3">Vérification de votre email</h2>
          </div>
          
          <Alert variant="info">
            <p>Un code de vérification a été envoyé à <strong>{email}</strong>.</p>
            <p>Veuillez saisir le code reçu pour activer votre compte.</p>
          </Alert>
          
          {message && (
            <Alert variant={message.type} className="my-3">
              {message.content}
            </Alert>
          )}
          
          <div className="mt-4">
            <p>Vous n'avez pas reçu de code ?</p>
            <Button 
              variant="outline-primary" 
              onClick={handleResendEmail} 
              disabled={resending || countdown > 0}
              className="me-2"
            >
              {resending ? 'Envoi en cours...' : 
               countdown > 0 ? `Renvoyer dans ${formatCountdown()}` : 'Renvoyer le code'}
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate('/auth/verify-code', { state: { email } })}
              disabled={!email}
            >
              Entrer le code
            </Button>
            <Link to="/auth/login" className="ms-2">
              <Button variant="link">Retour à la connexion</Button>
            </Link>
          </div>
          
          <div className="mt-4 pt-3 border-top">
            <h5>Conseils :</h5>
            <ul>
              <li>Vérifiez votre dossier de spam si vous ne trouvez pas l'email avec le code.</li>
              <li>Assurez-vous que l'adresse email saisie est correcte.</li>
              <li>Le code expire après 10 minutes.</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerificationPendingPage;
