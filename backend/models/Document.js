// models/Document.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Document = sequelize.define('Document', {
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
  titre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type_document: {
    type: DataTypes.ENUM('ordonnance', 'compte_rendu', 'examen', 'autre'),
    allowNull: false
  },
  categorie: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  url_fichier: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  nom_fichier: { 
    type: DataTypes.STRING(255),
    allowNull: true
  },
  date_document: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'documents_medicaux',
  timestamps: false
});

// Association : chaque document appartient à un utilisateur
Document.belongsTo(User, {
  foreignKey: 'utilisateur_id',
  as: 'Proprietaire'
});

export default Document;