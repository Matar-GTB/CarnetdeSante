// frontend/src/components/auth/PasswordResetRequest.jsx
import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { API } from '../../services/authService';

/**
 * Composant pour la demande de réinitialisation de mot de passe
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onRequestSent - Callback appelé après l'envoi de la demande
 */
const PasswordResetRequest = ({ onRequestSent }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Utilise le bon endpoint selon le backend/routes/passwordRoutes.js
      await API.post('/password/forgot', { email });
      
      setSuccess('Si votre email est enregistré, vous recevrez un lien de réinitialisation.');
      
      if (onRequestSent) {
        onRequestSent(email);
      }
    } catch (err) {
      // Pour des raisons de sécurité, on affiche toujours le même message
      setSuccess('Si votre email est enregistré, vous recevrez un lien de réinitialisation.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="password-reset-request">
      <Card.Body>
        <Card.Title>Réinitialisation de mot de passe</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre adresse email"
              required
            />
            <Form.Text className="text-muted">
              Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </Form.Text>
          </Form.Group>
          
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <><Spinner size="sm" animation="border" /> Envoi en cours...</>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PasswordResetRequest;
