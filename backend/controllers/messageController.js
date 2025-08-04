import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import ConversationParticipant from '../models/ConversationParticipant.js';
import User from '../models/User.js';
import DemandeTraitant from '../models/DemandeTraitant.js';
import { Op, literal } from 'sequelize';
import socketManager from '../utils/socketManager.js';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import CryptoJS from 'crypto-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration multer pour les médias
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/messages');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

class MessageController {
  constructor() {
    // Écouter les événements Socket.IO
    if (socketManager.io) {
      socketManager.io.on('handle_send_message', this.handleSocketSendMessage.bind(this));
      socketManager.io.on('handle_message_read', this.handleSocketMessageRead.bind(this));
      socketManager.io.on('handle_add_reaction', this.handleSocketAddReaction.bind(this));
      socketManager.io.on('handle_remove_reaction', this.handleSocketRemoveReaction.bind(this));
    }
  }

  // Créer ou récupérer une conversation
  async getOrCreateConversation(req, res) {
    try {
      const { otherUserId } = req.params;
      const currentUserId = req.user.userId;

      if (currentUserId == otherUserId) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de créer une conversation avec soi-même'
        });
      }

      // Vérifier si la conversation existe déjà
      let conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { patient_id: currentUserId, medecin_id: otherUserId },
            { patient_id: otherUserId, medecin_id: currentUserId }
          ]
        },
        include: [
          { model: User, as: 'Patient', attributes: ['id', 'nom', 'prenom', 'photo_profil'] },
          { model: User, as: 'Medecin', attributes: ['id', 'nom', 'prenom', 'photo_profil'] },
          {
            model: ConversationParticipant,
            as: 'Participants',
            attributes: ['utilisateur_id', 'peut_ecrire'],
            include: [
              { model: User, as: 'Patient', attributes: ['id', 'nom', 'prenom', 'photo_profil', 'role'] },
              { model: User, as: 'Medecin', attributes: ['id', 'nom', 'prenom', 'photo_profil', 'role'] },
              { model: User, as: 'Utilisateur', attributes: ['id', 'nom', 'prenom', 'photo_profil', 'role'] }
            ],
            required: false
          },
          { model: Message, as: 'DernierMessage', include: [
            { model: User, as: 'Expediteur', attributes: ['nom', 'prenom'] }
          ]}
        ]
      });

      if (!conversation) {
        // Déterminer qui est patient et qui est médecin
        const currentUser = await User.findByPk(currentUserId);
        const otherUser = await User.findByPk(otherUserId);

        const patientId = currentUser.role === 'patient' ? currentUserId : otherUserId;
        const medecinId = currentUser.role === 'medecin' ? currentUserId : otherUserId;

        // Créer la conversation
        conversation = await Conversation.create({
          patient_id: patientId,
          medecin_id: medecinId
        });

        // Ajouter les participants
        await ConversationParticipant.bulkCreate([
          {
            conversation_id: conversation.id,
            utilisateur_id: patientId,
            role: 'patient'
          },
          {
            conversation_id: conversation.id,
            utilisateur_id: medecinId,
            role: 'medecin'
          }
        ]);

        // Recharger avec les associations
        conversation = await Conversation.findByPk(conversation.id, {
          include: [
            { model: User, as: 'Patient', attributes: ['id', 'nom', 'prenom', 'photo_profil'] },
            { model: User, as: 'Medecin', attributes: ['id', 'nom', 'prenom', 'photo_profil'] },
            {
              model: ConversationParticipant,
              as: 'Participants',
              attributes: ['utilisateur_id', 'peut_ecrire'],
              include: [
                { model: User, as: 'Patient', attributes: ['id', 'nom', 'prenom', 'photo_profil', 'role'] },
                { model: User, as: 'Medecin', attributes: ['id', 'nom', 'prenom', 'photo_profil', 'role'] },
                { model: User, as: 'Utilisateur', attributes: ['id', 'nom', 'prenom', 'photo_profil', 'role'] }
              ],
              required: false
            }
          ]
        });
      }

      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('Erreur lors de la création/récupération de conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Récupérer toutes les conversations de l'utilisateur
  async getUserConversations(req, res) {
    try {
      const userId = req.user.userId;

      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { patient_id: userId },
            { medecin_id: userId }
          ],
          statut: 'active'
        },
        include: [
          {
            model: ConversationParticipant,
            as: 'Participants',
            attributes: ['utilisateur_id', 'peut_ecrire'],
            include: [
              { model: User, as: 'Patient', attributes: ['id', 'nom', 'prenom', 'photo_profil', 'role'] },
              { model: User, as: 'Medecin', attributes: ['id', 'nom', 'prenom', 'photo_profil', 'role'] },
              { model: User, as: 'Utilisateur', attributes: ['id', 'nom', 'prenom', 'photo_profil', 'role'] }
            ],
            required: false
          },
          { model: User, as: 'Patient', attributes: ['id', 'nom', 'prenom', 'photo_profil'] },
          { model: User, as: 'Medecin', attributes: ['id', 'nom', 'prenom', 'photo_profil'] },
          { 
            model: Message, 
            as: 'DernierMessage',
            include: [
              { model: User, as: 'Expediteur', attributes: ['nom', 'prenom'] }
            ]
          }
        ],
        order: [['dernier_message_date', 'DESC']]
      });

      // Ajouter le nombre de messages non lus pour chaque conversation
      const conversationsWithUnread = conversations.map(conv => {
        const unreadCount = req.user.role === 'patient' 
          ? conv.messages_non_lus_patient 
          : conv.messages_non_lus_medecin;
        
        return {
          ...conv.toJSON(),
          messages_non_lus: unreadCount
        };
      });

      res.json({
        success: true,
        data: conversationsWithUnread
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Récupérer les contacts disponibles pour démarrer une conversation
  async getAvailableContacts(req, res) {
    try {
      const userId = req.user.userId;
      const currentUser = await User.findByPk(userId);

      let availableUsers = [];

      if (currentUser.role === 'patient') {
        // Pour un patient, récupérer son médecin traitant depuis les demandes acceptées
        const demandeTraitant = await DemandeTraitant.findOne({
          where: {
            patient_id: userId,
            statut: 'accepte'
          },
          include: [{
            model: User,
            as: 'Medecin',
            attributes: ['id', 'nom', 'prenom', 'photo_profil', 'email']
          }]
        });

        if (demandeTraitant && demandeTraitant.Medecin) {
          availableUsers.push(demandeTraitant.Medecin);
        }
      } else if (currentUser.role === 'medecin') {
        // Pour un médecin, récupérer ses patients depuis les demandes acceptées
        const demandesTraitant = await DemandeTraitant.findAll({
          where: {
            medecin_id: userId,
            statut: 'accepte'
          },
          include: [{
            model: User,
            as: 'Patient',
            attributes: ['id', 'nom', 'prenom', 'photo_profil', 'email']
          }]
        });

        availableUsers = demandesTraitant.map(demande => demande.Patient);
      }

      res.json({
        success: true,
        data: availableUsers
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Récupérer les messages d'une conversation
  async getConversationMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = req.user.userId;

      // Vérifier que l'utilisateur fait partie de la conversation
      const participant = await ConversationParticipant.findOne({
        where: {
          conversation_id: conversationId,
          utilisateur_id: userId,
          statut_participant: 'actif'
        }
      });

      if (!participant) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à cette conversation'
        });
      }

      const offset = (page - 1) * limit;

      const messages = await Message.findAndCountAll({
        where: {
          conversation_id: conversationId,
          est_supprime: false
        },
        include: [
          { model: User, as: 'Expediteur', attributes: ['id', 'nom', 'prenom', 'photo_profil'] },
          { model: Message, as: 'MessageParent', include: [
            { model: User, as: 'Expediteur', attributes: ['nom', 'prenom'] }
          ]}
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          messages: messages.rows.reverse(), // Inverser pour avoir l'ordre chronologique
          pagination: {
            total: messages.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(messages.count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Envoyer un message
  async sendMessage(req, res) {
    try {
      const { conversationId, contenu, messageParentId, chiffre = false } = req.body;
      const userId = req.user.userId;

      // Vérifier que l'utilisateur fait partie de la conversation
      const participant = await ConversationParticipant.findOne({
        where: {
          conversation_id: conversationId,
          utilisateur_id: userId,
          statut_participant: 'actif',
          peut_ecrire: true
        }
      });

      if (!participant) {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez pas écrire dans cette conversation'
        });
      }

      // Récupérer la conversation pour déterminer le destinataire
      const conversation = await Conversation.findByPk(conversationId);
      const destinataireId = conversation.patient_id === userId 
        ? conversation.medecin_id 
        : conversation.patient_id;

      let contenuFinal = contenu;
      let contenuChiffre = null;

      // Chiffrement E2E si demandé
      if (chiffre && conversation.cle_chiffrement) {
        contenuChiffre = CryptoJS.AES.encrypt(contenu, conversation.cle_chiffrement).toString();
        contenuFinal = '[Message chiffré]';
      }
      console.log({
  conversation_id: conversationId,
  expediteur_id: userId,
  destinataire_id: destinataireId,
  contenu: contenuFinal,
  contenu_chiffre: contenuChiffre,
  message_parent_id: messageParentId || null,
  type_message: 'texte'
    });

      // Créer le message
      const message = await Message.create({
        conversation_id: conversationId,
        expediteur_id: userId,
        destinataire_id: destinataireId,
        contenu: contenuFinal,
        contenu_chiffre: contenuChiffre,
        message_parent_id: messageParentId || null,
        type_message: 'texte'
      });

      // Mettre à jour la conversation
      await Conversation.update({
        dernier_message_id: message.id,
        dernier_message_date: new Date(),
        // Incrémenter les messages non lus pour le destinataire
        [userId === conversation.patient_id ? 'messages_non_lus_medecin' : 'messages_non_lus_patient']: 
          literal(`${userId === conversation.patient_id ? 'messages_non_lus_medecin' : 'messages_non_lus_patient'} + 1`)
      }, {
        where: { id: conversationId }
      });

      // Recharger le message avec les associations
      const messageComplet = await Message.findByPk(message.id, {
        include: [
          { model: User, as: 'Expediteur', attributes: ['id', 'nom', 'prenom', 'photo_profil'] },
          { model: Message, as: 'MessageParent', include: [
            { model: User, as: 'Expediteur', attributes: ['nom', 'prenom'] }
          ]}
        ]
      });

      // Envoyer via Socket.IO
      socketManager.sendToConversation(conversationId, 'new_message', messageComplet);

      res.json({
        success: true,
        data: messageComplet
      });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error.message || error);
        console.error(error.stack);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi du message'
        });
    }
  }

  // Envoyer un message avec média
  async sendMediaMessage(req, res) {
    try {
      const { conversationId, messageParentId } = req.body;
      const userId = req.user.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      // Vérifier les permissions
      const participant = await ConversationParticipant.findOne({
        where: {
          conversation_id: conversationId,
          utilisateur_id: userId,
          statut_participant: 'actif',
          peut_ecrire: true
        }
      });

      if (!participant) {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez pas écrire dans cette conversation'
        });
      }

      // Déterminer le type de message
      let typeMessage = 'document';
      if (file.mimetype.startsWith('image/')) {
        typeMessage = 'image';
        // Optimiser l'image
        const optimizedPath = file.path.replace(path.extname(file.path), '_optimized' + path.extname(file.path));
        await sharp(file.path)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(optimizedPath);
        
        // Remplacer le fichier original
        await fs.unlink(file.path);
        await fs.rename(optimizedPath, file.path);
      } else if (file.mimetype.startsWith('video/')) {
        typeMessage = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        typeMessage = 'audio';
      }

      // Récupérer la conversation
      const conversation = await Conversation.findByPk(conversationId);
      const destinataireId = conversation.patient_id === userId 
        ? conversation.medecin_id 
        : conversation.patient_id;

      // Créer le message
      const message = await Message.create({
        conversation_id: conversationId,
        expediteur_id: userId,
        destinataire_id: destinataireId,
        type_message: typeMessage,
        fichier_url: `/uploads/messages/${file.filename}`,
        fichier_nom: file.originalname,
        fichier_taille: file.size,
        message_parent_id: messageParentId || null
      });

      // Mettre à jour la conversation
      await Conversation.update({
        dernier_message_id: message.id,
        dernier_message_date: new Date(),
        [userId === conversation.patient_id ? 'messages_non_lus_medecin' : 'messages_non_lus_patient']: 
          literal(`${userId === conversation.patient_id ? 'messages_non_lus_medecin' : 'messages_non_lus_patient'} + 1`)
      }, {
        where: { id: conversationId }
      });

      // Recharger avec associations
      const messageComplet = await Message.findByPk(message.id, {
        include: [
          { model: User, as: 'Expediteur', attributes: ['id', 'nom', 'prenom', 'photo_profil'] }
        ]
      });

      // Notifier via Socket.IO
      socketManager.sendToConversation(conversationId, 'new_message', messageComplet);

      res.json({
        success: true,
        data: messageComplet
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du média:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du média'
      });
    }
  }

  // Marquer des messages comme lus
  async markMessagesAsRead(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.userId;

      // Marquer tous les messages non lus de la conversation comme lus
      await Message.update({
        est_lu: true,
        date_lecture: new Date()
      }, {
        where: {
          conversation_id: conversationId,
          destinataire_id: userId,
          est_lu: false
        }
      });

      // Réinitialiser le compteur de messages non lus
      const conversation = await Conversation.findByPk(conversationId);
      const updateField = userId === conversation.patient_id 
        ? 'messages_non_lus_patient' 
        : 'messages_non_lus_medecin';

      await Conversation.update({
        [updateField]: 0
      }, {
        where: { id: conversationId }
      });

      // Notifier via Socket.IO
      socketManager.sendToConversation(conversationId, 'messages_read', {
        conversationId,
        readBy: userId,
        readAt: new Date()
      });

      res.json({
        success: true,
        message: 'Messages marqués comme lus'
      });
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Ajouter une réaction à un message
  async addReaction(req, res) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.user.userId;

      const message = await Message.findByPk(messageId);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message non trouvé'
        });
      }

      // Vérifier les permissions
      const participant = await ConversationParticipant.findOne({
        where: {
          conversation_id: message.conversation_id,
          utilisateur_id: userId,
          statut_participant: 'actif'
        }
      });

      if (!participant) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      // Ajouter la réaction
      const reactions = message.emojis_reactions || {};
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }
      
      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      }

      await Message.update({
        emojis_reactions: reactions
      }, {
        where: { id: messageId }
      });

      // Notifier via Socket.IO
      socketManager.sendToConversation(message.conversation_id, 'reaction_added', {
        messageId,
        emoji,
        userId,
        reactions
      });

      res.json({
        success: true,
        data: { reactions }
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de réaction:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Gestionnaires d'événements Socket.IO
  async handleSocketSendMessage({ socket, data }) {
    // Logique déjà dans sendMessage, ici on peut ajouter des vérifications supplémentaires
  }

  async handleSocketMessageRead({ socket, messageId, conversationId, userId }) {
    await Message.update({
      est_lu: true,
      date_lecture: new Date()
    }, {
      where: { id: messageId }
    });
  }

  async handleSocketAddReaction({ socket, messageId, emoji, conversationId, userId }) {
    const message = await Message.findByPk(messageId);
    if (message) {
      const reactions = message.emojis_reactions || {};
      if (!reactions[emoji]) reactions[emoji] = [];
      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
        await message.update({ emojis_reactions: reactions });
        
        socketManager.sendToConversation(conversationId, 'reaction_updated', {
          messageId,
          reactions
        });
      }
    }
  }

  async handleSocketRemoveReaction({ socket, messageId, emoji, conversationId, userId }) {
    const message = await Message.findByPk(messageId);
    if (message) {
      const reactions = message.emojis_reactions || {};
      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
        await message.update({ emojis_reactions: reactions });
        
        socketManager.sendToConversation(conversationId, 'reaction_updated', {
          messageId,
          reactions
        });
      }
    }
  }
}

export default new MessageController();
