// src/components/Messaging/UserOnlineStatus.jsx
import React from 'react';
import { MdSignalWifiStatusbar4Bar } from 'react-icons/md';
import './UserOnlineStatus.css';

const UserOnlineStatus = ({ onlineUsers, currentUser }) => {
  const onlineCount = onlineUsers.size;
  
  return (
    <div className="user-online-status">
      <div className="status-indicator">
        <span className="online-dot"></span>
        <span className="status-text">
          {onlineCount === 0 ? (
            'Aucun utilisateur en ligne'
          ) : onlineCount === 1 ? (
            '1 utilisateur en ligne'
          ) : (
            `${onlineCount} utilisateurs en ligne`
          )}
        </span>
      </div>
      
      <div className="connection-quality">
        <span className="connection-icon"><MdSignalWifiStatusbar4Bar /></span>
        <span className="connection-text">Connecté</span>
      </div>
    </div>
  );
};

export default UserOnlineStatus;
