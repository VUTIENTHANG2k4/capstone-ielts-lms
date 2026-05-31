const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.put('/password', auth, changePassword);          // alias for FE
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
