import express from 'express';
import messageController from '../controllers/messageController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuration multer pour les uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/messages'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Routes des conversations
router.get('/conversations', (req, res, next) => messageController.getUserConversations(req, res, next));
router.get('/available-contacts', (req, res, next) => messageController.getAvailableContacts(req, res, next));
router.get('/conversations/:otherUserId', (req, res, next) => messageController.getOrCreateConversation(req, res, next));
router.get('/conversations/:conversationId/messages', (req, res, next) => messageController.getConversationMessages(req, res, next));

// Routes des messages
router.post('/messages', (req, res, next) => messageController.sendMessage(req, res, next));
router.post('/messages/media', upload.single('file'), (req, res, next) => messageController.sendMediaMessage(req, res, next));
router.put('/conversations/:conversationId/read', (req, res, next) => messageController.markMessagesAsRead(req, res, next));

// Routes des réactions
router.post('/messages/:messageId/reactions', (req, res, next) => messageController.addReaction(req, res, next));
router.delete('/messages/:messageId/reactions', (req, res, next) => messageController.removeReaction(req, res, next));

export default router;
