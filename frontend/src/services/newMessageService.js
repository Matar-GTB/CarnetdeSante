// src/services/messageService.js
import axios from 'axios';
import { API } from './authService';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';

class MessageService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  // Initialiser la connexion Socket.IO
  initializeSocket(token) {
    if (!token) {
      console.error('Token manquant pour la connexion Socket.IO');
      return;
    }

    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connecté au serveur de messagerie');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Déconnecté du serveur de messagerie');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket.IO:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  // Fermer la connexion Socket.IO
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Écouter un événement
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Sauvegarder pour pouvoir nettoyer plus tard
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    }
  }

  // Arrêter d'écouter un événement
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Nettoyer la liste des listeners
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  // Émettre un événement
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Rejoindre une conversation
  joinConversation(conversationId) {
    this.emit('join_conversation', { conversationId });
  }

  // Quitter une conversation
  leaveConversation(conversationId) {
    this.emit('leave_conversation', { conversationId });
  }

  // Indiquer qu'on tape
  startTyping(conversationId) {
    this.emit('typing_start', { conversationId });
  }

  // Arrêter d'indiquer qu'on tape
  stopTyping(conversationId) {
    this.emit('typing_stop', { conversationId });
  }

  // API REST - Récupérer les conversations
  async getConversations() {
    try {
      const response = await API.get('/messages/conversations');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  }

  // API REST - Créer ou récupérer une conversation
  async getOrCreateConversation(otherUserId) {
    try {
      const response = await API.get(`/messages/conversations/${otherUserId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur lors de la création de conversation:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // API REST - Récupérer les messages d'une conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await API.get(`/messages/conversations/${conversationId}/messages`, {
        params: { page, limit }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: { messages: [], pagination: {} }
      };
    }
  }

  // API REST - Envoyer un message texte
  async sendMessage(conversationId, contenu, messageParentId = null, chiffre = false) {
    try {
      const response = await API.post('/messages/messages', {
        conversationId,
        contenu,
        messageParentId,
        chiffre
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // API REST - Envoyer un message avec média
  async sendMediaMessage(conversationId, file, messageParentId = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);
      if (messageParentId) {
        formData.append('messageParentId', messageParentId);
      }

      const response = await API.post('/messages/messages/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du média:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // API REST - Marquer les messages comme lus
  async markMessagesAsRead(conversationId) {
    try {
      await API.put(`/messages/conversations/${conversationId}/read`);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // API REST - Ajouter une réaction
  async addReaction(messageId, emoji) {
    try {
      const response = await API.post(`/messages/messages/${messageId}/reactions`, {
        emoji
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de réaction:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // API REST - Supprimer une réaction
  async removeReaction(messageId, emoji) {
    try {
      const response = await API.delete(`/messages/messages/${messageId}/reactions`, {
        data: { emoji }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de réaction:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Utilitaire - Vérifier si un utilisateur est en ligne
  isUserOnline(userId) {
    // Cette information serait maintenue côté client via les événements Socket.IO
    return false; // À implémenter selon les besoins
  }

  // Utilitaire - Obtenir le statut de connexion Socket.IO
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id
    };
  }
}

// Instance singleton
const messageService = new MessageService();
export default messageService;
