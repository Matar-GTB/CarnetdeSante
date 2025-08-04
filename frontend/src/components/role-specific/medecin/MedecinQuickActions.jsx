import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import './MedecinQuickActions.css';

const MedecinQuickActions = ({ className = '' }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'patients',
      title: 'Mes Patients',
      description: 'Gérer ma patientèle',
      icon: '👥',
      color: 'blue',
      action: () => navigate('/patients')
    },
    {
      id: 'appointments',
      title: 'Planning',
      description: 'Mes rendez-vous',
      icon: '📅',
      color: 'green',
      action: () => navigate('/appointments')
    },
    {
      id: 'disponibilites',
      title: 'Disponibilités',
      description: 'Gérer mes créneaux',
      icon: '⏰',
      color: 'purple',
      action: () => navigate('/disponibilites')
    },
    {
      id: 'prescriptions',
      title: 'Prescriptions',
      description: 'Rédiger ordonnances',
      icon: '📝',
      color: 'orange',
      action: () => navigate('/prescriptions')
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Gérer les documents',
      icon: '📄',
      color: 'teal',
      action: () => navigate('/documents')
    },
    {
      id: 'requests',
      title: 'Demandes reçues',
      description: 'Nouveaux patients traitants',
      icon: '👋',
      color: 'amber',
      action: () => navigate('/requests/received')
    }
  ];

  return (
    <div className={`medecin-quick-actions ${className}`}>
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

export default MedecinQuickActions;
