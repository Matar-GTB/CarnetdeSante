// backend/controllers/sharingController.js
import Sharing from '../models/Partage.js';
import User from '../models/User.js';
import AccessLog from '../models/AccessLog.js';
import crypto from 'crypto';
import dayjs from 'dayjs';

/**
 * 🔐 Crée un lien temporaire de partage
 */
export const createShareLink = async (req, res) => {
  const { selectedDocs, medecinId, dureeEnHeures = 24 } = req.body;
  const patientId = req.user.userId;

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = dayjs().add(dureeEnHeures, 'hour').toDate();

    const partage = await Sharing.create({
      token,
      patientId,
      medecinId,
      documents: selectedDocs,
      expiration,
      autorise: true,
      date_autorisation: new Date()
    });

    res.status(201).json({
      message: 'Lien généré',
      lien: `${process.env.FRONTEND_URL}/partage/${token}`,
      expiration
    });
  } catch (error) {
    console.error('Erreur création lien :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * 📥 Récupère les documents d’un lien valide
 */
export const getSharedDocuments = async (req, res) => {
  const { token } = req.params;

  try {
    const partage = await Sharing.findOne({ where: { token, autorise: true } });

    if (!partage || new Date(partage.expiration) < new Date()) {
      return res.status(403).json({ message: 'Lien expiré ou invalide' });
    }

    await AccessLog.create({
      partageId: partage.id,
      medecinId: partage.medecinId,
      date_acces: new Date()
    });

    res.json({
      patientId: partage.patientId,
      documents: partage.documents,
      expiration: partage.expiration
    });
  } catch (error) {
    console.error('Erreur accès lien :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * ❌ Révoquer l'accès à un lien
 */
export const revokeShareLink = async (req, res) => {
  const { id } = req.params;

  try {
    const partage = await Sharing.findByPk(id);
    if (!partage) return res.status(404).json({ message: 'Lien non trouvé' });

    partage.autorise = false;
    await partage.save();

    res.json({ message: 'Lien révoqué' });
  } catch (error) {
    console.error('Erreur révocation :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * 📊 Historique des accès
 */
export const getAccessLogs = async (req, res) => {
  const { userId } = req.params;

  try {
    const logs = await AccessLog.findAll({
      where: { medecinId: userId },
      include: [{
        model: Sharing,
        include: [{ model: User, as: 'Patient', attributes: ['id', 'prenom', 'nom'] }]
      }],
      order: [['date_acces', 'DESC']]
    });

    res.json(logs);
  } catch (error) {
    console.error('Erreur logs :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const grantAccessToDoctor = async (req, res) => {
  const patientId = req.user.userId;
  const { medecinId } = req.body;

  try {
    const existing = await Sharing.findOne({ where: { patientId, medecinId } });

    if (existing) {
      existing.autorise = true;
      existing.date_autorisation = new Date();
      await existing.save();
      return res.json({ message: 'Accès mis à jour', partage: existing });
    }

    const partage = await Sharing.create({
      patientId,
      medecinId,
      autorise: true,
      date_autorisation: new Date()
    });

    res.status(201).json({ message: 'Accès accordé', partage });
  } catch (error) {
    console.error('Erreur grantAccessToDoctor:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const revokeDoctorAccess = async (req, res) => {
  const patientId = req.user.userId;
  const medecinId = req.params.medecinId;

  try {
    const partage = await Sharing.findOne({ where: { patientId, medecinId } });

    if (!partage) return res.status(404).json({ message: 'Partage non trouvé' });

    partage.autorise = false;
    await partage.save();

    res.json({ message: 'Accès révoqué' });
  } catch (error) {
    console.error('Erreur revokeDoctorAccess:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const listAuthorizedDoctors = async (req, res) => {
  const patientId = req.user.userId;

  try {
    const partages = await Sharing.findAll({
      where: { patientId, autorise: true },
      include: [{
        model: User,
        as: 'Medecin',
        attributes: ['id', 'prenom', 'nom', 'specialite', 'email']
      }]
    });

    res.json({ doctors: partages.map(p => p.Medecin) });
  } catch (error) {
    console.error('Erreur listAuthorizedDoctors:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};