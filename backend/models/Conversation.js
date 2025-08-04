import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utilisateurs',
      key: 'id'
    }
  },
  medecin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utilisateurs',
      key: 'id'
    }
  },
  est_groupe: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  nom_groupe: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description_groupe: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photo_groupe: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dernier_message_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  dernier_message_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  est_archivee: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  est_epinglee: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  messages_non_lus_patient: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  messages_non_lus_medecin: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  statut: {
    type: DataTypes.ENUM('active', 'archivee', 'bloquee'),
    defaultValue: 'active'
  },
  cle_chiffrement: {
    type: DataTypes.STRING,
    allowNull: true // Pour le chiffrement E2E
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  date_mise_a_jour: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'date_creation',
  updatedAt: 'date_mise_a_jour',
  indexes: [
    {
      fields: ['patient_id', 'medecin_id'],
      unique: true // Une seule conversation par paire patient-médecin
    },
    {
      fields: ['dernier_message_date']
    },
    {
      fields: ['est_archivee']
    }
  ]
});

export default Conversation;
