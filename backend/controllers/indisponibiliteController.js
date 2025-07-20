import Indisponibilite from '../models/Indisponibilite.js';

/**
 * Récupérer toutes les indisponibilités du médecin (pour calendrier)
 * GET /api/indispos/medecin/:medecinId
 */
export const getIndisposByMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
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
