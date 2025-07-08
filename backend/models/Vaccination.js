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