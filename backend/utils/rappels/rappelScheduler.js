import cron from 'node-cron';
import { Op } from 'sequelize';
import Rappel from '../../models/Rappel.js';
import Notification from '../../models/Notification.js';

console.log("Scheduler de rappels démarré !");

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

  try {
    const rappelsDue = await Rappel.findAll({
      where: {
        envoye: false,
        date_heure: { [Op.between]: [fiveMinutesAgo, fiveMinutesLater] }
      }
    });

    if (!rappelsDue.length) {
      console.log("Aucun rappel à envoyer à cette minute.");
    }

    for (const rappel of rappelsDue) {
      let details = {};
      try {
        details = typeof rappel.details === 'string' ? JSON.parse(rappel.details) : rappel.details;
      } catch {
        console.warn("❌ JSON invalide pour rappel ID", rappel.id);
        continue;
      }

      const canaux = typeof rappel.canaux === 'string' ? JSON.parse(rappel.canaux) : rappel.canaux || {};

      if (canaux.notification || canaux.email || canaux.sms) {
        const dateHeure = rappel.date_heure ? new Date(rappel.date_heure) : null;

        if (rappel.type_rappel === 'médicament') {
          // Notification à l'heure précise
          if (dateHeure && dateHeure <= now) {
            await Notification.create({
              utilisateur_id: rappel.utilisateur_id,
              type_notification: 'rappel',
              titre: `Rappel prise de ${details.nom_medicament || ''}`,
              message: details.dose
                ? `Prendre ${details.dose} de ${details.nom_medicament} à ${details.heure_prise}`
                : details.nom_medicament
                  ? `Prendre ${details.nom_medicament} à ${details.heure_prise}`
                  : 'Rappel prise de médicament !',
              est_lu: false,
              date_creation: now
            });
            rappel.envoye = true;
            await rappel.save();
          }
        } else if (rappel.type_rappel === 'rendezvous') {
          // Notification 2h ou 24h avant
          if (dateHeure && dateHeure <= now) {
            await Notification.create({
              utilisateur_id: rappel.utilisateur_id,
              type_notification: 'rappel',
              titre: `Rappel rendez-vous avec Dr ${details.nom_medecin || ''}`,
              message: details.message
                ? details.message
                : `Rendez-vous avec Dr ${details.nom_medecin || ''} à ${details.heure || ''}`,
              est_lu: false,
              date_creation: now
            });
            rappel.envoye = true;
            await rappel.save();
          }
        } else if (rappel.type_rappel.includes('vaccin')) {
          // Notification 1 jour avant la date prévue
          if (dateHeure && dateHeure <= now) {
            await Notification.create({
              utilisateur_id: rappel.utilisateur_id,
              type_notification: 'rappel',
              titre: `Rappel vaccin${details.nom_vaccin ? ' : ' + details.nom_vaccin : ''}`,
              message: details.message
                ? details.message
                : `Rappel vaccin${details.nom_vaccin ? ' : ' + details.nom_vaccin : ''}`,
              est_lu: false,
              date_creation: now
            });
            rappel.envoye = true;
            await rappel.save();
          }
        }
      }
    }
  } catch (err) {
    console.error('Erreur scheduler rappel :', err);
  }
});
