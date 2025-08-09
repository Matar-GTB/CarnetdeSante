import PriseMedicament from '../models/PriseMedicament.js';
import Rappel from '../models/Rappel.js';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
dayjs.extend(isSameOrBefore);

/**
 * 🔄 Liste des médicaments d’un utilisateur
 */
export const getMedicaments = async (req, res) => {
  try {
    const data = await PriseMedicament.findAll({
      where: { utilisateur_id: req.user.userId },
      order: [['date_creation', 'DESC']]
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};


export const getMedicationById = async (req, res) => {
  try {
    const med = await PriseMedicament.findByPk(req.params.id);
    if (!med || med.utilisateur_id !== req.user.userId) {
      return res.status(404).json({ success: false, message: 'Médicament non trouvé' });
    }
    res.json(med);
  } catch (error) {
    console.error("Erreur getMedicationById:", error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

/**
 * ✏️ Mettre à jour un médicament et ses rappels associés
 */
export const updateMedicament = async (req, res) => {
  try {
    const { nom_medicament, dose, date_debut, date_fin, rappel_actif, frequence } = req.body;
    const med = await PriseMedicament.findByPk(req.params.id);
    if (!med || med.utilisateur_id !== req.user.userId) {
      return res.status(404).json({ success: false, message: 'Non trouvé' });
    }

    // Préparer les données pour la mise à jour
    // Si date_fin est une chaîne vide, mettre à null pour éviter l'erreur "Invalid date"
    const updateData = {
      ...req.body,
      date_fin: date_fin === "" ? null : date_fin,
      frequence: JSON.stringify(frequence)
    };

    await med.update(updateData);

    await Rappel.destroy({ where: { medicament_id: med.id } });

    if (rappel_actif && frequence) {
      const rappels = [];
      const start = dayjs(date_debut);
      const end = date_fin && date_fin !== "" ? dayjs(date_fin) : start;
      let currentDate = start;

      while (currentDate.isSameOrBefore(end)) {
        if (frequence.type === 'custom' && Array.isArray(frequence.hours)) {
          frequence.hours.forEach((heure) => {
            const fullDate = `${currentDate.format('YYYY-MM-DD')}T${heure}`;
            rappels.push({
              utilisateur_id: req.user.userId,
              medicament_id: med.id,
              type_rappel: 'médicament',
              details: JSON.stringify({
                nom_medicament: nom_medicament,
                 dosage: dose,
                heure_prise: heure,
                date_heure: fullDate,
                message: `Vous avez une prise de médicament ${nom_medicament} à ${heure} (dosage : ${dose})`
              }),
              date_heure: fullDate,
              recurrence: frequence.type === 'interval'
                ? `intervalle:${frequence.interval}`
                : 'quotidien',
              canaux: JSON.stringify(frequence.canaux || { notification: true }),
              envoye: false
            });
          });
        } else if (frequence.type === 'interval') {
          let cur = dayjs(`${currentDate.format('YYYY-MM-DD')}T${frequence.start}`);
          const endHour = dayjs(`${currentDate.format('YYYY-MM-DD')}T${frequence.end}`);
          while (cur.isSameOrBefore(endHour)) {
            const heure = cur.format('HH:mm');
            const fullDate = cur.format('YYYY-MM-DDTHH:mm');
            rappels.push({
              utilisateur_id: req.user.userId,
              medicament_id: med.id,
              type_rappel: 'médicament',
              details: JSON.stringify({
                nom_medicament: nom_medicament,
                dosage: dose,
                heure_prise: heure,
                date_heure: fullDate,
                message: `Vous avez une prise de médicament ${nom_medicament} à ${heure} (dosage : ${dose})`
              }),
              date_heure: fullDate,
              recurrence: frequence.type === 'interval'
                ? `intervalle:${frequence.interval}`
                : 'quotidien',
              canaux: JSON.stringify(frequence.canaux || { notification: true }),
              envoye: false
            });
            cur = cur.add(frequence.interval, 'minute');
          }
        }
        currentDate = currentDate.add(1, 'day');
      }

      if (rappels.length > 0) {
        await Rappel.bulkCreate(rappels);
      }
    }

    res.json({ success: true, data: med });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};


/**
 * ➕ Ajouter un médicament
 */

export const addMedicament = async (req, res) => {
  try {
    const { nom_medicament, dose, date_debut, date_fin, rappel_actif, frequence } = req.body;

    console.log('Ajout médicament appelé', req.body); // Ajout d'un log ici

    // Préparer les données pour la base de données
    // Si date_fin est une chaîne vide, mettre à null pour éviter l'erreur "Invalid date"
    const medicamentData = {
      utilisateur_id: req.user.userId,
      ...req.body,
      date_fin: date_fin === "" ? null : date_fin,
      frequence: JSON.stringify(frequence)
    };

    const newMedicament = await PriseMedicament.create(medicamentData);

    if (rappel_actif && frequence) {
      const rappels = [];
      const start = dayjs(date_debut);
      const end = date_fin && date_fin !== "" ? dayjs(date_fin) : start;
      let currentDate = start;

      while (currentDate.isSameOrBefore(end)) {
        if (frequence.type === 'custom' && Array.isArray(frequence.hours)) {
          frequence.hours.forEach((heure) => {
            const fullDate = `${currentDate.format('YYYY-MM-DD')}T${heure}`;
            rappels.push({
              utilisateur_id: req.user.userId,
              medicament_id: newMedicament.id, // ✅ Clé étrangère ajoutée
              type_rappel: 'médicament',
              details: JSON.stringify({
                nom_medicament: nom_medicament,
                dosage: dose,
                heure_prise: heure,
                date_heure: fullDate,
                message: `Vous avez une prise de médicament ${nom_medicament} à ${heure} (dosage : ${dose})`
              }),
              date_heure: fullDate,
             recurrence: frequence.type === 'interval'
                ? `intervalle:${frequence.interval}`
                : 'quotidien',
              canaux: JSON.stringify(frequence.canaux || { notification: true }),
              envoye: false
            });
          });
        } else if (frequence.type === 'interval' && frequence.start && frequence.end && frequence.interval) {
          let cur = dayjs(`${currentDate.format('YYYY-MM-DD')}T${frequence.start}`);
          const endHour = dayjs(`${currentDate.format('YYYY-MM-DD')}T${frequence.end}`);
          while (cur.isSameOrBefore(endHour)) {
            const heure = cur.format('HH:mm');
            const fullDate = cur.format('YYYY-MM-DDTHH:mm');
            rappels.push({
              utilisateur_id: req.user.userId,
              medicament_id: newMedicament.id, // ✅ ici aussi
              type_rappel: 'médicament',
              details: JSON.stringify({
                nom_medicament: nom_medicament,
                dosage: dose,
                heure_prise: heure,
                date_heure: fullDate,
                message: `Vous avez une prise de médicament ${nom_medicament} à ${heure} (dosage : ${dose})`
              }),
              date_heure: fullDate,
              recurrence: frequence.type === 'interval'
                ? `intervalle:${frequence.interval}`
                : 'quotidien',
              canaux: JSON.stringify(frequence.canaux || { notification: true }),
              envoye: false
            });
            cur = cur.add(frequence.interval, 'minute');
          }
        }
        currentDate = currentDate.add(1, 'day');
      }

      if (rappels.length > 0) {
        await Rappel.bulkCreate(rappels);
      }
    }

    res.status(201).json({ success: true, data: newMedicament });

  } catch (error) {
    res.status(400).json({ success: false, message: 'Erreur ajout médicament', error: error.message });
  }
};


/**
 * 🗑 Supprimer un médicament
 */
export const deleteMedicament = async (req, res) => {
  try {
    const med = await PriseMedicament.findByPk(req.params.id);
    if (!med || med.utilisateur_id !== req.user.userId) {
      return res.status(404).json({ success: false, message: 'Non trouvé' });
    }
    await Rappel.destroy({ where: { medicament_id: med.id } });
    await med.destroy();
    res.json({ success: true, message: 'Supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};
