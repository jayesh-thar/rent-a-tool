const express = require('express');
const passport = require('passport');
const authController = require('./auth.controller');
const { handleGoogleCallback } = require('./google.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public routes — no auth required
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Google OAuth — redirects to Google's consent screen, then back to our callback.
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_failed' }),
  handleGoogleCallback
);

// Protected routes — require valid access token
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;

