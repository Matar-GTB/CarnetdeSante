// frontend/src/components/rappels/RappelList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import RappelForm from './RappelForm';

/**
 * Composant d'affichage et de gestion des rappels
 */
const RappelList = () => {
  const [rappels, setRappels] = useState([]);
  const [filteredRappels, setFilteredRappels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRappel, setEditingRappel] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState({
    type: '',
    status: 'upcoming',
    search: ''
  });
  
  // Charger les rappels au démarrage
  useEffect(() => {
    fetchRappels();
  }, []);
  
  // Récupérer les rappels depuis l'API
  const fetchRappels = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('/api/rappels');
      setRappels(response.data.rappels || response.data);
    } catch (err) {
      setError('Erreur lors du chargement des rappels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Appliquer les filtres à la liste des rappels
  const applyFilters = useCallback(() => {
    let filtered = [...rappels];
    
    // Filtrer par type
    if (filter.type) {
      filtered = filtered.filter(rappel => rappel.type_rappel === filter.type);
    }
    
    // Filtrer par statut
    if (filter.status === 'upcoming') {
      filtered = filtered.filter(rappel => !rappel.envoye);
    } else if (filter.status === 'sent') {
      filtered = filtered.filter(rappel => rappel.envoye);
    }
    
    // Filtrer par recherche
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(rappel => {
        const titre = rappel.details?.titre?.toLowerCase() || '';
        const description = rappel.details?.description?.toLowerCase() || '';
        return titre.includes(searchTerm) || description.includes(searchTerm);
      });
    }
    
    // Trier par date (prochains rappels en premier)
    filtered.sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure));
    
    setFilteredRappels(filtered);
  }, [rappels, filter]);
  
  // Filtrer les rappels lorsque la liste ou les filtres changent
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);  // Gérer les changements de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };
  
  // Supprimer un rappel
  const deleteRappel = async (id) => {
    try {
      await axios.delete(`/api/rappels/${id}`);
      fetchRappels();
      setShowDeleteModal(false);
    } catch (err) {
      setError('Erreur lors de la suppression du rappel');
      console.error(err);
    }
  };
  
  // Gérer la soumission du formulaire
  const handleFormSuccess = () => {
    fetchRappels();
    setShowForm(false);
    setEditingRappel(null);
  };
  
  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Détermine la couleur du badge selon le type de rappel
  const getBadgeVariant = (type) => {
    switch (type) {
      case 'medicament':
        return 'primary';
      case 'rendez-vous':
        return 'success';
      case 'vaccin':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title>Mes rappels médicaux</Card.Title>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              + Ajouter un rappel
            </Button>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <div className="mb-3">
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                placeholder="Rechercher..."
                name="search"
                value={filter.search}
                onChange={handleFilterChange}
              />
            </Form.Group>
            
            <div className="d-flex gap-3">
              <Form.Select
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
                className="w-auto"
              >
                <option value="">Tous les types</option>
                <option value="medicament">Médicaments</option>
                <option value="rendez-vous">Rendez-vous</option>
                <option value="vaccin">Vaccins</option>
                <option value="autre">Autres</option>
              </Form.Select>
              
              <Form.Select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="w-auto"
              >
                <option value="all">Tous</option>
                <option value="upcoming">À venir</option>
                <option value="sent">Envoyés</option>
              </Form.Select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p>Chargement des rappels...</p>
            </div>
          ) : filteredRappels.length === 0 ? (
            <Alert variant="info">
              Aucun rappel trouvé. Cliquez sur "Ajouter un rappel" pour en créer un nouveau.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Récurrence</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRappels.map(rappel => (
                  <tr key={rappel.id}>
                    <td>
                      <Badge bg={getBadgeVariant(rappel.type_rappel)}>
                        {rappel.type_rappel.charAt(0).toUpperCase() + rappel.type_rappel.slice(1)}
                      </Badge>
                    </td>
                    <td>{rappel.details?.titre}</td>
                    <td>{formatDate(rappel.date_heure)}</td>
                    <td>{rappel.recurrence}</td>
                    <td>
                      {rappel.envoye ? (
                        <Badge bg="success">Envoyé</Badge>
                      ) : (
                        <Badge bg="warning">À venir</Badge>
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setEditingRappel(rappel);
                          setShowForm(true);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => {
                          setDeleteId(rappel.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de formulaire */}
      <Modal
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setEditingRappel(null);
        }}
        size="lg"
        centered
      >
        <Modal.Body>
          <RappelForm
            rappel={editingRappel}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingRappel(null);
            }}
          />
        </Modal.Body>
      </Modal>
      
      {/* Modal de confirmation de suppression */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer ce rappel ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={() => deleteRappel(deleteId)}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RappelList;
