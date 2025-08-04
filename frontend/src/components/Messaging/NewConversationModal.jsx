// src/components/Messaging/NewConversationModal.jsx
import React, { useState, useEffect } from 'react';
import { FaUserMd, FaUser } from 'react-icons/fa';
import { IoChatbubble, IoClose } from 'react-icons/io5';
import messageService from '../../services/messageService';
import './NewConversationModal.css';

const NewConversationModal = ({ isOpen, onClose, onStartConversation, currentUser }) => {
  const [availableContacts, setAvailableContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableContacts();
    }
  }, [isOpen]);

  const fetchAvailableContacts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await messageService.getAvailableContacts();
      
      if (result.success) {
        setAvailableContacts(result.data);
      } else {
        setError(result.error || 'Erreur lors de la récupération des contacts');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des contacts:', err);
      setError('Impossible de récupérer les contacts disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (contact) => {
    try {
      const result = await messageService.getOrCreateConversation(contact.id);
      
      if (result.success) {
        onStartConversation(result.data);
        onClose();
      } else {
        setError(result.error || 'Erreur lors de la création de la conversation');
      }
    } catch (err) {
      console.error('Erreur lors de la création de la conversation:', err);
      setError('Impossible de créer la conversation');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nouvelle conversation</h3>
          <button className="close-button" onClick={onClose}><IoClose /></button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement des contacts...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p className="error-message">{error}</p>
              <button onClick={fetchAvailableContacts} className="retry-button">
                Réessayer
              </button>
            </div>
          ) : availableContacts.length === 0 ? (
            <div className="empty-state">
              <h4>Aucun contact disponible</h4>
              <p>
                {currentUser.role === 'patient' 
                  ? 'Vous devez avoir un médecin traitant assigné pour commencer une conversation.'
                  : 'Vous n\'avez pas encore de patients assignés.'
                }
              </p>
            </div>
          ) : (
            <div className="contacts-list">
              <p className="contacts-subtitle">
                Sélectionnez un contact pour commencer une conversation :
              </p>
              {availableContacts.map(contact => (
                <div
                  key={contact.id}
                  className="contact-item"
                  onClick={() => handleStartConversation(contact)}
                >
                  <div className="contact-avatar">
                    <img 
                      src={contact.photo_profil || '/images/avatar.png'} 
                      alt={`${contact.prenom} ${contact.nom}`}
                      className="avatar-image"
                    />
                  </div>
                  
                  <div className="contact-info">
                    <h4 className="contact-name">
                      {contact.prenom} {contact.nom}
                    </h4>
                    <p className="contact-role">
                      {contact.role === 'medecin' ? <><FaUserMd /> Médecin</> : <><FaUser /> Patient</>}
                    </p>
                    <p className="contact-email">{contact.email}</p>
                  </div>
                  
                  <div className="contact-action">
                    <span className="start-chat-icon"><IoChatbubble /></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
