import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const DemandeTraitant = sequelize.define('DemandeTraitant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  medecin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  message_demande: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'accepte', 'refuse'),
    defaultValue: 'en_attente'
  },
  message_reponse: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'demandes_medecin_traitant',
  timestamps: false
});

// Associations
DemandeTraitant.belongsTo(User, { foreignKey: 'patient_id', as: 'Patient' });
DemandeTraitant.belongsTo(User, { foreignKey: 'medecin_id', as: 'Medecin' });

export default DemandeTraitant;