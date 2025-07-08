import DemandeTraitant from '../models/DemandeTraitant.js';
import User from '../models/User.js';

export const getPatientsByMedecin = async (req, res) => {
  try {
    const medecinId = req.user.userId;

    const demandes = await DemandeTraitant.findAll({
      where: {
        medecin_id: medecinId,
        statut: 'accepte'
      },
      include: [{
        model: User,
        as: 'Patient',
        attributes: ['id', 'prenom', 'nom', 'email', 'date_naissance']
      }]
    });

    const patients = demandes.map((d) => d.Patient);
    res.json(patients);
  } catch (err) {
    console.error("Erreur récupération patients:", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
