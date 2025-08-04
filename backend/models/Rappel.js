import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import PriseMedicament from './PriseMedicament.js'; // 👈 Assure-toi que le modèle est bien importé

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
  envoye: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  canaux: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  date_heure: {
    type: DataTypes.DATE,
    allowNull: true
  },
  medicament_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'prises_medicaments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
 sous_type: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: 'dose'
},

}, {
  tableName: 'rappels',
  timestamps: true
});

// 🔗 Association
Rappel.belongsTo(PriseMedicament, { foreignKey: 'medicament_id' });

export default Rappel;
