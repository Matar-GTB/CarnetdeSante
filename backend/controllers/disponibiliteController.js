import Indisponibilite from '../models/Indisponibilite.js';
import HorairesTravail from '../models/HorairesTravail.js';
import sequelize from '../config/db.js'; // ou là où tu initialises Sequelize
import { Op } from 'sequelize';




// 1. Lister les horaires de travail d’un médecin (planning hebdo)
export const getHorairesByMedecin = async (req, res) => {
  try {
    const medecin_id = req.user.userId;
    const horaires = await HorairesTravail.findAll({
      where: { medecin_id },
      order: [
        [sequelize.literal(`CASE 
          WHEN jour_semaine = 'lundi' THEN 1
          WHEN jour_semaine = 'mardi' THEN 2
          WHEN jour_semaine = 'mercredi' THEN 3
          WHEN jour_semaine = 'jeudi' THEN 4
          WHEN jour_semaine = 'vendredi' THEN 5
          WHEN jour_semaine = 'samedi' THEN 6
          WHEN jour_semaine = 'dimanche' THEN 7
          ELSE 8 END`), 'ASC'],
        ['heure_debut', 'ASC']
      ]
    });
    res.json({ success: true, data: horaires });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Erreur chargement horaires" });
  }
};

// 2. Créer/Mettre à jour un créneau de travail pour un jour
export const addOrUpdateHoraire = async (req, res) => {
  try {
    const medecin_id = req.user.userId;
    const jour_semaine = req.params.jour; 
    const {heure_debut, heure_fin, duree_creneau } = req.body;
    
    if (!jour_semaine || !heure_debut || !heure_fin || !duree_creneau) {
      return res.status(400).json({ success: false, message: "Champs requis manquants" });
    }
    console.log('[🟢 DEBUG PUT /horaires]', {
      medecin_id,
      jour_semaine,
      heure_debut,
      heure_fin,
      duree_creneau
    });
    // Vérifier si un créneau existe déjà ce jour-là
    let horaire = await HorairesTravail.findOne({ where: { medecin_id, jour_semaine } });

    if (horaire) {
      // Update
      horaire.heure_debut   = heure_debut;
      horaire.heure_fin     = heure_fin;
      horaire.duree_creneau = duree_creneau;
      await horaire.save();
    } else {
      // Create
      horaire = await HorairesTravail.create({ medecin_id, jour_semaine, heure_debut, heure_fin, duree_creneau });
    }

    res.json({ success: true, data: horaire });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Erreur ajout/MAJ horaire" });
  }
};

// 3. Supprimer un créneau (ex : ne travaille pas ce jour-là)
export const deleteHoraire = async (req, res) => {
  try {
    const { id } = req.params;
    const horaire = await HorairesTravail.findByPk(id);
    if (!horaire) return res.status(404).json({ success: false, message: "Non trouvé" });
    await horaire.destroy();
    res.json({ success: true, message: "Crenau supprimé" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Erreur suppression" });
  }
};

/**
 * Récupérer toutes les indisponibilités du médecin (pour calendrier)
 * GET /api/indispos/medecin/:medecinId
 */
export const getIndisposByMedecin = async (req, res) => {
  try {
    const  medecinId  = req.user.userId;
    const indispos = await Indisponibilite.findAll({
      where: { medecin_id: medecinId },
      order: [
        ['date_debut', 'ASC'],
        ['heure_debut', 'ASC']
      ]
    });
    res.json({ success: true, data: indispos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur récupération indisponibilités", error: error.message });
  }
};

/**
 * Créer une indisponibilité (absence, blocage…)
 * POST /api/indispos/
 */
export const createIndispo = async (req, res) => {
  try {
    const medecin_id = req.user.userId; // Sécurisé côté back
    const { date_debut, date_fin, heure_debut, heure_fin, motif } = req.body;

    if (date_fin < date_debut) {
      return res.status(400).json({ success: false, message: "Date de fin avant date de début" });
    }
    if (heure_fin <= heure_debut) {
      return res.status(400).json({ success: false, message: "Heure de fin avant début" });
    }

    const newIndispo = await Indisponibilite.create({
      medecin_id,
      date_debut,
      date_fin,
      heure_debut,
      heure_fin,
      motif: motif || null
    });

    res.status(201).json({ success: true, data: newIndispo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur création indisponibilité", error: error.message });
  }
};

/**
 * Supprimer une indisponibilité
 * DELETE /api/indispos/:id
 */
export const deleteIndispo = async (req, res) => {
  try {
    const { id } = req.params;
    const indispo = await Indisponibilite.findByPk(id);
    if (!indispo) return res.status(404).json({ success: false, message: "Indisponibilité non trouvée" });

    // Vérifie que c’est le bon médecin !
    if (indispo.medecin_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    await indispo.destroy();
    res.json({ success: true, message: "Indisponibilité supprimée" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur suppression indisponibilité", error: error.message });
  }
};
