// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';

// Import des routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import medicalRoutes from './routes/medicalRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import sharingRoutes from './routes/sharingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import traitantRoutes from './routes/traitantRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
const allowedOrigins = [
   'http://localhost:3000',
   'http://127.0.0.1:3000'
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
   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
   allowedHeaders: ['Content-Type','Authorization']
 }));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Pour les fichiers uploadés
app.use('/api/traitants', traitantRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/notifications', notificationRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('✅ Backend carnet-santé opérationnel');
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
    
    // Synchronisation des modèles (en dev seulement)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modèles synchronisés (mode développement)');
    }
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
      console.log(`🔒 Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Erreur démarrage serveur :', err);
    process.exit(1);
  }
};

startServer();