import { Op } from 'sequelize';
import cron from 'node-cron';
import Vaccination from '../models/Vaccination.js';
import User from '../models/User.js';
import { sendEmail } from '../../services/mailService.js'; // Assure-toi que ce chemin est correct

export const updateIncompleteVaccinations = async () => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const enAttenteExpirés = await Vaccination.findAll({
      where: {
        statut: 'en_attente',
        date_rappel: {
          [Op.lt]: today
        }
      }
    });

    for (const vaccin of enAttenteExpirés) {
      await vaccin.update({ statut: 'incomplet' });

      // Envoi d'un email au patient si possible
      const user = await User.findByPk(vaccin.patient_id);

      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: `Rappel non effectué pour ${vaccin.nom_vaccin}`,
          text: `Bonjour ${user.prenom},\n\nLe rappel prévu le ${vaccin.date_rappel} pour le vaccin ${vaccin.nom_vaccin} n’a pas été effectué. Son statut est désormais "incomplet".\n\nMerci de vérifier votre calendrier de vaccination.`
        });
      }

      console.log(`🔁 ${vaccin.nom_vaccin} → incomplet (email envoyé à ${user?.email})`);
    }

    console.log(`✅ ${enAttenteExpirés.length} vaccin(s) mis à jour.`);
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour automatique des vaccins incomplets :', err);
  }
};

// Tâche CRON : tous les jours à 1h du matin
cron.schedule('0 1 * * *', () => {
  console.log("🕐 Vérification des rappels expirés...");
  updateIncompleteVaccinations();
});