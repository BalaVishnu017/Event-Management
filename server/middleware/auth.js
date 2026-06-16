const admin = require('firebase-admin');
const User = require('../models/User');

let firebaseInitialized = false;

const initFirebase = () => {
  if (firebaseInitialized) return;

  try {
    // Option 1: JSON content provided directly as env var (best for cloud deployments like Render)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK initialized (from JSON env var)');
      return;
    }

    // Option 2: Path to a JSON file (local development)
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath) {
      const path = require('path');
      // Resolve relative paths from the server directory
      const resolvedPath = path.isAbsolute(serviceAccountPath)
        ? serviceAccountPath
        : path.resolve(__dirname, '..', serviceAccountPath.replace(/^\.\//, ''));

      const serviceAccount = require(resolvedPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK initialized (from file)');
      return;
    }

    // Option 3: Application Default Credentials (GCP / Firebase Hosting)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized (application default credentials)');
  } catch (error) {
    console.warn('⚠️  Firebase Admin SDK not configured — running in demo mode.');
    console.warn('   To enable real auth, set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in .env');
  }
};

initFirebase();

/**
 * Authentication middleware
 * Verifies Firebase ID token and attaches user to request.
 * Falls back to demo mode if Firebase is not configured.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Demo mode: allow un-authenticated requests in non-production when Firebase is not set up
      if (process.env.NODE_ENV !== 'production' && !firebaseInitialized) {
        req.user = {
          uid: 'demo-user-001',
          email: 'demo@skycal.app',
          displayName: 'Demo User',
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!firebaseInitialized) {
      // Demo mode fallback even when a token header is sent
      req.user = {
        uid: 'demo-user-001',
        email: 'demo@skycal.app',
        displayName: 'Demo User',
      };
      return next();
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Find or create user in MongoDB
    let dbUser = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!dbUser) {
      dbUser = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        photoURL: decodedToken.picture || '',
      });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || dbUser.displayName,
      dbId: dbUser._id,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ success: false, error: 'Token expired. Please re-login.' });
    }

    return res.status(401).json({ success: false, error: 'Invalid authentication token' });
  }
};

module.exports = authMiddleware;
