import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AccessLog from '../models/AccessLog.js';

/**
 * 🍪 Middleware d'authentification par cookies HttpOnly
 */
export const authMiddleware = async (req, res, next) => {
  console.log('🍪 cookieAuthMiddleware démarré pour', req.originalUrl);

  // Priorité : cookie accessToken, puis header Authorization (rétrocompatibilité)
  let token = req.cookies?.accessToken;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('   📱 Token depuis header Authorization (mode compatibilité)');
    }
  } else {
    console.log('   🍪 Token depuis cookie HttpOnly');
  }

  if (!token || token === 'null' || token === 'undefined') {
    console.warn('   ❌ Token invalide ou absent');
    return res.status(401).json({ error: 'Token invalide ou manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('   ✔ JWT décodé:', { userId: decoded.userId });

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      console.warn('   ❌ Utilisateur non trouvé en base pour ID', decoded.userId);
      return res.status(403).json({ error: 'Token invalide' });
    }

    req.user = {
      userId: user.id,
      role: user.role,
      nom_complet: `${user.prenom} ${user.nom}`
    };

    console.log(`   ✅ Authentifié: ${req.user.nom_complet} (ID=${user.id}, rôle=${user.role})`);
    next();

  } catch (err) {
    console.error('   ⚠ Erreur JWT →', err.name, err.message);
    
    // Si le token d'accès est expiré, essayer de le renouveler automatiquement
    if (err.name === 'TokenExpiredError' && req.cookies?.refreshToken) {
      console.log('   🔄 Tentative de renouvellement automatique du token...');
      return await attemptTokenRefresh(req, res, next);
    }
    
    return res.status(403).json({ error: 'Token expiré ou mal formé' });
  }
};

/**
 * 🔄 Tentative de renouvellement automatique du token
 */
const attemptTokenRefresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Session expirée, reconnexion requise' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_dev');
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ error: 'Token de refresh invalide' });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: 'Utilisateur introuvable' });
    }

    // Générer un nouveau token d'accès
    const newAccessToken = jwt.sign({
      userId: user.id,
      role: user.role,
      prenom: user.prenom,
      nom: user.nom
    }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Configuration des cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
      path: '/'
    };

    // Nouveau cookie d'accès
    res.cookie('accessToken', newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Mettre à jour la requête avec le nouvel utilisateur
    req.user = {
      userId: user.id,
      role: user.role,
      nom_complet: `${user.prenom} ${user.nom}`
    };

    console.log(`   ✅ Token renouvelé automatiquement pour: ${req.user.nom_complet}`);
    next();

  } catch (refreshErr) {
    console.error('   ❌ Échec du renouvellement automatique:', refreshErr.message);
    
    // Effacer les cookies invalides
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    return res.status(401).json({ error: 'Session expirée, reconnexion requise' });
  }
};

/**
 * 🔓 Middleware optionnel pour cookies : extrait l'utilisateur si connecté, sinon continue
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  console.log('🔓 optionalCookieAuthMiddleware démarré pour', req.originalUrl);

  let token = req.cookies?.accessToken;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  if (!token) {
    console.log('   ℹ️ Aucun token fourni, accès en mode public');
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      console.log('   ⚠ Token valide mais utilisateur introuvable');
      req.user = null;
      return next();
    }

    req.user = {
      userId: user.id,
      role: user.role,
      nom_complet: `${user.prenom} ${user.nom}`
    };
    console.log(`   ✅ Utilisateur optionnel identifié: ${req.user.nom_complet}`);
    next();

  } catch (err) {
    console.log('   ⚠ Token invalide, accès en mode public');
    req.user = null;
    next();
  }
};

export { authMiddleware as default };
