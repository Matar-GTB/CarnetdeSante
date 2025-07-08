// models/DocumentShare.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Sharing from './Partage.js';
import Document from './Document.js';

const DocumentShare = sequelize.define('DocumentShare', {
  partage_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Sharing,
      key: 'id'
    }
  },
  document_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Document,
      key: 'id'
    }
  }
}, {
  tableName: 'documents_partages',
  timestamps: false
});

// Associations
DocumentShare.belongsTo(Sharing, {
  foreignKey: 'partage_id'
});
DocumentShare.belongsTo(Document, {
  foreignKey: 'document_id'
});

export default DocumentShare;