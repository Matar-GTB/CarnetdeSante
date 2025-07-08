const { body, param, validationResult } = require('express-validator');
const { User } = require('../models');

module.exports = {
  // 🔁 Validation commune
  commonRules: {
    email: body('email')
      .isEmail().withMessage('Email invalide')
      .normalizeEmail()
      .custom(async (value) => {
        const user = await User.findOne({ where: { email: value } });
        if (user) throw new Error('Email déjà utilisé');
      }),

    password: body('password')
      .isLength({ min: 8 }).withMessage('8 caractères minimum')
      .matches(/[A-Z]/).withMessage('Doit contenir une majuscule')
      .matches(/[0-9]/).withMessage('Doit contenir un chiffre'),

    dateNaissance: body('date_naissance')
      .isISO8601().withMessage('Format de date invalide (YYYY-MM-DD)')
      .toDate()
  },

  // ✅ Validation des erreurs
  validate: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(err => ({
          param: err.param,
          message: err.msg,
          location: err.location
        }))
      });
    }
    next();
  },

  // 🛡 RGPD
  rgpdValidation: [
    body('consentement')
      .isBoolean().withMessage('Valeur booléenne requise')
      .toBoolean()
      .custom(value => {
        if (!value) throw new Error('Consentement RGPD requis');
        return true;
      }),

    body('consentement_date')
      .isISO8601().withMessage('Date de consentement invalide')
      .toDate()
  ],

  // 📄 Document médical
  documentValidation: [
    body('type')
      .isIn(['ordonnance', 'resultat', 'compte-rendu', 'certificat'])
      .withMessage('Type de document invalide'),

    body('date_creation')
      .optional({ nullable: true })
      .isISO8601().withMessage('Format de date invalide')
      .toDate()
  ],

  // 👨‍⚕ Demande médecin traitant
  demandeTraitantValidation: [
    body('medecin_id')
      .isInt({ min: 1 }).withMessage('ID médecin requis'),

    body('message_demande')
      .isLength({ min: 5 }).withMessage('Message trop court')
      .trim()
  ],

  // 📂 Partage de document
  partageDocumentValidation: [
    body('destinataire_id')
      .isInt({ min: 1 }).withMessage('ID destinataire requis'),

    body('document_ids')
      .isArray({ min: 1 }).withMessage('Liste de documents requise')
      .custom((arr) => arr.every(Number.isInteger))
      .withMessage('Les IDs doivent être des entiers')
  ],

  // 🔒 Changement de mot de passe
  passwordUpdateValidation: [
    body('ancien')
      .notEmpty().withMessage('Ancien mot de passe requis'),

    body('nouveau')
      .isLength({ min: 8 }).withMessage('8 caractères minimum')
      .matches(/[A-Z]/).withMessage('Doit contenir une majuscule')
      .matches(/[0-9]/).withMessage('Doit contenir un chiffre')
  ]
};