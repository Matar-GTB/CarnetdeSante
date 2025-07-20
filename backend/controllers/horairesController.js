import HorairesTravail from '../models/HorairesTravail.js';
import { Op } from 'sequelize';

// 1. Lister les horaires de travail d’un médecin (planning hebdo)
export const getHorairesByMedecin = async (req, res) => {
  try {
    const medecin_id = req.params.medecinId;
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
    const { jour_semaine, heure_debut, heure_fin, duree_creneau } = req.body;

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
