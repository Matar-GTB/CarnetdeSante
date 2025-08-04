import cron from 'node-cron';
import PriseMedicament from '../../models/PriseMedicament.js';
import Rappel from '../../models/Rappel.js';
import dayjs from 'dayjs';
import { Op } from 'sequelize';

// Cron : tous les jours à 02h du matin
cron.schedule('0 2 * * *', async () => {
  try {
    const seuil = dayjs().subtract(3, 'day').format('YYYY-MM-DD');

    const medsToDelete = await PriseMedicament.findAll({
      where: {
        date_fin: {
          [Op.lte]: seuil
        }
      }
    });

    for (const med of medsToDelete) {
      // 🔥 Supprimer les rappels associés
      await Rappel.destroy({
        where: {
          type_rappel: 'médicament',
          details: {
            [Op.like]: `%${med.nom_medicament || med.nom || med.dose || ''}%`
          }
        }
      });

      // 🗑 Supprimer le médicament lui-même
      await med.destroy();
      console.log(`💊 Médicament supprimé : ${med.nom_medicament || med.nom}`);
    }

  } catch (error) {
    console.error('❌ Erreur nettoyage médicaments :', error.message);
  }
});
