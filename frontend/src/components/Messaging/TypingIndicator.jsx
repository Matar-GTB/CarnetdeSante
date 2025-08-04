// src/components/Messaging/TypingIndicator.jsx
import React from 'react';
import './TypingIndicator.css';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  const formatUserNames = () => {
    if (users.length === 1) {
      return `${users[0].prenom || 'Utilisateur'} est en train d'écrire`;
    } else if (users.length === 2) {
      const names = users.map(u => u.prenom || 'Utilisateur').join(' et ');
      return `${names} sont en train d'écrire`;
    } else {
      return `${users.length} personnes sont en train d'écrire`;
    }
  };

  return (
    <div className="typing-indicator">
      <div className="typing-avatar">
        <img 
          src={users[0].photo_profil || '/images/avatar.png'} 
          alt=""
          className="avatar-image"
        />
      </div>
      
      <div className="typing-bubble">
        <div className="typing-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
      
      <div className="typing-text">
        {formatUserNames()}...
      </div>
    </div>
  );
};

export default TypingIndicator;
