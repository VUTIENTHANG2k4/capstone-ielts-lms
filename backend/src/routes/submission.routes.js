const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getSubmissions, getSubmissionById, gradeSubmission } = require('../controllers/submission.controller');

router.get('/', auth, getSubmissions);
router.get('/:id', auth, getSubmissionById);
router.post('/:id/feedback', auth, authorize('teacher', 'admin'), gradeSubmission);
router.post('/:id/grade', auth, authorize('teacher', 'admin'), gradeSubmission); // alias for FE

module.exports = router;
