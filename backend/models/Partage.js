// models/Sharing.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Sharing = sequelize.define('Sharing', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  proprietaire_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  destinataire_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  date_expiration: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'partages_documents',
  timestamps: false
});

// Associations
Sharing.belongsTo(User, {
  as: 'Proprietaire',
  foreignKey: 'proprietaire_id'
});
Sharing.belongsTo(User, {
  as: 'Destinataire',
  foreignKey: 'destinataire_id'
});

export default Sharing;