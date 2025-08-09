// backend/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import sequelize from './config/db.js';
import { verifyToken } from './config/jwt.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration dotenv avec un chemin absolu pour s'assurer qu'il trouve le fichier .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
// Désactivation du scheduler redondant
// import './utils/rappels/rappelScheduler.js';
import socketManager from './utils/socketManager.js';

// Import des routes
console.log('🔧 Import des routes...');
import authRoutes from './routes/authRoutes.js';
console.log('✅ authRoutes importé');
import userRoutes from './routes/userRoutes.js';
console.log('✅ userRoutes importé');
import profileRoutes from './routes/profileRoutes.js';
console.log('✅ profileRoutes importé');
import medicalRoutes from './routes/medicalRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import sharingRoutes from './routes/sharingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import traitantRoutes from './routes/traitantRoutes.js';
import rappelRoutes from './routes/rappelRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import disponibiliteRoutes from './routes/disponibiliteRoutes.js';
import avisRoutes from './routes/avisRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js'; // Nouvelle importation
import mailRoutes from './routes/mailRoutes.js'; // Import des routes d'email
console.log('✅ Tous les imports de routes terminés');


// Import des modèles (doit être fait avant les routes pour les associations)
import './models/User.js';
import './models/Avis.js';
import './models/PriseMedicament.js';
import './models/Rappel.js';
import './models/Appointment.js';
import './models/Document.js';
import './models/Notification.js';
import './models/DemandeTraitant.js';
import './models/Vaccination.js';
import './models/Partage.js';
import './models/Message.js';
import './models/Conversation.js';
import './models/ConversationParticipant.js';
import { setupAssociations } from './models/associations.js';

// dotenv déjà configuré au début du fichier
// dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialiser Socket.IO
const io = socketManager.initialize(server);

// Middlewares
const allowedOrigins = [
   'http://localhost:3000',
   'http://localhost:3001',
   'http://127.0.0.1:3000',
   'http://127.0.0.1:3001'
];
 app.use(cors({
   origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
       callback(null, true);
     } else {
       callback(new Error(`Origine CORS non autorisée : ${origin}`));
     }
   },
   credentials: true,
   methods: ['GET','POST','PUT','DELETE','OPTIONS', 'PATCH'],
   allowedHeaders: ['Content-Type','Authorization']
 }));
app.use(express.json());
app.use(cookieParser()); // Support des cookies HttpOnly
app.use('/uploads', express.static('uploads')); // Pour les fichiers uploadés

// Import des nouveaux services de sécurité et de rappels
import verificationRoutes from './routes/verificationRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import { initReminderService } from './services/reminderService.js';

// Configuration des routes spéciales pour la vérification
console.log('🔒 Configuration des routes de vérification...');

// Routes
console.log('🔧 Configuration des routes...');
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/password', passwordRoutes); // Ajout des routes pour la gestion des mots de passe
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rappels', rappelRoutes);
app.use('/api/medications', medicationRoutes);

// Nouvelles routes pour la vérification et les mots de passe
app.use('/api/verifications', verificationRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api', disponibiliteRoutes);
app.use('/api/traitants', traitantRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/consultations', consultationRoutes); // Nouvelle route ajoutée
app.use('/api/mail', mailRoutes); // Routes pour l'envoi d'emails
console.log('✅ Toutes les routes configurées');

// Route de test
app.get('/', (req, res) => {
  res.send('✅ Backend carnet-santé opérationnel');
});

// Route de santé pour vérifier la DB
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    res.status(503).json({ 
      status: 'warning', 
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString() 
    });
  }
});


// Middleware d'authentification (pour référence)
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  } else {
    res.sendStatus(401);
  }
};

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

// Connexion et synchronisation DB
const startServer = async () => {

  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB établie');
    
    // Configuration des associations entre modèles
    setupAssociations();
    console.log('✅ Associations de modèles configurées');
    
    // Initialiser le service de rappels
    initReminderService();
    console.log('✅ Services de sécurité et de rappels initialisés');
    
    // Synchronisation des modèles (en dev seulement)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modèles synchronisés (mode développement)');
    }
  } catch (err) {
    console.error('⚠️  Erreur base de données :', err.message);
    console.log('🔄 Démarrage du serveur sans DB...');
  }
  
  // Démarrage du serveur (même si DB indisponible)
  try {
    server.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
      console.log(`🔒 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 Socket.IO activé pour la messagerie en temps réel`);
    });
  } catch (err) {
    console.error('❌ Erreur démarrage serveur :', err);
    process.exit(1);
  }
};

startServer();