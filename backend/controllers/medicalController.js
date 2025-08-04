import { Op, Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import Vaccination from '../models/Vaccination.js';
import DemandeTraitant from '../models/DemandeTraitant.js';
import User from '../models/User.js';
import Rappel from '../models/Rappel.js';
//  Obtenir tous les documents médicaux d’un utilisateur


export const getDocuments = async (req, res) => {
  console.log("🔐 Utilisateur authentifié :", req.user);
  const  userId  = req.user.userId;

  try {
    const documents = await Document.findAll({
      where: { utilisateur_id: userId },
      order: [['date_document', 'DESC']],
    });

    res.json(documents);
  } catch (error) {
    console.error('Erreur getDocuments:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

//  Ajouter un nouveau document
export const uploadDocument = async (req, res) => {
  const userId = req.user.userId;
  const { titre, type_document, categorie } = req.body;
  const fichier = req.file?.filename;

  if (!titre || !type_document || !fichier) {
    return res.status(400).json({ message: 'Champs requis manquants' });
  }

  try {

     console.log({
            utilisateur_id: userId,
            titre,
            type_document,
            categorie,
            url_fichier: fichier,
            date_document: new Date()
    });
   
    const newDocument = await Document.create({
      utilisateur_id: userId,
      titre,
      type_document,
      categorie,
      url_fichier: fichier,
      nom_fichier: req.file.originalname,
      date_document: new Date()
    });

    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Erreur uploadDocument:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

//  Obtenir les vaccinations d’un utilisateur
export const getVaccinations = async (req, res) => {
  const requesterId = req.user.userId;
  const role = req.user.role;
  const patientId = req.query.patientId;

  try {
    let targetUserId = requesterId;

    // Cas médecin : il veut voir les vaccins d’un patient autorisé
    if (role === 'medecin' && patientId) {
      const demande = await DemandeTraitant.findOne({
        where: {
          medecin_id: requesterId,
          patient_id: patientId,
          statut: 'accepte'
        }
      });

      if (!demande) {
        return res.status(403).json({ error: 'Non autorisé à voir les vaccins de ce patient' });
      }

      targetUserId = patientId;
    }

    const vaccinations = await Vaccination.findAll({
      where: { patient_id: targetUserId }
    });

    res.json(vaccinations);
  } catch (err) {
    console.error("Erreur getVaccinations:", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


// ➕ Ajouter une vaccination
export const addVaccination = async (req, res) => {
  const userId = req.user.userId;
  const {
    nom_vaccin,
    categorie,
    date_administration: rawAdmin,
    date_rappel: rawRappel,
    lieu_vaccination,
    professionnel_sante,
    effets_secondaires,
    contre_indications,
    notes,
    creerRappelAuto,
    creerRappelProchain,
    canaux_notification,
    dose
  } = req.body;

  // ─── Validation commune ───
  if (!nom_vaccin) {
    return res.status(400).json({ message: 'Le nom du vaccin est requis.' });
  }

  // transforme en Date ou null
  const date_admin = rawAdmin ? new Date(rawAdmin) : null;
  const date_rappel = rawRappel ? new Date(rawRappel) : null;

  // ─── Validation conditionnelle ───
  if ((creerRappelAuto || creerRappelProchain) && !date_admin) {
    return res
      .status(400)
      .json({ message: 'Pour programmer un rappel, la date/heure de vaccination est obligatoire.' });
  }
  if (creerRappelProchain && !rawRappel) {
    return res
      .status(400)
      .json({ message: 'Pour programmer le rappel de dose suivante, la date/heure de rappel est obligatoire.' });
  }

  // contrôle de validité des dates
  if (rawAdmin && isNaN(date_admin))
    return res.status(400).json({ message: 'Date de vaccination invalide.' });
  if (rawRappel && isNaN(date_rappel))
    return res.status(400).json({ message: 'Date de rappel invalide.' });
  if (date_rappel && date_admin && date_rappel < date_admin)
    return res.status(400).json({ message: 'La date de rappel doit être après la date de vaccination.' });

  // ─── Création du vaccin avec tous les nouveaux champs ───
  const vaccin = await Vaccination.create({
    patient_id: userId,
    nom_vaccin,
    categorie: categorie || 'recommande',
    date_administration: date_admin,
    date_rappel,
    lieu_vaccination,
    professionnel_sante,
    effets_secondaires,
    contre_indications,
    notes,
    statut: 'en_attente',
    dose: dose || 1,
    date_creation: new Date()
  });

  // Gestion des rappels et notifications
  if (creerRappelAuto || creerRappelProchain) {
    const rappelData = {
      utilisateur_id: userId,
      type_rappel: 'vaccin',
      date_heure: creerRappelProchain ? date_rappel : date_admin,
      details: {
        nom_vaccin,
        dose,
        type: creerRappelProchain ? 'dose_suivante' : 'rappel_auto'
      },
      canaux: canaux_notification || { notification: true, email: false, sms: false }
    };

    await Rappel.create(rappelData);
  }

  return res.status(201).json(vaccin);
};

export const deleteVaccination = async (req, res) => {
  try {
    const userId = req.user.userId;
    const vaccin = await Vaccination.findOne({
      where: { id: req.params.id, patient_id: userId },
    });

    if (!vaccin) {
      return res.status(404).json({ error: 'Vaccin non trouvé' });
    }

    await vaccin.destroy();
    res.json({ message: 'Vaccin supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
};

export const updateVaccination = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { nom_vaccin, date_administration, date_rappel, notes } = req.body;

  try {
    const vaccin = await Vaccination.findOne({ where: { id, patient_id: userId } });

    if (!vaccin) {
      return res.status(404).json({ message: 'Vaccin non trouvé' });
    }

    await vaccin.update({
      nom_vaccin,
      date_administration,
      date_rappel,
      notes
    });

    res.json({ message: 'Vaccin mis à jour', data: vaccin });
  } catch (err) {
    console.error('Erreur updateVaccination:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

 //Supprimer un document médical + son fichier sur le disque
export const deleteDocument = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const isAdmin = req.user.role === 'admin';

  try {
    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ message: 'Document introuvable' });
    }

    // Vérifie que l'utilisateur est le propriétaire ou un admin
    if (document.utilisateur_id !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Accès interdit à ce document' });
    }

    // Supprimer le fichier physiquement s’il existe
    const uploadFolder = path.resolve('uploads');
    const filePath = path.join(uploadFolder, path.basename(document.url_fichier));
    fs.unlink(filePath, (err) => {
      if (err) {
        console.warn('⚠️ Fichier non supprimé physiquement :', err.message);
      } else {
        console.log('🗑️ Fichier supprimé :', filePath);
      }
    });

    // Supprimer la ligne en base de données
    await document.destroy();

    res.json({ message: '✅ Document supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression document :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
};
// controllers/medicalController.js
export const downloadDocument = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const doc = await Document.findByPk(id);

    if (!doc || doc.utilisateur_id !== userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const filePath = path.resolve('uploads', doc.url_fichier);
    res.download(filePath, doc.nom_fichier || 'document.pdf');
  } catch (error) {
    console.error("Erreur téléchargement :", error);
    res.status(500).json({ message: "Erreur lors du téléchargement" });
  }
};

// 📊 Obtenir les statistiques de vaccination
export const getStatistiquesVaccination = async (req, res) => {
  const userId = req.user.userId;

  try {
    const vaccinations = await Vaccination.findAll({
      where: { patient_id: userId }
    });

    const stats = {
      total: vaccinations.length,
      parCategorie: {
        obligatoire: vaccinations.filter(v => v.categorie === 'obligatoire').length,
        recommande: vaccinations.filter(v => v.categorie === 'recommande').length
      },
      parStatut: {
        complet: vaccinations.filter(v => v.statut === 'complet').length,
        en_attente: vaccinations.filter(v => v.statut === 'en_attente').length,
        incomplet: vaccinations.filter(v => v.statut === 'incomplet').length,
        test: vaccinations.filter(v => v.statut === 'test').length
      },
      rappelsProches: vaccinations.filter(v => {
        if (!v.date_rappel) return false;
        const now = new Date();
        const rappel = new Date(v.date_rappel);
        const diffJours = (rappel - now) / (1000 * 60 * 60 * 24);
        return diffJours >= 0 && diffJours <= 30;
      }).length
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur getStatistiquesVaccination:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 🗓️ Obtenir le calendrier vaccinal
export const getCalendrierVaccinal = async (req, res) => {
  const userId = req.user.userId;
  const { mois, annee } = req.query;

  try {
    const debut = new Date(annee || new Date().getFullYear(), (mois || new Date().getMonth()) - 1, 1);
    const fin = new Date(annee || new Date().getFullYear(), (mois || new Date().getMonth()), 0);

    const vaccins = await Vaccination.findAll({
      where: {
        patient_id: userId,
        [Op.or]: [
          { date_administration: { [Op.between]: [debut, fin] } },
          { date_rappel: { [Op.between]: [debut, fin] } }
        ]
      },
      order: [['date_administration', 'ASC'], ['date_rappel', 'ASC']]
    });

    res.json(vaccins);
  } catch (error) {
    console.error('Erreur getCalendrierVaccinal:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ⚙️ Mettre à jour les préférences de notification
export const updatePreferencesNotification = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { email, sms, push } = req.body;

  try {
    const vaccination = await Vaccination.findOne({
      where: { 
        id,
        patient_id: userId 
      }
    });
    
    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination non trouvée' });
    }

    await vaccination.update({
      canaux_notification: {
        email,
        sms,
        push
      }
    });

    res.json({ message: 'Préférences de notification mises à jour' });
  } catch (error) {
    console.error('Erreur updatePreferencesNotification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
