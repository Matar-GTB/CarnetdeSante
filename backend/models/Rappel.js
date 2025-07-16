// backend/models/Rappel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Rappel = sequelize.define('Rappel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type_rappel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  recurrence: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'aucune'
  },
  canaux: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
}, {
  tableName: 'rappels',
  timestamps: true
});

export default Rappel;