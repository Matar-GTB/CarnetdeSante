// backend/models/PriseMedicament.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';



const PriseMedicament = sequelize.define('PriseMedicament', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  nom_medicament: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dose: {
    type: DataTypes.STRING,
    allowNull: true
  },
  frequence: {
    type: DataTypes.STRING,
    allowNull: true
  },
  heure_prise: {
    type: DataTypes.TIME,
    allowNull: true
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  rappel: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'prises_medicaments',
  timestamps: false
});


export default PriseMedicament;
