import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import './PatientQuickActions.css';

const PatientQuickActions = ({ className = '' }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'new-appointment',
      title: 'Prendre RDV',
      description: 'Réserver une consultation',
      icon: '📅',
      color: 'blue',
      action: () => navigate('/appointments')
    },
    {
      id: 'medications',
      title: 'Mes Médicaments',
      description: 'Gérer mon traitement',
      icon: '💊',
      color: 'green',
      action: () => navigate('/medications')
    },
    {
      id: 'documents',
      title: 'Mes Documents',
      description: 'Ordonnances et résultats',
      icon: '📄',
      color: 'purple',
      action: () => navigate('/documents')
    },
    {
      id: 'vaccinations',
      title: 'Vaccinations',
      description: 'Carnet de vaccination',
      icon: '💉',
      color: 'orange',
      action: () => navigate('/vaccinations')
    },
    {
      id: 'sharing',
      title: 'Partage',
      description: 'Partager mes données',
      icon: '🔗',
      color: 'teal',
      action: () => navigate('/partage')
    },
    {
      id: 'medecin-traitant',
      title: 'Médecins traitants',
      description: 'Gérer mes médecins traitants',
      icon: '👨‍⚕️',
      color: 'indigo',
      action: () => navigate('/traitants')
    },
    {
      id: 'emergency',
      title: 'Urgence',
      description: 'Contacts d\'urgence',
      icon: '🚨',
      color: 'red',
      action: () => navigate('/emergency')
    }
  ];

  return (
    <div className={`patient-quick-actions ${className}`}>
      <h3>⚡ Actions rapides</h3>
      <div className="actions-grid">
        {quickActions.map(action => (
          <button
            key={action.id}
            className={`quick-action-btn ${action.color}`}
            onClick={action.action}
            title={action.description}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-content">
              <div className="action-title">{action.title}</div>
              <div className="action-description">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PatientQuickActions;
