// backend/controllers/avisController.js
import Avis from '../models/Avis.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

/**
 * Laisser un avis sur un médecin
 * POST /api/avis
 */
export const laisserAvis = async (req, res) => {
  try {
    const patient_id = req.user.userId;
    const { medecin_id, note, commentaire, anonyme = false } = req.body;

    // Vérifications
    if (req.user.role !== 'patient') {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les patients peuvent laisser des avis" 
      });
    }

    if (!medecin_id || !note) {
      return res.status(400).json({ 
        success: false, 
        message: "Médecin et note sont obligatoires" 
      });
    }

    if (note < 1 || note > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "La note doit être entre 1 et 5" 
      });
    }

    // Vérifier que le médecin existe
    const medecin = await User.findOne({
      where: { id: medecin_id, role: 'medecin' }
    });

    if (!medecin) {
      return res.status(404).json({ 
        success: false, 
        message: "Médecin introuvable" 
      });
    }

    // Vérifier qu'il n'y a pas déjà un avis de ce patient pour ce médecin
    const avisExistant = await Avis.findOne({
      where: { patient_id, medecin_id }
    });

    if (avisExistant) {
      // Mise à jour de l'avis existant
      await avisExistant.update({
        note,
        commentaire,
        anonyme,
        date_creation: new Date()
      });
      
      return res.json({ 
        success: true, 
        message: "Avis mis à jour avec succès",
        data: avisExistant 
      });
    } else {
      // Création d'un nouvel avis
      const nouvelAvis = await Avis.create({
        patient_id,
        medecin_id,
        note,
        commentaire,
        anonyme
      });

      return res.json({ 
        success: true, 
        message: "Avis ajouté avec succès",
        data: nouvelAvis 
      });
    }
  } catch (error) {
    console.error('Erreur laisserAvis:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
};

/**
 * Récupérer les avis d'un médecin
 * GET /api/avis/medecin/:id
 */
export const getAvisMedecin = async (req, res) => {
  try {
    const medecin_id = req.params.id;

    const avis = await Avis.findAll({
      where: { medecin_id },
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['prenom', 'nom']
        }
      ],
      order: [['date_creation', 'DESC']]
    });

    // Formater les avis pour la réponse
    const avisFormats = avis.map(avis => ({
      id: avis.id,
      note: avis.note,
      commentaire: avis.commentaire,
      date: new Date(avis.date_creation).toLocaleDateString('fr-FR'),
      patient: avis.anonyme 
        ? 'Patient anonyme' 
        : `${avis.Patient.prenom} ${avis.Patient.nom[0]}.`,
      anonyme: avis.anonyme
    }));

    // Calculer la note moyenne
    const noteMoyenne = avis.length > 0 
      ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1)
      : null;

    return res.json({
      success: true,
      data: {
        avis: avisFormats,
        note_moyenne: noteMoyenne,
        nombre_avis: avis.length
      }
    });
  } catch (error) {
    console.error('Erreur getAvisMedecin:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
};

/**
 * Récupérer l'avis d'un patient pour un médecin
 * GET /api/avis/patient-medecin/:medecinId
 */
export const getAvisPatientPourMedecin = async (req, res) => {
  try {
    const patient_id = req.user.userId;
    const medecin_id = req.params.medecinId;

    if (req.user.role !== 'patient') {
      return res.status(403).json({ 
        success: false, 
        message: "Accès refusé" 
      });
    }

    const avis = await Avis.findOne({
      where: { patient_id, medecin_id }
    });

    return res.json({
      success: true,
      data: avis
    });
  } catch (error) {
    console.error('Erreur getAvisPatientPourMedecin:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
};

/**
 * Supprimer un avis
 * DELETE /api/avis/:id
 */
export const supprimerAvis = async (req, res) => {
  try {
    const avis_id = req.params.id;
    const patient_id = req.user.userId;

    const avis = await Avis.findOne({
      where: { 
        id: avis_id,
        patient_id // S'assurer que le patient ne peut supprimer que ses propres avis
      }
    });

    if (!avis) {
      return res.status(404).json({ 
        success: false, 
        message: "Avis introuvable" 
      });
    }

    await avis.destroy();

    return res.json({
      success: true,
      message: "Avis supprimé avec succès"
    });
  } catch (error) {
    console.error('Erreur supprimerAvis:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
};
