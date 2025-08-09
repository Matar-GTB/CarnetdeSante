// backend/services/reminderService.js
import cron from 'node-cron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import Rappel from '../models/Rappel.js';
import User from '../models/User.js';
import { sendReminderEmail } from './emailService.js';
import { sendReminderSMS } from './smsService.js';

// Établir la relation entre User et Rappel
Rappel.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'Utilisateur' });

// Stockage des tâches cron
const cronJobs = new Map();

/**
 * Initialise le service de rappels
 */
export const initReminderService = () => {
  try {
    console.log('🚀 Initialisation du service de rappels...');
    
    // Vérification toutes les minutes pour les rappels à envoyer
    // En production, réduire la fréquence pour économiser les ressources
    const job = cron.schedule('* * * * *', async () => {
      await processReminders();
    });
    
    cronJobs.set('reminder-checker', job);
    console.log('✅ Service de rappels initialisé avec succès');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du service de rappels:', error);
    return false;
  }
};

/**
 * Traite les rappels à envoyer
 */
export const processReminders = async () => {
  try {
    const now = dayjs();
    const nowMinus1Min = now.subtract(1, 'minute');
    const nowPlus1Min = now.add(1, 'minute');
    
    // Récupérer les rappels à envoyer dans la fenêtre de temps
    // Récupérer les rappels sans jointure pour éviter l'erreur d'association
  const rappelsToSend = await Rappel.findAll({
      where: {
        date_heure: {
          [Op.between]: [nowMinus1Min.toDate(), nowPlus1Min.toDate()]
        },
        envoye: false
      }
      // Temporairement supprimé à cause de l'erreur d'association
      // include: [{
      //   model: User,
      //   attributes: ['id', 'email', 'telephone', 'prefs_notification']
      // }]
    });
    
    console.log(`📅 ${rappelsToSend.length} rappels à traiter...`);
    
    // Traiter chaque rappel
    for (const rappel of rappelsToSend) {
      await sendReminder(rappel);
    }
    
    return { success: true, processed: rappelsToSend.length };
  } catch (error) {
    console.error('❌ Erreur lors du traitement des rappels:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoie un rappel selon les préférences de l'utilisateur
 * @param {Object} rappel - Objet Rappel avec User associé
 */
export const sendReminder = async (rappel) => {
  try {
    // Récupérer l'utilisateur manuellement au lieu d'utiliser l'association
    const user = await User.findByPk(rappel.utilisateur_id);
    
    if (!user) {
      console.error(`❌ Utilisateur non trouvé pour le rappel ${rappel.id}`);
      return false;
    }
    
    // Récupérer les préférences de notification de l'utilisateur
    const prefs = user.prefs_notification ? 
      JSON.parse(user.prefs_notification) : 
      { email: true, sms: false };
    
    let emailSent = false;
    let smsSent = false;
    
    // Envoi par email si configuré
    if (prefs.email && user.email) {
      // Extraction des données nécessaires du rappel
      const details = typeof rappel.details === 'string' ? JSON.parse(rappel.details) : rappel.details;
      const titre = details.titre || `Rappel ${rappel.type_rappel}`;
      const description = details.description || '';
      
      const result = await sendReminderEmail(user.email, user.nom || 'Patient', titre, description, rappel.date_heure);
      emailSent = result.success;
    }
    
    // Envoi par SMS si configuré
    if (prefs.sms && user.telephone) {
      const details = typeof rappel.details === 'string' ? JSON.parse(rappel.details) : rappel.details;
      const titre = details.titre || `Rappel ${rappel.type_rappel}`;
      
      const result = await sendReminderSMS(user.telephone, titre, rappel.date_heure);
      smsSent = result.success;
    }
    
    // Marquer comme envoyé si au moins un moyen a fonctionné
    if (emailSent || smsSent) {
      await rappel.update({
        envoye: true,
        date_envoi: new Date(),
        canaux_envoi: JSON.stringify({
          email: emailSent,
          sms: smsSent
        })
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi du rappel ${rappel.id}:`, error);
    return false;
  }
};

/**
 * Crée un nouveau rappel
 * @param {Object} rappelData - Données du rappel à créer
 * @param {number} userId - ID de l'utilisateur
 * @returns {Object} - Rappel créé
 */
export const createReminder = async (rappelData, userId) => {
  try {
    const rappel = await Rappel.create({
      ...rappelData,
      user_id: userId,
      envoye: false
    });
    
    console.log(`✅ Rappel créé pour l'utilisateur ${userId}: ${rappel.id}`);
    return { success: true, rappel };
  } catch (error) {
    console.error('❌ Erreur lors de la création du rappel:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Met à jour un rappel existant
 * @param {number} rappelId - ID du rappel
 * @param {Object} rappelData - Nouvelles données
 * @param {number} userId - ID de l'utilisateur (pour vérification)
 * @returns {Object} - Résultat de la mise à jour
 */
export const updateReminder = async (rappelId, rappelData, userId) => {
  try {
    const rappel = await Rappel.findOne({
      where: { id: rappelId, user_id: userId }
    });
    
    if (!rappel) {
      return { success: false, error: 'Rappel non trouvé' };
    }
    
    await rappel.update(rappelData);
    
    console.log(`✅ Rappel ${rappelId} mis à jour pour l'utilisateur ${userId}`);
    return { success: true, rappel };
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour du rappel ${rappelId}:`, error);
    return { success: false, error: error.message };
  }
};

export default {
  initReminderService,
  processReminders,
  createReminder,
  updateReminder
};
