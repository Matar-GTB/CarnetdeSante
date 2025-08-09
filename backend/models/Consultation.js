// backend/models/Consultation.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Consultation = sequelize.define('Consultation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rendezvous_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'rendezvous', key: 'id' },
    onDelete: 'CASCADE'
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'utilisateurs', key: 'id' },
    onDelete: 'CASCADE'
  },
  medecin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'utilisateurs', key: 'id' },
    onDelete: 'CASCADE'
  },
  notes: {
    type: DataTypes.TEXT
  },
  examens: {
    type: DataTypes.TEXT
  },
  medicaments: {
    type: DataTypes.TEXT
  },
  notes_retenir: {
    type: DataTypes.TEXT
  },
  date_consultation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'consultations',
  timestamps: false
});

export default Consultation;
