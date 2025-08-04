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
      isValidBloodType(value) {
        if (value && value.trim() !== '' && !/^(A|B|AB|O)[+-]$/i.test(value)) {
          throw new Error('Groupe sanguin invalide. Format attendu: A+, B-, AB+, O-, etc.');
        }
      }
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
  traitements_actuels: DataTypes.TEXT,
  
  // Données biométriques et médicales
  poids: {
    type: DataTypes.DECIMAL(5, 2), // Ex: 123.45 kg
    validate: {
      min: 0,
      max: 500
    }
  },
  taille: {
    type: DataTypes.DECIMAL(5, 2), // Ex: 175.50 cm
    validate: {
      min: 0,
      max: 300
    }
  },
  electrophorese: DataTypes.TEXT, // Résultats d'électrophorèse
  
  numero_secu: {
  type: DataTypes.STRING(15),
  allowNull: true
},
  
  // Contacts d'urgence
  contact_urgence: {
    type: DataTypes.STRING(20),
    validate: {
      isPhoneNumber(value) {
        if (value && !/^\+?[0-9\s.-]{8,20}$/.test(value)) {
          throw new Error('Numéro de téléphone d\'urgence invalide');
        }
      }
    }
  },
  personne_urgence: DataTypes.STRING(100),
  
  // Préférences utilisateur
  langue_preferee: {
    type: DataTypes.STRING(10),
    defaultValue: 'fr',
    validate: {
      isIn: {
        args: [['fr', 'en', 'es', 'de', 'it']],
        msg: 'Langue non supportée'
      }
    }
  },

  // Champs médecins
  numero_ordre: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isNumeroOrdre(value) {
        if (value && !/^[0-9]{8,15}$/.test(value.replace(/\s/g, ''))) {
          throw new Error('Numéro d\'ordre invalide');
        }
      }
    }
  },
  specialite: DataTypes.STRING(100),
  sous_specialites: DataTypes.TEXT, // Ajout du champ sous-spécialités
  etablissements: DataTypes.TEXT,
  adresse_cabinet: DataTypes.TEXT,
  telephone_cabinet: {
    type: DataTypes.STRING(20),
    validate: {
      isPhoneNumber(value) {
        if (value && !/^\+?[0-9\s.-]{8,20}$/.test(value)) {
          throw new Error('Numéro de téléphone cabinet invalide');
        }
      }
    }
  },
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
  teleconsultation: { // Ajout du champ téléconsultation
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  horaires_travail: DataTypes.TEXT,
  jours_disponibles: DataTypes.TEXT, // Ajout du champ jours disponibles
  duree_consultation: { // Ajout du champ durée consultation
    type: DataTypes.INTEGER,
    defaultValue: 30,
    validate: {
      min: 10,
      max: 120
    }
  },
  profil_public: { // Ajout du champ profil public
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  visible_recherche: { // Ajout du champ visible dans recherche
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  afficher_avis: { // Ajout du champ afficher avis
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
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
  
  // Tokens d'urgence
  emergency_token: DataTypes.STRING,
  emergency_token_expires: DataTypes.DATE,
  
  // Paramètres de visibilité
  visibility_settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
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