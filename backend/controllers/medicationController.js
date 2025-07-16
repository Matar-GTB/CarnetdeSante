import PriseMedicament from '../models/PriseMedicament.js';

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

/**
 * ➕ Ajouter un médicament
 */
export const addMedicament = async (req, res) => {
  try {
    const newMedicament = await PriseMedicament.create({
      utilisateur_id: req.user.userId,
      ...req.body
    });
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
    await med.destroy();
    res.json({ success: true, message: 'Supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};
