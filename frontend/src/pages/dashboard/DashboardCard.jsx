// src/pages/dashboard/DashboardCard.jsx
import React from 'react';
import './Dashboard.css';

const DashboardCard = ({ 
  icon, 
  title, 
  description, 
  value, 
  color = 'blue', 
  highlight = false, 
  onClick 
}) => {
  return (
    <div 
      className={`dashboard-card ${color} ${highlight ? 'highlight' : ''}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="dashboard-icon">{icon}</div>
      <h3>{title}</h3>
      {value !== undefined && <div className="dashboard-value">{value}</div>}
      {description && <p>{description}</p>}
    </div>
  );
};

export default DashboardCard;