// frontend/src/components/auth/PasswordChange.jsx
import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Composant pour le changement de mot de passe (utilisateur connecté)
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onSuccess - Callback appelé après changement réussi
 */
const PasswordChange = ({ onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Vérifier la force du mot de passe
  const validatePassword = (pass) => {
    // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Vérifications basiques
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }
    
    if (currentPassword === newPassword) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien.');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post('/api/password/change', { 
        currentPassword, 
        newPassword 
      });
      
      setSuccess('Votre mot de passe a été changé avec succès.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur s\'est produite lors du changement de mot de passe.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="password-change">
      <Card.Body>
        <Card.Title>Changer votre mot de passe</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Mot de passe actuel</Form.Label>
            <InputGroup>
              <Form.Control
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
                required
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{ border: '1px solid #ced4da', borderLeft: 'none' }}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Nouveau mot de passe</Form.Label>
            <InputGroup>
              <Form.Control
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                required
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ border: '1px solid #ced4da', borderLeft: 'none' }}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
            <Form.Text>
              Le mot de passe doit contenir au moins 8 caractères, une majuscule, 
              une minuscule, un chiffre et un caractère spécial.
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                required
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ border: '1px solid #ced4da', borderLeft: 'none' }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
          
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <><Spinner size="sm" animation="border" /> Mise à jour...</>
            ) : (
              'Changer le mot de passe'
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PasswordChange;
