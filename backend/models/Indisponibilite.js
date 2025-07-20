// backend/models/Indisponibilite.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Indisponibilite = sequelize.define('Indisponibilite', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medecin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' }
  },
  date_debut: { type: DataTypes.DATEONLY, allowNull: false },
  date_fin:   { type: DataTypes.DATEONLY, allowNull: false },
  heure_debut: { type: DataTypes.TIME, allowNull: false, defaultValue: '00:00' },
  heure_fin:   { type: DataTypes.TIME, allowNull: false, defaultValue: '23:59' },
  motif: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'indisponibilites',
  timestamps: false
});

Indisponibilite.belongsTo(User, { foreignKey: 'medecin_id', as: 'Medecin' });

export default Indisponibilite;
