import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Message = sequelize.define('Message', {
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
  expediteur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utilisateurs',
      key: 'id'
    }
  },
  destinataire_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utilisateurs',
      key: 'id'
    }
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: true // Peut être null pour les messages avec seulement des médias
  },
  type_message: {
    type: DataTypes.ENUM('texte', 'vocal', 'fichier', 'image', 'video', 'audio', 'document'),
    defaultValue: 'texte'
  },
  fichier_url: {
    type: DataTypes.STRING,
    allowNull: true // URL du fichier média s'il y en a un
  },
  fichier_nom: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fichier_taille: {
    type: DataTypes.INTEGER,
    allowNull: true // Taille en bytes
  },
  message_parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  est_lu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_lecture: {
    type: DataTypes.DATE,
    allowNull: true
  },
  est_supprime: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  est_modifie: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_modification: {
    type: DataTypes.DATE,
    allowNull: true
  },
  contenu_chiffre: {
    type: DataTypes.TEXT,
    allowNull: true // Pour le chiffrement E2E
  },
  emojis_reactions: {
    type: DataTypes.JSONB,
    defaultValue: {} // {emoji: [user_ids], ...}
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['conversation_id', 'createdAt']
    },
    {
      fields: ['expediteur_id']
    },
    {
      fields: ['destinataire_id']
    },
    {
      fields: ['est_lu']
    }
  ]
});
export default Message;
