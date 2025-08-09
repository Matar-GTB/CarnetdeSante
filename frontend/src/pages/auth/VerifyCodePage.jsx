// frontend/src/pages/auth/VerifyCodePage.jsx
import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmailWithCode, resendVerificationCode } from '../../services/authService';
import '../../components/auth/VerifyCode.css';

// Composant défini comme une fonction nommée
function VerifyCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  // Etat pour chaque chiffre du code (6 chiffres)
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Reference aux inputs pour faciliter la navigation
  const inputRefs = Array(6).fill(0).map(() => React.createRef());

  // Gerer le changement d'un chiffre du code
  const handleCodeChange = (index, value) => {
    // Ne permettre que les chiffres
    if (value && !/^\d*$/.test(value)) return;
    
    // Mettre a jour le code
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Passer au champ suivant automatiquement
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Gerer la touche retour arriere pour aller au champ precedent
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Gerer le collage d'un code complet
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedCode = pastedData.trim().substring(0, 6).split('');
    
    if (pastedCode.every(char => /^\d$/.test(char))) {
      const newCode = [...code];
      pastedCode.forEach((digit, index) => {
        if (index < 6) newCode[index] = digit;
      });
      setCode(newCode);
      
      // Focus sur le dernier champ si le code est complet ou le prochain champ vide
      const lastFilledIndex = newCode.findIndex(digit => !digit);
      if (lastFilledIndex === -1) {
        inputRefs[5].current.focus();
      } else {
        inputRefs[lastFilledIndex].current.focus();
      }
    }
  };

  // Verifier le code
  const verifyCode = async () => {
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      setMessage('Veuillez saisir les 6 chiffres du code.');
      return;
    }
    
    setStatus('verifying');
    setMessage('');
    
    try {
      const response = await verifyEmailWithCode(email, codeString);
      
      setStatus('success');
      setMessage(response.message || 'Email verifie avec succes');
      
      // Rediriger apres 2 secondes
      setTimeout(() => {
        navigate('/auth/login', { 
          state: { 
            verified: true, 
            message: 'Votre compte a ete verifie avec succes. Vous pouvez maintenant vous connecter.' 
          } 
        });
      }, 2000);
      
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Code de verification incorrect. Veuillez reessayer.');
    }
  };

  // Renvoyer un nouveau code
  const resendCode = async () => {
    setStatus('idle');
    setMessage('');
    
    try {
      await resendVerificationCode(email);
      setMessage('Un nouveau code de verification a ete envoye a votre adresse email.');
      setCountdown(120); // 2 minutes d'attente avant de pouvoir renvoyer
      
      // Gerer le compte a rebours
      const timer = setInterval(() => {
        setCountdown(prevCount => {
          if (prevCount <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
    } catch (err) {
      setMessage(err.message || 'Erreur lors de l\'envoi du code. Veuillez reessayer.');
    }
  };

  // Formater le temps restant
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="verify-code-page">
      <Card className="verify-code-card">
        <Card.Body>
          {/* Icône et titre */}
          <div className="verify-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          
          <h2 className="verify-title">Vérification par code</h2>
          <p className="verify-subtitle">
            Nous avons envoyé un code de vérification à votre adresse email
          </p>
          
          {email && (
            <div className="verify-email">
              <i className="bi bi-envelope me-2"></i>
              {email}
            </div>
          )}
          
          {/* Section de débogage (peut être supprimée en production) */}
          <div className="debug-section">
            <h5><i className="bi bi-bug me-2"></i>Informations de débogage</h5>
            <p><strong>Composant:</strong> VerifyCodePage</p>
            <p><strong>Email:</strong> {email || 'Non défini'}</p>
            <p><strong>État:</strong> {status}</p>
            <p><strong>Heure:</strong> {new Date().toLocaleTimeString()}</p>
          </div>
          
          {email ? (
            <>
              {message && (
                <Alert 
                  variant={status === 'success' ? 'success' : 'danger'} 
                  className="verify-alert"
                >
                  {message}
                </Alert>
              )}
              
              <Form className="my-4">
                <Form.Group>
                  <Form.Label className="fw-semibold mb-3">
                    Saisissez le code à 6 chiffres
                  </Form.Label>
                  
                  {/* Nouveau container pour les champs de code */}
                  <div className="verification-code-container">
                    {code.map((digit, index) => (
                      <Form.Control
                        key={index}
                        ref={inputRefs[index]}
                        type="text"
                        className={`verification-code-input ${digit ? 'filled' : ''} ${status === 'error' ? 'error' : ''}`}
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        autoFocus={index === 0}
                        disabled={status === 'verifying' || status === 'success'}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    ))}
                  </div>
                </Form.Group>
                
                <div className="d-grid gap-3 mt-4">
                  <Button
                    className="verify-button"
                    onClick={verifyCode}
                    disabled={code.some(digit => !digit) || status === 'verifying' || status === 'success'}
                    size="lg"
                  >
                    {status === 'verifying' ? (
                      <>
                        <span className="loading-spinner spinner-border spinner-border-sm me-2"></span>
                        Vérification en cours...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Vérifier le code
                      </>
                    )}
                  </Button>
                  
                  <Button
                    className="resend-button"
                    onClick={resendCode}
                    disabled={countdown > 0 || status === 'verifying' || status === 'success'}
                    variant="outline-secondary"
                  >
                    {countdown > 0 ? (
                      <>
                        <i className="bi bi-clock me-2"></i>
                        Renvoyer dans {formatCountdown()}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-repeat me-2"></i>
                        Renvoyer le code
                      </>
                    )}
                  </Button>
                </div>
              </Form>
              
              {/* Conseils avec design amélioré */}
              <div className="mt-4 pt-4 border-top">
                <h6 className="text-muted mb-3">
                  <i className="bi bi-lightbulb me-2"></i>
                  Conseils utiles
                </h6>
                <div className="text-muted small">
                  <div className="mb-2">
                    <i className="bi bi-envelope-exclamation me-2 text-warning"></i>
                    Vérifiez votre dossier de spam si vous ne trouvez pas l'email
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-clock me-2 text-info"></i>
                    Le code expire après 30 minutes
                  </div>
                  <div>
                    <i className="bi bi-arrow-repeat me-2 text-success"></i>
                    Vous pouvez renvoyer le code si nécessaire
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Alert variant="danger" className="verify-alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <p className="mb-3">Aucune adresse email fournie. Veuillez recommencer le processus d'inscription.</p>
              <Button 
                variant="primary" 
                className="verify-button"
                onClick={() => navigate('/auth/register')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Retour à l'inscription
              </Button>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

// Export par défaut simple et direct
export default VerifyCodePage;
