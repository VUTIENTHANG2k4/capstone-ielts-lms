const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getLessons, getLessonById, createLesson, updateLesson, deleteLesson, completeLesson } = require('../controllers/lesson.controller');

router.get('/section/:sectionId', auth, getLessons);
router.get('/:id', auth, getLessonById);
router.post('/', auth, authorize('admin'), createLesson);
router.put('/:id', auth, authorize('admin'), updateLesson);
router.delete('/:id', auth, authorize('admin'), deleteLesson);
router.post('/:id/complete', auth, authorize('student'), completeLesson);

module.exports = router;
