import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utilisateurs',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('patient', 'medecin', 'admin'),
    allowNull: false
  },
  est_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  peut_ecrire: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notifications_activees: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  derniere_lecture: {
    type: DataTypes.DATE,
    allowNull: true
  },
  est_en_ligne: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  derniere_activite: {
    type: DataTypes.DATE,
    allowNull: true
  },
  statut_participant: {
    type: DataTypes.ENUM('actif', 'quitte', 'expulse'),
    defaultValue: 'actif'
  },
  date_ajout: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'conversation_participants',
  timestamps: false,
  indexes: [
    {
      fields: ['conversation_id', 'utilisateur_id'],
      unique: true
    },
    {
      fields: ['utilisateur_id']
    },
    {
      fields: ['est_en_ligne']
    }
  ]
});

export default ConversationParticipant;
