// src/components/Messaging/ConversationList.jsx
import React, { useState } from 'react';
import { IoSearch, IoClose, IoMailOpen } from 'react-icons/io5';
import { MdPhoto, MdVideocam, MdAttachFile } from 'react-icons/md';
import { FaUserMd, FaUser } from 'react-icons/fa';
import './ConversationList.css';
import NewConversationModal from './NewConversationModal';

const ConversationList = ({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  onlineUsers, 
  currentUser,
  onStartNewConversation 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  // Filtrer les conversations par terme de recherche
  const filteredConversations = conversations.filter(conversation => {
    // Trouver l'autre participant (patient ou médecin)  
    const otherParticipant = conversation.Participants?.find(cp => cp.utilisateur_id !== currentUser.id)?.Patient || 
                             conversation.Participants?.find(cp => cp.utilisateur_id !== currentUser.id)?.Medecin ||
                             conversation.Participants?.find(cp => cp.utilisateur_id !== currentUser.id)?.Utilisateur;
    if (!otherParticipant) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      otherParticipant.prenom?.toLowerCase().includes(searchLower) ||
      otherParticipant.nom?.toLowerCase().includes(searchLower) ||
      otherParticipant.email?.toLowerCase().includes(searchLower)
    );
  });

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Aujourd'hui - afficher l'heure
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  const getParticipantInfo = (conversation) => {
    const otherParticipant = conversation.Participants?.find(cp => cp.utilisateur_id !== currentUser.id)?.Patient || 
                             conversation.Participants?.find(cp => cp.utilisateur_id !== currentUser.id)?.Medecin ||
                             conversation.Participants?.find(cp => cp.utilisateur_id !== currentUser.id)?.Utilisateur;
    if (!otherParticipant) return { name: 'Utilisateur inconnu', role: '', isOnline: false };
    
    const name = `${otherParticipant.prenom || ''} ${otherParticipant.nom || ''}`.trim();
    const role = otherParticipant.role === 'medecin' ? 
      <><FaUserMd /> Médecin</> : 
      <><FaUser /> Patient</>;
    const isOnline = onlineUsers.has(otherParticipant.id);
    
    return { name, role, isOnline, participant: otherParticipant };
  };

  const handleStartNewConversation = (conversation) => {
    if (onStartNewConversation) {
      onStartNewConversation(conversation);
    }
    setShowNewConversationModal(false);
  };

  return (
    <div className="conversation-list">
      {/* En-tête avec bouton nouvelle conversation */}
      <div className="conversation-header">
        <h3>Messages</h3>
        <button 
          className="new-conversation-btn"
          onClick={() => setShowNewConversationModal(true)}
          title="Nouvelle conversation"
        >
          <IoMailOpen /> Nouveau
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="conversation-search">
        <div className="search-input-container">
          <span className="search-icon"><IoSearch /></span>
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              <IoClose />
            </button>
          )}
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="conversations-scroll">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            {conversations.length === 0 ? (
              <div className="empty-state">
                <h4>Aucune conversation</h4>
                <p>Vos conversations avec votre {currentUser.role === 'patient' ? 'médecin traitant' : 'patients'} apparaîtront ici</p>
              </div>
            ) : (
              <div className="no-results">
                <h4>Aucun résultat</h4>
                <p>Aucune conversation trouvée pour "{searchTerm}"</p>
              </div>
            )}
          </div>
        ) : (
          filteredConversations.map(conversation => {
            const { name, role, isOnline, participant } = getParticipantInfo(conversation);
            const isActive = activeConversation?.id === conversation.id;
            const lastMessage = conversation.DernierMessage;
            const unreadCount = conversation.messages_non_lus || 0;

            return (
              <div
                key={conversation.id}
                className={`conversation-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <img 
                    src={participant?.photo_profil || '/images/avatar.png'} 
                    alt={name}
                    className="avatar-image"
                  />
                  {isOnline && <div className="online-indicator"></div>}
                </div>

                <div className="conversation-content">
                  <div className="conversation-header">
                    <h4 className="participant-name">{name || 'Utilisateur'}</h4>
                    {lastMessage && (
                      <span className="message-time">
                        {formatTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="conversation-preview">
                    {lastMessage ? (
                      <div className="last-message">
                        {lastMessage.type_media ? (
                          <span className="media-indicator">
                            {lastMessage.type_media === 'image' && <><MdPhoto /> Photo</>}
                            {lastMessage.type_media === 'video' && <><MdVideocam /> Vidéo</>}
                            {lastMessage.type_media === 'audio' && (
                              <div className="audio-preview">
                                <div className="audio-play-btn">▶</div>
                                <div className="audio-waveform">
                                  <div className="waveform-bars">
                                    <span></span><span></span><span></span><span></span><span></span>
                                    <span></span><span></span><span></span><span></span><span></span>
                                    <span></span><span></span><span></span><span></span><span></span>
                                  </div>
                                </div>
                                <span className="audio-duration">0:04</span>
                              </div>
                            )}
                            {lastMessage.type_media === 'file' && <><MdAttachFile /> Fichier</>}
                          </span>
                        ) : (
                          <span className="message-text">
                            {truncateMessage(lastMessage.contenu)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="no-messages">Aucun message</span>
                    )}

                    {unreadCount > 0 && (
                      <div className="unread-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal nouvelle conversation */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onStartConversation={handleStartNewConversation}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ConversationList;
