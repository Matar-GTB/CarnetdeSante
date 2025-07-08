// frontend/src/pages/dashboard/DashboardPatient.jsx
import React from 'react';
import DashboardCard from '../../components/DashboardCard';
import { FaFileMedical, FaSyringe, FaCalendarAlt } from 'react-icons/fa';

const DashboardPatient = () => {
  return (
    <div className="dashboard-grid">
      <DashboardCard
        icon={<FaFileMedical />}
        title="Mes Documents"
        description="Consulter vos ordonnances, examens et comptes-rendus"
        onClick={() => window.location.href = '/documents'}
      />
      <DashboardCard
        icon={<FaSyringe />}
        title="Mes Vaccins"
        description="Voir et ajouter vos vaccinations"
        onClick={() => window.location.href = '/vaccinations'}
      />
      <DashboardCard
        icon={<FaCalendarAlt />}
        title="Mes Rendez-vous"
        description="Planifier et suivre vos consultations"
        onClick={() => window.location.href = '/rendezvous'}
      />
    </div>
  );
};

export default DashboardPatient;