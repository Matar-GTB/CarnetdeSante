// frontend/src/components/auth/VerificationForm.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { Button, Form, Alert, Spinner, Card } from 'react-bootstrap';
import axios from 'axios';

/**
 * Composant pour la vérification d'email ou de téléphone
 * @param {Object} props - Propriétés du composant
 * @param {string} props.type - Type de vérification ('email' ou 'phone')
 * @param {string} props.identifier - Email ou numéro de téléphone à vérifier
 * @param {Function} props.onVerified - Callback appelé après vérification réussie
 * @param {boolean} props.autoSend - Envoyer automatiquement le code à l'affichage du composant
 */
const VerificationForm = ({ type, identifier, onVerified, autoSend = false }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  // Envoyer le code de vérification
  const sendVerificationCode = useCallback(async () => {
    setError('');
    setSuccess('');
    setSendingCode(true);
    
    try {
      const endpoint = type === 'email' 
        ? '/api/verifications/email/generate' 
        : '/api/verifications/phone/generate';
      
      const data = type === 'email' 
        ? { email: identifier } 
        : { phoneNumber: identifier };
      
      await axios.post(endpoint, data);
      
      setSuccess(`Code envoyé avec succès ${type === 'email' ? 'par email' : 'par SMS'}`);
      
      // Démarrer le compte à rebours pour le renvoi (3 minutes)
      setCountdown(180);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setSendingCode(false);
    }
  }, [type, identifier]);
  
  // Vérifier le code
  const verifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/verifications/verify', {
        identifier,
        code,
        type
      });
      
      setSuccess('Vérification réussie !');
      
      // Appeler le callback
      if (onVerified) {
        onVerified(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };
  
  // Envoyer le code automatiquement au chargement si demandé
  useEffect(() => {
    if (autoSend) {
      sendVerificationCode();
    }
  }, [autoSend, sendVerificationCode]);
  
  // Formatter le compte à rebours
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <Card className="verification-form">
      <Card.Body>
        <Card.Title>
          {type === 'email' ? 'Vérification par Email' : 'Vérification par SMS'}
        </Card.Title>
        
        <Card.Text>
          {type === 'email' 
            ? `Un code de vérification a été envoyé à ${identifier}`
            : `Un code à 6 chiffres a été envoyé au ${identifier}`}
        </Card.Text>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={verifyCode}>
          <Form.Group className="mb-3">
            <Form.Label>Code de vérification</Form.Label>
            <Form.Control 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Entrez le code" 
              required
            />
          </Form.Group>
          
          <div className="d-flex justify-content-between align-items-center">
            <Button 
              variant="outline-primary" 
              onClick={sendVerificationCode}
              disabled={sendingCode || countdown > 0}
            >
              {sendingCode ? (
                <><Spinner size="sm" animation="border" /> Envoi en cours...</>
              ) : countdown > 0 ? (
                `Renvoyer dans ${formatCountdown()}`
              ) : (
                'Renvoyer le code'
              )}
            </Button>
            
            <Button type="submit" variant="primary" disabled={loading || !code}>
              {loading ? (
                <><Spinner size="sm" animation="border" /> Vérification...</>
              ) : (
                'Vérifier'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default VerificationForm;
