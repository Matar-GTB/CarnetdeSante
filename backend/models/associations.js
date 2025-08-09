// backend/models/associations.js
import PriseMedicament from './PriseMedicament.js';
import Rappel from './Rappel.js';
import User from './User.js';
import Avis from './Avis.js';
import Message from './Message.js';
import Conversation from './Conversation.js';
import ConversationParticipant from './ConversationParticipant.js';

export const setupAssociations = () => {
  // Associations pour les utilisateurs et les rappels
  User.hasMany(Rappel, { foreignKey: 'utilisateur_id', as: 'Rappels' });
  Rappel.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'UtilisateurRappel' });
  
  // Autres associations
  PriseMedicament.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'UtilisateurMedicament' });
  PriseMedicament.hasMany(Rappel, { foreignKey: 'medicament_id', as: 'Rappels', onDelete: 'CASCADE' });
  Rappel.belongsTo(PriseMedicament, { foreignKey: 'medicament_id' });
  
  // Associations pour les avis
  Avis.belongsTo(User, { foreignKey: 'patient_id', as: 'Patient' });
  Avis.belongsTo(User, { foreignKey: 'medecin_id', as: 'Medecin' });
  User.hasMany(Avis, { foreignKey: 'patient_id', as: 'AvisLaisses' });
  User.hasMany(Avis, { foreignKey: 'medecin_id', as: 'AvisRecus' });

  // Associations pour la messagerie
  // Conversations
  Conversation.belongsTo(User, { foreignKey: 'patient_id', as: 'Patient' });
  Conversation.belongsTo(User, { foreignKey: 'medecin_id', as: 'Medecin' });
  Conversation.belongsTo(Message, { foreignKey: 'dernier_message_id', as: 'DernierMessage' });
  Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'Messages' });
  Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversation_id', as: 'Participants' });

  // Messages
  Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'Conversation' });
  Message.belongsTo(User, { foreignKey: 'expediteur_id', as: 'Expediteur' });
  Message.belongsTo(User, { foreignKey: 'destinataire_id', as: 'Destinataire' });
  Message.belongsTo(Message, { foreignKey: 'message_parent_id', as: 'MessageParent' });
  Message.hasMany(Message, { foreignKey: 'message_parent_id', as: 'Reponses' });

  // Participants
  ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'Conversation' });
  ConversationParticipant.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'UtilisateurParticipant' });
  
  // Note: Les associations ci-dessous ont été commentées car elles utilisent la même clé étrangère
  // Ces associations peuvent être utilisées dans le code via des requêtes incluant le type de participant
  // ConversationParticipant.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'Patient' });
  // ConversationParticipant.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'Medecin' });

  // Relations utilisateur avec les messages
  User.hasMany(Message, { foreignKey: 'expediteur_id', as: 'MessagesEnvoyes' });
  User.hasMany(Message, { foreignKey: 'destinataire_id', as: 'MessagesRecus' });
  User.hasMany(Conversation, { foreignKey: 'patient_id', as: 'ConversationsPatient' });
  User.hasMany(Conversation, { foreignKey: 'medecin_id', as: 'ConversationsMedecin' });
  User.hasMany(ConversationParticipant, { foreignKey: 'utilisateur_id', as: 'ParticipationsConversations' });
};
