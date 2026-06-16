const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController');

// POST /api/auth/register — Register/sync user after Firebase signup
router.post('/register', authMiddleware, authController.registerUser);

// POST /api/auth/login — Sync user after Firebase login
router.post('/login', authMiddleware, authController.loginUser);

// GET /api/auth/me — Get current user profile
router.get('/me', authMiddleware, authController.getProfile);

// PUT /api/auth/me — Update user preferences
router.put('/me', authMiddleware, authController.updateProfile);

module.exports = router;
