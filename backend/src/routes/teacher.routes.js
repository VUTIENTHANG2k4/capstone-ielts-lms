const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getTeacherDashboard } = require('../controllers/teacher.controller');

router.get('/dashboard', auth, authorize('teacher', 'admin'), getTeacherDashboard);

module.exports = router;
