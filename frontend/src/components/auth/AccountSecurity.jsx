// frontend/src/components/auth/AccountSecurity.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import VerificationForm from './VerificationForm';
import PasswordChange from './PasswordChange';

/**
 * Composant pour la gestion de la sécurité du compte
 */
const AccountSecurity = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmailVerif, setShowEmailVerif] = useState(false);
  const [showPhoneVerif, setShowPhoneVerif] = useState(false);
  
  // Charger les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/users/me');
        setUser(response.data.user);
      } catch (err) {
        setError('Erreur lors du chargement des informations de l\'utilisateur');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
  }, []);
  
  // Gérer la vérification réussie
  const handleVerificationSuccess = (data) => {
    // Mettre à jour les données utilisateur
    if (data.field === 'email') {
      setUser({ ...user, email_verified: true });
      setShowEmailVerif(false);
    } else if (data.field === 'telephone') {
      setUser({ ...user, telephone_verified: true });
      setShowPhoneVerif(false);
    }
  };
  
  if (loading) {
    return (
      <Container>
        <Card>
          <Card.Body>
            <p>Chargement des informations de sécurité...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container>
      <h2 className="mb-4">Sécurité du Compte</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs defaultActiveKey="verification" className="mb-4">
        <Tab eventKey="verification" title="Vérification">
          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Email</Card.Title>
                  
                  <div className="mb-3">
                    <strong>Adresse email :</strong> {user?.email}
                    <br />
                    <strong>Statut :</strong>{' '}
                    {user?.email_verified ? (
                      <span className="text-success">Vérifié ✓</span>
                    ) : (
                      <span className="text-danger">Non vérifié ✗</span>
                    )}
                  </div>
                  
                  {!user?.email_verified && (
                    <Button 
                      variant="primary" 
                      onClick={() => setShowEmailVerif(true)}
                    >
                      Vérifier mon email
                    </Button>
                  )}
                  
                  {showEmailVerif && (
                    <div className="mt-3">
                      <VerificationForm 
                        type="email"
                        identifier={user.email}
                        onVerified={handleVerificationSuccess}
                        autoSend={true}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Téléphone</Card.Title>
                  
                  <div className="mb-3">
                    <strong>Numéro de téléphone :</strong> {user?.telephone || 'Non renseigné'}
                    <br />
                    {user?.telephone && (
                      <>
                        <strong>Statut :</strong>{' '}
                        {user?.telephone_verified ? (
                          <span className="text-success">Vérifié ✓</span>
                        ) : (
                          <span className="text-danger">Non vérifié ✗</span>
                        )}
                      </>
                    )}
                  </div>
                  
                  {user?.telephone && !user?.telephone_verified && (
                    <Button 
                      variant="primary" 
                      onClick={() => setShowPhoneVerif(true)}
                    >
                      Vérifier mon numéro
                    </Button>
                  )}
                  
                  {showPhoneVerif && (
                    <div className="mt-3">
                      <VerificationForm 
                        type="phone"
                        identifier={user.telephone}
                        onVerified={handleVerificationSuccess}
                        autoSend={true}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="password" title="Mot de passe">
          <Row>
            <Col md={8} className="mx-auto">
              <PasswordChange 
                onSuccess={() => {
                  // Optionnel : afficher un message de succès global
                }}
              />
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="preferences" title="Préférences de notification">
          <Card>
            <Card.Body>
              <NotificationPreferences user={user} />
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

/**
 * Sous-composant pour les préférences de notification
 */
const NotificationPreferences = ({ user }) => {
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Charger les préférences actuelles
  useEffect(() => {
    if (user?.prefs_notification) {
      try {
        const userPrefs = JSON.parse(user.prefs_notification);
        setPrefs({
          email: userPrefs.email ?? true,
          sms: userPrefs.sms ?? false
        });
      } catch (err) {
        console.error('Erreur lors du parsing des préférences:', err);
      }
    }
  }, [user]);
  
  const handlePrefChange = (e) => {
    const { name, checked } = e.target;
    setPrefs({ ...prefs, [name]: checked });
  };
  
  const savePreferences = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Utilisation de l'endpoint correct pour les préférences de notification
      await axios.put('/api/notifications/settings', { preferences: prefs });
      setSuccess('Préférences de notification mises à jour avec succès');
    } catch (err) {
      setError('Erreur lors de la mise à jour des préférences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Card.Title>Préférences de notification</Card.Title>
      
      <p>Choisissez comment vous souhaitez recevoir vos rappels médicaux :</p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <div className="mb-3">
        <div className="form-check mb-2">
          <input
            type="checkbox"
            id="pref-email"
            name="email"
            checked={prefs.email}
            onChange={handlePrefChange}
            className="form-check-input"
          />
          <label htmlFor="pref-email" className="form-check-label">
            Notifications par email
          </label>
        </div>
        
        <div className="form-check mb-3">
          <input
            type="checkbox"
            id="pref-sms"
            name="sms"
            checked={prefs.sms}
            onChange={handlePrefChange}
            className="form-check-input"
          />
          <label htmlFor="pref-sms" className="form-check-label">
            Notifications par SMS
          </label>
          {prefs.sms && !user?.telephone_verified && (
            <div className="text-danger small mt-1">
              Vous devez vérifier votre numéro de téléphone pour recevoir des SMS.
            </div>
          )}
        </div>
      </div>
      
      <Button
        variant="primary"
        onClick={savePreferences}
        disabled={loading}
      >
        {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
      </Button>
    </>
  );
};

export default AccountSecurity;
