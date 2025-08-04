import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Vaccination = sequelize.define('Vaccination', {
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
  nom_vaccin: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  date_administration: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_rappel: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dose: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'complet', 'test', 'incomplet'),
    defaultValue: 'en_attente'
  },
  categorie: {
    type: DataTypes.ENUM('obligatoire', 'recommande'),
    defaultValue: 'recommande'
  },
  lieu_vaccination: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  professionnel_sante: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  effets_secondaires: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contre_indications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  canaux_notification: {
    type: DataTypes.JSONB,
    defaultValue: { email: true, sms: false, push: true }
  }
}, {
  tableName: 'vaccinations',
  timestamps: false
});

Vaccination.belongsTo(User, {
  foreignKey: 'patient_id',
  as: 'Patient'
});

export default Vaccination;