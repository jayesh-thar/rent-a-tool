const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const env = require('../../config/env');

const BCRYPT_ROUNDS = 12;

// Registers a new user — hashes password, creates user record.
// Returns the new user (without passwordHash, thanks to toJSON).
async function registerUser({ fullName, email, password, phoneNumber, userType, communityDetails }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('An account with this email already exists');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    fullName,
    email,
    passwordHash,
    phoneNumber,
    userType,
    communityDetails,
    authProvider: 'local',
  });

  return user;
}

// Verifies email + password, returns the user if valid.
// Throws descriptive errors for wrong email, wrong password, or blocked accounts.
async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  if (user.isBlocked) {
    const error = new Error('Your account has been blocked. Contact support.');
    error.status = 403;
    throw error;
  }

  // Google-only accounts don't have a password — can't log in with email/password.
  if (!user.passwordHash) {
    const error = new Error('This account uses Google login. Please sign in with Google.');
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  return user;
}

// Generates a short-lived access token (15 min default).
// Contains user ID and roles — enough for authMiddleware to authorize requests.
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user._id, roles: user.roles },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
}

// Generates a long-lived refresh token (7 day default).
// Stored as an httpOnly cookie — never accessible to frontend JS.
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY }
  );
}

// Verifies a refresh token and returns the decoded payload.
// Used by the /auth/refresh endpoint to issue a new access token.
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.status = 401;
    throw error;
  }
}

// Verifies an access token and returns the decoded payload.
// Used by authMiddleware on every protected request.
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired access token');
    error.status = 401;
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
};
