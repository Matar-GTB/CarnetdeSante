import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const AccessDonnees = sequelize.define('AccessDonnees', {
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
    type: DataTypes.STRING(45),
    allowNull: true
  },
  date_action: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'journaux_acces',
  timestamps: false
});

// Association
AccessDonnees.belongsTo(User, {
  foreignKey: 'utilisateur_id',
  as: 'Utilisateur'
});

export default AccessDonnees;