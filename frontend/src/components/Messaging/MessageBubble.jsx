// src/components/Messaging/MessageBubble.jsx
import React, { useState, useRef } from 'react';
import EmojiPicker from './EmojiPicker';
import './MessageBubble.css';

const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  currentUser, 
  onReply, 
  onAddReaction, 
  onRemoveReaction,
  showAvatar 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReactionClick = (emoji) => {
    // Vérifier si l'utilisateur a déjà réagi avec cet emoji
    const existingReaction = message.emojis_reactions?.find(
      reaction => reaction.emoji === emoji && reaction.utilisateur_id === currentUser.id
    );

    if (existingReaction) {
      onRemoveReaction(message.id, emoji);
    } else {
      onAddReaction(message.id, emoji);
    }
    setShowEmojiPicker(false);
  };

  const getReactionCounts = () => {
    if (!message.emojis_reactions?.length) return {};
    
    const counts = {};
    message.emojis_reactions.forEach(reaction => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    return counts;
  };

  const getUserReactions = () => {
    if (!message.emojis_reactions?.length) return new Set();
    
    return new Set(
      message.emojis_reactions
        .filter(reaction => reaction.utilisateur_id === currentUser.id)
        .map(reaction => reaction.emoji)
    );
  };

  // Fonctions de contrôle audio
  const handleAudioPlay = () => {
    if (audioRef.current) {
      console.log('Tentative de lecture audio, URL:', audioRef.current.src);
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Essayer de charger et jouer l'audio
        audioRef.current.play().catch(error => {
          console.error('Erreur lors de la lecture audio:', error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      console.log('Audio chargé:', audioRef.current.duration, 'secondes');
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioError = (error) => {
    console.error('Erreur de chargement audio:', error);
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatAudioTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMediaContent = () => {
    if (!message.type_message || !message.fichier_url || message.type_message === 'texte') return null;

    // Construire l'URL complète si elle est relative
    const fileUrl = message.fichier_url.startsWith('http') 
      ? message.fichier_url 
      : `http://localhost:5000${message.fichier_url}`;

    switch (message.type_message) {
      case 'image':
        return (
          <div className="media-content image-content">
            <img 
              src={fileUrl} 
              alt="Contenu partagé"
              className="message-image"
              onClick={() => window.open(fileUrl, '_blank')}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="media-content video-content">
            <video 
              src={fileUrl} 
              controls
              className="message-video"
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="media-content audio-content">
            <div className="audio-message">
              <button 
                className="audio-play-btn"
                onClick={handleAudioPlay}
                type="button"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <div className="audio-waveform">
                <div className="waveform-bars">
                  {Array.from({ length: 20 }, (_, index) => {
                    const progress = duration > 0 ? (currentTime / duration) * 20 : 0;
                    const isActive = index < progress;
                    return (
                      <span 
                        key={index}
                        className={isActive ? 'active' : ''}
                      ></span>
                    );
                  })}
                </div>
              </div>
              <span className="audio-duration">
                {duration > 0 
                  ? `${formatAudioTime(currentTime)}/${formatAudioTime(duration)}`
                  : '0:00'
                }
              </span>
            </div>
            {/* Audio player caché pour la fonctionnalité */}
            <audio 
              ref={audioRef}
              src={fileUrl} 
              style={{ display: 'none' }}
              className="message-audio"
              onTimeUpdate={handleAudioTimeUpdate}
              onLoadedMetadata={handleAudioLoadedMetadata}
              onEnded={handleAudioEnded}
              onError={handleAudioError}
              preload="metadata"
            />
          </div>
        );
      
      case 'fichier':
      case 'document':
        return (
          <div className="media-content file-content">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="file-link"
            >
              <span className="file-icon">📎</span>
              <span className="file-name">
                {message.fichier_nom || 'Fichier téléchargé'}
              </span>
            </a>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderReplyContext = () => {
    if (!message.MessageParent) return null;

    return (
      <div className="reply-context">
        <div className="reply-indicator"></div>
        <div className="reply-content">
          <span className="reply-author">
            {message.MessageParent.expediteur_id === currentUser.id 
              ? 'Vous' 
              : 'Votre correspondant'}
          </span>
          <div className="reply-text">
            {message.MessageParent.type_message && message.MessageParent.type_message !== 'texte' ? (
              <span className="media-reply">
                {message.MessageParent.type_message === 'image' && '📷 Photo'}
                {message.MessageParent.type_message === 'video' && '🎥 Vidéo'}
                {message.MessageParent.type_message === 'audio' && '🎵 Audio'}
                {message.MessageParent.type_message === 'fichier' && '📎 Fichier'}
                {message.MessageParent.type_message === 'document' && '📎 Document'}
              </span>
            ) : (
              <span>
                {message.MessageParent.contenu && message.MessageParent.contenu.length > 50 
                  ? message.MessageParent.contenu.substring(0, 50) + '...'
                  : message.MessageParent.contenu || 'Message sans contenu'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const reactionCounts = getReactionCounts();
  const userReactions = getUserReactions();

  return (
    <div className={`message-bubble-container ${isOwnMessage ? 'own' : 'other'}`}>
      {!isOwnMessage && showAvatar && (
        <div className="message-avatar">
          <img 
            src={message.Expediteur?.photo_profil || '/images/avatar.png'} 
            alt={message.Expediteur?.prenom || 'Utilisateur'}
            className="avatar-image"
          />
        </div>
      )}

      <div 
        className={`message-bubble ${isOwnMessage ? 'own' : 'other'} ${message.isTemporary ? 'temporary' : ''}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {renderReplyContext()}

        <div className="message-content">
          {message.contenu && (
            <div className="message-text">
              {message.contenu}
            </div>
          )}
          
          {renderMediaContent()}

          <div className="message-meta">
            <span className="message-time">
              {formatTime(message.createdAt)}
            </span>
            {isOwnMessage && (
              <span className="message-status">
                {message.est_lu ? (
                  <span className="read-status">✓✓</span>
                ) : (
                  <span className="sent-status">✓</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Réactions */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="message-reactions">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <button
                key={emoji}
                className={`reaction-button ${userReactions.has(emoji) ? 'user-reacted' : ''}`}
                onClick={() => handleReactionClick(emoji)}
              >
                <span className="reaction-emoji">{emoji}</span>
                <span className="reaction-count">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Actions (apparaissent au survol) */}
        {showActions && (
          <div className={`message-actions ${isOwnMessage ? 'own' : 'other'}`}>
            <button
              className="action-button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Ajouter une réaction"
            >
              😊
            </button>
            <button
              className="action-button"
              onClick={() => onReply(message)}
              title="Répondre"
            >
              ↩️
            </button>
          </div>
        )}

        {/* Sélecteur d'emojis */}
        {showEmojiPicker && (
          <div className={`emoji-picker-container ${isOwnMessage ? 'own' : 'other'}`}>
            <EmojiPicker 
              onEmojiSelect={handleReactionClick}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
