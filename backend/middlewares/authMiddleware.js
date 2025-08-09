import jwt from 'jsonwebtoken';
import User from '../models/User.js';
// import AccessLog from '../models/AccessLog.js'; // TODO: utiliser ou supprimer

const isProd = process.env.NODE_ENV === 'production';
const cookieBase = {
  httpOnly: true,
  secure: isProd,                          // HTTPS only en prod
  sameSite: isProd ? 'None' : 'Lax',       // nécessaire pour cross-site en prod
  domain: isProd ? process.env.COOKIE_DOMAIN : undefined,
  path: '/',
};

export const authMiddleware = async (req, res, next) => {
  console.log('🍪 cookieAuthMiddleware →', req.originalUrl);

  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('   📱 Token via Authorization (fallback)');
    }
  } else {
    console.log('   🍪 Token via cookie');
  }

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Token invalide ou manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { clockTolerance: 5 });
    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(403).json({ error: 'Token invalide' });

    req.user = { userId: user.id, role: user.role, nom_complet: `${user.prenom} ${user.nom}` };
    return next();

  } catch (err) {
    console.warn('   ⚠ JWT error:', err.name, err.message);
    if (err.name === 'TokenExpiredError' && req.cookies?.refreshToken) {
      return attemptTokenRefresh(req, res, next);
    }
    return res.status(403).json({ error: 'Token expiré ou mal formé' });
  }
};

const attemptTokenRefresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Session expirée, reconnexion requise' });

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET /* pas de fallback en prod */,
      { clockTolerance: 5 }
    );
    if (decoded.type !== 'refresh') return res.status(403).json({ error: 'Token de refresh invalide' });

    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(403).json({ error: 'Utilisateur introuvable' });

    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role, prenom: user.prenom, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('accessToken', newAccessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
    req.user = { userId: user.id, role: user.role, nom_complet: `${user.prenom} ${user.nom}` };
    console.log('   ✅ Token renouvelé automatiquement');
    return next();

  } catch (e) {
    console.error('   ❌ Refresh échoué:', e.message);
    // Important: mêmes options que pose
    res.clearCookie('accessToken', cookieBase);
    res.clearCookie('refreshToken', cookieBase);
    return res.status(401).json({ error: 'Session expirée, reconnexion requise' });
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  let token = req.cookies?.accessToken;
  if (!token) {
    const h = req.headers.authorization;
    if (h?.startsWith('Bearer ')) token = h.split(' ')[1];
  }
  if (!token) { req.user = null; return next(); }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { clockTolerance: 5 });
    const user = await User.findByPk(decoded.userId);
    req.user = user ? { userId: user.id, role: user.role, nom_complet: `${user.prenom} ${user.nom}` } : null;
  } catch {
    req.user = null;
  }
  return next();
};

export default authMiddleware;
