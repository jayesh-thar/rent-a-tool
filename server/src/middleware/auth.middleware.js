const { verifyAccessToken } = require('../modules/auth/auth.service');
const User = require('../modules/auth/user.model');

// Verifies the access token on protected routes and attaches the user to req.user.
// Rejects the request if the token is missing, expired, or the user is blocked.
// Token is read from the Authorization header: "Bearer <token>".
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Re-check blocked status from DB on every request — a blocked user's
    // existing token should not continue working.
    const user = await User.findById(decoded.userId).select('isBlocked');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    // Attach decoded token payload to req.user for downstream route handlers.
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Authentication failed' });
  }
}

module.exports = { authMiddleware };
