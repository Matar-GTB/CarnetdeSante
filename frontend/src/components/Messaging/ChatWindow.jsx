// src/components/Messaging/ChatWindow.jsx
import React, { useState, useRef, useEffect } from 'react';
import { IoChevronDown, IoClose } from 'react-icons/io5';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import './ChatWindow.css';

const ChatWindow = ({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onAddReaction,
  onRemoveReaction,
  typingUsers,
  onlineUsers
}) => {
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gérer l'affichage du bouton de scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessageWrapper = (contenu, fileList = null) => {
    onSendMessage(contenu, fileList, replyToMessage);
    setReplyToMessage(null); // Effacer la réponse après envoi
  };

  const handleReplyToMessage = (message) => {
    setReplyToMessage(message);
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  // Obtenir les informations de l'autre participant
  const getOtherParticipant = () => {
    if (!conversation) return null;
    
    // Vérifier d'abord dans les associations Patient/Medecin directes
    if (conversation.Patient && conversation.Medecin) {
      if (currentUser.role === 'patient') {
        return conversation.Medecin;
      } else {
        return conversation.Patient;
      }
    }
    
    // Fallback: chercher dans Participants
    const otherParticipant = conversation.Participants?.find(cp => cp.utilisateur_id !== currentUser.id)?.Patient || 
                             conversation.Participants?.find(cp => cp.utilisateur_id !== currentUser.id)?.Medecin ||
                             conversation.Participants?.find(cp => cp.utilisateur_id !== currentUser.id)?.Utilisateur;
    return otherParticipant || null;
  };

  const otherParticipant = getOtherParticipant();
  const isOtherOnline = otherParticipant ? onlineUsers.has(otherParticipant.id) : false;

  // Grouper les messages par date
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;
    
    messages.forEach(message => {
      const messageDate = new Date(message.createdAt).toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          messages: [message]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });
    
    return groups;
  };

  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (dateString === today) {
      return "Aujourd'hui";
    } else if (dateString === yesterday) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const messageGroups = groupMessagesByDate(messages);
  const typingUsersArray = Array.from(typingUsers.values()).filter(user => user.id !== currentUser.id);

  return (
    <div className="chat-window">
      {/* En-tête de la conversation */}
      <div className="chat-header">
        <div className="chat-participant-info">
          <div className="participant-avatar">
            <img 
              src={otherParticipant?.photo_profil || '/images/avatar.png'} 
              alt={`${otherParticipant?.prenom || ''} ${otherParticipant?.nom || ''}`}
              className="avatar-image"
            />
            {isOtherOnline && <div className="online-indicator"></div>}
          </div>
          
          <div className="participant-details">
            <h3 className="participant-name">
              {otherParticipant ? 
                `${otherParticipant.prenom || ''} ${otherParticipant.nom || ''}`.trim() 
                : 'Utilisateur inconnu'
              }
            </h3>
            <div className="participant-status">
              {otherParticipant && (
                <span className="participant-role">
                  {otherParticipant.role === 'medecin' ? '👨‍⚕️ Médecin traitant' : '👤 Patient'}
                </span>
              )}
              <span className="connection-status">
                {isOtherOnline ? (
                  <span className="status-online">🟢 En ligne</span>
                ) : (
                  <span className="status-offline">⚫ Hors ligne</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container" ref={messagesContainerRef}>
        <div className="messages-content">
          {messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="message-group">
              <div className="date-separator">
                <span className="date-text">{formatDateSeparator(group.date)}</span>
              </div>
              
              {group.messages.map((message, messageIndex) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.expediteur_id === currentUser.id}
                  currentUser={currentUser}
                  onReply={handleReplyToMessage}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                  showAvatar={
                    messageIndex === 0 ||
                    group.messages[messageIndex - 1].expediteur_id !== message.expediteur_id
                  }
                />
              ))}
            </div>
          ))}

          {/* Indicateur de frappe */}
          {typingUsersArray.length > 0 && (
            <TypingIndicator users={typingUsersArray} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bouton de scroll vers le bas */}
        {showScrollButton && (
          <button 
            className="scroll-to-bottom"
            onClick={scrollToBottom}
            title="Aller au bas"
          >
            <IoChevronDown />
          </button>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="chat-input-container">
        {replyToMessage && (
          <div className="reply-preview">
            <div className="reply-content">
              <span className="reply-label">
                Répondre à {replyToMessage.utilisateur_id === currentUser.id ? 'vous' : otherParticipant?.prenom}
              </span>
              <div className="reply-message">
                {replyToMessage.type_media ? (
                  <span className="media-reply">
                    {replyToMessage.type_media === 'image' && '📷 Photo'}
                    {replyToMessage.type_media === 'video' && '🎥 Vidéo'}
                    {replyToMessage.type_media === 'audio' && '🎵 Audio'}
                    {replyToMessage.type_media === 'file' && '📎 Fichier'}
                  </span>
                ) : (
                  <span className="text-reply">
                    {replyToMessage.contenu && replyToMessage.contenu.length > 50 
                      ? replyToMessage.contenu.substring(0, 50) + '...'
                      : replyToMessage.contenu || 'Message sans contenu'
                    }
                  </span>
                )}
              </div>
            </div>
            <button className="cancel-reply" onClick={cancelReply}>
              <IoClose />
            </button>
          </div>
        )}

        {(() => {
          const peutEcrire = conversation?.Participants?.find(p => p.utilisateur_id === currentUser.id)?.peut_ecrire;
          
          return (
            <MessageInput
              onSendMessage={handleSendMessageWrapper}
              onTypingStart={onTypingStart}
              onTypingStop={onTypingStop}
              disabled={!peutEcrire}
              placeholder={
                !peutEcrire
                  ? "Impossible d'envoyer un message"
                  : `Écrivez votre message à ${otherParticipant?.prenom}...`
              }
            />
          );
        })()}
      </div>
    </div>
  );
};

export default ChatWindow;
