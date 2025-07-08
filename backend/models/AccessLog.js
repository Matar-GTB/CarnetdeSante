import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AccessLog = sequelize.define('AccessLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type_action: {
    type: DataTypes.ENUM('consultation', 'telechargement', 'modification', 'partage'),
    allowNull: false
  },
  type_cible: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  id_cible: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  adresse_ip: {
    type: DataTypes.STRING(45)
  },
  date_action: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'journaux_acces',
  timestamps: false
});

export default AccessLog;