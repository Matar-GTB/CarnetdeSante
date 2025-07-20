// backend/models/HorairesTravail.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const HorairesTravail = sequelize.define('HorairesTravail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  medecin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' }
  },
jour_semaine: {
  type: DataTypes.STRING,
  allowNull: false,
  validate: {
    isIn: [['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']]
  }
},
  heure_debut: {
    type: DataTypes.TIME,
    allowNull: false
  },
  heure_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duree_creneau: {
    type: DataTypes.INTEGER, // minutes
    allowNull: false,
    defaultValue: 20
  }
}, {
  tableName: 'horaires_travail',
  timestamps: false
});

HorairesTravail.belongsTo(User, { foreignKey: 'medecin_id', as: 'Medecin' });

export default HorairesTravail;
