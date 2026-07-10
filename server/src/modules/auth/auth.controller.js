const authService = require('./auth.service');
const User = require('./user.model');

// POST /api/v1/auth/register
// Creates a new user account with hashed password, issues tokens, sets refresh cookie.
async function register(req, res, next) {
  try {
    const { fullName, email, password, phoneNumber, userType, communityDetails } = req.body;

    if (!fullName || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'Full name, email, password, and phone number are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await authService.registerUser({
      fullName,
      email,
      password,
      phoneNumber,
      userType: userType || 'individual',
      communityDetails: communityDetails || { name: '', address: '', registrationId: '' },
    });

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      message: 'Registration successful',
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/auth/login
// Verifies email + password, issues access token in body and refresh token as httpOnly cookie.
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await authService.loginUser({ email, password });

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    res.json({
      message: 'Login successful',
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/auth/refresh
// Reads the refresh token from the httpOnly cookie, verifies it, issues a new access token.
// Also re-checks if the user is blocked — a blocked user's old refresh token won't work.
async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const decoded = authService.verifyRefreshToken(token);

    // Re-fetch user to check current blocked status — don't trust stale token data.
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.isBlocked) {
      clearRefreshCookie(res);
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    const accessToken = authService.generateAccessToken(user);

    // Rotate refresh token for better security — old one is now invalid.
    const newRefreshToken = authService.generateRefreshToken(user);
    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken, user });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/auth/logout
// Clears the refresh token cookie — the access token will expire on its own (short-lived).
async function logout(req, res) {
  clearRefreshCookie(res);
  res.json({ message: 'Logged out successfully' });
}

// GET /api/v1/auth/me
// Returns the currently authenticated user's profile.
// Requires authMiddleware to run first (attaches req.user).
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/auth/profile
// Updates user credentials, phone, and optional community details.
async function updateProfile(req, res, next) {
  try {
    const { fullName, email, phoneNumber, password, userType, communityDetails } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user.userId } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (userType) user.userType = userType;
    if (communityDetails) {
      user.communityDetails = {
        name: communityDetails.name || '',
        address: communityDetails.address || '',
        registrationId: communityDetails.registrationId || '',
      };
    }

    if (password) {
      const bcrypt = require('bcrypt');
      user.passwordHash = await bcrypt.hash(password, 12);
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
}

// ── Cookie Helpers ──────────────────────────────────────────────────────────

// Sets the refresh token as an httpOnly cookie — never accessible to frontend JavaScript.
// secure: true in production (HTTPS), sameSite: 'lax' prevents CSRF on cross-site requests.
// Rotated correctly in dev.
function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

module.exports = { register, login, refresh, logout, getMe, updateProfile };
