// frontend/src/components/auth/PasswordReset.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API } from '../../services/authService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Composant pour la réinitialisation de mot de passe
 * @param {Object} props - Propriétés du composant
 * @param {string} props.token - Token de réinitialisation
 * @param {Function} props.onSuccess - Callback appelé après réinitialisation réussie
 */
const PasswordReset = ({ token, onSuccess }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Vérifier la validité du token
  useEffect(() => {
    const verifyToken = async () => {
      try {
        console.log("Vérification du token:", token);
        // Endpoint correct selon backend/routes/passwordRoutes.js
        const response = await API.get(`/password/reset/verify/${token}`);
        
        if (response.data && response.data.success) {
          setEmail(response.data.email);
          setVerifying(false);
        } else {
          // Message d'erreur du serveur ou erreur générique
          setError(response.data?.message || 'Ce lien de réinitialisation est invalide ou a expiré.');
          setVerifying(false);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du token:', err);
        setError('Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.');
        setVerifying(false);
      }
    };
    
    if (token) {
      verifyToken();
    } else {
      setError('Token de réinitialisation manquant.');
      setVerifying(false);
    }
  }, [token]);
  
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
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Tentative de réinitialisation avec token:", token);
      // Utilise le bon endpoint et les bons noms de paramètres selon le backend
      const response = await API.post(`/password/reset/${token}`, { 
        nouveau_mot_de_passe: password, 
        confirmation_mot_de_passe: confirmPassword 
      });
      
      if (response.data && response.data.success) {
        setSuccess('Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.');
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.data?.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
      }
    } catch (err) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', err);
      
      // Traitement spécifique selon le type d'erreur
      if (err.response && err.response.status === 400) {
        // Erreur de validation ou token expiré
        setError(err.response.data?.message || 'Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.');
      } else {
        setError('Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (verifying) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Vérification du lien de réinitialisation...</p>
        </Card.Body>
      </Card>
    );
  }
  
  if (error && !email) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Problème de réinitialisation</Card.Title>
          <Alert variant="danger">{error}</Alert>
          <p>Votre lien de réinitialisation semble être expiré ou invalide.</p>
          <div className="d-grid gap-2 mt-3">
            <Button 
              variant="primary" 
              onClick={() => navigate('/auth/forgot-password')}
            >
              Demander un nouveau lien
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/auth/login')}
            >
              Retour à la connexion
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className="password-reset">
      <Card.Body>
        <Card.Title>Réinitialiser votre mot de passe</Card.Title>
        
        {email && (
          <Card.Subtitle className="mb-3 text-muted">
            Pour le compte : {email}
          </Card.Subtitle>
        )}
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        {!success && (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nouveau mot de passe</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre nouveau mot de passe"
                  required
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ border: '1px solid #ced4da', borderLeft: 'none' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
              <Form.Text>
                Le mot de passe doit contenir au moins 8 caractères, une majuscule, 
                une minuscule, un chiffre et un caractère spécial.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirmer le mot de passe</Form.Label>
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
                <><Spinner size="sm" animation="border" /> Réinitialisation...</>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </Button>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default PasswordReset;
