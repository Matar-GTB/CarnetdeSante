import { Server as socketIo } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ConversationParticipant from '../models/ConversationParticipant.js';

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> {socketId, userInfo}
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(server) {
    this.io = new socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));

    console.log('🔌 Socket.IO initialisé');
    return this.io;
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Token manquant'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'nom', 'prenom', 'role', 'photo_profil']
      });

      if (!user) {
        return next(new Error('Utilisateur non trouvé'));
      }

      socket.userId = user.id;
      socket.userInfo = user.toJSON();
      next();
    } catch (error) {
      console.error('Erreur authentification socket:', error);
      next(new Error('Token invalide'));
    }
  }

  async handleConnection(socket) {
    const userId = socket.userId;
    const userInfo = socket.userInfo;

    console.log(`👤 Utilisateur ${userInfo.prenom} ${userInfo.nom} connecté (${socket.id})`);

    // Enregistrer l'utilisateur connecté
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      userInfo,
      lastActivity: new Date()
    });
    this.userSockets.set(socket.id, userId);

    // Mettre à jour le statut en ligne dans la base
    await this.updateUserOnlineStatus(userId, true);

    // Joindre les conversations de l'utilisateur
    await this.joinUserConversations(socket, userId);

    // Événements de messagerie
    socket.on('send_message', this.handleSendMessage.bind(this, socket));
    socket.on('message_read', this.handleMessageRead.bind(this, socket));
    socket.on('typing_start', this.handleTypingStart.bind(this, socket));
    socket.on('typing_stop', this.handleTypingStop.bind(this, socket));
    socket.on('join_conversation', this.handleJoinConversation.bind(this, socket));
    socket.on('leave_conversation', this.handleLeaveConversation.bind(this, socket));

    // Événements de réaction
    socket.on('add_reaction', this.handleAddReaction.bind(this, socket));
    socket.on('remove_reaction', this.handleRemoveReaction.bind(this, socket));

    // Déconnexion
    socket.on('disconnect', this.handleDisconnection.bind(this, socket));

    // Notifier les autres utilisateurs de la connexion
    this.broadcastUserStatus(userId, 'online');
  }

  async joinUserConversations(socket, userId) {
    try {
      const participations = await ConversationParticipant.findAll({
        where: { utilisateur_id: userId, statut_participant: 'actif' },
        attributes: ['conversation_id']
      });

      for (const participation of participations) {
        const conversationRoom = `conversation-${participation.conversation_id}`;
        socket.join(conversationRoom);
      }

      console.log(`📱 Utilisateur ${userId} rejoint ${participations.length} conversations`);
    } catch (error) {
      console.error('Erreur lors du join des conversations:', error);
    }
  }

  handleSendMessage(socket, data) {
    // Implémenté dans messageController
    this.io.emit('handle_send_message', { socket, data });
  }

  handleMessageRead(socket, data) {
    const { messageId, conversationId } = data;
    
    // Marquer le message comme lu
    this.io.emit('handle_message_read', { 
      socket, 
      messageId, 
      conversationId, 
      userId: socket.userId 
    });

    // Notifier l'expéditeur
    socket.to(`conversation-${conversationId}`).emit('message_read_status', {
      messageId,
      readBy: socket.userId,
      readAt: new Date()
    });
  }

  handleTypingStart(socket, data) {
    const { conversationId } = data;
    
    socket.to(`conversation-${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      userInfo: socket.userInfo,
      conversationId
    });
  }

  handleTypingStop(socket, data) {
    const { conversationId } = data;
    
    socket.to(`conversation-${conversationId}`).emit('user_stop_typing', {
      userId: socket.userId,
      conversationId
    });
  }

  handleJoinConversation(socket, data) {
    const { conversationId } = data;
    const conversationRoom = `conversation-${conversationId}`;
    
    socket.join(conversationRoom);
    console.log(`📨 Utilisateur ${socket.userId} rejoint la conversation ${conversationId}`);
  }

  handleLeaveConversation(socket, data) {
    const { conversationId } = data;
    const conversationRoom = `conversation-${conversationId}`;
    
    socket.leave(conversationRoom);
    console.log(`📤 Utilisateur ${socket.userId} quitte la conversation ${conversationId}`);
  }

  handleAddReaction(socket, data) {
    const { messageId, emoji, conversationId } = data;
    
    // Implémenté dans messageController
    this.io.emit('handle_add_reaction', { 
      socket, 
      messageId, 
      emoji, 
      conversationId,
      userId: socket.userId 
    });
  }

  handleRemoveReaction(socket, data) {
    const { messageId, emoji, conversationId } = data;
    
    // Implémenté dans messageController
    this.io.emit('handle_remove_reaction', { 
      socket, 
      messageId, 
      emoji, 
      conversationId,
      userId: socket.userId 
    });
  }

  async handleDisconnection(socket) {
    const userId = this.userSockets.get(socket.id);
    
    if (userId) {
      console.log(`👋 Utilisateur ${userId} déconnecté (${socket.id})`);
      
      // Retirer des maps
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);

      // Mettre à jour le statut hors ligne
      await this.updateUserOnlineStatus(userId, false);

      // Notifier les autres utilisateurs
      this.broadcastUserStatus(userId, 'offline');
    }
  }

  async updateUserOnlineStatus(userId, isOnline) {
    try {
      await ConversationParticipant.update(
        { 
          est_en_ligne: isOnline,
          derniere_activite: new Date()
        },
        { where: { utilisateur_id: userId } }
      );
    } catch (error) {
      console.error('Erreur mise à jour statut en ligne:', error);
    }
  }

  broadcastUserStatus(userId, status) {
    this.io.emit('user_status_changed', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  // Méthodes utilitaires pour les controllers
  sendToConversation(conversationId, event, data) {
    this.io.to(`conversation-${conversationId}`).emit(event, data);
  }

  sendToUser(userId, event, data) {
    const userConnection = this.connectedUsers.get(userId);
    if (userConnection) {
      this.io.to(userConnection.socketId).emit(event, data);
    }
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  getConversationUsers(conversationId) {
    const conversationRoom = this.io.sockets.adapter.rooms.get(`conversation-${conversationId}`);
    if (!conversationRoom) return [];
    
    return Array.from(conversationRoom).map(socketId => this.userSockets.get(socketId)).filter(Boolean);
  }
}

// Instance singleton
const socketManager = new SocketManager();

export default socketManager;
