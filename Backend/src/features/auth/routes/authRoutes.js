/* ********************************************* */
/* File: #src/features/auth/routes/authRoutes.js */
/* ********************************************* */

const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Public authentication endpoints.
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Authenticated account endpoints.
router.get('/me', authenticate, authController.getCurrentUser);
router.patch('/me', authenticate, authController.updateCurrentUser);
router.patch('/change-password', authenticate, authController.changePassword);

module.exports = router;
