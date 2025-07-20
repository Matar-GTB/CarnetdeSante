import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  prenom: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le prénom est requis'
      }
    }
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le nom est requis'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: { 
      isEmail: {
        msg: 'Format email invalide'
      } 
    }
  },
  telephone: {
    type: DataTypes.STRING(20),
    validate: {
      isPhoneNumber(value) {
        if (value && !/^\+?[0-9\s.-]{8,20}$/.test(value)) {
          throw new Error('Numéro de téléphone invalide');
        }
      }
    }
  },
  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [8, 100],
        msg: 'Le mot de passe doit contenir entre 8 et 100 caractères'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('patient', 'medecin', 'admin'),
    defaultValue: 'patient'
  },

  // Infos générales
  sexe: {
    type: DataTypes.STRING(10),
    validate: {
      isIn: {
        args: [['homme', 'femme', 'autre', null]],
        msg: 'Sexe non valide'
      }
    }
  },
  date_naissance: DataTypes.DATEONLY,
  groupe_sanguin: {
    type: DataTypes.STRING(5),
    validate: {
      is: /^(A|B|AB|O)[+-]$/i
    }
  },
  adresse: DataTypes.TEXT,
  photo_profil: {
    type: DataTypes.STRING,
    defaultValue: 'default-avatar.jpg'
  },
  preferences_notifications: {
  type: DataTypes.JSONB,
  allowNull: true,
  defaultValue: {
    email: true,
    sms: false,
    push: true
  }
},



  // Champs patients
  allergies: DataTypes.TEXT,
  antecedents_medicaux: DataTypes.TEXT,

  // Champs médecins
  specialite: DataTypes.STRING(100),
  etablissements: DataTypes.TEXT,
  diplome: DataTypes.STRING,
  parcours_professionnel: DataTypes.TEXT,
  langues: {
    type: DataTypes.TEXT,
    validate: {
      max: 500
    }
  },
  moyens_paiement: DataTypes.TEXT,
  description: {
    type: DataTypes.TEXT,
    validate: {
      max: 2000
    }
  },
  accepte_nouveaux_patients: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  accepte_non_traitants: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  horaires_travail: DataTypes.TEXT,
  accessibilite: DataTypes.TEXT,

tarifs: DataTypes.TEXT,
faq: {
  type: DataTypes.JSONB,
  defaultValue: []
},


  // Sécurité
  tokenVersion: {
  type: DataTypes.INTEGER,
  defaultValue: 0
},

  token_reinitialisation: DataTypes.STRING,
  expiration_token_reinitialisation: DataTypes.DATE,
  est_verifie: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  // Champ virtuel
  nom_complet: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.prenom} ${this.nom}`;
    }
  }
}, {
  tableName: 'utilisateurs',
  timestamps: false,
  hooks: {
    beforeValidate: (user) => {
      // Convertit les chaînes vides en null
      if (user.telephone === '') user.telephone = null;
    },
    beforeSave: async (user) => {
      if (user.changed('mot_de_passe')) {
        if (user.mot_de_passe.length < 8) {
          throw new Error('Le mot de passe doit contenir au moins 8 caractères');
        }
        user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, 12);
      }
    }
  },
  indexes: [
    // Index pour les recherches fréquentes
    { fields: ['role'] },
    { fields: ['email'] },
    { fields: ['nom'] },
    { fields: ['specialite'] }
  ]
});

// Méthode d’instance pour vérifier un mot de passe
User.prototype.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.mot_de_passe);
};

export default User;