import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path'
import Document from '../models/Document.js';
import Vaccination from '../models/Vaccination.js';
import DemandeTraitant from '../models/DemandeTraitant.js';
import User from '../models/User.js';
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
  const  userId  = req.user.userId
  const { nom_vaccin, date_administration, date_rappel, notes } = req.body;

  if (!nom_vaccin || !date_administration) {
    return res.status(400).json({ message: 'Champs vaccin requis manquants' });
  }

  try {
    const newVaccin = await Vaccination.create({
      patient_id: userId,
      nom_vaccin,
      date_administration,
      date_rappel,
      notes,
      date_creation: new Date()
    });

    res.status(201).json(newVaccin);
  } catch (error) {
    console.error('Erreur addVaccination:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
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
