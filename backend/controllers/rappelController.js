// backend/controllers/rappelController.js
import Rappel from '../models/Rappel.js';

export const listerRappels = async (req, res) => {
  const utilisateurId = req.user.userId;
  try {
    const liste = await Rappel.findAll({ where: { utilisateur_id: utilisateurId } });
    res.json(liste);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
};

export const obtenirRappel = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Rappel.findByPk(id);
    if (!item || item.utilisateur_id !== req.user.userId) {
      return res.status(404).json({ erreur: 'Rappel introuvable' });
    }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
};

export const creerRappel = async (req, res) => {
  const utilisateurId = req.user.userId;
  const { type_rappel, details, recurrence, canaux } = req.body;
  try {
    const nouveau = await Rappel.create({ utilisateur_id: utilisateurId, type_rappel, details, recurrence, canaux });
    res.status(201).json(nouveau);
  } catch (err) {
    console.error(err);
    res.status(400).json({ erreur: 'Données invalides' });
  }
};

export const modifierRappel = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Rappel.findByPk(id);
    if (!item || item.utilisateur_id !== req.user.userId) {
      return res.status(404).json({ erreur: 'Rappel introuvable' });
    }
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ erreur: 'Mise à jour impossible' });
  }
};

export const supprimerRappel = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Rappel.findByPk(id);
    if (!item || item.utilisateur_id !== req.user.userId) {
      return res.status(404).json({ erreur: 'Rappel introuvable' });
    }
    await item.destroy();
    res.json({ message: 'Rappel supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
};