// backend/controllers/consultationController.js
import Consultation from '../models/Consultation.js';

// Créer une consultation
export const createConsultation = async (req, res) => {
  try {
    const { rendezvous_id, patient_id, medecin_id, notes, examens, medicaments, notes_retenir } = req.body;
    const consultation = await Consultation.create({
      rendezvous_id,
      patient_id,
      medecin_id,
      notes,
      examens,
      medicaments,
      notes_retenir
    });
    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mettre à jour une consultation
export const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, examens, medicaments, notes_retenir } = req.body;
    const consultation = await Consultation.findByPk(id);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    await consultation.update({ notes, examens, medicaments, notes_retenir });
    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer toutes les consultations d'un patient
export const getConsultationsByPatient = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const consultations = await Consultation.findAll({ where: { patient_id } });
    res.json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer une consultation par rendezvous
export const getConsultationByRendezvous = async (req, res) => {
  try {
    const { rendezvous_id } = req.params;
    const consultation = await Consultation.findOne({ where: { rendezvous_id } });
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
