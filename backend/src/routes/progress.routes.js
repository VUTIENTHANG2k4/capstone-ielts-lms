const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getRoadmap, getCourseProgress } = require('../controllers/progress.controller');

router.get('/roadmap', auth, authorize('student'), getRoadmap);
router.get('/course/:courseId', auth, authorize('student'), getCourseProgress);

module.exports = router;
