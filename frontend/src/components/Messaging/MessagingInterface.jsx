// src/components/Messaging/MessagingInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import messageService from '../../services/messageService';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import UserOnlineStatus from './UserOnlineStatus';
import './MessagingInterface.css';

const MessagingInterface = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const socketInitialized = useRef(false);

  // Initialisation Socket.IO
  useEffect(() => {
    if (token && !socketInitialized.current) {
      console.log('🔌 Initialisation Socket.IO...');
      messageService.initializeSocket(token);
      socketInitialized.current = true;

      // Écouter les événements Socket.IO
      messageService.on('new_message', handleNewMessage);
      messageService.on('message_read_status', handleMessageRead);
      messageService.on('user_typing', handleUserTyping);
      messageService.on('user_stop_typing', handleUserStopTyping);
      messageService.on('user_status_changed', handleUserStatusChanged);
      messageService.on('reaction_updated', handleReactionUpdated);

      return () => {
        messageService.off('new_message', handleNewMessage);
        messageService.off('message_read_status', handleMessageRead);
        messageService.off('user_typing', handleUserTyping);
        messageService.off('user_stop_typing', handleUserStopTyping);
        messageService.off('user_status_changed', handleUserStatusChanged);
        messageService.off('reaction_updated', handleReactionUpdated);
        messageService.disconnect();
        socketInitialized.current = false;
      };
    }
  }, [token]);

  // Charger les conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const result = await messageService.getConversations();
      if (result.success) {
        setConversations(result.data);
      } else {
        console.error('Erreur chargement conversations:', result.error);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId) => {
    try {
      const result = await messageService.getMessages(conversationId);
      if (result.success) {
        setMessages(result.data.messages || []);
        // Marquer les messages comme lus
        await messageService.markMessagesAsRead(conversationId);
      } else {
        console.error('Erreur chargement messages:', result.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      setMessages([]);
    }
  };

  // Gestionnaires d'événements Socket.IO
  const handleNewMessage = (message) => {
    console.log('📨 Nouveau message reçu:', message);
    
    // Mettre à jour les messages si c'est la conversation active
    if (activeConversation && message.conversation_id === activeConversation.id) {
      setMessages(prev => {
        // Éviter les doublons - vérifier si le message existe déjà
        const messageExists = prev.some(msg => msg.id === message.id);
        if (messageExists) {
          console.log('⚠️ Message déjà présent, ignoré');
          return prev;
        }
        
        // Supprimer les messages temporaires et ajouter le vrai message
        const filteredMessages = prev.filter(msg => !msg.isTemporary);
        return [...filteredMessages, message];
      });
      
      // Marquer comme lu automatiquement si la conversation est ouverte
      messageService.markMessagesAsRead(activeConversation.id);
    }
    
    // Mettre à jour la liste des conversations
    setConversations(prev => {
      return prev.map(conv => {
        if (conv.id === message.conversation_id) {
          return {
            ...conv,
            DernierMessage: message,
            dernier_message_date: message.createdAt,
            messages_non_lus: activeConversation?.id === conv.id ? 0 : (conv.messages_non_lus || 0) + 1
          };
        }
        return conv;
      });
    });
  };

  const handleMessageRead = (data) => {
    const { messageId, readBy, readAt } = data;
    console.log(`📖 Message ${messageId} lu par ${readBy}`);
    
    // Mettre à jour le statut de lecture dans l'interface
    setMessages(prev => {
      return prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            est_lu: true,
            date_lecture: readAt
          };
        }
        return msg;
      });
    });
  };

  const handleUserTyping = (data) => {
    const { userId, userInfo, conversationId } = data;
    
    if (activeConversation && conversationId === activeConversation.id) {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, userInfo);
        return newMap;
      });
    }
  };

  const handleUserStopTyping = (data) => {
    const { userId, conversationId } = data;
    
    if (activeConversation && conversationId === activeConversation.id) {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
  };

  const handleUserStatusChanged = (data) => {
    const { userId, status } = data;
    
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (status === 'online') {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleReactionUpdated = (data) => {
    const { messageId, reactions } = data;
    
    setMessages(prev => {
      return prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            emojis_reactions: reactions
          };
        }
        return msg;
      });
    });
  };

  // Sélectionner une conversation
  const selectConversation = async (conversation) => {
    if (activeConversation?.id !== conversation.id) {
      setActiveConversation(conversation);
      messageService.joinConversation(conversation.id);
      await loadMessages(conversation.id);
    }
  };

  // Démarrer une nouvelle conversation
  const handleStartNewConversation = async (conversation) => {
    // Ajouter la nouvelle conversation à la liste s'il elle n'existe pas
    setConversations(prev => {
      const exists = prev.find(conv => conv.id === conversation.id);
      if (!exists) {
        return [conversation, ...prev];
      }
      return prev;
    });
    
    // Sélectionner la nouvelle conversation
    await selectConversation(conversation);
  };

  // Envoyer un message
  const handleSendMessage = async (contenu, fileList = null, replyToMessage = null) => {
    if (!activeConversation) return;

    try {
      let result;
      
      if (fileList && fileList.length > 0) {
        // Envoyer chaque fichier séparément
        for (const file of fileList) {
          // Ajouter un message temporaire pour affichage optimiste
          const tempMessage = {
            id: `temp_${Date.now()}_${Math.random()}`,
            contenu: `Envoi de ${file.name}...`,
            conversation_id: activeConversation.id,
            expediteur_id: user.id,
            createdAt: new Date().toISOString(),
            type_message: file.type.startsWith('image/') ? 'image' : 
                         file.type.startsWith('video/') ? 'video' :
                         file.type.startsWith('audio/') ? 'audio' : 'fichier',
            est_lu: false,
            isTemporary: true,
            Expediteur: user
          };
          
          setMessages(prev => [...prev, tempMessage]);
          
          result = await messageService.sendMediaMessage(
            activeConversation.id,
            file,
            replyToMessage?.id
          );
          
          // Supprimer le message temporaire
          setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        }
      } else if (contenu.trim()) {
        // Ajouter un message temporaire pour affichage optimiste
        const tempMessage = {
          id: `temp_${Date.now()}_${Math.random()}`,
          contenu: contenu,
          conversation_id: activeConversation.id,
          expediteur_id: user.id,
          createdAt: new Date().toISOString(),
          type_message: 'texte',
          est_lu: false,
          isTemporary: true,
          Expediteur: user
        };
        
        setMessages(prev => [...prev, tempMessage]);
        
        // Envoyer un message texte
        result = await messageService.sendMessage(
          activeConversation.id,
          contenu,
          replyToMessage?.id
        );
        
        // Supprimer le message temporaire
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      }

      if (result && result.success) {
        // Le message réel sera ajouté via Socket.IO
        console.log('✅ Message envoyé avec succès');
      } else {
        console.error('❌ Erreur envoi message:', result?.error);
        // En cas d'erreur, afficher un message d'erreur
        alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      // Supprimer tous les messages temporaires en cas d'erreur
      setMessages(prev => prev.filter(msg => !msg.isTemporary));
      alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    }
  };

  // Commencer/arrêter de taper
  const handleTypingStart = () => {
    if (activeConversation) {
      messageService.startTyping(activeConversation.id);
    }
  };

  const handleTypingStop = () => {
    if (activeConversation) {
      messageService.stopTyping(activeConversation.id);
    }
  };

  // Gérer les réactions
  const handleAddReaction = async (messageId, emoji) => {
    try {
      const result = await messageService.addReaction(messageId, emoji);
      if (!result.success) {
        console.error('Erreur ajout réaction:', result.error);
      }
    } catch (error) {
      console.error('Erreur ajout réaction:', error);
    }
  };

  const handleRemoveReaction = async (messageId, emoji) => {
    try {
      const result = await messageService.removeReaction(messageId, emoji);
      if (!result.success) {
        console.error('Erreur suppression réaction:', result.error);
      }
    } catch (error) {
      console.error('Erreur suppression réaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="messaging-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de la messagerie...</p>
      </div>
    );
  }

  return (
    <div className="messaging-interface">
      <div className="messaging-header">
        <h2>💬 Messagerie</h2>
        <UserOnlineStatus 
          onlineUsers={onlineUsers}
          currentUser={user}
        />
      </div>
      
      <div className="messaging-content">
        <div className="conversations-panel">
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={selectConversation}
            onStartNewConversation={handleStartNewConversation}
            onlineUsers={onlineUsers}
            currentUser={user}
          />
        </div>
        
        <div className="chat-panel">
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              currentUser={user}
              onSendMessage={handleSendMessage}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              typingUsers={typingUsers}
              onlineUsers={onlineUsers}
            />
          ) : (
            <div className="no-conversation-selected">
              <div className="no-conversation-content">
                <h3>💬 Sélectionnez une conversation</h3>
                <p>Choisissez une conversation pour commencer à échanger des messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingInterface;
