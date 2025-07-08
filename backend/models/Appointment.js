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
    type: DataTypes.STRING(50)
  },
  statut: {
    type: DataTypes.ENUM('planifie', 'termine', 'annule', 'reprogramme'),
    defaultValue: 'planifie'
  },
  notes: {
    type: DataTypes.TEXT
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'rendezvous',
  timestamps: false
});

// Associations
Appointment.belongsTo(User, {
  as: 'Patient',
  foreignKey: 'patient_id'
});
Appointment.belongsTo(User, {
  as: 'Medecin',
  foreignKey: 'medecin_id'
});

export default Appointment;