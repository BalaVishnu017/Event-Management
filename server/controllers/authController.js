const User = require('../models/User');

/**
 * POST /api/auth/register
 * Register or sync user after Firebase signup
 */
exports.registerUser = async (req, res) => {
  try {
    const { uid, email, displayName } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      // User already exists, update last login info
      user.displayName = displayName || user.displayName;
      user.email = email || user.email;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        firebaseUid: uid,
        email: email || '',
        displayName: displayName || email?.split('@')[0] || 'User',
        photoURL: req.body.photoURL || '',
      });
    }

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Failed to register user' });
  }
};

/**
 * POST /api/auth/login
 * Sync user data after Firebase login
 */
exports.loginUser = async (req, res) => {
  try {
    const { uid, email, displayName } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Auto-create user if first login via this backend
      user = await User.create({
        firebaseUid: uid,
        email: email || '',
        displayName: displayName || 'User',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Login sync error:', error);
    res.status(500).json({ success: false, error: 'Failed to sync user' });
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
};

/**
 * PUT /api/auth/me
 * Update user preferences
 */
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['displayName', 'photoURL', 'preferences'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};
