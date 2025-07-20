// frontend/src/pages/dashboard/DashboardMedecin.jsx
import React from 'react';
import DashboardCard from '../../components/DashboardCard';
import { FaUserMd, FaCalendarCheck, FaShareAlt } from 'react-icons/fa';

const DashboardMedecin = () => {
  return (
    <div className="dashboard-grid">
      <DashboardCard
        icon={<FaCalendarCheck />}
        title="Mes Consultations"
        description="Gérer vos rendez-vous avec les patients"
        onClick={() => window.location.href = '/consultations"'}
      />
      <DashboardCard
        icon={<FaShareAlt />}
        title="Documents Partagés"
        description="Accéder aux documents que les patients vous ont partagés"
        onClick={() => window.location.href = '/partages'}
      />
      <DashboardCard
        icon={<FaUserMd />}
        title="Mes Patients"
        description="Voir la liste des patients traitants"
        onClick={() => window.location.href = '/patients'}
      />
    </div>
  );
};

export default DashboardMedecin;