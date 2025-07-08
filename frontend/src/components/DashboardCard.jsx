// frontend/src/components/DashboardCard.jsx
import React from 'react';
import './Dashboard.css';

const DashboardCard = ({ icon, title, description, onClick }) => {
  return (
    <div className="dashboard-card" onClick={onClick}>
      <div className="dashboard-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default DashboardCard;