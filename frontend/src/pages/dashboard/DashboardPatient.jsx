// src/pages/dashboard/DashboardPatient.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import {
  FaFileMedical,
  FaSyringe,
  FaCalendarAlt,
  FaUserMd
} from 'react-icons/fa';

const DashboardPatient = () => {
  const navigate = useNavigate();

  const cards = [
    {
      icon: <FaFileMedical />,
      title: 'Mes Documents',
      description: 'Consulter vos ordonnances, examens et comptes-rendus',
      path: '/documents'
    },
    {
      icon: <FaSyringe />,
      title: 'Mes Vaccins',
      description: 'Voir et ajouter vos vaccinations',
      path: '/vaccinations'
    },
    {
      icon: <FaCalendarAlt />,
      title: 'Mes Rendez-vous',
      description: 'Planifier et suivre vos consultations',
      path: '/rendezvous'
    },
    {
      icon: <FaUserMd />,
      title: 'Mon médecin traitant',
      description: 'Demander ou consulter votre médecin traitant',
      path: '/traitant/request'
    }
  ];

  return (
    <div className="dashboard-grid">
      {cards.map(({ icon, title, description, path }) => (
        <DashboardCard
          key={title}
          icon={icon}
          title={title}
          description={description}
          onClick={() => navigate(path)}
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate(path)}
        />
      ))}
    </div>
  );
};

export default DashboardPatient;
