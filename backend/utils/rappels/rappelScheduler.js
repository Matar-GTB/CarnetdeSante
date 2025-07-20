import cron from 'node-cron';
import { Op } from 'sequelize';
import Rappel from '../../models/Rappel.js';
import Notification from '../../models/Notification.js';

console.log("Scheduler de rappels démarré !");

cron.schedule('* * * * *', async () => {
  const now = new Date();

  try {
    // Charger uniquement les rappels à déclencher maintenant ou bientôt (optionnel)
    const rappelsDue = await Rappel.findAll({
      where: {
        envoye: false,
        canaux: { [Op.contains]: ['notification'] }
        // Tu peux aussi ajouter: date_heure <= now + 5min
      }
    });

    for (const rappel of rappelsDue) {
      // Parsing JSON éventuel si besoin
      const details = typeof rappel.details === 'string'
        ? JSON.parse(rappel.details)
        : rappel.details;

      const dateHeure =
        (details.date_heure && new Date(details.date_heure)) ||
        (
          details.date_debut && details.heure_prise
            ? new Date(`${details.date_debut}T${details.heure_prise}`)
            : null
        );

      if (dateHeure && dateHeure <= now) {
        console.log(`Envoi du rappel #${rappel.id} pour user #${rappel.utilisateur_id} à ${dateHeure.toISOString()}`);

        await Notification.create({
          utilisateur_id: rappel.utilisateur_id,
          type_notification: 'rappel',
          titre: rappel.type_rappel === 'médicament'
            ? `Rappel prise de ${details.nom_medicament || ''}`
            : `Rappel ${rappel.type_rappel}`,
          message: details.dose
            ? `Prendre ${details.dose} de ${details.nom_medicament} à ${details.heure_prise}`
            : details.nom_medicament
              ? `Prendre ${details.nom_medicament} à ${details.heure_prise}`
              : 'Rappel !',
          est_lu: false,
          date_creation: now
        });

        rappel.envoye = true;
        await rappel.save();
      } else {
        // Facultatif
        if (!dateHeure) console.warn('Rappel sans date de déclenchement !', rappel.id);
      }
    }
  } catch (err) {
    console.error('Erreur scheduler rappel :', err);
  }
});
