import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Notification = sequelize.define('Notification', {
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
  type_notification: {
    type: DataTypes.ENUM('rendezvous', 'vaccin', 'partage', 'rappel', 'securite'),
    allowNull: false
  },
  titre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  est_lu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  timestamps: false
});

Notification.belongsTo(User, {
  foreignKey: 'utilisateur_id',
  as: 'Utilisateur'
});

export default Notification;