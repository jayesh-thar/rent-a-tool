const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const env = require('./env');

// Configures Passport with the Google OAuth 2.0 strategy.
// We only use Passport for the Google OAuth handshake — session management
// is still handled by our own JWT system (access + refresh tokens).
function configurePassport() {
  const hasClientId = env.GOOGLE_CLIENT_ID && !env.GOOGLE_CLIENT_ID.includes('your-google-client-id');
  const hasClientSecret = env.GOOGLE_CLIENT_SECRET && !env.GOOGLE_CLIENT_SECRET.includes('your-google-client-secret');

  if (!hasClientId || !hasClientSecret) {
    console.warn('⚠️ Google OAuth is not configured. Google sign-in will not work.');
    console.warn('   Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env.');
    
    // Register a dummy strategy to prevent Passport from failing on initialization/routing
    passport.use(
      new GoogleStrategy(
        {
          clientID: 'dummy-client-id',
          clientSecret: 'dummy-client-secret',
          callbackURL: env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
          return done(null, profile);
        }
      )
    );
  } else {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
        },
        // This verify callback receives the Google profile after a successful OAuth exchange.
        // We don't do DB lookups here — that's handled in the route callback controller
        // so we can keep strategy config separate from business logic.
        (accessToken, refreshToken, profile, done) => {
          // Pass the Google profile to the route handler via done().
          // We don't need Google's tokens — we issue our own JWTs.
          return done(null, profile);
        }
      )
    );
  }

  // We don't use Passport sessions (we use JWTs instead), but Passport
  // requires these to be defined. They're no-ops.
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
}

module.exports = configurePassport;

