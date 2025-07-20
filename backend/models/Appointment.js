// backend/models/Appointment.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  medecin_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_rendezvous: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  heure_debut: {
    type: DataTypes.TIME,
    allowNull: false
  },
  heure_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  type_rendezvous: {
    type: DataTypes.STRING(50),
    defaultValue: null
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'planifie', 'termine', 'annule', 'reprogramme', 'refuse'),
    defaultValue: 'en_attente'
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'rendezvous',
  underscored: true,
  timestamps: false
});

// Associations
Appointment.belongsTo(User, { as: 'Patient', foreignKey: 'patient_id' });
Appointment.belongsTo(User, { as: 'Medecin', foreignKey: 'medecin_id' });

export default Appointment;
