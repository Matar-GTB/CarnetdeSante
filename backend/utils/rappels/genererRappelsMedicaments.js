// backend/utils/rappels/genererRappelsMedicaments.js
import PriseMedicament from '../../models/PriseMedicament.js';
import Notification from '../../models/Notification.js';
import { Op } from 'sequelize';

/**
 * 🧠 Génère des notifications automatiques pour les prises de médicaments à venir
 * @param {number} utilisateurId - ID de l'utilisateur pour lequel générer les rappels
 */
export const genererRappelsMedicaments = async (utilisateurId) => {
  try {
    const medicaments = await PriseMedicament.findAll({
      where: { utilisateur_id: utilisateurId }
    });

    const maintenant = new Date();

    for (const medicament of medicaments) {
      const dateHeurePrise = new Date(`${medicament.date_prise}T${medicament.heure_prise}`);

      const diffMs = dateHeurePrise - maintenant;

      // Si la prise est dans moins d'une heure (3600000 ms) et dans le futur
      if (diffMs > 0 && diffMs <= 60 * 60 * 1000) {
        // Vérifie si un rappel a déjà été généré pour ce médicament aujourd’hui
        const existe = await Notification.findOne({
          where: {
            utilisateur_id: utilisateurId,
            type_notification: 'rappel',
            titre: { [Op.iLike]: `%${medicament.nom_medicament}%` },
            date_creation: {
              [Op.gte]: new Date(Date.now() - 12 * 60 * 60 * 1000) // Pas de doublon sur les 12h
            }
          }
        });

        if (!existe) {
          await Notification.create({
            utilisateur_id: utilisateurId,
            type_notification: 'rappel',
            titre: `💊 Rappel : ${medicament.nom_medicament}`,
            message: `Prenez votre médicament "${medicament.nom_medicament}" (${medicament.dosage || 'dose'}), à ${medicament.heure_prise}.`,
            est_lu: false
          });
        }
      }
    }
  } catch (error) {
    console.error('Erreur génération rappels médicaments :', error.message);
  }
};
