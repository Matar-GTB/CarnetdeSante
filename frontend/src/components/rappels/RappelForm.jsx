// frontend/src/components/rappels/RappelForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios';

/**
 * Composant de formulaire pour créer ou modifier un rappel médical
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.rappel - Rappel existant à modifier (null pour création)
 * @param {Function} props.onSuccess - Callback appelé après création/modification réussie
 * @param {Function} props.onCancel - Callback appelé lorsque l'utilisateur annule
 */
const RappelForm = ({ rappel, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    type_rappel: '',
    details: {},
    recurrence: 'aucune',
    date_heure: '',
    canaux: { email: true, sms: false },
    sous_type: 'dose'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Remplir le formulaire si un rappel existant est fourni
  useEffect(() => {
    if (rappel) {
      setFormData({
        type_rappel: rappel.type_rappel || '',
        details: rappel.details || {},
        recurrence: rappel.recurrence || 'aucune',
        date_heure: formatDateForInput(rappel.date_heure) || '',
        canaux: rappel.canaux || { email: true, sms: false },
        sous_type: rappel.sous_type || 'dose',
        medicament_id: rappel.medicament_id || null
      });
    }
  }, [rappel]);
  
  // Formater la date pour l'input datetime-local
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format "YYYY-MM-DDTHH:MM"
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      details: { ...formData.details, [name]: value }
    });
  };
  
  const handleCanauxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      canaux: { ...formData.canaux, [name]: checked }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      let response;
      
      if (rappel) {
        // Mise à jour d'un rappel existant
        response = await axios.put(`/api/rappels/${rappel.id}`, formData);
      } else {
        // Création d'un nouveau rappel
        response = await axios.post('/api/rappels', formData);
      }
      
      setSuccess(`Rappel ${rappel ? 'modifié' : 'créé'} avec succès !`);
      
      if (onSuccess) {
        onSuccess(response.data.rappel);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Une erreur s'est produite lors de l'${rappel ? 'modification' : 'ajout'} du rappel`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="rappel-form">
      <Card.Body>
        <Card.Title>{rappel ? 'Modifier le rappel' : 'Ajouter un rappel'}</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Type de rappel</Form.Label>
            <Form.Select
              name="type_rappel"
              value={formData.type_rappel}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="medicament">Médicament</option>
              <option value="rendez-vous">Rendez-vous médical</option>
              <option value="vaccin">Vaccination</option>
              <option value="autre">Autre</option>
            </Form.Select>
          </Form.Group>
          
          {formData.type_rappel === 'medicament' && (
            <Form.Group className="mb-3">
              <Form.Label>Type de prise</Form.Label>
              <Form.Select
                name="sous_type"
                value={formData.sous_type}
                onChange={handleInputChange}
              >
                <option value="dose">Dose à prendre</option>
                <option value="renouvellement">Renouvellement</option>
              </Form.Select>
            </Form.Group>
          )}
          
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Titre</Form.Label>
                <Form.Control
                  type="text"
                  name="titre"
                  value={formData.details.titre || ''}
                  onChange={handleDetailsChange}
                  placeholder="Titre du rappel"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col>
              <Form.Group>
                <Form.Label>Date et heure</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="date_heure"
                  value={formData.date_heure}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.details.description || ''}
              onChange={handleDetailsChange}
              placeholder="Détails du rappel"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Récurrence</Form.Label>
            <Form.Select
              name="recurrence"
              value={formData.recurrence}
              onChange={handleInputChange}
            >
              <option value="aucune">Aucune (rappel unique)</option>
              <option value="quotidien">Quotidien</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuel">Mensuel</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Canaux de notification</Form.Label>
            <div>
              <Form.Check
                type="checkbox"
                id="canal-email"
                label="Email"
                name="email"
                checked={formData.canaux.email}
                onChange={handleCanauxChange}
                inline
              />
              <Form.Check
                type="checkbox"
                id="canal-sms"
                label="SMS"
                name="sms"
                checked={formData.canaux.sms}
                onChange={handleCanauxChange}
                inline
              />
            </div>
          </Form.Group>
          
          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={onCancel} disabled={loading}>
              Annuler
            </Button>
            
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <><Spinner size="sm" animation="border" /> Enregistrement...</>
              ) : (
                rappel ? 'Modifier' : 'Créer'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RappelForm;
