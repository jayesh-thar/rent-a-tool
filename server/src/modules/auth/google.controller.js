const User = require('./user.model');
const { generateAccessToken, generateRefreshToken } = require('./auth.service');

// Handles Google's OAuth callback. Looks up the user by the email Google returns;
// links to an existing account if one exists, otherwise creates a new one.
// Issues the same JWT session as local login so the rest of the app treats
// Google and email/password users identically.
async function handleGoogleCallback(req, res) {
  try {
    const profile = req.user; // Set by Passport's verify callback
    const email = profile.emails?.[0]?.value;
    const fullName = profile.displayName || 'Google User';
    const profilePicture = profile.photos?.[0]?.value || '';

    if (!email) {
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=no_email`
      );
    }

    let user = await User.findOne({ email });

    if (user) {
      // Existing account — link Google login if they previously registered with email/password.
      if (user.authProvider === 'local') {
        user.authProvider = 'both';
        if (!user.profilePicture && profilePicture) {
          user.profilePicture = profilePicture;
        }
        await user.save();
      }
    } else {
      // No account exists — create a new Google-only user (no password needed).
      user = await User.create({
        fullName,
        email,
        authProvider: 'google',
        profilePicture,
        verificationStatus: 'verified', // Google already verified the email
      });
    }

    // Check if user is blocked before issuing tokens.
    if (user.isBlocked) {
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=blocked`
      );
    }

    // Issue the same JWT pair as local login — the rest of the app never
    // needs to know which login method was used.
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as httpOnly cookie (same as local login).
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Redirect to frontend with access token as a URL parameter.
    // The frontend will read it, store it in memory, and clear the URL.
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/auth/google/success?token=${accessToken}`);
  } catch (error) {
    console.error('Google OAuth error:', error.message);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/login?error=server_error`);
  }
}

module.exports = { handleGoogleCallback };
